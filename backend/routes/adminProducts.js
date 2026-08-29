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
            skin_type,
            specification,
            storage,
            usage,
            notice,
            price,
            stock,
            isHot
        } = req.body;

        const image = req.file
            ? `products/${req.file.filename}`
            : null;

        const skinTypeIds = Array.isArray(skin_type)
            ? skin_type
            : skin_type
                ? [skin_type]
                : [];

        const sql = `
            INSERT INTO products
            (
                name,
                price,
                image,
                category,
                isHot,
                specification,
                storage,
                \`usage\`,
                notice,
                stock
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

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
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        message: "新增商品失敗",
                        error: err
                    });
                }

                const productId = result.insertId;

                // 沒有選膚質
                if (skinTypeIds.length === 0) {
                    return res.json({
                        message: "商品新增成功",
                        id: productId
                    });
                }

                const values = skinTypeIds.map(
                    skinTypeId => [productId, skinTypeId]
                );

                const skinSql = `
                    INSERT INTO product_skin_types
                    (product_id, skin_type_id)
                    VALUES ?
                `;

                db.query(
                    skinSql,
                    [values],
                    (skinErr) => {

                        if (skinErr) {
                            return res.status(500).json({
                                message: "商品新增成功，但膚質資料新增失敗",
                                error: skinErr
                            });
                        }

                        res.json({
                            message: "商品新增成功",
                            id: productId
                        });

                    }
                );

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
router.put(
    "/:id",
    verifyToken,
    verifyAdmin,
    upload.single("image"),
    (req, res) => {

        const id = req.params.id;

        const {
            name,
            price,
            category,
            skin_types,
            isHot,
            specification,
            storage,
            usage,
            notice,
            stock,
            oldImage
        } = req.body;


        // ========================================
        // 1. 解析膚質
        // ========================================

        let skinTypes = [];

        try {

            if (skin_types) {

                skinTypes = JSON.parse(skin_types);

                skinTypes = skinTypes.map(Number);

            }

        } catch (error) {

            console.log("膚質資料解析失敗:", error);

            return res.status(400).json({
                message: "膚質資料格式錯誤"
            });

        }


        // 確保是陣列
        if (!Array.isArray(skinTypes)) {

            return res.status(400).json({
                message: "膚質資料必須是陣列"
            });

        }


        // 去除重複膚質
        skinTypes = [...new Set(skinTypes)];


        // ========================================
        // 2. 處理圖片
        // ========================================

        let image = oldImage || null;


        if (req.file) {

            image = "products/" + req.file.filename;

        }


        // ========================================
        // 3. 取得 connection
        // ========================================

        db.getConnection((err, connection) => {

            if (err) {

                console.log("取得資料庫 connection 失敗:", err);

                return res.status(500).json({
                    message: "資料庫連線失敗"
                });

            }


            // ========================================
            // 4. 開始 Transaction
            // ========================================

            connection.beginTransaction((err) => {

                if (err) {

                    console.log(
                        "Transaction 開始失敗:",
                        err
                    );

                    connection.release();

                    return res.status(500).json({
                        message: "修改商品失敗"
                    });

                }


                // ========================================
                // 5. 更新 products
                // ========================================

                const productSql = `
                    UPDATE products
                    SET
                        name = ?,
                        price = ?,
                        image = ?,
                        category = ?,
                        isHot = ?,
                        specification = ?,
                        storage = ?,
                        \`usage\` = ?,
                        notice = ?,
                        stock = ?
                    WHERE id = ?
                `;


                connection.query(
                    productSql,
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
                    (err, result) => {

                        if (err) {

                            console.log(
                                "更新商品失敗:",
                                err
                            );


                            return connection.rollback(() => {

                                connection.release();

                                res.status(500).json({
                                    message: "修改商品失敗"
                                });

                            });

                        }


                        // ========================================
                        // 商品不存在
                        // ========================================

                        if (result.affectedRows === 0) {

                            return connection.rollback(() => {

                                connection.release();

                                res.status(404).json({
                                    message: "找不到商品"
                                });

                            });

                        }


                        // ========================================
                        // 6. 刪除舊膚質關聯
                        // ========================================

                        const deleteSkinSql = `
                            DELETE FROM product_skin_types
                            WHERE product_id = ?
                        `;


                        connection.query(
                            deleteSkinSql,
                            [id],
                            (err) => {

                                if (err) {

                                    console.log(
                                        "刪除舊膚質失敗:",
                                        err
                                    );


                                    return connection.rollback(() => {

                                        connection.release();

                                        res.status(500).json({
                                            message: "更新商品膚質失敗"
                                        });

                                    });

                                }


                                // ========================================
                                // 7. 沒有選擇膚質
                                // ========================================

                                if (skinTypes.length === 0) {

                                    return connection.commit((err) => {

                                        if (err) {

                                            console.log(
                                                "Commit 失敗:",
                                                err
                                            );


                                            return connection.rollback(() => {

                                                connection.release();

                                                res.status(500).json({
                                                    message: "修改商品失敗"
                                                });

                                            });

                                        }


                                        connection.release();

                                        if (req.file && oldImage) {

                                            deleteOldImage(
                                                oldImage
                                            );

                                        }


                                        res.json({

                                            message: "商品修改成功",

                                            productId: id,

                                            skinTypes: []

                                        });

                                    });

                                }


                                // ========================================
                                // 8. 建立新的膚質關聯
                                // ========================================

                                const skinValues = skinTypes.map(
                                    skinTypeId => [
                                        id,
                                        skinTypeId
                                    ]
                                );


                                const insertSkinSql = `
                                    INSERT INTO product_skin_types
                                    (
                                        product_id,
                                        skin_type_id
                                    )
                                    VALUES ?
                                `;


                                connection.query(
                                    insertSkinSql,
                                    [skinValues],
                                    (err) => {

                                        if (err) {

                                            console.log(
                                                "新增商品膚質失敗:",
                                                err
                                            );


                                            return connection.rollback(() => {

                                                connection.release();

                                                res.status(500).json({
                                                    message: "更新商品膚質失敗"
                                                });

                                            });

                                        }


                                        // ========================================
                                        // 9. Commit
                                        // ========================================

                                        connection.commit((err) => {

                                            if (err) {

                                                console.log(
                                                    "Commit 失敗:",
                                                    err
                                                );


                                                return connection.rollback(() => {

                                                    connection.release();

                                                    res.status(500).json({
                                                        message: "修改商品失敗"
                                                    });

                                                });

                                            }


                                            // ========================================
                                            // 10. 釋放 connection
                                            // ========================================

                                            connection.release();


                                            // ========================================
                                            // 11. 成功後刪除舊圖片
                                            // ========================================

                                            if (req.file && oldImage) {

                                                deleteOldImage(
                                                    oldImage
                                                );

                                            }


                                            // ========================================
                                            // 12. 回傳
                                            // ========================================

                                            res.json({

                                                message: "商品修改成功",

                                                productId: id,

                                                skinTypes: skinTypes

                                            });

                                        });

                                    }

                                );

                            }

                        );

                    }

                );

            });

        });


        // ========================================
        // 刪除舊圖片
        // ========================================

        function deleteOldImage(oldImage) {

            const oldPath = path.join(
                __dirname,
                "..",
                "uploads",
                oldImage
            );


            fs.unlink(
                oldPath,
                (err) => {

                    if (err) {

                        console.log(
                            "舊圖片刪除失敗:",
                            err
                        );

                    } else {

                        console.log(
                            "舊圖片刪除成功:",
                            oldPath
                        );

                    }

                }
            );

        }

    }
);
router.get(
    "/:id/skin-types",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const productId = req.params.id;

        const sql = `
            SELECT
                st.id,
                st.name,
                pst.product_id,
                pst.skin_type_id
            FROM product_skin_types pst
            JOIN skin_types st
                ON st.id = pst.skin_type_id
            WHERE pst.product_id = ?
        `;

        db.query(
            sql,
            [productId],
            (err, results) => {

                if (err) {

                    console.log(
                        "取得商品膚質失敗:",
                        err
                    );

                    return res.status(500).json({
                        message: "取得商品膚質失敗"
                    });

                }

                res.json(results);

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