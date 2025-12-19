const db = require('../config/database');

class Obat {
    static async create(obatData) {
        const { kode_obat, nama_obat, satuan, stok_total } = obatData;
        const [result] = await db.execute(
            'INSERT INTO obat (kode_obat, nama_obat, satuan, stok_total) VALUES (?, ?, ?, ?)',
            [kode_obat, nama_obat, satuan, stok_total || 0]
        );
        return result.insertId;
    }

    static async getAll(search = '') {
        let query = 'SELECT * FROM obat';
        let params = [];

        if (search) {
            query += ' WHERE nama_obat LIKE ? OR kode_obat LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM obat WHERE id_obat = ?', [id]);
        return rows[0];
    }

    static async updateStok(id, newStok) {
        await db.execute('UPDATE obat SET stok_total = ? WHERE id_obat = ?', [newStok, id]);
    }
}

module.exports = Obat;
