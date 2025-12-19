const db = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

exports.setupDatabase = async (req, res) => {
    try {
        // Check if tables already exist
        const [tables] = await db.execute("SHOW TABLES LIKE 'user'");
        if (tables.length > 0) {
            return res.send(`
                <h1>⚠️ Database Sudah Di-Setup</h1>
                <p>Tabel sudah ada. Tidak perlu setup lagi.</p>
                <p><a href="/login">Klik di sini untuk login</a></p>
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> halomok123</p>
            `);
        }

        // Create tables manually (more reliable than reading file)
        await db.execute(`
            CREATE TABLE IF NOT EXISTS user (
                id_user INT AUTO_INCREMENT PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('Admin', 'Petugas') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS obat (
                id_obat INT AUTO_INCREMENT PRIMARY KEY,
                kode_obat VARCHAR(50) UNIQUE NOT NULL,
                nama_obat VARCHAR(100) NOT NULL,
                satuan ENUM('Strip', 'Box', 'Botol', 'Pcs') NOT NULL,
                stok_total INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS batch_obat (
                id_batch INT AUTO_INCREMENT PRIMARY KEY,
                id_obat INT NOT NULL,
                batch_code VARCHAR(50) NOT NULL,
                jumlah INT NOT NULL,
                tgl_masuk DATE NOT NULL,
                tgl_exp DATE NOT NULL,
                status ENUM('available', 'sold_out', 'donated', 'expired') DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_obat) REFERENCES obat(id_obat) ON DELETE CASCADE
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS transaksi_masuk (
                id_transaksi INT AUTO_INCREMENT PRIMARY KEY,
                id_obat INT NOT NULL,
                id_batch INT NOT NULL,
                jumlah INT NOT NULL,
                tgl_masuk DATE NOT NULL,
                id_user INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_obat) REFERENCES obat(id_obat) ON DELETE CASCADE,
                FOREIGN KEY (id_batch) REFERENCES batch_obat(id_batch) ON DELETE CASCADE,
                FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS transaksi_keluar (
                id_transaksi INT AUTO_INCREMENT PRIMARY KEY,
                id_obat INT NOT NULL,
                id_batch INT NOT NULL,
                jumlah INT NOT NULL,
                tgl_keluar DATE NOT NULL,
                id_user INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_obat) REFERENCES obat(id_obat) ON DELETE CASCADE,
                FOREIGN KEY (id_batch) REFERENCES batch_obat(id_batch) ON DELETE CASCADE,
                FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS donasi_obat (
                id_donasi INT AUTO_INCREMENT PRIMARY KEY,
                id_obat INT NOT NULL,
                id_batch INT NOT NULL,
                jumlah INT NOT NULL,
                penerima VARCHAR(100) NOT NULL,
                status ENUM('Pending', 'Dikirim', 'Selesai') DEFAULT 'Pending',
                tgl_donasi DATE NOT NULL,
                id_user INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_obat) REFERENCES obat(id_obat) ON DELETE CASCADE,
                FOREIGN KEY (id_batch) REFERENCES batch_obat(id_batch) ON DELETE CASCADE,
                FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE
            )
        `);

        // Seed admin user
        const hashedPassword = await bcrypt.hash('halomok123', 10);
        await db.execute(
            'INSERT INTO user (nama, username, password, role) VALUES (?, ?, ?, ?)',
            ['Administrator', 'admin', hashedPassword, 'Admin']
        );

        res.send(`
            <h1>✅ Database Setup Berhasil!</h1>
            <p>Semua tabel telah dibuat dan user admin telah ditambahkan.</p>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> halomok123</p>
            <p><a href="/login">Klik di sini untuk login</a></p>
            <hr>
            <p><small>PENTING: Hapus route /setup dari server.js setelah setup selesai untuk keamanan!</small></p>
        `);
    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).send(`
            <h1>❌ Setup Gagal</h1>
            <p><strong>Error:</strong> ${error.message}</p>
            <p><strong>Stack:</strong> ${error.stack}</p>
            <hr>
            <p>Jika error adalah "table already exists", coba akses <a href="/login">/login</a> langsung.</p>
        `);
    }
};
