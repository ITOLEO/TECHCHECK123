# Google Search Console DNS Configuration Guide

## TXT Record Settings
Untuk memverifikasi domain Anda di Google Search Console menggunakan metode **DNS TXT Record**, tambahkan record DNS berikut pada penyedia domain / DNS Registrar Anda (misalnya Cloudflare, Namecheap, GoDaddy, Niagahoster, Hostinger, IDCloudHost, atau Vercel):

| Field / Pengaturan | Nilai (Value) | Keterangan |
|---|---|---|
| **Record Type** | `TXT` | Tipe record DNS teks |
| **Name / Host** | `@` (atau tinggalkan kosong / masukkan `techcheck.homes`) | Root domain |
| **Value / Content / Text** | `google-site-verification=ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg` | Token verifikasi Google Search Console terbaru |
| **TTL** | `3600` (atau `Auto` / 1/2 jam) | Time to live |

---

## Verifikasi Otomatis yang Sudah Dikonfigurasi di Website

Kami telah mengaktifkan 2 metode verifikasi langsung di aplikasi website:

1. **HTML Meta Tag (Verifikasi Instan Tanpa Menunggu Propagasi DNS)**
   Telah disematkan langsung di `<head>` file `index.html`:
   ```html
   <meta name="google-site-verification" content="ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg" />
   ```
   *Keuntungan: Anda bisa langsung klik tombol **"VERIFY"** di Google Search Console dengan metode HTML Tag seketika tanpa perlu menunggu propagasi DNS 1-24 jam.*

2. **File HTML Verification (Route Server & Public File)**
   Telah dibuat di:
   - `https://techcheck.homes/googleak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg.html`
   - `https://techcheck.homes/ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg.html`

---

## Langkah-langkah di Google Search Console

1. Buka [Google Search Console](https://search.google.com/search-console/)
2. Pilih Properti domain Anda (`techcheck.homes`)
3. Jika menggunakan metode **DNS record**:
   - Salin nilai TXT: `google-site-verification=ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg`
   - Masukkan ke DNS Management registrar Anda.
   - Klik **Verify**.
4. Jika menggunakan metode **HTML Tag**:
   - Pilih **HTML Tag** pada opsi verifikasi lain.
   - Klik **Verify** langsung (karena tag sudah terpasang di source code).
