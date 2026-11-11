import React from 'react'
import Icon from './Icon.jsx'

export function Skeleton({ width, height = 16, radius = 8, style, className = '' }) {
  return (
    <div
      className={`skeleton-box ${className}`}
      style={{
        width: width ?? '100%',
        height,
        borderRadius: radius,
        ...style
      }}
      aria-hidden="true"
    />
  )
}

export function SkeletonRoutineItem() {
  return (
    <div className="item plan-routine" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <Skeleton width={38} height={38} radius={10} style={{ flexShrink: 0 }} />
      <div className="grow" style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <Skeleton width="60%" height={16} radius={6} />
        <Skeleton width="35%" height={12} radius={5} />
      </div>
      <Skeleton width={32} height={20} radius={6} />
    </div>
  )
}

export function SkeletonPlan() {
  return (
    <div className="skeleton-plan" aria-busy="true" aria-label="Cargando...">
      {/* Selector de vista */}
      <div style={{ marginBottom: 16 }}>
        <Skeleton height={36} radius={99} />
      </div>
      {/* Barra de acciones */}
      <div className="row between plan-sec-h" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width={90} height={28} radius={8} />
        <Skeleton width={110} height={28} radius={8} />
      </div>
      {/* Lista de rutinas esqueleto */}
      <div className="list routine-list plan-routines">
        <SkeletonRoutineItem />
        <SkeletonRoutineItem />
        <SkeletonRoutineItem />
      </div>
    </div>
  )
}

export function SkeletonRoutineEdit({ nav }) {
  return (
    <div className="narrow" aria-busy="true" aria-label="Cargando rutina...">
      <div className="hdr" style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button className="iconbtn" onClick={() => nav && nav('/plan')}><Icon name="chevronLeft" /></button>
        <div style={{ flex: 1, margin: '0 12px' }}>
          <Skeleton width="55%" height={18} radius={6} />
        </div>
      </div>
      {/* Tarjeta de cabecera de la rutina */}
      <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 16, marginBottom: 16 }}>
        <Skeleton width={52} height={52} radius={12} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width="65%" height={20} radius={6} />
          <Skeleton width="35%" height={13} radius={5} />
        </div>
      </div>
      {/* Lista de ejercicios esqueleto */}
      <div className="list">
        <SkeletonRoutineItem />
        <SkeletonRoutineItem />
        <SkeletonRoutineItem />
      </div>
    </div>
  )
}
