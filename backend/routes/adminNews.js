const express = require('express');
const router = express.Router();

const db = require('../db');
router.get('/', (req, res) => {
    const sql = `
        SELECT id, DATE_FORMAT(date, '%Y-%m-%d') AS date, title
        FROM news
        ORDER BY date DESC, id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('取得新聞失敗:', err);
            return res.status(500).json({
                message: '取得新聞失敗'
            });
        }

        res.json(results);
    });
});
router.post('/', (req, res) => {

    const { date, title } = req.body;

    if (!date || !title) {
        return res.status(400).json({
            message: '日期與標題不可為空'
        });
    }

    const sql = `
        INSERT INTO news (date, title)
        VALUES (?, ?)
    `;

    db.query(sql, [date, title], (err, result) => {

        if (err) {
            console.error('新增新聞失敗:', err);

            return res.status(500).json({
                message: '新增新聞失敗'
            });
        }

        res.status(201).json({
            message: '新增新聞成功',
            id: result.insertId
        });
    });
});
router.put('/:id', (req, res) => {

    const { id } = req.params;
    const { date, title } = req.body;

    if (!date || !title) {
        return res.status(400).json({
            message: '日期與標題不可為空'
        });
    }

    const sql = `
        UPDATE news
        SET date = ?, title = ?
        WHERE id = ?
    `;

    db.query(sql, [date, title, id], (err, result) => {

        if (err) {
            console.error('修改新聞失敗:', err);

            return res.status(500).json({
                message: '修改新聞失敗'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: '找不到這筆新聞'
            });
        }

        res.json({
            message: '修改新聞成功'
        });
    });
});
router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM news
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error('刪除新聞失敗:', err);

            return res.status(500).json({
                message: '刪除新聞失敗'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: '找不到這筆新聞'
            });
        }

        res.json({
            message: '刪除新聞成功'
        });
    });
});
module.exports = router;