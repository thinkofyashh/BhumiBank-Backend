const mongoose=require("mongoose")
const { string, Schema } = require("zod")

mongoose.connect("mongodb+srv://thinkofyash:18NovMonday@cluster0.xay1cqj.mongodb.net/BhumiBank")

const UserSchema=new mongoose.Schema({
    username:String,
    firstname:String,
    lastname:String,
    password:String
})




const User=mongoose.model("Users",UserSchema)

const AccountSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    balance:{
        type:Number,
        required:true
    }
})

const Account=mongoose.model("Accounts",AccountSchema)

module.exports={
    Users:User,
    Accounts:Account
}
