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
      LEFT JOIN users u
        ON o.user_id = u.id
      LEFT JOIN order_items oi
        ON o.id = oi.order_id
      LEFT JOIN products p
        ON oi.product_id = p.id
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
        receiver_address: results[0].receiver_address,
        total_amount: results[0].total_amount,
        order_status: results[0].order_status,
        payment_status: results[0].payment_status,
        created_at: results[0].created_at,
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
            subtotal: row.quantity * row.price
          });
        }
      });

      res.json(order);
    });
  }
);

// 更新訂單狀態
router.put(
  "/:id/status",
  verifyToken,
  verifyAdmin,
  (req, res) => {
    const orderId = req.params.id;
    const { order_status, payment_status } = req.body;

    if (!order_status && !payment_status) {
      return res.status(400).json({
        message: "需要 order_status 或 payment_status"
      });
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

    const sql = `
      UPDATE orders
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    values.push(orderId);

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("更新訂單狀態失敗", err);
        return res.status(500).json({
          message: "更新訂單失敗"
        });
      }

      res.json({
        message: "訂單狀態已更新"
      });
    });
  }
);

module.exports = router;
