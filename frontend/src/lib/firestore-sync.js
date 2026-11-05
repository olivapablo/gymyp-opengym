// Sincronización directa con Firestore (sin servidor Node)
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

export async function saveStateToFirestore(uid, state) {
  if (!uid || !state) return
  try {
    const json = JSON.stringify(state)
    const ref = doc(db, 'users', uid, 'data', 'state')
    await setDoc(ref, {
      json,
      _ts: state._ts || Date.now(),
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.warn('Error al guardar datos en Firestore:', err)
  }
}

export async function loadStateFromFirestore(uid) {
  if (!uid) return null
  try {
    const ref = doc(db, 'users', uid, 'data', 'state')
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const data = snap.data()
    if (data?.json) {
      return JSON.parse(data.json)
    }
    return null
  } catch (err) {
    console.warn('Error al cargar datos desde Firestore:', err)
    return null
  }
}
