export const normalisasiEmail = (input: string): string => {
  return input.trim().toLowerCase();
};

export const normalisasiUsername = (input: string): string => {
  return input.trim().toLowerCase();
};

export const normalisasiNoWa = (input: string): string => {
  if (!input) return '';
  // 1. Buang spasi, strip, dan karakter non-digit kecuali '+'
  let clean = input.replace(/[^\d+]/g, '');
  
  // 2. Hapus '+' jika ada di awal
  if (clean.startsWith('+')) clean = clean.substring(1);
  
  // 3. Normalisasi awalan
  if (clean.startsWith('08')) {
    clean = '62' + clean.substring(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  
  // Jika awalnya bukan 62 setelah dibersihkan, mungkin nomor luar negeri atau aneh, 
  // tapi untuk requirement ini kita simpan apa adanya (misal 628...). 
  // Asalkan format +62, 08, 8, dan 62 tertangani.
  return clean;
};
