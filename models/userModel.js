const db = require('../config/database');

class User {
    static async create(user) {
        const { nama, username, password, role } = user;
        const [result] = await db.execute(
            'INSERT INTO user (nama, username, password, role) VALUES (?, ?, ?, ?)',
            [nama, username, password, role]
        );
        return result.insertId;
    }

    static async findByUsername(username) {
        const [rows] = await db.execute('SELECT * FROM user WHERE username = ?', [username]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM user WHERE id_user = ?', [id]);
        return rows[0];
    }
}

module.exports = User;
