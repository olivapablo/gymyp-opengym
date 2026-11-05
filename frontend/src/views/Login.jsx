// Login con Firebase Authentication (email + contraseña)
// Reemplaza el sistema de passkeys y servidor Node.

import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'

// Traduce los errores de Firebase a mensajes simples en español
function errorMsg(code) {
  switch (code) {
    case 'auth/invalid-email':          return 'El email no es válido.'
    case 'auth/user-not-found':         return 'No existe una cuenta con ese email.'
    case 'auth/wrong-password':         return 'Contraseña incorrecta.'
    case 'auth/invalid-credential':     return 'Email o contraseña incorrectos.'
    case 'auth/email-already-in-use':   return 'Ya existe una cuenta con ese email.'
    case 'auth/weak-password':          return 'La contraseña debe tener al menos 6 caracteres.'
    case 'auth/too-many-requests':      return 'Demasiados intentos. Esperá un momento e intentá de nuevo.'
    case 'auth/network-request-failed': return 'Sin conexión a internet.'
    default:                            return 'Error inesperado. Intentá de nuevo.'
  }
}

export default function Login() {
  const [modo, setModo] = useState('login') // 'login' | 'register'
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const wrap = {
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    minHeight: '78vh', textAlign: 'center',
  }
  const inputStyle = {
    width: '100%', boxSizing: 'border-box', marginBottom: 10,
  }

  const handleLogin = async () => {
    setError('')
    if (!email.trim() || !pass) { setError('Completá email y contraseña.'); return }
    setCargando(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass)
      // onAuthStateChanged en useFirebaseAuth.js se encarga de setUser
    } catch (e) {
      setError(errorMsg(e.code))
    } finally {
      setCargando(false)
    }
  }

  const handleRegister = async () => {
    setError('')
    if (!nombre.trim())    { setError('Escribí tu nombre.'); return }
    if (!email.trim())     { setError('Escribí tu email.'); return }
    if (pass.length < 6)   { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setCargando(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass)
      // Crear el perfil en Firestore con rol "student" por defecto
      await setDoc(doc(db, 'users', cred.user.uid), {
        name:      nombre.trim(),
        email:     email.trim(),
        role:      'student',
        createdAt: new Date().toISOString(),
      })
      // onAuthStateChanged en useFirebaseAuth.js se encarga de setUser
    } catch (e) {
      setError(errorMsg(e.code))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="narrow" style={wrap}>
      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <img src="icon-512.png" alt="GYMYP" style={{ width: 112, height: 112, objectFit: 'contain' }} />
      </div>

      {/* Título */}
      <div className="muted" style={{ marginBottom: 28 }}>
        {modo === 'login' ? 'Iniciá sesión para continuar.' : 'Creá tu cuenta para empezar.'}
      </div>

      {/* Campo nombre (solo al registrarse) */}
      {modo === 'register' && (
        <input
          className="input"
          style={inputStyle}
          placeholder="Tu nombre"
          maxLength={40}
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          autoComplete="name"
        />
      )}

      {/* Email */}
      <input
        className="input"
        style={inputStyle}
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="email"
      />

      {/* Contraseña */}
      <input
        className="input"
        style={inputStyle}
        type="password"
        placeholder="Contraseña"
        value={pass}
        onChange={e => setPass(e.target.value)}
        autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
        onKeyDown={e => { if (e.key === 'Enter') modo === 'login' ? handleLogin() : handleRegister() }}
      />

      {/* Mensaje de error */}
      {error && (
        <div style={{ color: 'var(--accent, #f55)', fontSize: 13, marginBottom: 10 }}>
          {error}
        </div>
      )}

      {/* Botón principal */}
      <button
        className="btn btn-primary"
        style={{ width: '100%', marginBottom: 10 }}
        onClick={modo === 'login' ? handleLogin : handleRegister}
        disabled={cargando}
      >
        {cargando ? 'Cargando…' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </button>

      {/* Cambiar entre login y registro */}
      <button
        className="btn"
        style={{ width: '100%' }}
        onClick={() => { setModo(modo === 'login' ? 'register' : 'login'); setError('') }}
        disabled={cargando}
      >
        {modo === 'login' ? 'Crear cuenta nueva' : 'Ya tengo cuenta'}
      </button>
    </div>
  )
}
