/**
 * chessEngine.js
 * Motor de ajedrez simplificado con reglas principales:
 * - Representación: board[8][8] con objetos {type:'p','r','n','b','q','k', color:'w'|'b'} o null
 * - Movimientos legales (incluye enroque, promoción y detección de jaque/jaque mate)
 * - Bot con 3 niveles: easy (aleatorio), medium (elige aleatoriamente entre top N), hard (minimax con poda)
 *
 * Nota: Este motor prioriza claridad y funcionamiento en el navegador. No cubre absolutamente todos los matices FIDE (por ejemplo, reglas de tres repeticiones y 50-move).
 */

// Deep clone board
export function cloneBoard(board){
  return board.map(row=>row.map(cell=>cell ? {...cell} : null))
}

export function initBoard(){
  // ranks 0..7 top to bottom (8..1)
  const empty = ()=>Array(8).fill(null)
  const board = []
  board.push([
    {type:'r',color:'b'},{type:'n',color:'b'},{type:'b',color:'b'},{type:'q',color:'b'},{type:'k',color:'b'},{type:'b',color:'b'},{type:'n',color:'b'},{type:'r',color:'b'}
  ])
  board.push(Array.from({length:8},()=>({type:'p',color:'b'})))
  for(let i=0;i<4;i++) board.push(empty())
  board.push(Array.from({length:8},()=>({type:'p',color:'w'})))
  board.push([
    {type:'r',color:'w'},{type:'n',color:'w'},{type:'b',color:'w'},{type:'q',color:'w'},{type:'k',color:'w'},{type:'b',color:'w'},{type:'n',color:'w'},{type:'r',color:'w'}
  ])
  return board
}

// Utilities
const inBounds = (x,y)=> x>=0 && x<8 && y>=0 && y<8

export function findKing(board, color){
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
    const p = board[y][x]
    if(p && p.type==='k' && p.color===color) return [x,y]
  }
  return null
}

// Return array of moves [fromX,fromY,toX,toY, promotion?]
export function generatePseudoLegalMoves(board, color, state){
  // state can hold castling rights and moved info
  const moves = []
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
    const p = board[y][x]
    if(!p || p.color!==color) continue
    const t = p.type
    if(t==='p'){
      const dir = color==='w' ? -1 : 1
      const startRank = color==='w' ? 6 : 1
      // forward
      const ny = y+dir
      if(inBounds(x,ny) && !board[ny][x]){
        // promotion
        if(ny===0 || ny===7){
          moves.push([x,y,x,ny,'q'])
        } else moves.push([x,y,x,ny])
        // two squares
        if(y===startRank){
          const ny2 = y + dir*2
          if(!board[ny2][x]) moves.push([x,y,x,ny2])
        }
      }
      // captures
      for(const dx of [-1,1]){
        const cx = x+dx, cy = y+dir
        if(inBounds(cx,cy) && board[cy][cx] && board[cy][cx].color!==color){
          if(cy===0||cy===7) moves.push([x,y,cx,cy,'q'])
          else moves.push([x,y,cx,cy])
        }
      }
    } else if(t==='n'){
      const dirs = [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]
      for(const [dx,dy] of dirs){
        const nx=x+dx, ny=y+dy
        if(!inBounds(nx,ny)) continue
        if(!board[ny][nx] || board[ny][nx].color!==color) moves.push([x,y,nx,ny])
      }
    } else if(t==='b' || t==='r' || t==='q'){
      const dirs = []
      if(t==='b' || t==='q') dirs.push([1,1],[1,-1],[-1,1],[-1,-1])
      if(t==='r' || t==='q') dirs.push([1,0],[-1,0],[0,1],[0,-1])
      for(const [dx,dy] of dirs){
        let nx=x+dx, ny=y+dy
        while(inBounds(nx,ny)){
          if(!board[ny][nx]) moves.push([x,y,nx,ny])
          else{ if(board[ny][nx].color!==color) moves.push([x,y,nx,ny]); break }
          nx+=dx; ny+=dy
        }
      }
    } else if(t==='k'){
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
        if(dx===0&&dy===0) continue
        const nx=x+dx, ny=y+dy
        if(!inBounds(nx,ny)) continue
        if(!board[ny][nx] || board[ny][nx].color!==color) moves.push([x,y,nx,ny])
      }
      // castling
      const rights = state?.castling || {}
      if(color==='w' && y===7 && x===4){
        if(rights.wk && !board[7][5] && !board[7][6]) moves.push([4,7,6,7,'castle_k'])
        if(rights.wq && !board[7][3] && !board[7][2] && !board[7][1]) moves.push([4,7,2,7,'castle_q'])
      }
      if(color==='b' && y===0 && x===4){
        if(rights.bk && !board[0][5] && !board[0][6]) moves.push([4,0,6,0,'castle_k'])
        if(rights.bq && !board[0][3] && !board[0][2] && !board[0][1]) moves.push([4,0,2,0,'castle_q'])
      }
    }
  }
  return moves
}

export function isSquareAttacked(board, x,y, byColor){
  // brute force: generate opponent pseudo moves and see if any targets x,y
  const moves = generatePseudoLegalMoves(board, byColor, {})
  for(const m of moves) if(m[2]===x && m[3]===y) return true
  return false
}

export function makeMove(board, move, state){
  // move: [fx,fy,tx,ty, extra]
  const nb = cloneBoard(board)
  const [fx,fy,tx,ty,extra] = move
  const piece = nb[fy][fx]
  nb[fy][fx] = null
  // handle castling
  if(extra==='castle_k'){
    nb[ty][tx] = piece
    // move rook
    nb[ty][tx-1] = nb[ty][7]
    nb[ty][7] = null
  } else if(extra==='castle_q'){
    nb[ty][tx] = piece
    nb[ty][tx+1] = nb[ty][0]
    nb[ty][0] = null
  } else {
    // promotion
    if(extra==='q') nb[ty][tx] = {type:'q', color: piece.color}
    else nb[ty][tx] = piece
  }

  // update castling rights
  const nstate = {...state}
  nstate.castling = {...(state.castling||{})}
  if(piece.type==='k'){
    if(piece.color==='w'){ nstate.castling.wk=false; nstate.castling.wq=false }
    else { nstate.castling.bk=false; nstate.castling.bq=false }
  }
  if(piece.type==='r'){
    if(fx===0 && fy===7) nstate.castling.wq=false
    if(fx===7 && fy===7) nstate.castling.wk=false
    if(fx===0 && fy===0) nstate.castling.bq=false
    if(fx===7 && fy===0) nstate.castling.bk=false
  }

  return {board:nb, state:nstate}
}

export function isInCheck(board, color, state){
  const king = findKing(board,color)
  if(!king) return true
  return isSquareAttacked(board, king[0], king[1], color==='w'?'b':'w')
}

export function generateLegalMoves(board, color, state){
  const pseudo = generatePseudoLegalMoves(board,color,state)
  const legal = []
  for(const m of pseudo){
    const {board:nb} = makeMove(board,m,state)
    if(!isInCheck(nb,color,state)) legal.push(m)
  }
  return legal
}

export function isCheckmate(board,color,state){
  if(!isInCheck(board,color,state)) return false
  const moves = generateLegalMoves(board,color,state)
  return moves.length===0
}

// Simple evaluation: material + small mobility
function evaluateBoard(board, colorToEvaluate='w'){
  const weights = {p:100, n:320, b:330, r:500, q:900, k:20000}
  let score=0
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
    const p = board[y][x]
    if(!p) continue
    const sign = p.color==='w' ? 1 : -1
    score += sign * (weights[p.type] || 0)
  }
  return (colorToEvaluate==='w')? score : -score
}

// Minimax with alpha-beta
export function findBestMove(board,color,state,depth=3){
  const maximizingColor = color

  function negamax(nodeBoard,nodeState,depthAlphaBeta,colorTurn,alpha,beta){
    if(depthAlphaBeta===0) return evaluateBoard(nodeBoard,maximizingColor)
    const moves = generateLegalMoves(nodeBoard,colorTurn,nodeState)
    if(moves.length===0){
      if(isInCheck(nodeBoard,colorTurn,nodeState)) return colorTurn===maximizingColor? -999999 : 999999
      return 0
    }
    let best = -Infinity
    for(const m of moves){
      const {board:nb, state:ns} = makeMove(nodeBoard,m,nodeState)
      const val = -negamax(nb,ns,depthAlphaBeta-1, colorTurn==='w'?'b':'w', -beta, -alpha)
      if(val>best) best=val
      if(val>alpha) alpha=val
      if(alpha>=beta) break
    }
    return best
  }

  const moves = generateLegalMoves(board,color,state)
  if(moves.length===0) return null
  let bestScore = -Infinity
  let bestMoves = []
  for(const m of moves){
    const {board:nb, state:ns} = makeMove(board,m,state)
    const score = -negamax(nb,ns,depth-1, color==='w'?'b':'w', -Infinity, Infinity)
    if(score>bestScore){bestScore=score; bestMoves=[m]}
    else if(score===bestScore) bestMoves.push(m)
  }
  // pick first best
  return {move: bestMoves[Math.floor(Math.random()*bestMoves.length)], score: bestScore}
}

export function botMove(board, color, state, difficulty='hard'){
  // difficulty: 'easy','medium','hard'
  const legal = generateLegalMoves(board,color,state)
  if(legal.length===0) return null
  if(difficulty==='easy'){
    // pick almost random; but avoid immediate blunders by sometimes preferring captures
    const captures = legal.filter(m=>{
      const [fx,fy,tx,ty]=m
      return board[ty][tx]
    })
    if(Math.random()<0.2 && captures.length>0) return captures[Math.floor(Math.random()*captures.length)]
    return legal[Math.floor(Math.random()*legal.length)]
  }
  if(difficulty==='medium'){
    // evaluate shallowly and pick among top N
    const scored = legal.map(m=>{
      const {board:nb} = makeMove(board,m,state)
      const s = evaluateBoard(nb,color)
      return {m,s}
    })
    scored.sort((a,b)=>b.s-a.s)
    const N = Math.max(1, Math.floor(scored.length*0.35))
    const top = scored.slice(0,N)
    return top[Math.floor(Math.random()*top.length)].m
  }
  // hard
  const res = findBestMove(board,color,state,3)
  return res? res.move : legal[Math.floor(Math.random()*legal.length)]
}
