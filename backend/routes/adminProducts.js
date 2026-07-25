const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const fs = require("fs");

const db = require("../db");

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(null,"uploads/products");

    },


    filename:(req,file,cb)=>{

        const ext = path.extname(file.originalname);

        cb(
            null,
            Date.now()+ext
        );

    }

});


const upload = multer({
    storage
});

// 查詢所有商品
router.get(
  "/",
  verifyToken,
  verifyAdmin,
  (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    db.query(
      "SELECT COUNT(*) AS total FROM products",
      (err, countResult) => {

        if (err) {
          return res.status(500).json({
            message: "資料庫錯誤"
          });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        db.query(
          `
          SELECT *
          FROM products
          ORDER BY id DESC
          LIMIT ? OFFSET ?
          `,
          [limit, offset],
          (err, products) => {

            if (err) {
              return res.status(500).json({
                message: "資料庫錯誤"
              });
            }

            res.json({
              data: products,
              total,
              page,
              limit,
              totalPages
            });

          }
        );

      }
    );

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
    upload.single("image"),
    (req, res) => {

        const {
            name,
            category,
            description,
            price,
            stock,
            isHot
        } = req.body;
        const image = req.file ? `/uploads/products/${req.file.filename}`: null;

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
    upload.single("image"),
    (req,res)=>{

        const id = req.params.id;

        const {
            name,
            price,
            category,
            isHot,
            description,
            stock
        } = req.body;

        let image;
        if(req.file){

            image =
            "/images/uploads/" + req.file.filename;

        }
        else{

            image = req.body.oldImage;

        }

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

        // 先取得圖片路徑
        const selectSql =
        "SELECT image FROM products WHERE id = ?";
        
        db.query(
            selectSql,
            [id],
            (err,result)=>{
                if(err){

                    console.log(err);

                    return res.status(500)
                    .json({
                        message:"查詢商品失敗"
                    });

                }

                if(result.length === 0){

                    return res.status(404)
                    .json({
                        message:"找不到商品"
                    });

                }

                const imagePath = result[0].image;

                // 刪除資料
                const deleteSql =
                "DELETE FROM products WHERE id = ?";

                db.query(
                    deleteSql,
                    [id],
                    (err)=>{

                        if(err){

                            console.log(err);

                            return res.status(500)
                            .json({
                                message:"刪除商品失敗"
                            });

                        }

                        // 刪除圖片
                        if(imagePath){


                            const filePath =
                            path.join(
                                __dirname,
                                "..",
                                imagePath
                            );


                            fs.unlink(
                                filePath,
                                (err)=>{

                                    if(err){

                                        console.log(
                                            "圖片刪除失敗:",
                                            err
                                        );

                                    }

                                }
                            );


                        }

                        res.json({

                            message:"商品刪除成功"

                        });


                    }
                );


            }
        );


    }
);
module.exports = router;