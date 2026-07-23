const express = require("express");
const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");


// 查詢所有商品
router.get(
    "/",
    verifyToken,
    verifyAdmin,
    (req,res)=>{

        const sql = `SELECT * FROM products ORDER BY id DESC`;


        db.query(sql,(err,result)=>{

            if(err){
                return res.status(500).json({
                    message:"資料庫錯誤"
                });
            }


            res.json(result);

        });

    }
);
router.get(
"/:id",
verifyToken,
verifyAdmin,
(req,res)=>{

    const id=req.params.id;

    const sql=`SELECT * FROM products WHERE id=?`;


    db.query(sql,[id],(err,result)=>{

        if(err){
            return res.status(500).json({
                message:"資料庫錯誤"
            });
        }


        if(result.length===0){
            return res.status(404).json({
                message:"找不到商品"
            });
        }


        res.json(result[0]);

    });

});
// 新增商品
router.post(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {
            name,
            category,
            description,
            price,
            image,
            stock,
            isHot
        } = req.body;


        const sql = `INSERT INTO products(name, price, image, category, isHot, description, stock)VALUES (?, ?, ?, ?, ?, ?, ?)`;


        db.query(
            sql,
            [
                name,
                price,
                image,
                category,
                isHot,
                description,
                stock
            ],
            (err, result)=>{

                if(err){
                    return res.status(500).json({
                        message:"新增商品失敗",
                        error:err
                    });
                }


                res.json({
                    message:"商品新增成功",
                    id:result.insertId
                });

            }
        );

    }
);
// 修改商品
router.put(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req,res)=>{

        const id = req.params.id;

        const {
            name,
            price,
            image,
            category,
            isHot,
            description,
            stock
        } = req.body;


        const sql = `UPDATE products SET name = ?, price = ?, image = ?, category = ?, isHot = ?, description = ?, stock = ? WHERE id = ?`;

        db.query(
            sql,
            [
                name,
                price,
                image,
                category,
                isHot,
                description,
                stock,
                id
            ],
            (err,result)=>{

                if(err){
                    console.log(err);

                    return res.status(500)
                    .json({
                        message:"修改商品失敗"
                    });
                }


                if(result.affectedRows === 0){

                    return res.status(404)
                    .json({
                        message:"找不到商品"
                    });

                }


                res.json({
                    message:"商品修改成功"
                });

            }
        );

    }
);
// 刪除商品
router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req,res)=>{

        const id = req.params.id;


        const sql = `DELETE FROM products WHERE id = ?`;


        db.query(
            sql,
            [id],
            (err,result)=>{

                if(err){

                    console.log(err);

                    return res.status(500)
                    .json({
                        message:"刪除商品失敗"
                    });

                }


                if(result.affectedRows === 0){

                    return res.status(404)
                    .json({
                        message:"找不到商品"
                    });

                }


                res.json({
                    message:"商品刪除成功"
                });

            }
        );

    }
);
module.exports = router;