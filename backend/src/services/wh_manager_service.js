import { wh_managerRepo } from "../repositories/wh_manager.js";
import { JwtService } from "./jwt_create.js";
import { ApiError } from "../utils/ApiError.js";

export const wh_manager_service={
    create_wh_manager:async(data)=>{
        const {whm_name, whm_email, whm_password, whm_phone}=data;
        if(!whm_email){
            return new ApiError("Email is required",400);
        }
        if(!whm_password){
            return new ApiError("Password is required",400);
        }
        if(!whm_phone){
            return new ApiError("Phone number is required",400);
        }
        if(!whm_name){
            whm_name= "whm_"+Math.floor(Math.random()*100000);
        }
        const user= await wh_managerRepo.create_wh_manager(data);
        return user;
    },
    login_wh_manager:async(data)=>{
        const {whm_email, whm_password}=data;
        if(!whm_email){
            throw new ApiError("Email is required",400);
        }
        if(!whm_password){
            throw new ApiError("Password is required",400);
        }
        const user = await wh_managerRepo.login_wh_manager(data);
        return user;
    },
    verify_otp_wh_manager:async(data)=>{
        const {whm_email,admin_email, otp, otp2}=data;
        if(!whm_email){
            throw new ApiError("Email is required",400);
        }
        if(!otp){
            throw new ApiError("OTP is required",400);
        }
        if(!otp2){
            throw new ApiError("Admin OTP is required",400);
        }
        const user = await wh_managerRepo.verify_otp_wh_manager(data);
        return user;
    }
}