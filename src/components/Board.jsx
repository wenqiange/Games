import React from 'react'
import Piece from './Piece'

function coordToLabel(x,y,showCoords){
  if(!showCoords) return null
  const files = 'ABCDEFGH'
  const ranks = '87654321'
  return <div className="coords">{files[x]}{ranks[y]}</div>
}

export default function Board({board, selected, highlights=[], onSelect, showCoords, flipped}){
  const filesOrder = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7]
  const ranksOrder = flipped ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0]
  const squares = []

  for(const y of ranksOrder){
    for(const x of filesOrder){
      const sq = board[y][x]
      const isDark = (x+y)%2===1
      const key = `${x}-${y}`
      const isHighlight = highlights.some(h=>h[0]===x && h[1]===y)
      const isSelected = selected && selected[0]===x && selected[1]===y
      squares.push(
        <div key={key} onClick={()=>onSelect(x,y)} className={`square ${isDark?'dark':'light'} ${isHighlight? 'highlight':''}`}>
          {coordToLabel(x,y,showCoords)}
          {sq && <Piece piece={sq} />}
          {isSelected && <div className="selected-ring"></div>}
        </div>
      )
    }
  }

  return (
    <div className="chess-board">
      {squares}
    </div>
  )
}
