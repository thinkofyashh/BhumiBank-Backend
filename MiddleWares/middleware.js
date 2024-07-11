const express=require("express")
const jwt=require("jsonwebtoken");
const { JWT_SECRET } = require("../config");



function authMiddleWares(req,res,next){
    const token=req.headers.authorization
    if(!token || !token.startsWith("Bearer ")){
        return res.json({
            status:false,
        })
    }
    const t=token.split(" ")
    const jwtToken=t[1];

    try{
    const decoded=jwt.verify(jwtToken,JWT_SECRET)
    if(decoded.userId){
        req.userId=decoded.userId
        next();
    }

    }catch(err){
       return res.status(401).json({message:"unauthorized"})
    }

    

}
module.exports=authMiddleWares