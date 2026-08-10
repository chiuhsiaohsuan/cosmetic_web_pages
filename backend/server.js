require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./db");
const productDetailImage = require('./routes/productDetailImage');
const adminProductsRouter = require('./routes/adminProducts');
const adminRouter = require('./routes/admin');
const orderRouter = require('./routes/order');
const paymentRouter = require('./routes/payment');
const userRouter = require('./routes/user');
const adminOrdersRouter = require('./routes/adminOrders');
const transporter = require('./middleware/mailer');
const forgotPassRouter = require('./routes/forgotPass');
const verificationCodes = new Map();


app.use(cors({
    origin:[
        'http://localhost:4200',
        'https://web-cosmetic-c11d0.web.app',
        'https://chengyi-group.com.tw'
    ],
    methods:['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders:[
        'Content-Type',
        'Authorization'
    ],
    exposedHeaders:['X-Account-Disabled']
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use("/uploads",express.static("uploads"));
app.use('/api', userRouter);
app.use('/api', forgotPassRouter);
app.use(
    '/api/products',
    productDetailImage
);
app.use(
    '/api/admin',
    adminRouter
);
app.use(
    "/api/admin/products",
    adminProductsRouter
);
app.use(
    '/api/admin/orders',
    adminOrdersRouter
);
app.use(
    '/api/orders',
    orderRouter
);
app.use(
    "/api/admin/payments",
    paymentRouter
);

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
//取得全部商品
app.get("/api/products",(req,res)=>{

    const sql = "SELECT * FROM products WHERE status='active'";

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
app.post("/api/send-verification-code", async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "請輸入電子郵件"
        });
    }

    // 產生 6 位數驗證碼
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 儲存驗證碼，5 分鐘後過期
    verificationCodes.set(email, {
        code: code,
        expires: Date.now() + 5 * 60 * 1000,
        verified: false
    });

    try {

        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}"<${process.env.MAIL_FROM}>`,
            to: email,
            subject: "會員註冊 Email 驗證碼",
            html: `
                <h2>會員註冊驗證</h2>

                <p>您好，您的電子郵件驗證碼是：</p>

                <h1>${code}</h1>

                <p>驗證碼 5 分鐘內有效。</p>

                <p>如果不是您本人操作，請忽略此信件。</p>
            `
        });

        console.log(`驗證碼 ${code} 已寄送至 ${email}`);

        res.json({
            success: true,
            message: "驗證碼已寄出"
        });

    } catch (error) {

        console.error("Email 發送失敗:", error);

        // 寄信失敗就把驗證碼刪掉
        verificationCodes.delete(email);

        res.status(500).json({
            success: false,
            message: "驗證碼寄送失敗"
        });
    }
});
app.post("/api/verify-email", (req, res) => {

    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({
            success: false,
            message: "請輸入 Email 和驗證碼"
        });
    }

    const data = verificationCodes.get(email);

    // 找不到驗證碼
    if (!data) {
        return res.status(400).json({
            success: false,
            message: "驗證碼不存在或已失效"
        });
    }

    // 驗證碼過期
    if (Date.now() > data.expires) {

        verificationCodes.delete(email);

        return res.status(400).json({
            success: false,
            message: "驗證碼已過期，請重新取得"
        });
    }

    // 驗證碼錯誤
    if (data.code !== code) {
        return res.status(400).json({
            success: false,
            message: "驗證碼錯誤"
        });
    }

    // 驗證成功
    data.verified = true;

    verificationCodes.set(email, data);

    res.json({
        success: true,
        message: "Email 驗證成功"
    });

});
app.post("/api/register",async(req,res)=>{

    const {
        name,
        birthday,
        password,
        phone,
        email
    } = req.body;

    // 檢查 Email 是否已驗證
    const verification = verificationCodes.get(email);

    if (!verification || !verification.verified) {

        return res.status(400).json({
            success: false,
            message: "請先完成電子郵件驗證"
        });

    }
    const bcrypt = require('bcrypt');
    const hashPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users(name,birthday,password,phone,email,status)VALUES(?,?,?,?,?,?)`;

    db.query(
        sql,
        [
          name,
          birthday,
          hashPassword,
          phone,
          email,
          'active'
        ],
        (err,result)=>{


            if(err){

                console.log(err);

                return res.status(500)
                .json(err);

            }
            // 註冊完成後刪除驗證碼
            verificationCodes.delete(email);
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
        if(user.status === 'disabled'){

            return res.status(403)
            .json({
                message:"帳號已停權，請聯絡管理員"
            });

        }
        if(user.is_deleted === 1){

            return res.status(403).json({
                message:'帳號不存在'
            });

        }

        const token = jwt.sign(
            {
                id:user.id,
                email:user.email,
                role:user.role
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
                email:user.email,
                phone:user.phone,
                role:user.role
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
