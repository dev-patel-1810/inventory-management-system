import { JwtService } from '../src/services/jwt_create.js';
import { wh_manager_service } from '../src/services/wh_manager_service.js';
import { ApiError } from '../src/utils/ApiError.js';
import async_handler from '../src/utils/async_handler.js';

export const wh_managerController={
    create_wh_manager:async_handler(async(req,res,next)=>{
        try{
            const user= await wh_manager_service.create_wh_manager(req.body);
            res.status(201).json(user);
        }
        catch(err){
            console.log(err);
            throw new ApiError(400, err.message);
        }
    }),
    verify_otp_wh_manager:async_handler(async(req,res,next)=>{
        try{
            const user= await wh_manager_service.verify_otp_wh_manager(req.body);
            res.status(200).json(user);
        }
        catch(err){
            throw new ApiError(400, err.message);
        }
    }),
    login_wh_manager:async_handler(async(req,res,next)=>{
        try{
            const data= await wh_manager_service.login_wh_manager(req.body);
            return res.json(data);
        }
        catch(err){
            console.log(err);
            throw new ApiError(400, err.message);
        }
    }),
    verify_otp_wh_manager:async_handler(async(req,res,next)=>{
        try{
            const data=await wh_manager_service.verify_otp_wh_manager(req.body);
            console.log(data);
            if (!data.success) {
                return res.status(400).json(data);
            }
            console.log("data from service", data);
            const accessToken_wh_manager = JwtService.generateAccessToken(data.user);
            const refreshToken_wh_manager = JwtService.generateRefreshToken(data.user);
            res.cookie("access_token", accessToken_wh_manager, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            })
            .cookie("refresh_token", refreshToken_wh_manager, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            }).json(data);
        }
        catch(err){
            console.log(err);
            throw new ApiError(400, err.message);
        }
    })
}