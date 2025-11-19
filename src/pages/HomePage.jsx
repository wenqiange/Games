import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage(){
  return (
    <div>
      <div className="home-hero">
        <div>
          <span className="pill">Nuevo</span>
          <h3>Compite contra nuestra IA de ajedrez</h3>
          <p>Una colección creciente de mini juegos. Empezamos con ajedrez con un bot configurable y pronto llegarán más retos.</p>
          <div className="home-actions">
            <Link className="btn primary" to="/chess">Jugar Ajedrez</Link>
            <Link className="btn secondary" to="/auth">Login / Registro</Link>
          </div>
        </div>
        <div className="hero-card">
          <h4>Estado de la plataforma</h4>
          <ul>
            <li>Motor de ajedrez con 3 dificultades</li>
            <li>Interfaz lista para móvil</li>
            <li>Sistema de cuentas MySQL</li>
          </ul>
        </div>
      </div>

      <div className="games-grid">
        <Link className="game-card card-link" to="/chess">
          <h4>Ajedrez</h4>
          <p>Tablero animado, resaltado de jugadas y bot con IA.</p>
        </Link>
        <div className="game-card">
          <h4>Próximamente</h4>
          <p>Más mini-juegos se podrán añadir fácilmente.</p>
        </div>
        <Link className="game-card card-link" to="/auth">
          <h4>Login & Registro</h4>
          <p>Crea una cuenta vinculada a MySQL para guardar tu progreso.</p>
        </Link>
      </div>
    </div>
  )
}
