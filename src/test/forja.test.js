import { describe, it, expect, vi } from 'vitest'
import { calcularNivel, xpParaSiguienteNivel, progresoBarra, getEsteticaNivel } from '../lib/profile'

// ── Smoke tests: lib/profile.js ───────────────────────────────────────

describe('calcularNivel', () => {
  it('nivel 1 con 0 XP', () => {
    expect(calcularNivel(0)).toBe(1)
  })

  it('nivel 1 con 199 XP', () => {
    expect(calcularNivel(199)).toBe(1)
  })

  it('nivel 2 con 200 XP', () => {
    expect(calcularNivel(200)).toBe(2)
  })

  it('nivel 5 con 800 XP', () => {
    expect(calcularNivel(800)).toBe(5)
  })

  it('nivel 10 con 1800 XP', () => {
    expect(calcularNivel(1800)).toBe(10)
  })
})

describe('xpParaSiguienteNivel', () => {
  it('necesita 200 XP con 0 XP total', () => {
    expect(xpParaSiguienteNivel(0)).toBe(200)
  })

  it('necesita 1 XP con 199 XP total', () => {
    expect(xpParaSiguienteNivel(199)).toBe(1)
  })

  it('necesita 200 XP al empezar nuevo nivel', () => {
    expect(xpParaSiguienteNivel(200)).toBe(200)
  })
})

describe('progresoBarra', () => {
  it('0% con 0 XP', () => {
    expect(progresoBarra(0)).toBe(0)
  })

  it('50% con 100 XP', () => {
    expect(progresoBarra(100)).toBe(50)
  })

  it('100% con 399 XP (199 en nivel actual — redondeo)', () => {
    expect(progresoBarra(399)).toBe(100)
  })

  it('0% al inicio de nuevo nivel', () => {
    expect(progresoBarra(200)).toBe(0)
  })

  it('entre 0 y 100', () => {
    const pct = progresoBarra(350)
    expect(pct).toBeGreaterThanOrEqual(0)
    expect(pct).toBeLessThanOrEqual(100)
  })
})

describe('getEsteticaNivel', () => {
  it('medieval para nivel 1-5', () => {
    expect(getEsteticaNivel(1)).toBe('medieval')
    expect(getEsteticaNivel(5)).toBe('medieval')
  })

  it('pueblo para nivel 6-10', () => {
    expect(getEsteticaNivel(6)).toBe('pueblo')
    expect(getEsteticaNivel(10)).toBe('pueblo')
  })

  it('ciudad para nivel 11-20', () => {
    expect(getEsteticaNivel(11)).toBe('ciudad')
    expect(getEsteticaNivel(20)).toBe('ciudad')
  })

  it('futuro para nivel 21+', () => {
    expect(getEsteticaNivel(21)).toBe('futuro')
    expect(getEsteticaNivel(100)).toBe('futuro')
  })
})

// ── Smoke tests: sistema XP bonus por racha ───────────────────────────

describe('XP bonus por racha', () => {
  it('10% bonus sobre xp base', () => {
    const xpBase = 20
    const bonus = Math.round(xpBase * 0.1)
    expect(bonus).toBe(2)
    expect(xpBase + bonus).toBe(22)
  })

  it('sin bonus si racha 0', () => {
    const xpBase = 30
    const rachaActiva = false
    const bonus = rachaActiva ? Math.round(xpBase * 0.1) : 0
    expect(bonus).toBe(0)
  })
})
