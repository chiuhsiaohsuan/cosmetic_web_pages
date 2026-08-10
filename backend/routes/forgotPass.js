const express = require('express');
const router = express.Router();

const crypto = require('crypto');
const bcrypt = require('bcrypt');

const db = require('../db');
const transporter = require('../mailer');

router.post('/forgot-password', (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: '請輸入 Email'
        });
    }

    const sql = 'SELECT id, email FROM users WHERE email = ?';

    db.query(sql, [email], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: '伺服器錯誤'
            });
        }

        if (result.length === 0) {
            return res.status(200).json({
                message: '如果此電子郵件已註冊，重設密碼信將會寄出'
            });
        }

        const userId = result[0].id;
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        const updateSql = `
            UPDATE users
            SET reset_token = ?,
                reset_token_expiry = ?
            WHERE id = ?
        `;

        db.query(
            updateSql,
            [resetToken, expiry, userId],
            (err) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        message: '伺服器錯誤'
                    });
                }

                const resetUrl =
                    `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

                const mailOptions = {
                        from: `"${process.env.MAIL_FROM_NAME}"<${process.env.MAIL_FROM}>`,
                        to: email,
                        subject: '【承檍股份有限公司】重設您的密碼',

                        text: `
                    您好：

                    我們收到您的密碼重設申請。

                    請點擊以下連結重新設定密碼：
                    ${resetUrl}

                    此連結將於 15 分鐘後失效。

                    如果您沒有提出密碼重設申請，請忽略此封郵件。

                    承檍股份有限公司
                        `,

                        html: `
                            <div style="
                                font-family: Arial, sans-serif;
                                line-height: 1.8;
                                max-width: 600px;
                                margin: auto;
                            ">

                                <h2>重設您的密碼</h2>

                                <p>您好：</p>

                                <p>
                                    我們收到您的密碼重設申請。
                                </p>

                                <p>
                                    請點擊下方按鈕重新設定密碼：
                                </p>

                                <p>
                                    <a
                                        href="${resetUrl}"
                                        style="
                                            display: inline-block;
                                            padding: 12px 24px;
                                            background-color: #333;
                                            color: white;
                                            text-decoration: none;
                                            border-radius: 6px;
                                        "
                                    >
                                        重設密碼
                                    </a>
                                </p>

                                <p>
                                    此連結將於 <strong>15 分鐘</strong>後失效。
                                </p>

                                <p>
                                    如果您沒有提出密碼重設申請，
                                    請忽略此封郵件。
                                </p>

                                <hr>

                                <p style="color: #888; font-size: 12px;">
                                    承檍股份有限公司
                                </p>

                            </div>
                        `
                    };

                transporter.sendMail(
                    mailOptions,
                    (error, info) => {

                        if (error) {
                            console.log(error);

                            return res.status(500).json({
                                message: '郵件寄送失敗'
                            });
                        }

                        console.log('Email sent:', info.response);

                        return res.json({
                            message: '已發送重設密碼信件，請檢查信箱。'
                        });

                    }
                );

            }
        );

    });

});


router.post('/reset-password', (req, res) => {

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            message: '資料不完整'
        });
    }

    const sql = `
        SELECT id
        FROM users
        WHERE reset_token = ?
        AND reset_token_expiry > NOW()
    `;

    db.query(sql, [token], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: '伺服器錯誤'
            });
        }

        if (result.length === 0) {
            return res.status(400).json({
                message: '重設密碼連結無效或已過期'
            });
        }

        const userId = result[0].id;

        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: '密碼加密失敗'
                });
            }

            const updateSql = `
                UPDATE users
                SET password = ?,
                    reset_token = NULL,
                    reset_token_expiry = NULL
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [hashedPassword, userId],
                (err) => {

                    if (err) {
                        console.log(err);

                        return res.status(500).json({
                            message: '密碼更新失敗'
                        });
                    }

                    return res.json({
                        message: '密碼重設成功，請重新登入。'
                    });

                }
            );

        });

    });

});


module.exports = router;