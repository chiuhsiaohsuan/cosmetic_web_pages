const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require('../db');

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(null,"uploads/articles");

    },


    filename:(req,file,cb)=>{

        const ext = path.extname(file.originalname);

        cb(
            null,
            Date.now()+ext
        );

    }
});
const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上傳圖片'));
    }

  }

});
// 取得所有文章
router.get('/', (req, res) => {

    const sql = `
        SELECT *
        FROM articles
        ORDER BY date DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: '取得文章失敗'
            });
        }

        res.json(result);
    });
});
// 取得單篇文章
router.get('/articles/:id', (req, res) => {

  const { id } = req.params;

  const sql = 'SELECT * FROM articles WHERE id = ?';

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.error('取得文章失敗:', err);

      return res.status(500).json({
        message: '取得文章失敗'
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: '找不到此文章'
      });
    }

    res.status(200).json(result[0]);

  });

});

// 新增文章
router.post('/', upload.single('image'), (req, res) => {
    const {
        title,
        description,
        category,
        date,
        image
    } = req.body;

    if (!title || !description || !category || !date) {
        return res.status(400).json({
            message: '請填寫完整文章資料'
        });
    }

    if (!req.file) {

      return res.status(400).json({
        message: '請選擇文章圖片'
      });

    }
    const image = req.file.filename;
    const sql = `
        INSERT INTO articles
        (title, description, category, date, image)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        title,
        description,
        category,
        date,
        image
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: '新增文章失敗'
            });
        }

        res.status(201).json({
            message: '文章新增成功',
            articleId: result.insertId
        });
    });
});
// 編輯文章
router.put('/articles/:id', (req, res) => {

  const { id } = req.params;

  const {
    title,
    description,
    category,
    date,
    image
  } = req.body;

  const sql = `
    UPDATE articles
    SET
      title = ?,
      description = ?,
      category = ?,
      date = ?,
      image = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title,
      description,
      category,
      date,
      image,
      id
    ],
    (err, result) => {

      if (err) {
        console.error('編輯文章失敗:', err);

        return res.status(500).json({
          message: '編輯文章失敗'
        });
      }

      // 找不到文章
      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: '找不到此文章'
        });
      }

      res.status(200).json({
        message: '文章更新成功'
      });

    }
  );

});

// 刪除文章
router.delete('/articles/:id', (req, res) => {

  const { id } = req.params;

  const sql = 'DELETE FROM articles WHERE id = ?';

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.error('刪除文章失敗:', err);

      return res.status(500).json({
        message: '刪除文章失敗'
      });
    }

    // 找不到這篇文章
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: '找不到此文章'
      });
    }

    res.status(200).json({
      message: '文章刪除成功'
    });

  });

});
module.exports = router;