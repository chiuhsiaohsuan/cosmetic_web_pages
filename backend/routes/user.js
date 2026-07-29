const express = require('express');
const router = express.Router();

const db = require('../db');
const verifyToken = require("../middleware/verifyToken");
router.put('/user/update', verifyToken, async(req,res)=>{

    try {

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
                name=?,
                email=?,
                phone=?
            WHERE id=?
        `;



        const [result] = await db.query(
            sql,
            [
                name,
                email,
                phone,
                userId
            ]
        );



        if(result.affectedRows === 0){

            return res.status(404).json({

                message:"找不到會員資料"

            });

        }



        res.json({

            message:"會員資料更新成功"

        });



    }
    catch(err){


        console.log(err);


        res.status(500).json({

            message:"伺服器錯誤"

        });


    }


});
module.exports = router;