import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool(process.env.DATABASE_URL);

console.log("Pool de conexão MySQL inicializado com sucesso.");

export default pool;