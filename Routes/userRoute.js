const express=require("express")
const router=express.Router()
const zod=require("zod")
const { Users, Accounts } = require("../DB/indexx")
const jwt=require("jsonwebtoken")
const { JWT_SECRET } = require("../config")
const authMiddleWares = require("../MiddleWares/middleware")

//user Routes

const signupBody=zod.object({
    username:zod.string().email(),
    firstname:zod.string(),
    lastname:zod.string(),
    password:zod.string().min(6),
})

/*

// postman
{
    "username":"yash@gmail.com",
    "firstname":"yash",
    "lastname":"rawat",
    "password":"123456"
}


*/
router.post("/signup",async function(req,res){
    // create a new user
    const body=req.body;

    // validating inputs 

    const okreport=signupBody.safeParse(body);
    if(!okreport.success){
        return res.json({
            message: "Incorrect inputs"
        })
    }

    // checking for existing user 

    const existingUser=await Users.findOne(
        {username:body.username}
    )

    // checking if the existing user id is present or not .if yes then sending user message that user already exists .

    if(existingUser){
        return res.json({
            message: "User already exists"
        })
    }

    // after checking all the checks . we creating a user in the database .

    const newUser=await Users.create(body)

    const userid=newUser._id

    // assigning random bank balance to the user created between 1 to 10000. 

    await Accounts.create({
        userId:userid,
        balance:1+Math.random()*10000
    })

    // generating jwt token for the user. using the id of the newUser created .

    const jwtToken=jwt.sign({userId:newUser._id},JWT_SECRET)
  

   return  res.json({
        message: "User created",
        token:jwtToken
    })

    


})
// zod schema for signin 

const signinBody=zod.object({
    username:zod.string().email(),
    password:zod.string().min(6),
});

/*
postman
{
    "username":"yash@gmail.com",
    "password":"123456"
}


*/


router.post("/signin",async function(req,res){
    // sign in a user
    const body=req.body;

    // input vaildation 

    const okreport=signinBody.safeParse(body);
    if(!okreport.success){
        return res.json({
            message: "Incorrect inputs"
        })
    }

    // finding if you the user exist or not in the database

    const existingUser=await Users.findOne({
        username:body.username,
        password:body.password
    })

    // if user doesnt exist it will be returned back.
    if(!existingUser){
       return res.json({
            message: "User not found"
        })
    }

    // if exist then signing the jwt token
    const jwtToken=jwt.sign({userId:existingUser._id},JWT_SECRET)

    // sending back the response with token 

    return res.json({
        message: "User signed in",
        token:jwtToken
    })
    
})

const updatebody=zod.object({
    firstname:zod.string().optional(),
    lastname:zod.string().optional(),
    password:zod.string().min(6).optional()
})

router.put("/update",authMiddleWares,async function(req,res){
    // update a user information 
    const body=req.body;
    const okreport=updatebody.safeParse(body);
    if(!okreport.success){
       return res.json({
            message: "Incorrect inputs"
        })
    }

    // this is how we update thing on the database .
    await Users.updateOne({_id:req.userId},{
        "$set":body
    })

    return res.json({
        message: "User updated"
    })

})

router.get("/bulk",authMiddleWares,async function(req,res){

    // This is needed so users can search for their friends and send them money.
    const filter=req.query.filter || "";

    const filtered=await Users.find({
        $or:[
            // why regex?  because we want to search for the name of the user.it can also search sub string in the string . this type of query is know as like query.
            {firstname:{"$regex":filter}},{lastname:{"$regex":filter}}
        ]

    })

    res.json({
        user:filtered.map((val)=>{
            return {
                username:val.username,
                firstname:val.firstname,
                lastname:val.lastname,
                _id:val._id,
            }
        })

    })






})


module.exports=router