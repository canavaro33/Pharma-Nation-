const db = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

exports.setupDatabase = async (req, res) => {
    try {
        // Read schema.sql
        const schemaPath = path.join(__dirname, '../schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await db.execute(statement);
            }
        }

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
            <p>Error: ${error.message}</p>
            <p>Jika tabel sudah ada, ini normal. Coba akses <a href="/login">/login</a></p>
        `);
    }
};
