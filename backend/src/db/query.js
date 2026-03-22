import {pool} from './pool.js';
export const query = async(sql, params=[])=>{
    const client = await pool.connect();
    try{
        return await client.query(sql,params);
    }
    catch(err){
        console.log("Error executing query", err);
        throw err;
    }
    finally{
        client.release();
    }
};