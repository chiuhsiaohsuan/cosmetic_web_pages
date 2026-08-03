const express = require('express');
const router = express.Router();

const db = require('../db');
// 提交付款資訊
router.post('/', (req, res) => {

    const {
        order_id,
        payer_name,
        account_last5,
        amount
    } = req.body;

    // 檢查資料
    if (!order_id || !payer_name || !account_last5 || !amount) {
        return res.status(400).json({
            message: "缺少付款資料"
        });
    }

    // 確認匯款後五碼格式
    if (!/^\d{5}$/.test(account_last5)) {
        return res.status(400).json({
            message: "匯款後五碼必須是 5 位數字"
        });
    }

    // 1. 先查詢訂單
    const orderSql = `
        SELECT
            id,
            user_id,
            total_amount,
            order_status,
            payment_status
        FROM orders
        WHERE id = ?
    `;

    db.query(orderSql, [order_id], (err, orders) => {

        if (err) {
            console.error("查詢訂單失敗", err);

            return res.status(500).json({
                message: "查詢訂單失敗"
            });
        }

        // 找不到訂單
        if (orders.length === 0) {
            return res.status(404).json({
                message: "找不到訂單"
            });
        }

        const order = orders[0];

        // 訂單已取消
        if (order.order_status === "已取消") {
            return res.status(400).json({
                message: "訂單已取消"
            });
        }

        // 已經付款
        if (order.payment_status === "已付款") {
            return res.status(400).json({
                message: "此訂單已付款"
            });
        }

        // 確認金額
        if (Number(amount) !== Number(order.total_amount)) {
            return res.status(400).json({
                message: `匯款金額錯誤，應付金額為 ${order.total_amount}`
            });
        }

        // 2. 檢查是否已經送過付款資料
        const checkPaymentSql = `
            SELECT id
            FROM payments
            WHERE order_id = ?
              AND status = '待確認'
        `;

        db.query(checkPaymentSql, [order_id], (err, payments) => {

            if (err) {
                console.error("查詢付款資料失敗", err);

                return res.status(500).json({
                    message: "查詢付款資料失敗"
                });
            }

            if (payments.length > 0) {
                return res.status(400).json({
                    message: "此訂單已有待確認的付款資料"
                });
            }

            // 3. 新增付款資料
            const paymentSql = `
                INSERT INTO payments
                (
                    order_id,
                    payer_name,
                    account_last5,
                    amount,
                    status
                )
                VALUES (?, ?, ?, ?, '待確認')
            `;

            db.query(
                paymentSql,
                [
                    order_id,
                    payer_name,
                    account_last5,
                    amount
                ],
                (err, result) => {

                    if (err) {
                        console.error("建立付款資料失敗", err);

                        return res.status(500).json({
                            message: "建立付款資料失敗"
                        });
                    }

                    // 4. 更新訂單付款狀態
                    const updateOrderSql = `
                        UPDATE orders
                        SET payment_status = '待確認'
                        WHERE id = ?
                    `;

                    db.query(
                        updateOrderSql,
                        [order_id],
                        (err) => {

                            if (err) {
                                console.error(
                                    "更新訂單付款狀態失敗",
                                    err
                                );

                                return res.status(500).json({
                                    message: "更新訂單付款狀態失敗"
                                });
                            }

                            res.status(201).json({
                                message: "付款資訊已送出，等待後台確認",
                                payment_id: result.insertId,
                                order_id: order_id
                            });

                        }
                    );

                }
            );

        });

    });

});
// 後台確認付款
router.put('/:id/confirm', (req, res) => {

    const paymentId = req.params.id;

    db.beginTransaction((err) => {

        if (err) {
            console.error("Transaction 開始失敗", err);

            return res.status(500).json({
                message: "確認付款失敗"
            });
        }

        const paymentSql = `
            SELECT
                p.id,
                p.order_id,
                p.amount,
                p.status,
                o.total_amount
            FROM payments p
            JOIN orders o
                ON p.order_id = o.id
            WHERE p.id = ?
        `;

        db.query(paymentSql, [paymentId], (err, results) => {

            if (err) {
                return db.rollback(() => {
                    res.status(500).json({
                        message: "查詢付款資料失敗"
                    });
                });
            }

            if (results.length === 0) {
                return db.rollback(() => {
                    res.status(404).json({
                        message: "找不到付款資料"
                    });
                });
            }

            const payment = results[0];

            if (payment.status === "已確認") {
                return db.rollback(() => {
                    res.status(400).json({
                        message: "此付款已確認"
                    });
                });
            }

            if (Number(payment.amount) !== Number(payment.total_amount)) {
                return db.rollback(() => {
                    res.status(400).json({
                        message: "付款金額與訂單金額不符"
                    });
                });
            }

            // 更新 payments
            const updatePaymentSql = `
                UPDATE payments
                SET
                    status = '已確認',
                    confirmed_at = NOW()
                WHERE id = ?
            `;

            db.query(
                updatePaymentSql,
                [paymentId],
                (err) => {

                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({
                                message: "更新付款狀態失敗"
                            });
                        });
                    }

                    // 更新 orders
                    const updateOrderSql = `
                        UPDATE orders
                        SET
                            payment_status = '已付款',
                            order_status = '已成立',
                            paid_at = NOW()
                        WHERE id = ?
                    `;

                    db.query(
                        updateOrderSql,
                        [payment.order_id],
                        (err) => {

                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({
                                        message: "更新訂單狀態失敗"
                                    });
                                });
                            }

                            db.commit((err) => {

                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: "確認付款失敗"
                                        });
                                    });
                                }

                                res.json({
                                    message: "付款確認成功",
                                    payment_id: paymentId,
                                    order_id: payment.order_id
                                });

                            });
                        }
                    );
                }
            );

        });

    });

});

module.exports = router;