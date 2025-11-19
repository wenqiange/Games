import React, {useEffect, useState, useRef} from 'react'
import Board from '../components/Board'
import DifficultySelector from '../components/DifficultySelector'
import GameWindow from '../components/GameWindow'
import { initBoard, generateLegalMoves, makeMove, isInCheck, isCheckmate, botMove } from '../games/chess/chessEngine'

const DEFAULT_MINUTES = 5
const MIN_SECONDS = 30

const formatTime = (seconds)=>{
  const clamped = Math.max(0, seconds)
  const mins = Math.floor(clamped/60).toString().padStart(2,'0')
  const secs = (clamped%60).toString().padStart(2,'0')
  return `${mins}:${secs}`
}

export default function ChessPage(){
  const [board, setBoard] = useState(()=>initBoard())
  const [state, setState] = useState({castling:{wk:true,wq:true,bk:true,bq:true}})
  const [turn, setTurn] = useState('w')
  const [playerColor, setPlayerColor] = useState('w')
  const [selected, setSelected] = useState(null)
  const [highlights, setHighlights] = useState([])
  const [difficulty, setDifficulty] = useState('medium')
  const [showCoords, setShowCoords] = useState(true)
  const [flipped, setFlipped] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [botThinking, setBotThinking] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(DEFAULT_MINUTES)
  const [playerTime, setPlayerTime] = useState(DEFAULT_MINUTES*60)
  const [botTime, setBotTime] = useState(DEFAULT_MINUTES*60)
  const thinkingRef = useRef(false)

  const timeExpired = playerTime<=0 || botTime<=0
  const isMate = isCheckmate(board, turn, state)
  const isCheck = !isMate && isInCheck(board, turn, state)
  const botColor = playerColor==='w' ? 'b' : 'w'

  useEffect(()=>{
    if(turn===botColor && !timeExpired && !isMate){
      thinkingRef.current = true
      setBotThinking(true)
      const timer = setTimeout(()=>{
        const m = botMove(board,botColor,state,difficulty)
        if(m){
          const {board:nb, state:ns} = makeMove(board,m,state)
          setBoard(nb)
          setState(ns)
          setMoveCount(c=>c+1)
          setTurn(playerColor)
        }
        thinkingRef.current = false
        setBotThinking(false)
      }, 420)
      return ()=>clearTimeout(timer)
    }
  },[turn, board, state, difficulty, timeExpired, isMate, playerColor, botColor])

  useEffect(()=>{
    if(timeExpired || isMate) return
    const interval = setInterval(()=>{
      if(turn===playerColor){
        setPlayerTime(prev=>prev>0? prev-1 : 0)
      } else {
        setBotTime(prev=>prev>0? prev-1 : 0)
      }
    },1000)
    return ()=>clearInterval(interval)
  },[turn, timeExpired, isMate, playerColor])

  function resetTimers(){
    const seconds = Math.max(MIN_SECONDS, Math.round(timerMinutes*60))
    setPlayerTime(seconds)
    setBotTime(seconds)
  }

  function handleSelect(x,y){
    if(thinkingRef.current || timeExpired) return
    if(turn !== playerColor) return

    const piece = board[y][x]
    if(selected){
      const legal = generateLegalMoves(board, selected[2], state)
      const found = legal.find(m=>m[0]===selected[0] && m[1]===selected[1] && m[2]===x && m[3]===y)
      if(found){
        const {board:nb, state:ns} = makeMove(board,found,state)
        setBoard(nb)
        setState(ns)
        setSelected(null)
        setHighlights([])
        setMoveCount(c=>c+1)
        setTurn(t=> t==='w'?'b':'w')
        return
      }
    }
    if(piece && piece.color===turn){
      const moves = generateLegalMoves(board, piece.color, state).filter(m=>m[0]===x && m[1]===y)
      setSelected([x,y,piece.color])
      setHighlights(moves.map(m=>[m[2],m[3]]))
    } else {
      setSelected(null)
      setHighlights([])
    }
  }

  function restart(){
    setBoard(initBoard())
    setState({castling:{wk:true,wq:true,bk:true,bq:true}})
    setTurn('w')
    setSelected(null)
    setHighlights([])
    setMoveCount(0)
    setBotThinking(false)
    thinkingRef.current = false
    resetTimers()
    // Ensure orientation matches player color on restart
    setFlipped(playerColor==='b')
  }

  const timeoutLabel = playerTime===0 && botTime===0
    ? 'Ambos sin tiempo'
    : playerTime===0
    ? 'Tiempo agotado: Jugador'
    : 'Tiempo agotado: Bot'

  let statusText
  if(timeExpired){
    statusText = timeoutLabel
  } else if(isMate){
    statusText = `${turn==='w'?'Blancas':'Negras'} en jaque mate`
  } else if(isCheck){
    statusText = `${turn==='w'?'Blancas':'Negras'} en jaque`
  } else {
    statusText = turn===playerColor ? `Tu turno (${playerColor==='w'?'Blancas':'Negras'})` : `Turno del Bot (${botColor==='w'?'Blancas':'Negras'})`
  }

  const statusVariant = (timeExpired || isMate || isCheck) ? 'alert' : 'ready'

  const applyTimerConfig = ()=>{
    resetTimers()
  }

  const changeSide = (color)=>{
    setPlayerColor(color)
    setFlipped(color==='b')
    // We need to defer restart to ensure state updates? 
    // React batches updates. restart() sets turn to 'w'.
    // So next render: playerColor=new, turn='w'.
    // If new color is 'b', botColor is 'w'. turn==botColor -> bot moves. Correct.
    // If new color is 'w', botColor is 'b'. turn!=botColor -> player moves. Correct.
    // However, we should call restart() to reset board.
    // But restart() relies on closure? No, it calls setters.
    setBoard(initBoard())
    setState({castling:{wk:true,wq:true,bk:true,bq:true}})
    setTurn('w')
    setSelected(null)
    setHighlights([])
    setMoveCount(0)
    setBotThinking(false)
    thinkingRef.current = false
    resetTimers()
  }

  return (
    <GameWindow title="Ajedrez" subtitle="Juega contra un bot inteligente con tres niveles de dificultad.">
      <div className="status-banner">
        <div>
          <span className="badge">Partida activa</span>
          <strong>{statusText}</strong>
        </div>
        <div>
          <span className={`status-chip ${statusVariant}`}>
            {turn===playerColor ? 'Jugador' : 'Bot'}{botThinking ? ' · pensando' : ''}
          </span>
        </div>
      </div>

      <div className="board-wrap">
        <Board
          board={board}
          selected={selected && [selected[0],selected[1]]}
          highlights={highlights}
          onSelect={handleSelect}
          showCoords={showCoords}
          flipped={flipped}
        />

        <div className="sidebar">
          <div className="panel">
            <p className="panel-title">Estado</p>
            <div className={`status-chip ${statusVariant}`}>
              {statusText}
            </div>
            <div className="stats-grid" style={{marginTop:12}}>
              <div className="stat-card">
                <span>Movimientos</span>
                <strong>{moveCount}</strong>
              </div>
              <div className="stat-card">
                <span>Dificultad</span>
                <strong>{difficulty==='easy'?'Fácil':difficulty==='medium'?'Media':'Difícil'}</strong>
              </div>
              <div className="stat-card">
                <span>Orientación</span>
                <strong>{flipped ? 'Negras abajo' : 'Blancas abajo'}</strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <p className="panel-title">Reloj</p>
            <div className="timer-row">
              <div className={`timer-block ${turn===playerColor ? 'active' : ''}`}>
                <span>Jugador</span>
                <strong className="timer-value">{formatTime(playerTime)}</strong>
              </div>
              <div className={`timer-block ${turn!==playerColor ? 'active' : ''}`}>
                <span>Bot</span>
                <strong className="timer-value">{formatTime(botTime)}</strong>
              </div>
            </div>
            <div className="timer-config">
              <label>Minutos por lado</label>
              <div className="timer-input">
                <input
                  type="number"
                  step={0.5}
                  min={0.5}
                  max={30}
                  value={timerMinutes}
                  onChange={e=>setTimerMinutes(Math.min(30, Math.max(0.5, Number(e.target.value) || 0.5)))}
                />
                <button type="button" className="btn secondary" onClick={applyTimerConfig}>Aplicar</button>
              </div>
              <small className="muted">Mínimo {(MIN_SECONDS/60).toFixed(1)} min (~{MIN_SECONDS}s)</small>
            </div>
          </div>

          <div className="panel">
            <p className="panel-title">Opciones</p>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
            
            <div style={{marginTop:12}}>
              <div className="label" style={{marginBottom:6}}>Jugar como</div>
              <div style={{display:'flex', gap:8}}>
                <button 
                  className={`btn ${playerColor==='w'?'primary':'secondary'}`} 
                  style={{flex:1, padding:'6px', fontSize:'0.9rem'}}
                  onClick={()=>changeSide('w')}
                >Blancas</button>
                <button 
                  className={`btn ${playerColor==='b'?'primary':'secondary'}`} 
                  style={{flex:1, padding:'6px', fontSize:'0.9rem'}}
                  onClick={()=>changeSide('b')}
                >Negras</button>
              </div>
            </div>

            <div className="controls" style={{marginTop:12}}>
              <div className="pill-toggle" onClick={()=>setFlipped(f=>!f)}>
                <input type="checkbox" checked={flipped} readOnly />
                <span>Invertir tablero</span>
              </div>
              <label className="pill-toggle">
                <input type="checkbox" checked={showCoords} onChange={e=>setShowCoords(e.target.checked)} />
                Mostrar coordenadas
              </label>
            </div>

            <div className="home-actions" style={{marginTop:16}}>
              <button className="btn primary" onClick={restart}>Reiniciar Partida</button>
            </div>
          </div>
        </div>
      </div>
    </GameWindow>
  )
}
