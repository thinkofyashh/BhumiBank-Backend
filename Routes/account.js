const express=require("express");
const zod=require("zod")

const authMiddleWares = require("../MiddleWares/middleware");
const { Accounts } = require("../DB/indexx");
const { default: mongoose } = require("mongoose");
const router=express.Router();


/*

postman
{
    "username":"yash1@gmail.com"
    
}

*/
router.get("/balance",authMiddleWares,async function(req,res){
    const userid=req.userId;
    console.log(userid)
    const account=await Accounts.findOne({
        userId:userid
    })
    console.log(account)
    console.log(account.balance)
   return res.json({
        balance:account.balance
    })
})

const transferBody=zod.object({
    to:zod.string(),
    amount:zod.number().min(1).max(10000)
})
/*


*/
router.post("/transfer",authMiddleWares,async function(req,res){
try{
    // started session

    const session=await mongoose.startSession();
    session.startTransaction();

    // destructuring of an object and extreacting body
    const {amount,to}=req.body

    // checking if the sender account exist or not 
    const senderAccount=await Accounts.findOne({
        userId:req.userId
    }).session(session)

    // checking if the balance sended by the sender is less than he/she balance 
    if(!senderAccount || senderAccount.balance<amount){
        // aborting the session 
        await session.abortTransaction()
       return res.json({
            msg:"Insufficient Balance"

        })
    }
    // checking if the receiver account exist or not
    const toAccount=await Accounts.findOne({userId:to}).session(session)

    if(!toAccount){
        await session.abortTransaction()
       return  res.json({
            msg:"Invalid Account"
        })
    }

    await Accounts.updateOne({userId:req.userId},{"$inc":{balance:-amount}}).session(session)

    // updating the account with updated value.
    
        await Accounts.updateOne({userId:to},{"$inc":{balance:amount}}).session(session)
    
    // if all done returning the message .
    await session.commitTransaction()
    
       return res.json({
            msg:"Transfer Successful"
        })
}catch(err){
    await session.abortTransaction();
    console.log(err)
    return res.json({msg:"Error transferring funds"})
}
})




module.exports=router;