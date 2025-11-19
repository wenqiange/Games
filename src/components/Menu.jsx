import React from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  {to:'/', label:'Inicio'},
  {to:'/chess', label:'Ajedrez'},
  {to:'/auth', label:'Login / Registro'}
]

export default function Menu(){
  return (
    <nav className="menu">
      {links.map(link=>(
        <NavLink
          key={link.to}
          to={link.to}
          className={({isActive})=>`menu-link ${isActive? 'active':''}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
