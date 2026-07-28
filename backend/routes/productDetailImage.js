const express = require('express');
const router = express.Router();
const db = require('../db');


// 取得商品特色圖片
router.get('/:productId/detail-images', (req, res)=>{

    const productId = req.params.productId;


    const sql = `
        SELECT *
        FROM product_detail_images
        WHERE product_id = ?
        ORDER BY sort_order ASC
    `;


    db.query(sql,[productId],(err,result)=>{

        if(err){
            console.log(err);

            return res.status(500).json({
                message:'取得商品特色圖片失敗'
            });
        }


        res.json(result);

    });

});




module.exports = router;