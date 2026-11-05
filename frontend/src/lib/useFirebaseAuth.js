// Conecta Firebase Authentication con el store de la app.
// Se llama UNA SOLA VEZ al arrancar la app (en main.jsx).

import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase.js'
import { useStore } from '../store/useStore.js'
import { markFirebaseReady } from './firebase-ready.js'

let initialized = false

export function initFirebaseAuth() {
  if (initialized) return
  initialized = true

  onAuthStateChanged(auth, async (firebaseUser) => {
    const store = useStore.getState()

    if (!firebaseUser) {
      // No hay sesión en Firebase: dejar que boot() muestre el login
      markFirebaseReady()
      store.setUser(null)
      return
    }

    try {
      // Buscar el perfil en Firestore: /users/{uid}
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!snap.exists()) {
        // Perfil no existe (write de Firestore falló al registrarse)
        await signOut(auth)
        markFirebaseReady()
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
      markFirebaseReady()
    } catch (err) {
      console.error('Error cargando perfil de Firestore:', err)
      markFirebaseReady()
      store.setUser(null)
    }
  })
}
