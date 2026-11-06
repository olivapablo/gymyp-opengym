// Conecta Firebase Authentication con el store de la app.
// Se llama UNA SOLA VEZ al arrancar la app (en main.jsx).

import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
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
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      let snap = await getDoc(userDocRef)
      if (!snap.exists()) {
        // Si entra por Google o el perfil no existía, lo creamos automáticamente
        const nuevoPerfil = {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          email: firebaseUser.email || '',
          role: 'student',
          createdAt: new Date().toISOString(),
        }
        await setDoc(userDocRef, nuevoPerfil)
        snap = await getDoc(userDocRef)
      }
      const data = snap.data() || {}
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
