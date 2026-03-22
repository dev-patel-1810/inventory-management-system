import { Pool } from 'pg';
import { dbconfig } from '../config/db.js';

export const pool = new Pool(dbconfig);
let logged = false;
pool.on('connect', () => {
    if (!logged) {
    console.log('Database connected');
    logged = true;
  }
    // console.log('Connected to the database');
    // console.log('Pool initialized', process.pid);
});

pool.on('error', (err) => {
    console.error('Error connecting DB', err);
    process.exit(1);
});
