const jwt = require('jsonwebtoken');
const db = require('../db');

function verifyToken(req, res, next) {

    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: '沒有 Token'
        });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, user) => {

            if (err) {
                return res.status(401).json({
                    message: 'Token 無效或已過期'
                });
            }

            db.query(
                'SELECT status, is_deleted FROM users WHERE id = ?',
                [user.id],
                (dbErr, rows) => {

                    if (dbErr) {
                        console.error(dbErr);

                        return res.status(500).json({
                            message: '驗證失敗'
                        });
                    }

                    if (!rows.length) {
                        return res.status(401).json({
                            message: '使用者不存在'
                        });
                    }

                    if (rows[0].is_deleted === 1) {
                        return res.status(403).json({
                            message: '帳號不存在'
                        });
                    }

                    if (rows[0].status === 'disabled') {

                        res.set(
                            'X-Account-Disabled',
                            'true'
                        );

                        return res.status(403).json({
                            message: '帳號已停權'
                        });
                    }

                    req.user = user;

                    next();
                }
            );
        }
    );
}

module.exports = verifyToken;