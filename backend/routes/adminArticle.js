const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require('../db');

const uploadDir = path.join(
    __dirname,
    '../uploads/articles'
);


// 如果資料夾不存在就建立
if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, {
        recursive: true
    });

}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadDir);

    },

    filename: (req, file, cb) => {

        const ext = path.extname(
            file.originalname
        );

        const filename =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

        cb(null, filename);

    }

});

const upload = multer({

    storage: storage,

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
router.get('/:id', (req, res) => {

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
        context,
        category,
        date
    } = req.body;

    // 檢查文字資料
    if (!title || !description || !context || !category || !date) {
        return res.status(400).json({
            message: '請填寫完整文章資料'
        });
    }

    // 檢查圖片
    if (!req.file) {
        return res.status(400).json({
            message: '請選擇文章圖片'
        });
    }

    // Multer 上傳後產生的檔名
     const image = `articles/${req.file.filename}`;

    const sql = `
        INSERT INTO articles
        (title, description, context, category, date, image)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        title,
        description,
        context,
        category,
        date,
        image
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error('新增文章失敗:', err);

            return res.status(500).json({
                message: '新增文章失敗'
            });
        }

        res.status(201).json({
            message: '文章新增成功',
            articleId: result.insertId,
            image: image
        });

    });

});

// 編輯文章
router.put('/:id', upload.single('image'), (req, res) => {

    const { id } = req.params;

    const {
        title,
        description,
        context,
        category,
        date
    } = req.body;

    if (!title || !description || !context || !category || !date) {
        return res.status(400).json({
            message: '請填寫完整文章資料'
        });
    }

    // 如果有重新上傳圖片
    if (req.file) {

        // 先取得舊圖片
        const selectSql = `
            SELECT image
            FROM articles
            WHERE id = ?
        `;

        db.query(selectSql, [id], (err, result) => {

            if (err) {
                console.error('取得舊圖片失敗:', err);

                return res.status(500).json({
                    message: '編輯文章失敗'
                });
            }

            if (result.length === 0) {
                fs.unlink(req.file.path, () => {});

                return res.status(404).json({
                    message: '找不到此文章'
                });
            }

            const oldImage = result[0].image;

            const newImage = `articles/${req.file.filename}`;

            const sql = `
                UPDATE articles
                SET
                    title = ?,
                    description = ?,
                    context = ?,
                    category = ?,
                    date = ?,
                    image = ?
                WHERE id = ?
            `;

            const values = [
                title,
                description,
                context,
                category,
                date,
                newImage,
                id
            ];

            db.query(sql, values, (err, result) => {

                if (err) {
                    console.error('編輯文章失敗:', err);

                    fs.unlink(req.file.path, () => {});

                    return res.status(500).json({
                        message: '編輯文章失敗'
                    });
                }

                // 刪除舊圖片
                if (oldImage) {

                    const oldImagePath = path.join(
                        uploadDir,
                        path.basename(oldImage)
                    );

                    fs.unlink(oldImagePath, (err) => {

                        if (err && err.code !== 'ENOENT') {
                            console.error(
                                '刪除舊圖片失敗:',
                                err
                            );
                        }

                    });

                }

                res.status(200).json({
                    message: '文章編輯成功'
                });

            });

        });

    } else {

        // 沒有重新上傳圖片
        const sql = `
            UPDATE articles
            SET
                title = ?,
                description = ?,
                context = ?,
                category = ?,
                date = ?
            WHERE id = ?
        `;

        const values = [
            title,
            description,
            context,
            category,
            date,
            id
        ];

        db.query(sql, values, (err, result) => {

            if (err) {
                console.error('編輯文章失敗:', err);

                return res.status(500).json({
                    message: '編輯文章失敗'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: '找不到此文章'
                });
            }

            res.status(200).json({
                message: '文章編輯成功'
            });

        });

    }

});

// 刪除文章
router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const selectSql = `
        SELECT image
        FROM articles
        WHERE id = ?
    `;

    db.query(selectSql, [id], (err, result) => {

        if (err) {
            console.error('取得文章失敗:', err);

            return res.status(500).json({
                message: '取得文章失敗'
            });
        }

        // 找不到文章
        if (result.length === 0) {
            return res.status(404).json({
                message: '找不到此文章'
            });
        }

        const image = result[0].image;

        // 刪除資料庫中的文章
        const deleteSql = `
            DELETE FROM articles
            WHERE id = ?
        `;

        db.query(deleteSql, [id], (err, result) => {

            if (err) {
                console.error('刪除文章失敗:', err);

                return res.status(500).json({
                    message: '刪除文章失敗'
                });
            }

            // 刪除圖片
            if (image) {

                const imagePath = path.join(
                    uploadDir,
                    path.basename(image)
                );

                fs.unlink(imagePath, (err) => {

                    if (err) {

                        // 找不到圖片不影響文章刪除
                        if (err.code !== 'ENOENT') {
                            console.error('刪除文章圖片失敗:', err);
                        }

                    }

                });
            }

            res.status(200).json({
                message: '文章刪除成功'
            });

        });

    });

});
module.exports = router;