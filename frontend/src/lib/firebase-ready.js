// Archivo intermediario: promesa que se resuelve cuando Firebase determina
// el estado inicial de sesión. Sin dependencias circulares.
// Importado tanto por useStore.js como por useFirebaseAuth.js.

let resolveFirebase = null

// boot() en useStore.js espera esta promesa antes de llamar a /api/me.
// Si Firebase ya tiene al usuario logueado, firebaseBoot() se llama primero
// y boot() se sale sin tocar el servidor Node.
export const firebaseReady = new Promise(res => { resolveFirebase = res })

// Llamado desde useFirebaseAuth.js cuando Firebase termina de verificar la sesión.
export function markFirebaseReady() {
  resolveFirebase?.()
}
