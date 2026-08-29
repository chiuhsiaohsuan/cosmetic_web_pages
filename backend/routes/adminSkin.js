const express = require('express');

const router = express.Router();

const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require("../middleware/verifyAdmin");

router.get(
    '/user/:userId',
    verifyToken,verifyAdmin,
    (req, res) => {

        const userId = req.params.userId;

        const sql = `
            SELECT
                id,
                user_id,
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
                        '取得會員肌膚檢測紀錄失敗:',
                        err
                    );

                    return res.status(500).json({
                        message: '取得肌膚檢測紀錄失敗'
                    });

                }

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

    }
);
module.exports = router;