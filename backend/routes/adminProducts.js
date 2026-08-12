const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const fs = require("fs");

const db = require("../db");

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const { not } = require("rxjs/internal/util/not");

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
const detailImageStorage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(
            null,
            "uploads/product-detail-images"
        );

    },


    filename:(req,file,cb)=>{

        const ext = path.extname(file.originalname);

        cb(
            null,
            Date.now()+ext
        );

    }

});


const detailUpload = multer({
    storage:detailImageStorage
});

// 查詢所有商品
router.get(
  "/",
  verifyToken,
  verifyAdmin,
  (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || '';

    const offset = (page - 1) * limit;

    // 搜尋商品名稱
    const searchValue = `%${search}%`;

    db.query(
      `
      SELECT COUNT(*) AS total
      FROM products
      WHERE name LIKE ?
      `,
      [searchValue],
      (err, countResult) => {

        if (err) {

          console.error('取得商品總數失敗:', err);

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
          WHERE name LIKE ?
          ORDER BY id DESC
          LIMIT ? OFFSET ?
          `,
          [searchValue, limit, offset],
          (err, products) => {

            if (err) {

              console.error('取得商品失敗:', err);

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
// 取得所有商品分類
router.get(
  "/categories",
  verifyToken,
  verifyAdmin,
  (req, res) => {

    db.query(
      `
      SELECT DISTINCT category
      FROM products
      WHERE category IS NOT NULL
        AND category != ''
      ORDER BY category
      `,
      (err, results) => {

        if (err) {

          console.error('取得商品分類失敗:', err);

          return res.status(500).json({
            message: '資料庫錯誤'
          });

        }

        const categories = results.map(
          item => item.category
        );

        res.json(categories);

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
            specification,
            storage,
            usage,
            notice,
            price,
            stock,
            isHot
        } = req.body;
        const image = req.file ? `/uploads/products/${req.file.filename}`: null;

        const sql = `INSERT INTO products(name, price, image, category, isHot, specification, storage, \`usage\`, notice, stock)VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;


        db.query(
            sql,
            [
                name,
                price,
                image,
                category,
                isHot,
                specification,
                storage,
                usage,
                notice,
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
router.post(
    "/:productId/detail-images",
    verifyToken,
    verifyAdmin,
    detailUpload.array("images"),
    (req,res)=>{

        const productId = req.params.productId;

        const files = req.files;


        const values = files.map((file,index)=>[
            productId,
            `/uploads/product-detail-images/${file.filename}`,
            index + 1
        ]);


        const sql = `
            INSERT INTO product_detail_images
            (
                product_id,
                image,
                sort_order
            )
            VALUES ?
        `;


        db.query(
            sql,
            [values],
            (err,result)=>{

                if(err){

                    return res.status(500).json({
                        message:"特色圖片新增失敗",
                        error:err
                    });

                }


                res.json({
                    message:"特色圖片新增成功"
                });

            }
        );


    }
);
// 修改商品
router.put("/:id", verifyToken, verifyAdmin, upload.single("image"),
    (req,res)=>{
        const id = req.params.id;

        const {
            name,
            price,
            category,
            isHot,
            specification,
            storage,
            usage,
            notice,
            stock,
            oldImage
        } = req.body;

        let image = oldImage;

        if(req.file){

            image = "products/" + req.file.filename;

            if(oldImage){

                const oldPath = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    oldImage
                );

                fs.unlink(oldPath,(err)=>{

                    if(err){
                        console.log("舊圖片刪除失敗:",err);
                    }else{
                        console.log("舊圖片刪除成功:",oldPath);
                    }

                });

            }

        }

        const sql = `UPDATE products SET name = ?, price = ?, image = ?, category = ?, isHot = ?, specification = ?, storage = ?, \`usage\`=?, notice=?, stock = ? WHERE id = ?`;


        db.query(
            sql,
            [
                name,
                price,
                image,
                category,
                isHot,
                specification,
                storage,
                usage,
                notice,
                stock,
                id
            ],
            (err,result)=>{

                if(err){
                    console.log(err);

                    return res.status(500).json({
                        message:"修改商品失敗"
                    });
                }


                if(result.affectedRows === 0){

                    return res.status(404).json({
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
// 商品下架
router.put("/:id/status", (req, res) => {

    const productId = req.params.id;

    const sql = `
        UPDATE products
        SET status = IF(status = 'active', 'inactive', 'active')
        WHERE id = ?
    `;

    db.query(sql, [productId], (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "找不到此商品"
            });
        }

        res.json({
            message: "商品狀態更新成功"
        });

    });

});

// 修改產品特色圖片
router.put(
    "/:productId/detail-images",
    verifyToken,
    verifyAdmin,
    detailUpload.array("images"),
    (req,res)=>{

        const productId = req.params.productId;

        const files = req.files;

        // 沒有新圖片
        if(!files || files.length === 0){

            return res.status(400).json({

                message:"請上傳特色圖片"

            });

        }

        const selectOldSql = `

            SELECT image
            FROM product_detail_images
            WHERE product_id = ?

        `;

        db.query(
            selectOldSql,
            [productId],
            (err,oldImages)=>{


                if(err){

                    return res.status(500).json({

                        message:"查詢舊圖片失敗",
                        error:err

                    });

                }

                oldImages.forEach(item=>{


                    const filePath = path.join(

                        __dirname,

                        "../uploads",

                        item.image

                    );


                    fs.unlink(
                        filePath,
                        (err)=>{

                            if(err){

                                console.log(
                                    "刪除圖片失敗:",
                                    err.message
                                );

                            }

                        }
                    );


                });

                const deleteSql = `

                    DELETE FROM product_detail_images
                    WHERE product_id = ?

                `;

                db.query(
                    deleteSql,
                    [productId],
                    (err)=>{


                        if(err){

                            return res.status(500).json({

                                message:"刪除舊特色圖片資料失敗",
                                error:err

                            });

                        }

                        const values =
                        files.map((file,index)=>{


                            return [

                                productId,

                                `product-detail-images/${file.filename}`,

                                index + 1

                            ];


                        });

                        const insertSql = `

                            INSERT INTO product_detail_images
                            (
                                product_id,
                                image,
                                sort_order
                            )
                            VALUES ?

                        `;

                        db.query(
                            insertSql,
                            [values],
                            (err,result)=>{


                                if(err){

                                    return res.status(500).json({

                                        message:"新增特色圖片失敗",
                                        error:err

                                    });

                                }

                                res.json({

                                    message:"特色圖片修改成功"

                                });



                            }
                        );



                    }
                );


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


        // 查主圖
        const productSql =
        "SELECT image FROM products WHERE id = ?";


        db.query(
            productSql,
            [id],
            (err,productResult)=>{


                if(err){

                    console.log(err);

                    return res.status(500)
                    .json({
                        message:"查詢商品失敗"
                    });

                }


                if(productResult.length === 0){

                    return res.status(404)
                    .json({
                        message:"找不到商品"
                    });

                }


                const mainImage =
                productResult[0].image;



                // 查特色圖
                const detailSql =
                `
                SELECT image 
                FROM product_detail_images
                WHERE product_id = ?
                `;


                db.query(
                    detailSql,
                    [id],
                    (err,detailResult)=>{


                        if(err){

                            console.log(err);

                            return res.status(500)
                            .json({
                                message:"查詢特色圖失敗"
                            });

                        }



                        const detailImages =
                        detailResult.map(
                            item=>item.image
                        );



                        // 刪特色圖資料
                        db.query(
                            `
                            DELETE FROM product_detail_images
                            WHERE product_id = ?
                            `,
                            [id],
                            (err)=>{


                                if(err){

                                    console.log(err);

                                    return res.status(500)
                                    .json({
                                        message:"刪除特色圖資料失敗"
                                    });

                                }



                                // 刪商品資料
                                db.query(
                                    `
                                    DELETE FROM products
                                    WHERE id = ?
                                    `,
                                    [id],
                                    (err)=>{


                                        if(err){

                                            console.log(err);

                                            return res.status(500)
                                            .json({
                                                message:"刪除商品失敗"
                                            });

                                        }



                                        // 刪主圖
                                        if(mainImage){

                                            const mainPath =
                                            path.join(
                                                __dirname,
                                                "..",
                                                mainImage
                                            );


                                            fs.unlink(
                                                mainPath,
                                                err=>{

                                                    if(err)
                                                        console.log(
                                                            "主圖刪除失敗:",
                                                            err.message
                                                        );

                                                }
                                            );

                                        }



                                        // 刪特色圖
                                        detailImages.forEach(
                                            img=>{


                                                const detailPath =
                                                path.join(
                                                    __dirname,
                                                    "..",
                                                    img
                                                );


                                                fs.unlink(
                                                    detailPath,
                                                    err=>{

                                                        if(err)
                                                            console.log(
                                                                "特色圖刪除失敗:",
                                                                err.message
                                                            );

                                                    }
                                                );


                                            }
                                        );



                                        res.json({
                                            message:"商品刪除成功"
                                        });



                                    }
                                );



                            }
                        );



                    }
                );



            }
        );



    }
);
module.exports = router;