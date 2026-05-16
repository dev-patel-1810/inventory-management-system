import { ApiError } from '../utils/ApiError.js';
import { admin_repo } from '../repositories/admin.js';

export const admin_service={
    login_admin:async(data)=>{
        const {admin_email, admin_password}= data;
        if(!admin_email){
            return new ApiError("Email is required",400);
        }
        if(!admin_password){
            return new ApiError("Password is required",400);
        }
        return admin_repo.admin_login(data);
    },
    create_admin:async(data)=>{
        const {admin_email, admin_password, admin_phone, admin_name}= data;
        if(!admin_email){
            return new ApiError("Email is required",400);
        }
        if(!admin_phone){
            return new ApiError("Phone number is required",400);
        }
        if(!admin_password){
            return new ApiError("Password is required",400);
        }
        if(!admin_name){
            admin_name= "admin_"+Math.floor(Math.random()*100000);
        }
        return admin_repo.create_admin(data);
    },
    verify_otp_admin:async(data)=>{
        const{admin_email,otp}=data;
        if(!admin_email){
            return new ApiError("Email is required",400);
        }
        if(!otp){
            return new ApiError("OTP is required",400);
        }
        return admin_repo.verify_otp_admin(data);
    }
}