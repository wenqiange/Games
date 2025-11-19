const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, payload){
  const res = await fetch(`${API_BASE}${path}`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  const data = await res.json().catch(()=>({}))
  if(!res.ok){
    throw new Error(data.message || 'Error en la solicitud')
  }
  return data
}

export function registerUser(payload){
  return request('/api/auth/register', payload)
}

export function loginUser(payload){
  return request('/api/auth/login', payload)
}
