require("dotenv").config();
const express = require("express");
const cors = require("cors");
const verifyToken = require('./middleware/verifyToken');
const adminProductsRouter = require("./routes/adminProducts");
const app = express();
const db = require("./db");

app.use(cors());
app.use(express.json());
app.use(express.static('public'));


app.get('/api/user',
verifyToken,
(req,res)=>{
    const id = req.user.id;


    const sql = `
    SELECT id,name,email,phone
    FROM users
    WHERE id=?
    `;


    db.query(
        sql,
        [id],
        (err,result)=>{


            if(err){
                return res.status(500)
                .json(err);
            }


            res.json(result[0]);

        }
    );


});
app.use(
    "/api/admin/products",
    adminProductsRouter
);
//取得全部商品
app.get("/api/products",(req,res)=>{

    const sql = "SELECT * FROM products";

    db.query(sql,(err,result)=>{

        if(err){
            console.error(err);
            return res.status(500).json({
                message:"Database error"
            });
        }


        res.json(result);

    });

});
app.get('/api/products/:id',(req,res)=>{

 const id=req.params.id;


 db.query(
  'SELECT * FROM products WHERE id=?',
  [id],
  (err,result)=>{

    if(err){
      return res.status(500).json(err);
    }
    if(result.length === 0){

      return res.status(404).json({
        message:"找不到商品"
      });

    }

    res.json(result[0]);

  }

 );


});

app.post("/api/register",async(req,res)=>{

    const {
        name,
        birthday,
        password,
        phone,
        email
    } = req.body;


    const bcrypt = require('bcrypt');
    const hashPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users(name,birthday,password,phone,email)VALUES(?,?,?,?,?)`;

    db.query(
        sql,
        [
          name,
          birthday,
          hashPassword,
          phone,
          email
        ],
        (err,result)=>{


            if(err){

                console.log(err);

                return res.status(500)
                .json(err);

            }

            res.json({

                success:true,
                message:"註冊成功"

            });


        }
    );


});
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
app.post('/api/login',(req,res)=>{

    const {email,password}=req.body;


    const sql =
    "SELECT * FROM users WHERE email=?";


    db.query(sql,[email],async(err,result)=>{

        if(err)
            return res.status(500).json(err);


        if(result.length===0){
            return res.status(401)
            .json({message:"帳號不存在"});
        }


        const user=result[0];


        const checkPassword =
        await bcrypt.compare(
            password,
            user.password
        );

        if(!checkPassword){
            return res.status(401)
            .json({message:"密碼錯誤"});
        }


        const token = jwt.sign(
            {
                id:user.id,
                email:user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:'2h'
            }
        );


        res.json({
            message:"登入成功",
            token:token,
            user:{
                id:user.id,
                name:user.name,
                email:user.email
            }
        });


    });

});

app.post('/api/cart/add', (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id) {
        return res.status(400).json({
            message: "缺少必要資料"
        });
    }

    const qty = quantity || 1;

    // 先確認購物車是否已有此商品
    const checkSql = `
        SELECT * 
        FROM cart_item
        WHERE user_id = ? AND product_id = ?
    `;

    db.query(checkSql, [user_id, product_id], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "資料庫錯誤",
                error: err
            });
        }

        // 已存在 -> 數量增加
        if (result.length > 0) {

            const updateSql = `
                UPDATE cart_item
                SET quantity = quantity + ?
                WHERE user_id = ? AND product_id = ?
            `;

            db.query(
                updateSql,
                [qty, user_id, product_id],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            message: "更新購物車失敗"
                        });
                    }

                    res.json({
                        message: "商品數量已更新"
                    });
                }
            );

        } 
        // 不存在 -> 新增
        else {

            const insertSql = `
                INSERT INTO cart_item
                (user_id, product_id, quantity)
                VALUES (?, ?, ?)
            `;

            db.query(
                insertSql,
                [user_id, product_id, qty],
                (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            message: "加入購物車失敗"
                        });
                    }

                    res.json({
                        message: "加入購物車成功",
                        cart_id: result.insertId
                    });
                }
            );
        }
    });
});
app.get('/api/cart/:user_id', (req, res) => {

    const user_id = req.params.user_id;

    const sql = `
        SELECT 
            cart_item.id,
            products.id AS product_id,
            products.name,
            products.price,
            products.image,
            cart_item.quantity
        FROM cart_item
        JOIN products
        ON cart_item.product_id = products.id
        WHERE cart_item.user_id = ?
    `;

    db.query(sql, [user_id], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "取得購物車失敗"
            });
        }

        res.json(result);

    });

});
app.put('/api/cart/update/:id', (req, res) => {

    const id = req.params.id;
    const { quantity } = req.body;


    const sql = `
        UPDATE cart_item
        SET quantity = ?
        WHERE id = ?
    `;


    db.query(
        sql,
        [quantity, id],
        (err, result) => {

            if(err){
                console.log(err);

                return res.status(500).json({
                    message:"更新失敗"
                });
            }


            res.json({
                message:"更新成功"
            });

        }
    );

});
app.delete('/api/cart/:id', (req, res) => {

    const id = req.params.id;


    const sql = `
        DELETE FROM cart_item
        WHERE id = ?
    `;


    db.query(
        sql,
        [id],
        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500).json({
                    message:"刪除失敗"
                });

            }


            res.json({
                message:"刪除成功"
            });

        }
    );

});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});