import bcrypt from 'bcrypt';
import {query} from '../db/query.js';
import {ApiError} from '../utils/ApiError.js';
export const CustomerRepo = {
    create: async ({ customer_name,c_email, c_password,c_mobileNumber }) => {
        try{
            const hashed_c_password= await bcrypt.hash(c_password,10);
            const { rows } = await query(
            `
            INSERT INTO customers ( customer_name,c_email,c_password,c_mobileNumber)
            VALUES ($1,$2,$3,$4)
            RETURNING customer_id, customer_name, c_email, c_password,c_mobileNumber
            `,
            [customer_name, c_email, hashed_c_password,c_mobileNumber]
            );
            var {c_password, ...customer} = rows[0];
            return customer;
        }
        catch(err){
            throw new ApiError(400, "Error creating user: " + err.message);
        }
  },
    findAll: async()=>{
        try{
            const{rows}=await query(
                "Select * from customers"
            )
            const {c_password, ...customer} = rows;
            return customer;
        }
        catch(err){
            throw new ApiError(400, "Error fetching users: " + err.message);
        }
    },
    checkEmailExists:async(c_email)=>{
        try{
            const{rows}=await query(
                "SELECT EXISTS (SELECT 1 FROM customers WHERE c_email = $1);"
                [c_email]
            )
            if(rows){
                return "email exists";
            }
            else{
                return "email does not exist";
            }
        }
        catch(err){
            throw new ApiError(400, "Error checking email: " + err.message);
        }
    },
    changeUserData: async ({ c_email, customer_name, c_mobileNumber, new_password }) => {
        try{
            const fields = [];
            const values = [];
            let i = 1;

            if (customer_name) {
                fields.push(`customer_name=$${i++}`);
                values.push(customer_name);
            }

            if (c_mobileNumber) {
                fields.push(`c_mobileNumber=$${i++}`);
                values.push(c_mobileNumber);
            }

            if (new_password) {
                const hash = await bcrypt.hash(new_password, 10);
                fields.push(`c_password=$${i++}`);
                values.push(hash);
            }

            if (!fields.length) return null;

            values.push(c_email);

            const { rows } = await query(
                `update customers set ${fields.join(", ")} where c_email=$${i} returning customer_id, customer_name, c_email, c_mobileNumber`,
                values
            );
            const {c_password, ...customer} = rows[0];
            return customer;
        }
        catch(err){
            throw new ApiError(400, "Error updating user: " + err.message);
        }
    },
    login: async (data) => {
        try {
            const { rows } = await query(
                "select * from customers where c_email = $1",
                [data.c_email]
            );

            if (!rows.length) throw new ApiError(400, "Invalid email or password");

            const user = rows[0];

            const isMatch = await bcrypt.compare(data.c_password, user.c_password);
            if (!isMatch) throw new ApiError(400, "Invalid email or password");

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            await query(
                `INSERT INTO otp_codes (email, otp, expires_at)
                VALUES ($1, $2, $3)
                ON CONFLICT (email)
                DO UPDATE SET otp = EXCLUDED.otp,
                            expires_at = EXCLUDED.expires_at`,
                [data.c_email, otp, Date.now() + 5 * 60 * 1000]
            );

            await fetch("http://127.0.0.1:8000/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: data.c_email,
                    subject: "Login OTP for Inventory app",
                    body: `Your OTP to log in is ${otp}. OTP is valid for 5 minutes only.`
                })
            });

            return { message: "OTP sent" };

        } catch (err) {
            throw new ApiError(400, "Error during login: " + err.message);
        }
    },
    emailLogin: async (data) => {
        try {
            const { c_email, otp } = data;
            const inputOtp = otp.toString();

            const { rows } = await query(
                "SELECT * FROM otp_codes WHERE email = $1",
                [c_email]
            );

            if (!rows.length) {
                return { success: false, message: "No OTP found" };
            }

            const record = rows[0];

            if (record.expires_at < Date.now()) {
                return { success: false, message: "OTP expired" };
            }

            if (record.otp !== inputOtp) {
                return { success: false, message: "Invalid OTP" };
            }
            await query(
                "DELETE FROM otp_codes WHERE email = $1",
                [c_email]
            );
            const { rows: userRows } = await query(
                "SELECT * FROM customers WHERE c_email = $1",
                [c_email]
            );
            if (!userRows.length) {
                throw new ApiError("User not found", 400);
            }
            const user = userRows[0];
            const { c_password, ...userWithoutPassword } = user;
            return {
                success: true,
                message: "Login successful",
                user: userWithoutPassword
            };
        } catch (err) {
            throw new ApiError(400, "Error during email login: " + err.message);
        }
    },
    findIdByEmail:async(email)=>{
        try{
            const{rows}=await query(
                "select customer_id from customers where c_email=$1",
                [email]
            )
            const {c_password, ...customer} = rows[0];
            return customer;
        }
        catch(err){
            throw new ApiError(400, "Error fetching user ID: " + err.message);
        }
    },
    getUserInfo:async(customer_id)=>{
        try{
        const{rows}=await query(
            "select * from customers where customer_id=$1",
            [customer_id]
        )
        const{c_password, ...customer}=rows[0];
        return customer;
        }
        catch(err){
            throw new ApiError(400, "Error fetching user info: " + err.message);
        }
    }
    
    // WE WRITE ALL THE DIFFERENT TYPES OF QUERIES WE NEED TO PERFORM HERE............
}