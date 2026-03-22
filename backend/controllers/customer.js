import cookie_parser from 'cookie-parser';
import { JwtService } from '../src/services/jwt_create.js';
import { CustomerService } from "../src/services/customer_services.js";
import { ApiError } from '../src/utils/ApiError.js';
import async_handler from '../src/utils/async_handler.js';

export const CustomerController={
    createCustomer:async_handler(async(req,res,next)=>{
        try{
            console.log(req.body);
            const user= await CustomerService.createCustomer(req.body);
            res.status(201).json(user);
        }
        catch(err){
            console.log(err);
            throw new ApiError(400, err.message);
        }
    }),
    updateUser:async_handler(async(req,res,next)=>{
        try{
            const data=await CustomerService.changeUserData(req.body);
            res.status(200).json(data);
        }
        catch(err){
            throw new ApiError(400, err.message);
        }
    }),
    loginUser:async_handler(async(req,res,next)=>{
        try{
            const data= await CustomerService.loginUser(req.body);
            res.json(data);
        }
        catch(err){
            throw new ApiError(400, err.message);
        }
    }),
    emailLogin:async_handler(async(req,res,next)=>{
        try{
            const data= await CustomerService.emailLogin(req.body);
            if (!data.success) {
                return res.status(400).json(data);
            }
            const accessToken = JwtService.generateAccessToken(data.user);
            const refreshToken = JwtService.generateRefreshToken(data.user);
            res.cookie("access_token", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            })
            .cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            }).json(data);
        }
        catch(err){
            throw new ApiError(400, err.message);
        }
    }),
    getUserId:async_handler(async(req,res,next)=>{
        try{
            const data = await CustomerService.getUserId(req.params.id);
            res.status(200).json(data);
        }
        catch(err){
            throw new ApiError(400, "User not found");
        }
    }),
    getUserInfo:async_handler(async(req,res,next)=>{
        try{
            const data= await CustomerService.getUserInfo(req.user.id);
            return res.status(200).json(data);
        }
        catch(err){
            console.log(req.user);
            throw new ApiError(400, "Error fetching user info: " + err.message);
            // throw err;
        }
    })
    // get user info will come here once i add the authentication and jwt things, then i can get the email from the token and then get the user info from the database using that email and return it to the frontend
}