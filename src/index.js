import dotenv from "dotenv"
import connectDB from "./config/db.js";
import app from './app.js'


dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>
{   app.on("error", (error) =>{
    console.log("ERRR: ", error);
    throw error
})
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running at port: ${process.env.PORT}`);
    })
})
.catch((err)=>
{
    console.log("mongoDB connection failed",err);
})