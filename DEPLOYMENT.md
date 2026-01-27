# Panduan Deployment Aplikasi ke Publik

Ada dua cara utama untuk membuat aplikasi Anda (Frontend Next.js + Backend Express + PostgreSQL) bisa diakses publik:

## Opsi 1: Temporary (Tunneling) - Cepat, untuk Demo/Testing
Cocok jika Anda hanya ingin menunjukkan aplikasi ke teman atau klien sebentar tanpa setup server.

### Langkah-langkah:
1. **Jalankan Aplikasi Lokal**: Pastikan frontend dan backend berjalan (`npm run dev` di kedua folder).
2. **Expose Backend**:
   - Buka terminal baru di folder `todo-list-api`.
   - Jalankan: `npx localtunnel --port 3001` (Port default Anda 3001).
   - Simpan URL yang diberikan (misal: `https://api-random.loca.lt`).
3. **Update Frontend**:
   - Di `todo-list`, Anda mungkin perlu mengubah URL API agar mengarah ke URL public backend di atas.
   - **PENTING**: Backend Anda memiliki konfigurasi CORS. Pastikan URL frontend tunnel nanti ditambahkan ke whitelist CORS di `src/index.ts` jika error.
4. **Expose Frontend**:
   - Buka terminal baru di folder `todo-list`.
   - Jalankan: `npx localtunnel --port 3000`.
   - Bagikan URL frontend ini ke orang lain.

## Opsi 2: Permanent Deployment - Untuk Penggunaan Nyata
Ini adalah cara yang benar untuk "production".

### 1. Database (PostgreSQL) -> Cloud
Database lokal tidak bisa diakses server cloud.
- **Solusi**: Gunakan [Neon](https://neon.tech) atau [Supabase](https://supabase.com) (Gratis).
- **Setup**: Buat project, copy connection string `postgres://...`, update `.env` di backend.

### 2. Backend API -> Cloud
Upload kode backend `todo-list-api`.
- **Solusi**: [Railway](https://railway.app) atau [Render](https://render.com).
- **Setup**: Connect GitHub repo, set environment variables (DATABASE_URL, BETTER_AUTH_SECRET, dll).

### 3. Frontend -> Vercel
Deploy `todo-list`.
- **Solusi**: [Vercel](https://vercel.com).
- **Setup**: Connect GitHub repo, set Environment Variable `NEXT_PUBLIC_API_URL` ke URL backend yang sudah dideploy.

---
**Rekomendasi**: Jika untuk jangka panjang, pilih **Opsi 2**. Jika hanya untuk demo 5 menit, pilih **Opsi 1**.
