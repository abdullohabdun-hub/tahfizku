// src/lib/email.ts
// Helper untuk mengirim email menggunakan Resend API (HTTP)
// Memerlukan variabel lingkungan RESEND_API_KEY

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY tidak ditemukan di environment. Email tidak dikirim.');
    console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'TahfidzKu <no-reply@tahfidzku.my.id>', // Pastikan domain ini diverifikasi di Resend
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Gagal mengirim email via Resend:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error saat menghubungi API Resend:', error);
    return false;
  }
}
