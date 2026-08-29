const express = require('express');

const router = express.Router();

const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// ========================================
// 儲存肌膚測驗
// POST /api/skin-analysis
// ========================================

router.post('/', verifyToken, (req, res) => {

    const userId = req.user.id;

    const {
        age,
        feel,
        problem,
        routine,
        skinType
    } = req.body;


    // ========================================
    // 資料驗證
    // ========================================

    if (!age) {

        return res.status(400).json({
            message: '缺少年齡資料'
        });

    }


    if (!feel) {

        return res.status(400).json({
            message: '缺少肌膚狀態資料'
        });

    }


    if (
        !Array.isArray(problem) ||
        problem.length === 0
    ) {

        return res.status(400).json({
            message: '至少需要選擇一個肌膚問題'
        });

    }


    if (!Array.isArray(routine)) {

        return res.status(400).json({
            message: '保養習慣資料格式錯誤'
        });

    }


    if (!skinType) {

        return res.status(400).json({
            message: '缺少肌膚分析結果'
        });

    }


    // ========================================
    // SQL
    // ========================================

    const sql = `
        INSERT INTO skin_analysis_records
        (
            user_id,
            age,
            feel,
            problem,
            routine,
            skin_type
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;


    const values = [

        userId,

        age,

        feel,

        JSON.stringify(problem),

        JSON.stringify(routine),

        skinType

    ];


    // ========================================
    // 寫入 MySQL
    // ========================================

    db.query(
        sql,
        values,
        (err, result) => {

            if (err) {

                console.error(
                    '儲存肌膚測驗失敗:',
                    err
                );

                return res.status(500).json({

                    message: '儲存肌膚測驗失敗'

                });

            }


            console.log(
                '肌膚測驗儲存成功:',
                result.insertId
            );


            return res.status(201).json({

                message: '肌膚測驗儲存成功',

                id: result.insertId

            });

        }
    );

});


// ========================================
// 取得目前會員的肌膚測驗紀錄
// GET /api/skin-analysis
// ========================================

router.get('/', verifyToken, (req, res) => {

    const userId = req.user.id;


    const sql = `
        SELECT
            id,
            age,
            feel,
            problem,
            routine,
            skin_type,
            created_at
        FROM skin_analysis_records
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;


    db.query(
        sql,
        [userId],
        (err, rows) => {

            if (err) {

                console.error(
                    '取得肌膚測驗紀錄失敗:',
                    err
                );

                return res.status(500).json({

                    message: '取得肌膚測驗紀錄失敗'

                });

            }


            // ========================================
            // JSON 欄位轉回陣列
            // ========================================

            const records = rows.map(row => ({

                ...row,

                problem:
                    typeof row.problem === 'string'
                        ? JSON.parse(row.problem)
                        : row.problem,

                routine:
                    typeof row.routine === 'string'
                        ? JSON.parse(row.routine)
                        : row.routine

            }));


            return res.json(records);

        }
    );

});

module.exports = router;