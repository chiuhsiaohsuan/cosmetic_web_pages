const express = require('express');
const router = express.Router();

const db = require('../db');
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// 取得所有會員
router.get('/users',verifyToken, verifyAdmin, async (req, res)=>{

    try {

        const [rows] = await db.query(
            `
            SELECT 
                id,
                name,
                email,
                phone,
                DATE_FORMAT(birthday,'%Y-%m-%d') AS birthday,
                role,
                status
            FROM users WHERE is_deleted = 0
            `
        );

        res.json(rows);

    } catch(error){

        console.log(error);

        res.status(500).json({
            message:'取得會員失敗'
        });

    }

});
// 修改會員狀態
router.put('/users/:id/status',verifyToken, verifyAdmin,(req,res)=>{

    const id = req.params.id;

    const {status} = req.body;


    const sql = `
        UPDATE users
        SET status=?
        WHERE id=?
    `;


    db.query(
        sql,
        [
            status,
            id
        ],
        (err,result)=>{

            if(err){

                console.log(err);

                return res.status(500).json({
                    message:'修改狀態失敗'
                });

            }


            res.json({
                message:'狀態更新成功'
            });

        }
    );


});

module.exports = router;