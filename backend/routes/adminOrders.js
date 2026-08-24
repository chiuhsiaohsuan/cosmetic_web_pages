const express = require("express");
const router = express.Router();

const db = require("../db");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// 取得訂單列表
router.get(
  "/",
  verifyToken,
  verifyAdmin,
  (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    db.query("SELECT COUNT(*) AS total FROM orders", (err, countResult) => {
      if (err) {
        console.error("取得訂單總數失敗", err);
        return res.status(500).json({
          message: "取得訂單失敗"
        });
      }

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const sql = `
        SELECT
          o.id,
          o.user_id,
          u.name AS user_name,
           o.receiver_name,
           o.receiver_phone,
           o.receiver_email,
           o.receiver_address,
          o.total_amount,
          o.order_status,
          o.payment_status,
          o.created_at,
          o.paid_at
        FROM orders o
        LEFT JOIN users u
          ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `;

      db.query(sql, [limit, offset], (err, orders) => {
        if (err) {
          console.error("取得訂單列表失敗", err);
          return res.status(500).json({
            message: "取得訂單失敗"
          });
        }

        res.json({
          data: orders,
          total,
          page,
          limit,
          totalPages
        });
      });
    });
  }
);

// 取得訂單明細
router.get(
  "/:id",
  verifyToken,
  verifyAdmin,
  (req, res) => {
    const orderId = req.params.id;

    const sql = `
      SELECT
        o.id,
        o.user_id,
        u.name AS user_name,
        o.receiver_name,
        o.receiver_phone,
        o.receiver_email,
        o.receiver_address,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.created_at,
        o.paid_at,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name AS product_name,
        pay.submitted_at
      FROM orders o
      LEFT JOIN users u
        ON o.user_id = u.id
      LEFT JOIN order_items oi
        ON o.id = oi.order_id
      LEFT JOIN products p
        ON oi.product_id = p.id
      LEFT JOIN payments pay
        ON o.id = pay.order_id
      WHERE o.id = ?
    `;

    db.query(sql, [orderId], (err, results) => {
      if (err) {
        console.error("查詢訂單明細失敗", err);
        return res.status(500).json({
          message: "查詢訂單失敗"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "找不到訂單"
        });
      }

      const order = {
        id: results[0].id,
        user_id: results[0].user_id,
        user_name: results[0].user_name,
        receiver_name: results[0].receiver_name,
        receiver_phone: results[0].receiver_phone,
        receiver_email: results[0].receiver_email,
        receiver_address: results[0].receiver_address,
        total_amount: results[0].total_amount,
        order_status: results[0].order_status,
        payment_status: results[0].payment_status,
        created_at: results[0].created_at,
        submitted_at: results[0].submitted_at,
        paid_at: results[0].paid_at,
        items: []
      };

      results.forEach(row => {
        if (row.product_id) {
          order.items.push({
            product_id: row.product_id,
            product_name: row.product_name,
            quantity: row.quantity,
            price: row.price,
            submitted_at: row.submitted_at,
            subtotal: row.quantity * row.price
          });
        }
      });

      res.json(order);
    });
  }
);

// 更新訂單狀態
router.put("/:id/status", verifyToken, verifyAdmin, (req, res) => {

    const orderId = req.params.id;

    const {
        order_status,
        payment_status,
        cancel_reason
    } = req.body;


    if (!order_status && !payment_status) {
        return res.status(400).json({
            message: "需要 order_status 或 payment_status"
        });
    }

    if (order_status === "已取消") {

        if (!cancel_reason || !cancel_reason.trim()) {
            return res.status(400).json({
                message: "取消訂單時必須提供取消原因"
            });
        }

    }


    const fields = [];
    const values = [];

    if (order_status) {

        fields.push("order_status = ?");
        values.push(order_status);

    }

    if (payment_status) {

        fields.push("payment_status = ?");
        values.push(payment_status);

    }

    if (payment_status === "已付款") {

        fields.push("paid_at = NOW()");

    }

    if (order_status === "已出貨") {

        fields.push("shipped_at = NOW()");

    }

    if (order_status === "已完成") {

        fields.push("completed_at = NOW()");

    }

    if (order_status === "已取消") {

        fields.push("cancel_reason = ?");
        values.push(cancel_reason.trim());

        fields.push("cancelled_at = NOW()");

    }
    const sql = `
        UPDATE orders
        SET ${fields.join(", ")}
        WHERE id = ?
    `;

    values.push(orderId);


    const completeUpdate = () => {

        return res.json({
            message: "訂單狀態已更新"
        });

    };

    if (payment_status === "已付款") {

        db.getConnection((err, connection) => {

            if (err) {

                console.error(
                    "取得資料庫連線失敗:",
                    err
                );

                return res.status(500).json({
                    message: "更新訂單失敗"
                });

            }


            connection.beginTransaction((err) => {

                if (err) {

                    connection.release();

                    console.error(
                        "Transaction 開始失敗:",
                        err
                    );

                    return res.status(500).json({
                        message: "更新訂單失敗"
                    });

                }


                // ========================================
                // 1. 更新 orders
                // ========================================

                connection.query(
                    sql,
                    values,
                    (err, result) => {

                        if (err) {

                            return connection.rollback(() => {

                                connection.release();

                                console.error(
                                    "更新訂單狀態失敗:",
                                    err
                                );

                                return res.status(500).json({
                                    message: "更新訂單失敗"
                                });

                            });

                        }


                        // ========================================
                        // 2. 更新 payments
                        // ========================================

                        const paymentSql = `
                            UPDATE payments
                            SET
                                status = '已確認',
                                confirmed_at = NOW()
                            WHERE order_id = ?
                            AND status != '已確認'
                        `;


                        connection.query(
                            paymentSql,
                            [orderId],
                            (err, paymentResult) => {

                                if (err) {

                                    return connection.rollback(() => {

                                        connection.release();

                                        console.error(
                                            "更新付款狀態失敗:",
                                            err
                                        );

                                        return res.status(500).json({
                                            message: "更新付款失敗"
                                        });

                                    });

                                }


                                // ========================================
                                // 3. Commit
                                // ========================================

                                connection.commit((err) => {

                                    if (err) {

                                        return connection.rollback(() => {

                                            connection.release();

                                            console.error(
                                                "Transaction commit 失敗:",
                                                err
                                            );

                                            return res.status(500).json({
                                                message: "更新訂單失敗"
                                            });

                                        });

                                    }


                                    // ========================================
                                    // 4. 釋放 connection
                                    // ========================================

                                    connection.release();

                                    completeUpdate();

                                });

                            }
                        );

                    }
                );

            });

        });

    }

    else {

        db.query(
            sql,
            values,
            (err, result) => {

                if (err) {

                    console.error(
                        "更新訂單狀態失敗:",
                        err
                    );

                    return res.status(500).json({
                        message: "更新訂單失敗"
                    });

                }

                completeUpdate();

            }
        );

    }

});

router.post("/", verifyToken, verifyAdmin, (req, res) => {

    const {
        user_id,
        receiver_name,
        receiver_phone,
        receiver_email,
        receiver_address,
        items
    } = req.body;

    if (!receiver_name || !receiver_phone || !receiver_address) {
        return res.status(400).json({
            message: "缺少收件人資料"
        });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            message: "缺少商品資料"
        });
    }

    db.getConnection((err, connection) => {

        if (err) {
            console.error("取得資料庫連線失敗", err);

            return res.status(500).json({
                message: "建立訂單失敗"
            });
        }

        connection.beginTransaction((err) => {

            if (err) {
                connection.release();

                console.error("Transaction 開始失敗", err);

                return res.status(500).json({
                    message: "建立訂單失敗"
                });
            }

            const productIds = items.map(it => it.product_id);

            const placeholders = productIds
                .map(() => "?")
                .join(",");

            const sql = `
                SELECT id, price, stock, name
                FROM products
                WHERE id IN (${placeholders})
            `;

            connection.query(
                sql,
                productIds,
                (err, products) => {

                    if (err) {

                        console.error("查詢商品失敗", err);

                        return connection.rollback(() => {
                            connection.release();

                            res.status(500).json({
                                message: "查詢商品失敗"
                            });
                        });
                    }

                    const prodMap = new Map();

                    products.forEach(product => {
                        prodMap.set(product.id, product);
                    });

                    let totalAmount = 0;

                    for (const it of items) {

                        const product = prodMap.get(it.product_id);

                        if (!product) {

                            return connection.rollback(() => {
                                connection.release();

                                res.status(400).json({
                                    message: `商品 ${it.product_id} 不存在`
                                });
                            });
                        }

                        if (it.quantity <= 0) {

                            return connection.rollback(() => {
                                connection.release();

                                res.status(400).json({
                                    message: `${product.name} 商品數量不正確`
                                });
                            });
                        }

                        if (it.quantity > product.stock) {

                            return connection.rollback(() => {
                                connection.release();

                                res.status(400).json({
                                    message: `${product.name} 庫存不足`
                                });
                            });
                        }

                        totalAmount += product.price * it.quantity;
                    }

                    const insertOrderSql = `
                        INSERT INTO orders (
                            user_id,
                            receiver_name,
                            receiver_phone,
                            receiver_email,
                            receiver_address,
                            total_amount,
                            order_status,
                            payment_status
                        )
                        VALUES (
                            ?, ?, ?, ?, ?, ?,
                            '待付款',
                            '未付款'
                        )
                    `;

                    const userIdVal = user_id ? user_id : null;

                    connection.query(
                        insertOrderSql,
                        [
                            userIdVal,
                            receiver_name,
                            receiver_phone,
                            receiver_email,
                            receiver_address,
                            totalAmount
                        ],
                        (err, orderResult) => {

                            if (err) {

                                console.error(
                                    "建立 orders 失敗",
                                    err
                                );

                                return connection.rollback(() => {
                                    connection.release();

                                    res.status(500).json({
                                        message: "建立訂單失敗"
                                    });
                                });
                            }

                            const orderId = orderResult.insertId;

                            // 建立訂單商品
                            const insertItem = (index) => {

                                if (index >= items.length) {

                                    // 所有 order_items 建立完成
                                    // 開始扣庫存
                                    updateStock(0);

                                    return;
                                }

                                const it = items[index];

                                const product =
                                    prodMap.get(it.product_id);

                                const itemSql = `
                                    INSERT INTO order_items (
                                        order_id,
                                        product_id,
                                        quantity,
                                        price
                                    )
                                    VALUES (?, ?, ?, ?)
                                `;

                                connection.query(
                                    itemSql,
                                    [
                                        orderId,
                                        it.product_id,
                                        it.quantity,
                                        product.price
                                    ],
                                    (err) => {

                                        if (err) {

                                            console.error(
                                                "建立 order_items 失敗",
                                                err
                                            );

                                            return connection.rollback(() => {
                                                connection.release();

                                                res.status(500).json({
                                                    message:
                                                        "建立訂單商品失敗"
                                                });
                                            });
                                        }

                                        insertItem(index + 1);
                                    }
                                );
                            };

                            // 扣庫存
                            const updateStock = (index) => {

                                if (index >= items.length) {

                                    connection.commit((err) => {

                                        if (err) {

                                            console.error(
                                                "Transaction commit 失敗",
                                                err
                                            );

                                            return connection.rollback(() => {
                                                connection.release();

                                                res.status(500).json({
                                                    message:
                                                        "建立訂單失敗"
                                                });
                                            });
                                        }

                                        connection.release();

                                        return res.status(201).json({
                                            message: "訂單建立成功",
                                            order_id: orderId,
                                            total_amount: totalAmount
                                        });
                                    });

                                    return;
                                }

                                const it = items[index];

                                const stockSql = `
                                    UPDATE products
                                    SET stock = stock - ?
                                    WHERE id = ?
                                    AND stock >= ?
                                `;

                              connection.query(
                                  stockSql,
                                  [
                                      it.quantity,
                                      it.product_id,
                                      it.quantity
                                  ],
                                  (err, result) => {

                                      if (err) {
                                          // rollback
                                      }

                                      if (result.affectedRows === 0) {
                                          // 庫存不足
                                          return connection.rollback(() => {
                                              connection.release();

                                              res.status(400).json({
                                                  message: "商品庫存不足"
                                              });
                                          });
                                      }

                                      updateStock(index + 1);
                                  }
                              );
                            };

                            insertItem(0);
                        }
                    );
                }
            );
        });
    });
});
module.exports = router;