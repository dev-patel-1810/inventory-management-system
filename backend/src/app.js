import express from 'express';
import cors from 'cors';
import cookie_parser from 'cookie-parser';
// import dotenv from 'dotenv';
import router from './routes/customer.js';
// dotenv.config()

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookie_parser())
app.use("/",router)

export {app};
