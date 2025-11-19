import React from 'react'

const pieceImages = [
  'w_k','w_q','w_r','w_b','w_n','w_p',
  'b_k','b_q','b_r','b_b','b_n','b_p'
].reduce((acc,key)=>{
  acc[key] = `${import.meta.env.BASE_URL || '/'}assets/chess/${key}.svg`
  return acc
}, {})

export default function Piece({piece, size=56}){
  if(!piece) return null
  const {type, color} = piece
  const key = `${color}_${type}`
  const src = pieceImages[key]
  if(!src) return null
  return (
    <img
      draggable={false}
      style={{width:size+'px',height:size+'px'}}
      className="piece"
      src={src}
      alt={`${color}_${type}`}
      loading="lazy"
    />
  )
}
