// Conecta Firebase Authentication con el store de la app.
// Se llama UNA SOLA VEZ al arrancar la app (en main.jsx).

import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase.js'
import { useStore } from '../store/useStore.js'

let initialized = false

// Promesa que se resuelve cuando Firebase determina el estado inicial de sesión.
// App.jsx llama a boot() en useEffect, pero Firebase puede tardar ~300ms en responder.
// Esta promesa hace que boot() espere a Firebase antes de llamar a /api/me.
let firebaseResolved = false
let resolveFirebase = null
export const firebaseReady = new Promise(res => { resolveFirebase = res })

export function initFirebaseAuth() {
  if (initialized) return
  initialized = true

  onAuthStateChanged(auth, async (firebaseUser) => {
    const store = useStore.getState()

    if (!firebaseUser) {
      // No hay sesión en Firebase: dejar que el flujo normal continúe
      // (mostrará el login de Firebase, ya que Login.jsx usa Firebase)
      if (!firebaseResolved) {
        firebaseResolved = true
        resolveFirebase(false)  // false = no hay usuario
      }
      store.setUser(null)
      return
    }

    try {
      // Buscar el perfil en Firestore: /users/{uid}
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!snap.exists()) {
        // Perfil no existe (write de Firestore falló al registrarse)
        await signOut(auth)
        if (!firebaseResolved) { firebaseResolved = true; resolveFirebase(false) }
        store.setUser(null)
        return
      }
      const data = snap.data()
      // Armar el objeto de usuario que espera el store
      const user = {
        id: firebaseUser.uid,
        name: data.name || firebaseUser.email,
        role: data.role || 'student',
        admin: data.role === 'trainer',
      }
      store.setUser(user)
      // Marcar la app como lista (reemplaza /api/me del boot original)
      store.firebaseBoot()
      if (!firebaseResolved) { firebaseResolved = true; resolveFirebase(true) }
    } catch (err) {
      console.error('Error cargando perfil de Firestore:', err)
      if (!firebaseResolved) { firebaseResolved = true; resolveFirebase(false) }
      store.setUser(null)
    }
  })
}
