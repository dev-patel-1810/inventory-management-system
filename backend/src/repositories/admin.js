import { ApiError } from '../utils/ApiError.js';
import bcrypt from 'bcrypt';
import { query } from '../db/query.js';
export const admin_repo={
    create_admin:async({admin_email, admin_password, admin_phone, admin_name})=>{
        try{
            const hashed_password= await bcrypt.hash(admin_password,10);
            const { rows } = await query(
                `insert into admins (admin_email, admin_password, admin_phone, admin_name) 
                values ($1,$2,$3,$4) returning admin_id, admin_email, admin_phone, admin_name`, 
                [admin_email, hashed_password, admin_phone, admin_name]
            );
            const admin=rows[0];
            return admin;
        }
        catch(err){
            throw new ApiError(400, "Error creating admin: " + err.message);
        }
    },
    admin_login:async(data)=>{
        try{
            const{rows}=await query(
                "select * from admins where admin_email=$1",
                [data.admin_email]
            )
            if(!rows.length) throw new ApiError("Admin not found",400);
            const admin=rows[0];
            const match = await bcrypt.compare(data.admin_password, admin.admin_password);
            if(!match) throw new ApiError("Invalid password",400);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await query(
                `insert into otp_codes(email,otp,expires_at) values($1,$2,$3)
                on conflict(email) do update set otp=EXCLUDED.otp, expires_at=EXCLUDED.expires_at`, [data.admin_email, otp, Date.now() + 5 * 60 * 1000]
            );
            await fetch("http://127.0.0.1:8000/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: data.admin_email,
                    subject: "Login OTP for Inventory app(Admin)",
                    body: `Your OTP to log in is ${otp}. OTP is valid for 5 minutes only.`
                })
            });
            return { message: "OTP sent" };
        }
        catch(err){
            throw new ApiError(400, "Error during login: " + err.message);
        }
    },
    verify_otp_admin:async(data)=>{
        try{
            const inp_otp=data.otp.toString();
            const{rows}=await query(
                'select * from otp_codes where email=$1',[data.admin_email]
            );
            if(!rows.length) throw new ApiError("OTP not found",400);
            const record=rows[0];
            if(record.expires_at<Date.now()){
                return {success:false, message:"OTP expired"};
            }
            if(record.otp!==inp_otp){ 
                return {success:false, message:"Invalid OTP"};
            }
            await query(
                `delete from otp_codes where email=$1`, [data.admin_email]
            );
            const {rows: adminRows}= await query(
                `select * from admins where admin_email=$1`, [data.admin_email]
            );
            if(!adminRows.length) throw new ApiError("Admin not found",400);
            const admin=adminRows[0];
            const {admin_password, ...adminData}=admin;
            return {
                success:true,
                message:"OTP verified",
                user:adminData
            }
        }
        catch(err){
            throw new ApiError(400, "Error verifying OTP: " + err.message);
        }
    }
}