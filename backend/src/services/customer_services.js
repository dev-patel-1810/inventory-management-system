import { CustomerRepo } from "../repositories/customer.js";
import { ApiError} from "../utils/ApiError.js";
import async_handler from "../utils/async_handler.js";

export const CustomerService={
    get_users:async()=>{
        return CustomerRepo.findAll();
    },
    getUserById:async(id)=>{
        if(!id){
            throw new ApiError("User id is required",400);
        }
        return CustomerRepo.findById(id);
    },
    getUserId:async(email)=>{
        if(!email){
            throw new ApiError("User email is required",400);
        }
        return CustomerRepo.findIdByEmail(email);
    },
    createCustomer:async(data)=>{
        const { customer_name, c_mobileNumber,  c_email ,c_password } = data;
        if(!c_email){
            throw new ApiError("Email is required",400);
        }
        if(!c_password){
            throw new ApiError("Password is required",400);
        }
        if(!c_mobileNumber){
            throw new ApiError("Mobile number is required",400);
        }
        if(!customer_name){
            customer_name="Guest"+ Math.floor(Math.random() * 100000);
        }
        return CustomerRepo.create(data);
    },

    getUserByEmail:async(email)=>{
        if(!email){
            throw new ApiError("User email is required",400);
        }
        return CustomerRepo.checkEmailExists(email);
    },
    changeUserData:async(data)=>{
        return CustomerRepo.changeUserData(data);
    },

    loginUser:async(login_info)=>{
        if(!login_info.c_email){
            throw new ApiError("User email is required",400);
        }
        if(!login_info.c_password){
            throw new ApiError("User password is required",400);
        }
        return CustomerRepo.login(login_info);
    },
    emailLogin:async(data)=>{
        // if(!data.c_email || !data.otp){
        //     throw new ApiError("Login OTP is required",400);
        // }
        return CustomerRepo.emailLogin(data);
    },
    getUserInfo:async(customer_id)=>{
        if(!customer_id){
            throw new ApiError(400,"User ID is required");
        }
        return CustomerRepo.getUserInfo(customer_id);
    }
}