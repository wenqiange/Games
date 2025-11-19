import React from 'react'

export default function GameWindow({title, subtitle, children}){
  return (
    <section className="game-window">
      <div>
        <h3>{title}</h3>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}
