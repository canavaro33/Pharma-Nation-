require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupRailwayDatabase() {
    console.log('🚀 Memulai setup database Railway...\n');

    // Create connection
    const connection = await mysql.createConnection({
        host: process.env.MYSQLHOST || process.env.DB_HOST,
        user: process.env.MYSQLUSER || process.env.DB_USER,
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
        database: process.env.MYSQLDATABASE || process.env.DB_NAME,
        port: process.env.MYSQLPORT || 3306
    });

    console.log('✅ Koneksi ke database berhasil!\n');

    try {
        // Check if tables exist
        const [tables] = await connection.execute("SHOW TABLES LIKE 'user'");
        if (tables.length > 0) {
            console.log('⚠️  Tabel sudah ada. Melewati pembuatan tabel...\n');
        } else {
            console.log('📝 Membuat tabel...');

            // Create user table
            await connection.execute(`
                CREATE TABLE user (
                    id_user INT AUTO_INCREMENT PRIMARY KEY,
                    nama VARCHAR(100) NOT NULL,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role ENUM('Admin', 'Petugas') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('  ✓ Tabel user');

            // Create obat table
            await connection.execute(`
                CREATE TABLE obat (
                    id_obat INT AUTO_INCREMENT PRIMARY KEY,
                    kode_obat VARCHAR(50) UNIQUE NOT NULL,
                    nama_obat VARCHAR(100) NOT NULL,
                    satuan ENUM('Strip', 'Box', 'Botol', 'Pcs') NOT NULL,
                    stok_total INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('  ✓ Tabel obat');

            // Create batch_obat table
            await connection.execute(`
                CREATE TABLE batch_obat (
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
            console.log('  ✓ Tabel batch_obat');

            // Create transaksi_masuk table
            await connection.execute(`
                CREATE TABLE transaksi_masuk (
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
            console.log('  ✓ Tabel transaksi_masuk');

            // Create transaksi_keluar table
            await connection.execute(`
                CREATE TABLE transaksi_keluar (
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
            console.log('  ✓ Tabel transaksi_keluar');

            // Create donasi_obat table
            await connection.execute(`
                CREATE TABLE donasi_obat (
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
            console.log('  ✓ Tabel donasi_obat\n');
        }

        // Check if admin user exists
        const [users] = await connection.execute("SELECT * FROM user WHERE username = 'admin'");
        if (users.length > 0) {
            console.log('⚠️  User admin sudah ada. Melewati pembuatan user...\n');
        } else {
            console.log('👤 Membuat user admin...');
            const hashedPassword = await bcrypt.hash('halomok123', 10);
            await connection.execute(
                'INSERT INTO user (nama, username, password, role) VALUES (?, ?, ?, ?)',
                ['Administrator', 'admin', hashedPassword, 'Admin']
            );
            console.log('  ✓ User admin berhasil dibuat\n');
        }

        console.log('🎉 Setup database selesai!\n');
        console.log('📌 Informasi Login:');
        console.log('   Username: admin');
        console.log('   Password: halomok123\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run the setup
setupRailwayDatabase()
    .then(() => {
        console.log('✅ Proses selesai!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Setup gagal:', error);
        process.exit(1);
    });
