import { describe, it, expect } from 'vitest';
import { 
  parseHalamanPecahan, 
  posisiHafalanBerikutnya, 
  labelRentangAyatZiyadah, 
  urutanJuzStandar 
} from './quranMapper';

describe('quranMapper', () => {
  describe('parseHalamanPecahan', () => {
    it('harus membaca angka bulat', () => {
      expect(parseHalamanPecahan(3)).toEqual({ halaman: 3, pecahan: 0 });
      expect(parseHalamanPecahan("3")).toEqual({ halaman: 3, pecahan: 0 });
    });

    it('harus membaca koma dengan benar', () => {
      expect(parseHalamanPecahan("1,5")).toEqual({ halaman: 1, pecahan: 0.5 });
      expect(parseHalamanPecahan("1,25")).toEqual({ halaman: 1, pecahan: 0.25 });
    });

    it('harus membaca titik dengan benar', () => {
      expect(parseHalamanPecahan("1.5")).toEqual({ halaman: 1, pecahan: 0.5 });
      expect(parseHalamanPecahan("1.75")).toEqual({ halaman: 1, pecahan: 0.75 });
    });

    it('harus melempar error untuk format acak', () => {
      expect(() => parseHalamanPecahan("")).toThrowError();
      expect(() => parseHalamanPecahan("abc")).toThrowError();
      expect(() => parseHalamanPecahan("1,33")).toThrowError(); // Bukan pecahan standar (0.25, 0.5, 0.75)
    });
  });

  describe('posisiHafalanBerikutnya', () => {
    it('harus berpindah dengan tepat (2 juz selesai -> mulai dari juz ke-3 di urutan hafalan)', () => {
      const urutan = urutanJuzStandar();
      // Asumsikan sedang berada di akhir juz 2 (Surah Al-Baqarah ayat 252)
      // Juz 3 dimulai dari Al-Baqarah ayat 253
      const next = posisiHafalanBerikutnya(2, 252, urutan);
      expect(next).toEqual({
        surahNomor: 2,
        ayat: 253,
        juz: 3
      });
    });
    
    it('harus melompat antar surat (Al-Mulk ke Al-Qalam)', () => {
       const urutan = urutanJuzStandar();
       const next = posisiHafalanBerikutnya(67, 30, urutan);
       expect(next).toEqual({
           surahNomor: 68,
           ayat: 1,
           juz: 29
       })
    });
  });

  describe('labelRentangAyatZiyadah', () => {
    it('harus memproses arah maju (lintas surat) dengan sukses', () => {
      // Al-Falaq (113) ayat 2 -> An-Nas (114) ayat 3
      const label = labelRentangAyatZiyadah(113, 2, 114, 3);
      expect(label).toBe('Al-Falaq 2-5 - An-Nas 1-3');
    });

    it('harus melempar error jika arahnya mundur', () => {
      // An-Nas (114) -> Al-Falaq (113)
      expect(() => labelRentangAyatZiyadah(114, 2, 113, 1)).toThrowError('Ayat selesai harus berada setelah ayat mulai di dalam mushaf.');
    });
    
    it('harus memproses dalam surat yang sama', () => {
        expect(labelRentangAyatZiyadah(1, 1, 1, 7)).toBe('Al-Fatiha ayat 1-7')
    })
  });
});
