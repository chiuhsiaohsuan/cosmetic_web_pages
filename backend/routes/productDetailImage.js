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

router.get("/recommend", (req, res) => {

    const { skinType } = req.query;

    if (!skinType) {

        return res.status(400).json({
            message: "請提供膚質"
        });

    }

    // 各膚質的優先推薦商品
    const priorityMap = {

        "敏弱": [3, 10, 19, 20],
        "乾性": [9, 12, 18, 21, 25],
        "油性": [4, 6, 7],
        "混合": [1]
    };

    const priorityIds = priorityMap[skinType] || [];

    let orderBy = "p.id DESC";

    if (priorityIds.length > 0) {

        const priorityOrder = priorityIds
            .map((id, index) => `WHEN ${id} THEN ${index}`)
            .join(" ");

        orderBy = `
            CASE p.id
                ${priorityOrder}
                ELSE 999
            END,
            p.id DESC
        `;

    }

    const sql = `
        SELECT DISTINCT
            p.id,
            p.name,
            p.price,
            p.image,
            p.category
        FROM products p
        JOIN product_skin_types pst
            ON p.id = pst.product_id
        JOIN skin_types st
            ON st.id = pst.skin_type_id
        WHERE st.name = ?
        AND p.status = 'active'
        ORDER BY ${orderBy}
        LIMIT 5
    `;

    db.query(
        sql,
        [skinType],
        (err, results) => {

            if (err) {

                console.error(
                    "取得推薦商品失敗:",
                    err
                );

                return res.status(500).json({
                    message: "取得推薦商品失敗"
                });

            }

            console.log(
                "膚質:",
                skinType
            );

            console.log(
                "推薦商品:",
                results
            );

            res.json(results);

        }
    );

});


module.exports = router;