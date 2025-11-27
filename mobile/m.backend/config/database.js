import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DATABASE_URL || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: '',
    database: process.env.DATABASE_NAME || 'navi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Função assíncrona que obtém uma conexão do pool.
// Essa conexão é usada para executar as queries SQL.
async function getConnection() {
    return pool.getConnection();
}

// Função para ler todos os registros
async function readAll(table, where = null) {
    const connection = await getConnection();
    try {
        let sql = `SELECT * FROM ${table}`;
        if (where) {
            sql += ` WHERE ${where}`;
        }
        const [rows] = await connection.execute(sql);
        return rows;
    } finally {
        connection.release();
    }
}

// Função para ler um registro específico
// config/database.js
async function read(table, where, params = []) {
    const connection = await getConnection();
    try {
        let sql = `SELECT * FROM ${table}`;
        if (where) {
            sql += ` WHERE ${where}`;
        }
        const [rows] = await connection.execute(sql, params); // Passa os parâmetros aqui
        return rows[0] || null;
    } finally {
        connection.release();
    }
}
// Função para inserir um novo registro
// Função assíncrona para inserir dados em uma tabela do banco de dados
async function create(table, data) {
    const connection = await getConnection();
    try {
        const columns = Object.keys(data).join(', ');
        const placeholders = Array(Object.keys(data).length).fill('?').join(', ');
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        const values = Object.values(data);
        const [result] = await connection.execute(sql, values);
        return;
    } finally {
        connection.release();
    }
}

// Função para atualizar um registro
async function update(table, data, where) {
    const connection = await getConnection();
    try {
        const set = Object.keys(data)
            .map(column => `${column} = ?`)
            .join(', ');

        const sql = `UPDATE ${table} SET ${set} WHERE ${where}`;
        const values = Object.values(data);

        const [result] = await connection.execute(sql, [...values]);
        return result.affectedRows;
    } finally {
        connection.release();
    }
}

// Função para excluir um registro
async function deleteRecord(table, where) {
    const connection = await getConnection();
    try {
        const sql = `DELETE FROM ${table} WHERE ${where}`;
        const [result] = await connection.execute(sql);
        return result.affectedRows;
    } catch (error) {
        console.error('Não foi possível excluir o registro', error)
        throw error
    } finally {
        connection.release();
    }
}

async function compare(senha, hash) {
    try {
        // Compare a senha com o hash usando bcrypt
        return await bcrypt.compare(senha, hash);
    } catch (error) {
        console.error('Erro ao comparar a senha com o hash:', error);
        return false; // Em caso de erro, retorne falso para indicar que a senha não corresponde
    }
}

export { pool, create, readAll, read, update, deleteRecord, compare };