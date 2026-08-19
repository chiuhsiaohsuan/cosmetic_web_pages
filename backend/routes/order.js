const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require("../middleware/verifyToken");

// 建立訂單
router.post("/", (req, res) => {

    const {
        user_id,
        receiver_name,
        receiver_phone,
        receiver_email,
        receiver_address
    } = req.body;


    if (
        !user_id ||
        !receiver_name ||
        !receiver_phone ||
        !receiver_email ||
        !receiver_address
    ) {
        return res.status(400).json({
            message: "缺少訂單資料"
        });
    }

    db.getConnection((err, connection) => {

        if (err) {

            console.error(
                "取得資料庫連線失敗",
                err
            );

            return res.status(500).json({
                message: "建立訂單失敗"
            });
        }

        connection.beginTransaction((err) => {

            if (err) {

                console.error(
                    "Transaction 開始失敗",
                    err
                );

                connection.release();

                return res.status(500).json({
                    message: "建立訂單失敗"
                });
            }


            const cartSql = `
                SELECT
                    c.product_id,
                    c.quantity,
                    p.name,
                    p.price,
                    p.stock
                FROM cart_item c
                JOIN products p
                    ON c.product_id = p.id
                WHERE c.user_id = ?
            `;


            connection.query(
                cartSql,
                [user_id],
                (err, cartItems) => {

                    if (err) {

                        console.error(
                            "查詢購物車失敗",
                            err
                        );

                        return connection.rollback(() => {

                            connection.release();

                            res.status(500).json({
                                message: "查詢購物車失敗"
                            });

                        });

                    }

                    if (cartItems.length === 0) {

                        return connection.rollback(() => {

                            connection.release();

                            res.status(400).json({
                                message: "購物車是空的"
                            });

                        });

                    }



                    for (const item of cartItems) {

                        if (item.quantity > item.stock) {

                            return connection.rollback(() => {

                                connection.release();

                                res.status(400).json({
                                    message:
                                        `${item.name} 庫存不足，目前庫存：${item.stock}，購買數量：${item.quantity}`
                                });

                            });

                        }

                    }

                    let totalAmount = 0;

                    cartItems.forEach((item) => {

                        totalAmount +=
                            Number(item.price) *
                            Number(item.quantity);

                    });

                    const orderSql = `
                        INSERT INTO orders
                        (
                            user_id,
                            receiver_name,
                            receiver_phone,
                            receiver_email,
                            receiver_address,
                            total_amount,
                            order_status,
                            payment_status
                        )
                        VALUES (?, ?, ?, ?, ?, ?, '待付款', '未付款')
                    `;


                    connection.query(
                        orderSql,
                        [
                            user_id,
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


                            const orderId =
                                orderResult.insertId;

                            const insertItem = (index) => {

                                // 所有商品都建立完成
                                if (
                                    index >=
                                    cartItems.length
                                ) {

                                    updateStock(0);

                                    return;
                                }


                                const item =
                                    cartItems[index];


                                const itemSql = `
                                    INSERT INTO order_items
                                    (
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
                                        item.product_id,
                                        item.quantity,
                                        item.price
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


                                        insertItem(
                                            index + 1
                                        );

                                    }
                                );

                            };

                            const updateStock = (index) => {

                                // 所有庫存都扣完
                                if (
                                    index >=
                                    cartItems.length
                                ) {

                                    deleteCart();

                                    return;
                                }


                                const item =
                                    cartItems[index];

                                const stockSql = `
                                    UPDATE products
                                    SET stock = stock - ?
                                    WHERE id = ?
                                    AND stock >= ?
                                `;


                                connection.query(
                                    stockSql,
                                    [
                                        item.quantity,
                                        item.product_id,
                                        item.quantity
                                    ],
                                    (err, result) => {

                                        if (err) {

                                            console.error(
                                                "扣庫存失敗",
                                                err
                                            );

                                            return connection.rollback(() => {

                                                connection.release();

                                                res.status(500).json({
                                                    message:
                                                        "扣庫存失敗"
                                                });

                                            });

                                        }


                                        if (
                                            result.affectedRows === 0
                                        ) {

                                            return connection.rollback(() => {

                                                connection.release();

                                                res.status(400).json({
                                                    message:
                                                        `${item.name} 庫存不足`
                                                });

                                            });

                                        }


                                        updateStock(
                                            index + 1
                                        );

                                    }
                                );

                            };


                            const deleteCart = () => {

                                const deleteSql = `
                                    DELETE FROM cart_item
                                    WHERE user_id = ?
                                `;


                                connection.query(
                                    deleteSql,
                                    [user_id],
                                    (err) => {

                                        if (err) {

                                            console.error(
                                                "清空購物車失敗",
                                                err
                                            );

                                            return connection.rollback(() => {

                                                connection.release();

                                                res.status(500).json({
                                                    message:
                                                        "清空購物車失敗"
                                                });

                                            });

                                        }

                                        connection.commit(
                                            (err) => {

                                                if (err) {

                                                    console.error(
                                                        "Transaction commit 失敗",
                                                        err
                                                    );

                                                    return connection.rollback(
                                                        () => {

                                                            connection.release();

                                                            res.status(500).json({
                                                                message:
                                                                    "訂單建立失敗"
                                                            });

                                                        }
                                                    );

                                                }

                                                connection.release();


                                                res.status(201).json({
                                                    message:
                                                        "訂單建立成功",
                                                    order_id:
                                                        orderId,
                                                    total_amount:
                                                        totalAmount
                                                });

                                            }
                                        );

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
router.get('/my', verifyToken, (req, res) => {

  const userId = req.user.id;

  const sql = `
    SELECT
      o.id,
      o.user_id,

      o.receiver_name,
      o.receiver_phone,
      o.receiver_email,
      o.receiver_address,

      o.total_amount,

      o.order_status,
      o.payment_status,

      o.created_at,
      o.paid_at,

      o.shipped_at,
      o.completed_at,

      o.cancel_reason,
      o.cancelled_at,

      oi.product_id,
      oi.quantity,
      oi.price,

      p.name AS product_name

    FROM orders o

    LEFT JOIN order_items oi
      ON o.id = oi.order_id

    LEFT JOIN products p
      ON oi.product_id = p.id

    WHERE o.user_id = ?

    ORDER BY o.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {

    if (err) {

      console.error(
        '取得我的訂單失敗:',
        err
      );

      return res.status(500).json({
        message: '取得訂單失敗'
      });
    }


    const orders = [];


    results.forEach(row => {

      let order =
        orders.find(
          order => order.id === row.id
        );


      // ========================================
      // 建立訂單
      // ========================================

      if (!order) {

        order = {

          id: row.id,

          user_id: row.user_id,


          // 收件資訊
          receiver_name:
            row.receiver_name,

          receiver_phone:
            row.receiver_phone,

          receiver_email:
            row.receiver_email,

          receiver_address:
            row.receiver_address,


          // 金額
          total_amount:
            row.total_amount,


          // 狀態
          order_status:
            row.order_status,

          payment_status:
            row.payment_status,


          // 時間
          created_at:
            row.created_at,

          paid_at:
            row.paid_at,

          shipped_at:
            row.shipped_at,

          completed_at:
            row.completed_at,


          // 取消資訊
          cancel_reason:
            row.cancel_reason,

          cancelled_at:
            row.cancelled_at,


          // 商品
          items: []

        };


        orders.push(order);
      }


      // ========================================
      // 加入商品
      // ========================================

      if (row.product_id) {

        order.items.push({

          product_id:
            row.product_id,

          product_name:
            row.product_name,

          quantity:
            row.quantity,

          price:
            row.price,

          subtotal:
            row.quantity *
            row.price

        });

      }

    });


    res.json(orders);

  });

});
router.get('/:id', (req, res) => {

    const orderId = req.params.id;

    const sql = `
        SELECT
            id,
            user_id,
            receiver_name,
            receiver_phone,
            receiver_email,
            receiver_address,
            total_amount,
            order_status,
            payment_status,
            created_at,
            paid_at
        FROM orders
        WHERE id = ?
    `;

    db.query(sql, [orderId], (err, results) => {

        if (err) {
            console.error("查詢訂單失敗", err);

            return res.status(500).json({
                message: "查詢訂單失敗"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "找不到訂單"
            });
        }

        res.json(results[0]);
    });

});

router.put('/:id/status', verifyToken, (req, res) => {

    const orderId = req.params.id;

    const {
        order_status,
        cancel_reason
    } = req.body;

    const userId = req.user.id;


    // ========================================
    // 1. 檢查 order_status
    // ========================================

    if (!order_status) {
        return res.status(400).json({
            message: '需要 order_status'
        });
    }


    // ========================================
    // 2. 只允許兩種操作
    //
    // 待付款 → 已取消
    // 已成立 → 已取消
    //
    // 已出貨 → 已完成
    // ========================================

    if (
        order_status !== '已取消' &&
        order_status !== '已完成'
    ) {
        return res.status(400).json({
            message: '不允許的訂單狀態'
        });
    }


    // ========================================
    // 3. 取消訂單
    // ========================================

    if (order_status === '已取消') {


        // 如果有取消原因，就檢查一下
        if (!cancel_reason) {
            return res.status(400).json({
                message: '請提供取消原因'
            });
        }


        db.getConnection((err, connection) => {

            if (err) {

                console.error(
                    '取得資料庫連線失敗',
                    err
                );

                return res.status(500).json({
                    message: '取消訂單失敗'
                });
            }


            // ========================================
            // 開始 Transaction
            // ========================================

            connection.beginTransaction((err) => {

                if (err) {

                    console.error(
                        'Transaction 開始失敗',
                        err
                    );

                    connection.release();

                    return res.status(500).json({
                        message: '取消訂單失敗'
                    });
                }


                // ========================================
                // 4. 查詢訂單
                //
                // FOR UPDATE：
                // 鎖住這筆訂單，避免同時重複取消
                // ========================================

                const orderSql = `
                    SELECT
                        id,
                        order_status
                    FROM orders
                    WHERE id = ?
                    AND user_id = ?
                    FOR UPDATE
                `;


                connection.query(
                    orderSql,
                    [orderId, userId],
                    (err, orders) => {

                        if (err) {

                            console.error(
                                '查詢訂單失敗',
                                err
                            );

                            return connection.rollback(() => {

                                connection.release();

                                res.status(500).json({
                                    message:
                                        '取消訂單失敗'
                                });

                            });

                        }


                        // ========================================
                        // 訂單不存在
                        // ========================================

                        if (orders.length === 0) {

                            return connection.rollback(() => {

                                connection.release();

                                res.status(404).json({
                                    message:
                                        '找不到訂單'
                                });

                            });

                        }


                        const order = orders[0];


                        // ========================================
                        // 5. 確認訂單可以取消
                        //
                        // 只有：
                        // 待付款
                        // 已成立
                        //
                        // 才可以取消
                        // ========================================

                        if (
                            order.order_status !== '待付款' &&
                            order.order_status !== '已成立'
                        ) {

                            return connection.rollback(() => {

                                connection.release();

                                res.status(400).json({
                                    message:
                                        '目前無法取消此訂單'
                                });

                            });

                        }


                        // ========================================
                        // 6. 查詢訂單商品
                        // ========================================

                        const itemSql = `
                            SELECT
                                product_id,
                                quantity
                            FROM order_items
                            WHERE order_id = ?
                        `;


                        connection.query(
                            itemSql,
                            [orderId],
                            (err, items) => {

                                if (err) {

                                    console.error(
                                        '查詢訂單商品失敗',
                                        err
                                    );

                                    return connection.rollback(() => {

                                        connection.release();

                                        res.status(500).json({
                                            message:
                                                '取消訂單失敗'
                                        });

                                    });

                                }


                                // ========================================
                                // 7. 回補庫存
                                // ========================================

                                const restoreStock = (index) => {


                                    // 所有商品都處理完成
                                    if (
                                        index >=
                                        items.length
                                    ) {

                                        updateOrder();

                                        return;
                                    }


                                    const item =
                                        items[index];


                                    const stockSql = `
                                        UPDATE products
                                        SET stock = stock + ?
                                        WHERE id = ?
                                    `;


                                    connection.query(
                                        stockSql,
                                        [
                                            item.quantity,
                                            item.product_id
                                        ],
                                        (err, result) => {

                                            if (err) {

                                                console.error(
                                                    '回補庫存失敗',
                                                    err
                                                );

                                                return connection.rollback(() => {

                                                    connection.release();

                                                    res.status(500).json({
                                                        message:
                                                            '回補庫存失敗'
                                                    });

                                                });

                                            }


                                            // 商品不存在
                                            if (
                                                result.affectedRows === 0
                                            ) {

                                                return connection.rollback(() => {

                                                    connection.release();

                                                    res.status(400).json({
                                                        message:
                                                            '商品不存在，無法回補庫存'
                                                    });

                                                });

                                            }


                                            restoreStock(
                                                index + 1
                                            );

                                        }
                                    );

                                };


                                // ========================================
                                // 8. 更新訂單
                                // ========================================

                                const updateOrder = () => {

                                    const updateSql = `
                                        UPDATE orders
                                        SET
                                            order_status = '已取消',
                                            cancel_reason = ?,
                                            cancelled_at = NOW()
                                        WHERE id = ?
                                        AND user_id = ?
                                        AND order_status IN ('待付款', '已成立')
                                    `;


                                    connection.query(
                                        updateSql,
                                        [
                                            cancel_reason,
                                            orderId,
                                            userId
                                        ],
                                        (err, result) => {

                                            if (err) {

                                                console.error(
                                                    '更新訂單狀態失敗',
                                                    err
                                                );

                                                return connection.rollback(() => {

                                                    connection.release();

                                                    res.status(500).json({
                                                        message:
                                                            '取消訂單失敗'
                                                    });

                                                });

                                            }


                                            // ========================================
                                            // 更新失敗
                                            // ========================================

                                            if (
                                                result.affectedRows === 0
                                            ) {

                                                return connection.rollback(() => {

                                                    connection.release();

                                                    res.status(400).json({
                                                        message:
                                                            '目前無法取消此訂單'
                                                    });

                                                });

                                            }


                                            // ========================================
                                            // 9. Commit
                                            // ========================================

                                            connection.commit(
                                                (err) => {

                                                    if (err) {

                                                        console.error(
                                                            'Transaction commit 失敗',
                                                            err
                                                        );

                                                        return connection.rollback(() => {

                                                            connection.release();

                                                            res.status(500).json({
                                                                message:
                                                                    '取消訂單失敗'
                                                            });

                                                        });

                                                    }


                                                    connection.release();


                                                    // ========================================
                                                    // 10. 成功
                                                    // ========================================

                                                    res.json({
                                                        message:
                                                            '訂單已取消'
                                                    });

                                                }
                                            );

                                        }
                                    );

                                };


                                // 開始回補庫存
                                restoreStock(0);

                            }
                        );

                    }
                );

            });

        });


        return;
    }

// ========================================
// 已出貨 → 已完成
// 使用者確認收貨
// ========================================

    if (order_status === '已完成') {

        const sql = `
            UPDATE orders
            SET
                order_status = '已完成',
                completed_at = NOW()
            WHERE id = ?
            AND user_id = ?
            AND order_status = '已出貨'
        `;

        db.query(
            sql,
            [
                orderId,
                userId
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        '完成訂單失敗',
                        err
                    );

                    return res.status(500).json({
                        message: '完成訂單失敗'
                    });
                }

                if (result.affectedRows === 0) {

                    return res.status(400).json({
                        message: '目前無法完成此訂單'
                    });
                }

                res.json({
                    message: '訂單已完成'
                });

            }
        );

        return;
    }

});

module.exports = router;