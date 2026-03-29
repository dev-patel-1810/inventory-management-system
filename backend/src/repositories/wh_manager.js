import bcrypt from 'bcrypt';
import { query } from '../db/query.js';
import { ApiError } from '../utils/ApiError.js';
import { JwtService } from '../services/jwt_create.js';

export const wh_managerRepo={
    create_wh_manager:async(data)=>{
        try{
            const { whm_name, whm_email, whm_password, whm_phone } = data;
            const hashedPassword = await bcrypt.hash(whm_password, 10);
            const { rows } = await query(
                'insert into wh_manager (whm_name, whm_email, whm_password, whm_phone) values($1, $2,$3,$4) returning whm_id, whm_name, whm_email, whm_phone',
                [whm_name, whm_email, hashedPassword, whm_phone]
            );
            var{wh_password, ...data}=rows[0];
            return data;
        }
        catch(err){
            throw new ApiError(400, "Error creating warehouse manager: " + err.message);
        }
    },
    login_wh_manager: async (data) => {
            try {
            const { whm_email, whm_password } = data;
            if (!whm_email) {
                throw new ApiError("Email is required", 400);
            }
            const { rows } = await query(
                "select * from wh_manager where whm_email = $1",
                [whm_email]
            );

            if (!rows.length) throw new ApiError(400, "Invalid email or password");
            const user = rows[0];
            const isMatch = await bcrypt.compare(whm_password, user.whm_password);
            if (!isMatch) throw new ApiError(400, "Invalid email or password");
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await query(
                `INSERT INTO otp_codes (email, otp, expires_at)
                VALUES ($1, $2, $3)
                ON CONFLICT (email)
                DO UPDATE SET otp = EXCLUDED.otp,
                            expires_at = EXCLUDED.expires_at`,
                [whm_email, otp, Date.now() + 5 * 60 * 1000]
            );

            await fetch("http://127.0.0.1:8000/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: whm_email,
                    subject: "Login OTP for Inventory app",
                    body: `Your OTP to log in is ${otp}. OTP is valid for 2 minutes only.`
                })
            });

            return { message: "OTP sent" };

        } catch (err) {
            throw new ApiError(400, "Error during login: " + err.message);
        }
    },
    verify_otp_wh_manager:async(data)=>{
        try{
            const {whm_email,otp}=data;
            const inp_otp=otp.toString();
            const {rows}= await query(
                `select * from otp_codes where email=$1 and otp=$2`,
                [whm_email, inp_otp]
            )
            if(rows.length===0){
                throw new ApiError(400, "Invalid OTP or OTP expired");
            }
            if(rows[0].expires_at<new Date()){
                throw new ApiError(400, "OTP expired");
            }
            const user1= await query(
                `delete from otp_codes where email=$1`,
                [whm_email]
            )
            const data1=await query(
                `select * from wh_manager where whm_email=$1`,
                [whm_email]
            )
            var {whm_password, ...user}= data1.rows[0];
            return user;
        }    
        catch(err){
            console.log(err);
            throw new ApiError(400, "Error verifying OTP, Please login again: " + err.message);        
        }
    }
}