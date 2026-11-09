// Modal para gestionar alumnos y roles desde Firestore
import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useUI } from '../store/useUI.js'
import { useStore } from '../store/useStore.js'
import { confirmSheet } from '../sheets.jsx'
import Icon from './Icon.jsx'
import { Button } from './ui.jsx'

export default function TrainerRolesSheet({ close }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const currentUser = useStore(s => s.user)
  const toast = useUI.getState().toast

  const loadUsers = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'users'))
      const list = []
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() })
      })
      setUsers(list)
    } catch (e) {
      console.error(e)
      toast('Error al cargar alumnos: ' + (e.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (targetUser, newRole) => {
    setSavingId(targetUser.id)
    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        role: newRole
      })
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u))
      toast(`Rol de ${targetUser.name || 'usuario'} actualizado a ${newRole === 'trainer' ? 'Entrenador' : 'Alumno'}`)
    } catch (e) {
      console.error(e)
      toast('Error al actualizar rol: ' + (e.message || e))
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteUser = targetUser => {
    confirmSheet({
      title: `¿Eliminar a ${targetUser.name || targetUser.email || 'este alumno'}?`,
      message: 'Se eliminará el perfil del alumno y todos sus datos de entrenamiento de Firestore. Esta acción no se puede deshacer.',
      confirmText: 'Eliminar alumno',
      danger: true,
      onConfirm: async () => {
        setSavingId(targetUser.id)
        try {
          await deleteDoc(doc(db, 'users', targetUser.id, 'data', 'state')).catch(() => {})
          await deleteDoc(doc(db, 'users', targetUser.id))
          setUsers(prev => prev.filter(u => u.id !== targetUser.id))
          toast(`Alumno ${targetUser.name || ''} eliminado con éxito`)
        } catch (e) {
          console.error(e)
          toast('Error al eliminar alumno: ' + (e.message || e))
        } finally {
          setSavingId(null)
        }
      }
    })
  }

  return (
    <div style={{ padding: '8px 4px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0 }}>Alumnos y Roles</h3>
        <Button variant="ghost" onClick={close} style={{ padding: '6px 12px' }}>Cerrar</Button>
      </div>

      <div className="muted small" style={{ marginBottom: 18, lineHeight: 1.4 }}>
        Administrá los perfiles registrados. Los <b>Alumnos</b> solo pueden entrenar y ver sus rutinas. Los <b>Entrenadores</b> pueden gestionar y armar rutinas para todos.
      </div>

      {loading ? (
        <div style={{ padding: '24px 0', textAlign: 'center' }} className="muted">
          Cargando usuarios...
        </div>
      ) : users.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center' }} className="muted">
          No hay usuarios registrados todavía.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(u => {
            const isMe = u.id === currentUser?.id
            const isTrainer = u.role === 'trainer'
            const isSaving = savingId === u.id

            return (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--card-bg, rgba(255,255,255,0.06))',
                  borderRadius: 'var(--radius, 12px)',
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name || u.email || 'Sin nombre'}
                    </span>
                    {isMe && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.12)',
                          color: 'var(--muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        Vos
                      </span>
                    )}
                  </div>
                  {u.email && (
                    <div className="dim small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {u.email}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    className="select"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: 'var(--fs-footnote, 13px)',
                      background: 'var(--input-bg, rgba(255,255,255,0.1))',
                      color: 'inherit',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                    value={u.role || 'student'}
                    disabled={isSaving}
                    onChange={e => handleRoleChange(u, e.target.value)}
                  >
                    <option value="trainer">Entrenador</option>
                    <option value="student">Alumno</option>
                  </select>

                  {!isMe && (
                    <button
                      className="iconbtn"
                      title="Eliminar alumno"
                      aria-label="Eliminar alumno"
                      disabled={isSaving}
                      style={{ color: 'var(--bad, #ff453a)', padding: 6 }}
                      onClick={() => handleDeleteUser(u)}
                    >
                      <Icon name="trash" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
