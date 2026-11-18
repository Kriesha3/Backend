const bcrypt = require('bcryptjs');

class User {
  static async create(db, { name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await db.collection('users').findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.collection('users').insertOne({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return {
      id: result.insertedId.toString(),
      name: name.trim(),
      email: normalizedEmail,
    };
  }

  static async findByEmail(db, email) {
    return db.collection('users').findOne({
      email: email.trim().toLowerCase(),
    });
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;
