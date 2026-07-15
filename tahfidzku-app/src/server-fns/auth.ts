// src/server-fns/auth.ts
// Server Functions untuk Autentikasi (Login & Logout)

import { createServerFn } from '@tanstack/react-start'
import { eq, or } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { createSession, clearSession, getSession } from '../lib/session'
import { loginSchema } from '../lib/validators'
import { success, handleError } from '../lib/response'
import { AuthenticationError } from '../lib/errors'
import { normalisasiEmail, normalisasiNoWa, normalisasiUsername } from '../lib/string-utils'

// ═══════════════════════════════════════════════════════
// 1. LOGIN (Membuat Session)
// ═══════════════════════════════════════════════════════
export const login = createServerFn({ method: 'POST' })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    try {
      const identifier = data.identifier
      
      const [user] = await db
        .select()
        .from(users)
        .where(
          or(
            eq(users.email, normalisasiEmail(identifier)),
            eq(users.noWa, normalisasiNoWa(identifier)),
            eq(users.username, normalisasiUsername(identifier))
          )
        )
        .limit(1)

      // Jika user tidak ditemukan
      if (!user) {
        throw new AuthenticationError('Data pengguna tidak ditemukan.')
      }

      // ── Verifikasi Password (PIN) ──
      if (user.passwordHash !== data.password) {
         throw new AuthenticationError('Nomor HP/Email/Username atau PIN Anda kurang tepat.')
      }

      // ── Buat Session JWT ──
      await createSession({
        id: user.id,
        tenantId: user.tenantId,
        nama: user.nama,
        email: user.email,
        username: user.username,
        noWa: user.noWa,
        role: user.role,
        santriId: user.santriId,
      })

      console.log('✅ Login berhasil untuk:', user.nama, '(', user.role, ')')
      return success({ role: user.role }, 'Berhasil masuk')
    } catch (err) {
      console.error('❌ Login Error:', err)
      return handleError(err)
    }
  })

// ═══════════════════════════════════════════════════════
// 2. LOGOUT (Menghapus Session)
// ═══════════════════════════════════════════════════════
export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    clearSession()
    return success(null, 'Berhasil keluar')
  } catch (err) {
    return handleError(err)
  }
})

// ═══════════════════════════════════════════════════════
// 3. CHECK AUTH (Mendapatkan Session Aktif)
// ═══════════════════════════════════════════════════════
export const checkAuth = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await getSession()
  if (!session) return null
  return session.user
})
