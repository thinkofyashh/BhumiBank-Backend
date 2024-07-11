const express=require("express")
const cors = require('cors');
const bodyParser=require("body-parser")
const rootRouter=require("./Routes/index")

const app=express()
app.use(bodyParser.json())
app.use(cors());
app.use("/api/v1",rootRouter)


app.listen(3000)