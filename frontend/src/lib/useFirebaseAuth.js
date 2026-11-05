// Conecta Firebase Authentication con el store de la app.
// Se llama UNA SOLA VEZ al arrancar la app (en main.jsx).
// Cuando Firebase detecta que ya hay una sesión abierta (recarga de página,
// volver al tab), carga el perfil del usuario desde Firestore y lo pone en el store.

import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase.js'
import { useStore } from '../store/useStore.js'

let initialized = false

export function initFirebaseAuth() {
  if (initialized) return
  initialized = true

  onAuthStateChanged(auth, async (firebaseUser) => {
    const store = useStore.getState()

    if (!firebaseUser) {
      // No hay sesión: limpiar usuario del store
      store.setUser(null)
      return
    }

    try {
      // Buscar el perfil en Firestore: /users/{uid}
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!snap.exists()) {
        // El documento no existe todavía (raro, pero seguro)
        await signOut(auth)
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
    } catch (err) {
      console.error('Error cargando perfil de Firestore:', err)
      store.setUser(null)
    }
  })
}
