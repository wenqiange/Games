const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

dotenv.config()

const app = express()
const PORT = process.env.API_PORT || 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }))
app.use(express.json())

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whengames',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
})

async function ensureSchema(){
  const createStatement = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  const conn = await pool.getConnection()
  try{
    await conn.query(createStatement)
  } finally {
    conn.release()
  }
}

ensureSchema().catch(err=>{
  console.error('Error preparando la base de datos', err)
  process.exit(1)
})

app.get('/api/auth/health', (_req,res)=>{
  res.json({status:'ok'})
})

app.post('/api/auth/register', async (req,res)=>{
  const { username, email, password } = req.body
  if(!username || !email || !password){
    return res.status(400).json({message:'Faltan campos'})
  }
  try{
    const conn = await pool.getConnection()
    try{
      const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email])
      if(existing.length){
        return res.status(409).json({message:'El email ya está registrado'})
      }
      const hash = await bcrypt.hash(password, 10)
      await conn.query('INSERT INTO users (username,email,password_hash) VALUES (?,?,?)', [username, email, hash])
      res.json({message:'Usuario creado correctamente'})
    } finally {
      conn.release()
    }
  }catch(err){
    console.error(err)
    res.status(500).json({message:'Error interno', details: err.message})
  }
})

app.post('/api/auth/login', async (req,res)=>{
  const { email, password } = req.body
  if(!email || !password){
    return res.status(400).json({message:'Faltan credenciales'})
  }
  try{
    const conn = await pool.getConnection()
    try{
      const [rows] = await conn.query('SELECT id, username, password_hash FROM users WHERE email = ?', [email])
      if(!rows.length){
        return res.status(401).json({message:'Credenciales incorrectas'})
      }
      const user = rows[0]
      const match = await bcrypt.compare(password, user.password_hash)
      if(!match){
        return res.status(401).json({message:'Credenciales incorrectas'})
      }
      res.json({message:'Login correcto', user:{id:user.id, username:user.username, email}})
    } finally {
      conn.release()
    }
  }catch(err){
    console.error(err)
    res.status(500).json({message:'Error interno', details: err.message})
  }
})

app.listen(PORT, ()=>{
  console.log(`API escuchando en http://localhost:${PORT}`)
})
