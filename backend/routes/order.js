const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require("../middleware/verifyToken");

router.post('/', (req, res) => {

    const {
        user_id,
        receiver_name,
        receiver_phone,
        receiver_address
    } = req.body;

    // 檢查資料
    if (
        !user_id ||
        !receiver_name ||
        !receiver_phone ||
        !receiver_address
    ) {
        return res.status(400).json({
            message: "缺少訂單資料"
        });
    }

    // 開始交易
    db.beginTransaction((err) => {

        if (err) {
            console.error("Transaction 開始失敗", err);

            return res.status(500).json({
                message: "建立訂單失敗"
            });
        }

        // 1. 查詢購物車
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

        db.query(cartSql, [user_id], (err, cartItems) => {

            if (err) {
                console.error("查詢購物車失敗", err);

                return db.rollback(() => {
                    res.status(500).json({
                        message: "查詢購物車失敗"
                    });
                });
            }

            // 購物車為空
            if (cartItems.length === 0) {

                return db.rollback(() => {
                    res.status(400).json({
                        message: "購物車是空的"
                    });
                });

            }

            // 2. 檢查庫存
            for (const item of cartItems) {

                if (item.quantity > item.stock) {

                    return db.rollback(() => {
                        res.status(400).json({
                            message: `${item.name} 庫存不足`
                        });
                    });

                }

            }

            // 3. 計算總金額
            let totalAmount = 0;

            cartItems.forEach(item => {
                totalAmount += item.price * item.quantity;
            });


            // 4. 建立訂單
            const orderSql = `
                INSERT INTO orders
                (
                    user_id,
                    receiver_name,
                    receiver_phone,
                    receiver_address,
                    total_amount,
                    order_status,
                    payment_status
                )
                VALUES (?, ?, ?, ?, ?, '待付款', '未付款')
            `;

            db.query(
                orderSql,
                [
                    user_id,
                    receiver_name,
                    receiver_phone,
                    receiver_address,
                    totalAmount
                ],
                (err, orderResult) => {

                    if (err) {
                        console.error("建立 orders 失敗", err);

                        return db.rollback(() => {
                            res.status(500).json({
                                message: "建立訂單失敗"
                            });
                        });
                    }

                    const orderId = orderResult.insertId;


                    // 5. 建立 order_items
                    const insertItem = (index) => {

                        if (index >= cartItems.length) {

                            // 全部 order_items 建立完成
                            // 開始扣庫存
                            updateStock(0);

                            return;
                        }

                        const item = cartItems[index];

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

                        db.query(
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

                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: "建立訂單商品失敗"
                                        });
                                    });
                                }

                                insertItem(index + 1);
                            }
                        );
                    };


                    // 6. 扣庫存
                    const updateStock = (index) => {

                        if (index >= cartItems.length) {

                            // 全部庫存扣完
                            deleteCart();

                            return;
                        }

                        const item = cartItems[index];

                        const stockSql = `
                            UPDATE products
                            SET stock = stock - ?
                            WHERE id = ?
                        `;

                        db.query(
                            stockSql,
                            [
                                item.quantity,
                                item.product_id
                            ],
                            (err, result) => {

                                if (err) {
                                    console.error(
                                        "扣庫存失敗",
                                        err
                                    );

                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: "扣庫存失敗"
                                        });
                                    });
                                }

                                updateStock(index + 1);
                            }
                        );
                    };


                    // 7. 清空購物車
                    const deleteCart = () => {

                        const deleteSql = `
                            DELETE FROM cart_item
                            WHERE user_id = ?
                        `;

                        db.query(
                            deleteSql,
                            [user_id],
                            (err) => {

                                if (err) {
                                    console.error(
                                        "清空購物車失敗",
                                        err
                                    );

                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: "清空購物車失敗"
                                        });
                                    });
                                }


                                // 8. 全部成功
                                db.commit((err) => {

                                    if (err) {

                                        console.error(
                                            "Transaction commit 失敗",
                                            err
                                        );

                                        return db.rollback(() => {
                                            res.status(500).json({
                                                message: "訂單建立失敗"
                                            });
                                        });

                                    }


                                    // 成功
                                    res.status(201).json({
                                        message: "訂單建立成功",
                                        order_id: orderId,
                                        total_amount: totalAmount
                                    });

                                });

                            }
                        );

                    };


                    // 開始建立 order_items
                    insertItem(0);

                }
            );

        });

    });

});
// ==============================
// 我的訂單
// GET /api/orders/my
// ==============================
router.get('/my', verifyToken, (req, res) => {

  const userId = req.user.id;

  const sql = `
    SELECT
      o.id,
      o.user_id,
      o.receiver_name,
      o.receiver_phone,
      o.receiver_address,
      o.total_amount,
      o.order_status,
      o.payment_status,
      o.created_at,
      o.paid_at,

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
      console.error('取得我的訂單失敗:', err);

      return res.status(500).json({
        message: '取得訂單失敗'
      });
    }


    const orders = [];


    results.forEach(row => {

      let order = orders.find(order => order.id === row.id);


      // 如果這筆訂單還沒有建立
      if (!order) {

        order = {
          id: row.id,
          user_id: row.user_id,

          receiver_name: row.receiver_name,
          receiver_phone: row.receiver_phone,
          receiver_address: row.receiver_address,

          total_amount: row.total_amount,

          order_status: row.order_status,
          payment_status: row.payment_status,

          created_at: row.created_at,
          paid_at: row.paid_at,

          items: []
        };

        orders.push(order);
      }


      // 加入商品
      if (row.product_id) {

        order.items.push({

          product_id: row.product_id,

          product_name: row.product_name,

          quantity: row.quantity,

          price: row.price,

          subtotal: row.quantity * row.price

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
module.exports = router;