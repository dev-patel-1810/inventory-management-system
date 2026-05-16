import {admin_service} from "../src/services/admin_service.js";
import { JwtService } from '../src/services/jwt_create.js';
import { ApiError } from '../src/utils/ApiError.js';
import async_handler from '../src/utils/async_handler.js';

export const adminController={
    create_admin:async_handler(async(req,res,next)=>{
        try{
            const user= await admin_service.create_admin(req.body);
            res.status(201).json(user);
        }
        catch(err){
            return new ApiError(400, err.message);
        }
    }),
    login_admin:async_handler(async(req,res,next)=>{
        try{
            const data= await admin_service.login_admin(req.body);
            res.status(200).json(data);
        }
        catch(err){
            return new ApiError(400, err.message);
        }
    }),
    verify_otp_admin:async_handler(async(req,res,next)=>{
        try{
            const data= await admin_service.verify_otp_admin(req.body);
            if(!data.success){
                return res.status(400).json(data);
            }
            const accessToken_admin = JwtService.generateAccessToken(data.user);
            const refreshToken_admin = JwtService.generateRefreshToken(data.user);
            res.cookie("access_token", accessToken_admin, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            })
            .cookie("refresh_token", refreshToken_admin, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            }).json(data);
        }
        catch(err){
            return new ApiError(400, err.message);
        }
    })
}