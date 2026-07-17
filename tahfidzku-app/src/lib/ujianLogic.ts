// src/lib/ujianLogic.ts
// Logika murni untuk kalkulasi skor Ujian Kenaikan Juz
// Skor bersifat REFERENSI — keputusan lulus/tidak tetap di tangan ustadz.

export type SkorKelancaran = 'lancar' | 'mengulang' | 'terbata'
export type SkorTajwid     = 'sempurna' | 'cukup' | 'kurang'
export type StatusUjian    = 'lulus' | 'tidak_lulus'

// Poin per rubrik
const POIN_KELANCARAN: Record<SkorKelancaran, number> = {
  lancar:    50,
  mengulang: 30,
  terbata:   10,
}
const POIN_TAJWID: Record<SkorTajwid, number> = {
  sempurna: 50,
  cukup:    30,
  kurang:   10,
}

/**
 * Hitung total skor referensi (0-100).
 * Skor ini ditampilkan di UI sebagai panduan ustadz, bukan penentu lulus otomatis.
 */
export function hitungSkorUjian(kelancaran: SkorKelancaran, tajwid: SkorTajwid): number {
  return POIN_KELANCARAN[kelancaran] + POIN_TAJWID[tajwid]
}

/**
 * Rekomendasi lulus berdasarkan skor (skor >= 70).
 * Ini hanya REKOMENDASI di UI — ustadz yang menentukan akhir.
 */
export function rekomendasiLulus(skor: number): boolean {
  return skor >= 70
}

/**
 * Label skor untuk UI.
 */
export function labelSkor(skor: number): string {
  if (skor >= 90) return 'Sangat Baik'
  if (skor >= 70) return 'Baik'
  if (skor >= 50) return 'Cukup'
  return 'Perlu Banyak Latihan'
}

/**
 * Warna badge status untuk UI.
 */
export function warnaBadgeStatus(status: StatusUjian): string {
  return status === 'lulus'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : 'bg-red-100 text-red-800 border-red-200'
}

/**
 * Teks badge status untuk UI.
 */
export function labelStatus(status: StatusUjian): string {
  return status === 'lulus' ? '✓ Lulus' : '✗ Tidak Lulus'
}
