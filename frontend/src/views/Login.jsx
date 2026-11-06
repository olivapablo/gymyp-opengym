// Login con Firebase Authentication (email + contraseña)
// Reemplaza el sistema de passkeys y servidor Node.

import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
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
    case 'auth/popup-closed-by-user':   return 'Se cerró la ventana de inicio de sesión.'
    case 'auth/cancelled-popup-request':return 'Operación cancelada.'
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

  const handleGoogleLogin = async () => {
    setError('')
    setCargando(true)
    try {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      // Aseguramos perfil en Firestore si es nuevo
      const userDocRef = doc(db, 'users', cred.user.uid)
      const snap = await getDoc(userDocRef)
      if (!snap.exists()) {
        await setDoc(userDocRef, {
          name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Usuario',
          email: cred.user.email || '',
          role: 'student',
          createdAt: new Date().toISOString(),
        })
      }
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

      {/* Separador */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 10px', gap: 10 }}>
        <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border, #333)' }} />
        <span style={{ fontSize: 12, color: 'var(--muted, #888)' }}>o</span>
        <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border, #333)' }} />
      </div>

      {/* Botón Google */}
      <button
        type="button"
        className="btn"
        style={{
          width: '100%',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontWeight: 500,
        }}
        onClick={handleGoogleLogin}
        disabled={cargando}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Continuar con Google
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
