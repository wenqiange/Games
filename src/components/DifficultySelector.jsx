import React from 'react'

export default function DifficultySelector({value,onChange}){
  return (
    <div>
      <div className="label">Dificultad</div>
      <select className="difficulty-select" value={value} onChange={e=>onChange(e.target.value)}>
        <option value="easy">Fácil</option>
        <option value="medium">Medio</option>
        <option value="hard">Difícil</option>
      </select>
    </div>
  )
}
