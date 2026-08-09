const jwt = require('jsonwebtoken');
const db = require('../db');

function verifyToken(req, res, next){

    const authHeader = req.headers.authorization;


    if(!authHeader){

        return res.status(401).json({
            message:"沒有 Token"
        });

    }


    const token = authHeader.split(" ")[1];


    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, user)=>{

            if(err){

                return res.status(403).json({
                    message:"Token 無效"
                });

            }

            db.query(
                'SELECT status FROM users WHERE id = ?',
                [user.id],
                (dbErr, rows)=>{
                    if (dbErr) {
                        console.error(dbErr);
                        return res.status(500).json({ message: '驗證失敗' });
                    }

                    if (!rows.length) {
                        return res.status(401).json({ message: '使用者不存在' });
                    }

                    if (rows[0].status === 'disabled') {
                        res.set('X-Account-Disabled', 'true');
                        return res.status(403).json({ message: '帳號已停權' });
                    }

                    req.user = user;
                    next();
                }
            );

        }
    );

}


module.exports = verifyToken;
