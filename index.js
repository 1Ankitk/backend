const express = require("express");
const app = express();
const {connectMongoDB} = require("./connect");
// const {connectMySql,dataToInsert,disConnectMysql} = require("./database");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
require("dotenv").config();

//connectMySql();
connectMongoDB(process.env.MONGO_URL,
{ useNewUrlParser: true, useUnifiedTopology: true })
.then(()=> console.log("mongo db connected"));
app.use(cors({
    origin: '*'
}));
app.use(express.urlencoded({extended:false}))
app.use(cookieParser());
app.use(express.json());

// app.use( (req,res,next)=>{
//     console.log("hello from middleware");
//     console.log(req.body);
//     next();
// })

app.use(session({
    secret: 'AiZw',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({  mongoUrl: process.env.MONGO_URL })
}));

const userRouter = require("./routes/users");
app.use("/users" , userRouter);

app.listen(process.env.PORT,()=> console.log(`Server started on ${process.env.PORT}`));