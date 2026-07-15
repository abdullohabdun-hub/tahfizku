import { describe, it, expect, vi, beforeEach } from 'vitest'
import { impersonateUser, stopImpersonating } from '../impersonate'
import * as authMiddleware from '../../middleware/auth.middleware'
import * as dbModule from '../../db'
import * as sessionModule from '../../lib/session'


// Mock dependencies
vi.mock('../../middleware/auth.middleware')
vi.mock('../../db')
vi.mock('../../lib/session')

// Mock createServerFn
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    let handlerFn: any;
    const chain = {
      validator: () => chain,
      handler: (fn: any) => {
        handlerFn = fn;
        return (args?: any) => handlerFn(args || {})
      }
    }
    return chain
  }
}))

describe('Impersonate Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(sessionModule.createSession).mockResolvedValue(undefined as any)
    vi.mocked(sessionModule.clearSession).mockResolvedValue(undefined as any)
  })

  describe('impersonateUser()', () => {
    it('harus menolak akses jika pemanggil bukan admin', async () => {
      vi.mocked(authMiddleware.getAuthSession).mockResolvedValue({
        user: { id: 'user-1', role: 'ustadz', tenantId: 'tenant-1' } as any
      } as any)

      const result = await impersonateUser({ data: { targetRole: 'ustadz', targetId: '123' } })
      
      expect(result.success).toBe(false)
      expect((result as any).error?.message).toContain('Hanya Admin')
    })

    it('harus menolak jika targetRole adalah admin', async () => {
      vi.mocked(authMiddleware.getAuthSession).mockResolvedValue({
        user: { id: 'admin-1', role: 'admin', tenantId: 'tenant-1' } as any
      } as any)

      const result = await impersonateUser({ data: { targetRole: 'admin' as any, targetId: '123' } })
      
      expect(result.success).toBe(false)
      expect((result as any).error?.message).toContain('Tidak diizinkan meng-impersonate Admin lain')
    })

    it('harus menolak akses nested impersonation', async () => {
      vi.mocked(authMiddleware.getAuthSession).mockResolvedValue({
        user: { id: 'user-1', role: 'admin', originalAdminId: 'admin-0', tenantId: 'tenant-1' } as any
      } as any)

      const result = await impersonateUser({ data: { targetRole: 'ustadz', targetId: '123' } })
      
      expect(result.success).toBe(false)
      expect((result as any).error?.message).toContain('Tidak dapat melakukan impersonate beruntun')
    })
  })

  describe('stopImpersonating()', () => {
    it('harus menolak jika bukan sedang menyamar', async () => {
      vi.mocked(authMiddleware.getAuthSession).mockResolvedValue({
        user: { id: 'admin-1', role: 'admin', tenantId: 'tenant-1' } as any
      } as any)

      const result = await stopImpersonating()
      
      expect(result.success).toBe(false)
      expect((result as any).error?.message).toContain('Tidak sedang dalam mode menyamar')
    })

    it('harus membersihkan sesi jika role admin telah dicabut', async () => {
      vi.mocked(authMiddleware.getAuthSession).mockResolvedValue({
        user: { id: 'user-1', role: 'ustadz', originalAdminId: 'admin-1', tenantId: 'tenant-1' } as any
      } as any)

      // Mock DB query to return non-admin role
      vi.mocked(dbModule.db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'admin-1', role: 'ustadz' }]) // Sudah bukan admin
          })
        })
      } as any)

      const result = await stopImpersonating()
      
      expect(result.success).toBe(false)
      expect((result as any).error?.message).toContain('Akses Admin Anda telah dicabut')
      expect(sessionModule.clearSession).toHaveBeenCalled()
    })
  })
})
