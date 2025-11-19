import React, { useState } from 'react'
import GameWindow from '../components/GameWindow'
import { registerUser, loginUser } from '../services/authService'

export default function AuthPage(){
  const [registerData, setRegisterData] = useState({username:'', email:'', password:''})
  const [loginData, setLoginData] = useState({email:'', password:''})
  const [feedback, setFeedback] = useState({register:null, login:null})
  const [loading, setLoading] = useState({register:false, login:false})

  const onRegister = async (e)=>{
    e.preventDefault()
    setLoading(prev=>({...prev, register:true}))
    try{
      const res = await registerUser(registerData)
      setFeedback(prev=>({...prev, register:{type:'success', message:res.message || 'Cuenta creada'} }))
      setRegisterData({username:'', email:'', password:''})
    }catch(err){
      setFeedback(prev=>({...prev, register:{type:'error', message:err.message}}))
    }finally{
      setLoading(prev=>({...prev, register:false}))
    }
  }

  const onLogin = async (e)=>{
    e.preventDefault()
    setLoading(prev=>({...prev, login:true}))
    try{
      const res = await loginUser(loginData)
      setFeedback(prev=>({...prev, login:{type:'success', message:res.message || 'Login correcto'}}))
    }catch(err){
      setFeedback(prev=>({...prev, login:{type:'error', message:err.message}}))
    }finally{
      setLoading(prev=>({...prev, login:false}))
    }
  }

  return (
    <GameWindow title="Login & Registro" subtitle="Tus credenciales se almacenan en MySQL mediante una API Express.">
      <div className="auth-grid">
        <form className="form-card" onSubmit={onRegister}>
          <h3>Crear cuenta</h3>
          <div className="form-field">
            <label htmlFor="username">Usuario</label>
            <input id="username" value={registerData.username} onChange={e=>setRegisterData({...registerData, username:e.target.value})} required />
          </div>
          <div className="form-field">
            <label htmlFor="reg-email">Email</label>
            <input type="email" id="reg-email" value={registerData.email} onChange={e=>setRegisterData({...registerData, email:e.target.value})} required />
          </div>
          <div className="form-field">
            <label htmlFor="reg-pass">Contraseña</label>
            <input type="password" id="reg-pass" value={registerData.password} onChange={e=>setRegisterData({...registerData, password:e.target.value})} required />
          </div>
          <button className="btn primary" type="submit" disabled={loading.register}>{loading.register?'Creando...':'Registrarme'}</button>
          {feedback.register && (
            <div className={`feedback ${feedback.register.type}`}>{feedback.register.message}</div>
          )}
        </form>

        <form className="form-card" onSubmit={onLogin}>
          <h3>Iniciar sesión</h3>
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input type="email" id="login-email" value={loginData.email} onChange={e=>setLoginData({...loginData, email:e.target.value})} required />
          </div>
          <div className="form-field">
            <label htmlFor="login-pass">Contraseña</label>
            <input type="password" id="login-pass" value={loginData.password} onChange={e=>setLoginData({...loginData, password:e.target.value})} required />
          </div>
          <button className="btn primary" type="submit" disabled={loading.login}>{loading.login?'Entrando...':'Entrar'}</button>
          {feedback.login && (
            <div className={`feedback ${feedback.login.type}`}>{feedback.login.message}</div>
          )}
        </form>
      </div>
    </GameWindow>
  )
}
