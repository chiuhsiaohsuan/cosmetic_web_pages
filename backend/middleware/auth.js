const jwt = require('jsonwebtoken');


function verifyToken(req, res, next){

    const authHeader = req.headers.authorization;


    if(!authHeader){

        return res.status(401).json({
            message:"沒有 Token"
        });

    }


    const token = authHeader.split(" ")[1];


    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, user)=>{

            if(err){

                return res.status(403).json({
                    message:"Token 無效"
                });

            }


            req.user = user;

            next();

        }
    );

}


module.exports = verifyToken;