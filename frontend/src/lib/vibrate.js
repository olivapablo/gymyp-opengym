import { vibrate, vibrateSupported } from './sound.js'

/**
 * Micro-tick háptico táctil para acciones precisas (ej: marcar serie).
 * 12ms simula el "taptic engine" mecánico sin vibraciones molestas ni largas.
 * Respeta la opción de Ajustes -> Vibración y se anula en dispositivos sin soporte.
 */
export function hapticTick() {
  if (!vibrateSupported()) return
  vibrate(12)
}

/**
 * Confirmación háptica sutil de éxito (doble micro-pulso).
 */
export function hapticSuccess() {
  if (!vibrateSupported()) return
  vibrate([10, 45, 14])
}

/**
 * Alerta háptica para acciones destructivas o advertencias.
 */
export function hapticWarning() {
  if (!vibrateSupported()) return
  vibrate(26)
}
