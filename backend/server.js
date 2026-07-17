require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("MySQL Connected");
});

app.get("/api/user", (req, res) => {
  db.query("SELECT * FROM user", (err, results) => {
    if (err) return res.status(500).json(err);

    res.json(results);
  });
});
app.post("/api/register",(req,res)=>{

    const {
        name,
        password,
        phone,
        email
    } = req.body;


    const sql = `INSERT INTO user(name,password,phone,email)VALUES(?,?,?,?)`;

    db.query(
        sql,
        [
          name,
          password,
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
app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    const sql =
        "SELECT id, name, email FROM user WHERE email=? AND password=?";

    db.query(sql, [email, password], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(401).json({
                success: false,
                message: "帳號或密碼錯誤"
            });
        }

        res.json({
            success: true,
            user: result[0]
        });

    });

});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});