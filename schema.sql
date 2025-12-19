CREATE DATABASE IF NOT EXISTS medicine_inventory_fifo;
USE medicine_inventory_fifo;

CREATE TABLE IF NOT EXISTS user (
    id_user INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(50) NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Petugas') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS obat (
    id_obat INT PRIMARY KEY AUTO_INCREMENT,
    kode_obat VARCHAR(20) UNIQUE NOT NULL,
    nama_obat VARCHAR(100) NOT NULL,
    satuan VARCHAR(20) NOT NULL,
    stok_total INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batch_obat (
    id_batch INT PRIMARY KEY AUTO_INCREMENT,
    id_obat INT NOT NULL,
    batch_code VARCHAR(50) NOT NULL,
    jumlah INT NOT NULL,
    tgl_masuk DATE NOT NULL,
    tgl_exp DATE NOT NULL,
    status ENUM('available', 'sold_out', 'donated', 'expired') DEFAULT 'available',
    FOREIGN KEY (id_obat) REFERENCES obat(id_obat) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaksi_masuk (
    id_transaksi INT PRIMARY KEY AUTO_INCREMENT,
    id_obat INT NOT NULL,
    id_batch INT NOT NULL,
    jumlah INT NOT NULL,
    tgl_masuk DATE NOT NULL,
    id_user INT NOT NULL,
    FOREIGN KEY (id_obat) REFERENCES obat(id_obat),
    FOREIGN KEY (id_batch) REFERENCES batch_obat(id_batch),
    FOREIGN KEY (id_user) REFERENCES user(id_user),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaksi_keluar (
    id_transaksi INT PRIMARY KEY AUTO_INCREMENT,
    id_obat INT NOT NULL,
    id_batch INT NOT NULL,
    jumlah INT NOT NULL,
    tgl_keluar DATE NOT NULL,
    id_user INT NOT NULL,
    FOREIGN KEY (id_obat) REFERENCES obat(id_obat),
    FOREIGN KEY (id_batch) REFERENCES batch_obat(id_batch),
    FOREIGN KEY (id_user) REFERENCES user(id_user),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donasi_obat (
    id_donasi INT PRIMARY KEY AUTO_INCREMENT,
    id_obat INT NOT NULL,
    id_batch INT NOT NULL,
    jumlah INT NOT NULL,
    penerima VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    tgl_donasi DATE NOT NULL,
    id_user INT NOT NULL,
    FOREIGN KEY (id_obat) REFERENCES obat(id_obat),
    FOREIGN KEY (id_batch) REFERENCES batch_obat(id_batch),
    FOREIGN KEY (id_user) REFERENCES user(id_user),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Admin User (Password: admin123)
-- $2a$10$X7... represented hash for 'admin123' (Just an example hash, needs real generation if crucial)
-- For now, we will insert a raw query. In real app, perform bcrypt hash.
-- INSERT INTO user (nama, username, password, role) VALUES ('Administrator', 'admin', '$2a$10$ExampleHashForAdmin123', 'Admin');
