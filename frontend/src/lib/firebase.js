// Conexión de GYMYP a Firebase (inicialización única, se importa desde otros archivos)
// NO guardes este archivo con claves secretas en un repositorio público.
// Las claves de la web de Firebase son públicas por diseño: la seguridad real
// la hacen las Reglas de Firestore (que configuramos en la consola de Firebase).

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDGUICXkVxs64bw3U4LHKwJHGDPaJVkEOs',
  authDomain: 'gymmyp-opengym.firebaseapp.com',
  projectId: 'gymmyp-opengym',
  storageBucket: 'gymmyp-opengym.firebasestorage.app',
  messagingSenderId: '274128040175',
  appId: '1:274128040175:web:fd1290fd4d2efb7aebab1a',
}

// Inicializa la app de Firebase (solo una vez en toda la app)
const firebaseApp = initializeApp(firebaseConfig)

// auth = el servicio de inicio de sesión (email/contraseña)
export const auth = getAuth(firebaseApp)

// db = la base de datos Firestore donde se guardarán rutinas, pesos, etc.
export const db = getFirestore(firebaseApp)

export default firebaseApp
