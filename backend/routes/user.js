const express = require('express');
const router = express.Router();

const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const bcrypt = require('bcrypt');


router.put('/user/update', verifyToken, (req, res) => {


// 從 JWT middleware 取得使用者 id
const userId = req.user.id;

const {
    name,
    email,
    phone
} = req.body;

const sql = `
    UPDATE users
    SET
        name = ?,
        email = ?,
        phone = ?
    WHERE id = ?
`;

db.query(
    sql,
    [
        name,
        email,
        phone,
        userId
    ],
    (err, result) => {

        // SQL 執行錯誤
        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "伺服器錯誤"
            });
        }

        // 找不到會員
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "找不到會員資料"
            });
        }

        // 更新成功
        res.json({
            message: "會員資料更新成功"
        });

    }
);


});
router.put('/user/password', verifyToken, (req, res) => {

    const userId = req.user.id;

    const {
        oldPassword,
        newPassword
    } = req.body;


    // 檢查資料
    if (!oldPassword || !newPassword) {

        return res.status(400).json({
            message: '請輸入完整密碼'
        });

    }


    // 查詢目前會員的密碼
    db.query('SELECT password FROM users WHERE id = ?',
        [userId],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: '資料庫錯誤'
                });

            }

            if (result.length === 0) {

                return res.status(404).json({
                    message: '找不到會員'
                });

            }

            const hashedPassword = result[0].password;

            // 比對舊密碼
            bcrypt.compare(
                oldPassword,
                hashedPassword,
                (err, match) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            message: '密碼驗證失敗'
                        });

                    }


                    if (!match) {

                        return res.status(401).json({
                            message: '舊密碼錯誤'
                        });

                    }


                    // 加密新密碼
                    bcrypt.hash(
                        newPassword,
                        10,
                        (err, newHashedPassword) => {

                            if (err) {

                                console.log(err);

                                return res.status(500).json({
                                    message: '密碼加密失敗'
                                });

                            }


                            // 更新密碼
                            db.query(
                                'UPDATE users SET password = ? WHERE id = ?',
                                [newHashedPassword, userId],
                                (err, result) => {

                                    if (err) {

                                        console.log(err);

                                        return res.status(500).json({
                                            message: '密碼修改失敗'
                                        });

                                    }


                                    return res.json({
                                        message: '密碼修改成功'
                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});
module.exports = router;