# Sistem Pengendalian Stok Obat (FIFO)

Aplikasi manajemen stok obat berbasis web menggunakan Node.js, Express, dan MySQL dengan penerapan algoritma FIFO (First In First Out).

## Fitur Utama
- **Manajemen Obat**: Input data obat dan batch dengan validasi kadaluarsa.
- **Transaksi FIFO**: Pengurangan stok otomatis berdasarkan batch termurah (terlama).
- **Dashboard**: Statistik real-time stok dan peringatan kadaluarsa.
- **Laporan**: Laporan stok dan notifikasi expiry date (<90 hari).
- **Donasi**: Manajemen obat yang mendekati expired untuk didonasikan.

## Persyaratan Sistem
- Node.js (v14+)
- MySQL Database

## Cara Install & Menjalankan

### 1. Setup Database
Pastikan MySQL sudah berjalan. Buat database dan import tabel:
```bash
# Otomatis (menggunakan script utility yang disediakan)
node utils/db_setup.js
# Lalu seed user admin
node utils/seed.js
```

### 2. Konfigurasi Environment
File `.env` sudah disediakan dengan konfigurasi default:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=medicine_inventory_fifo
```
*Sesuaikan DB_PASSWORD jika MySQL Anda menggunakan password.*

### 3. Install Dependencies
```bash
npm install
```

### 4. Jalankan Aplikasi
Mode Development (Auto-restart):
```bash
npm run dev
```
Mode Production:
```bash
npm start
```

Akses aplikasi di: **http://localhost:3000**

## Akun Login Default
- **Username**: `admin`
- **Password**: `halomok123`

## Struktur Folder
- `controllers/`: Logika bisnis (termasuk algoritma FIFO di `transaksiController.js`)
- `models/`: Query database
- `views/`: Tampilan antarmuka (EJS)
- `routes/`: Routing URL
