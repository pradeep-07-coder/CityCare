
const db = require('../config/db');

class UserRepository {
  async findByEmail(email, client = db) {
    const query = `
      SELECT u.user_id, u.email, u.password_hash, u.role, u.is_active,
             COALESCE(p.patient_id, d.doctor_id, s.staff_id) AS profile_id,
             COALESCE(
               p.first_name || ' ' || p.last_name,
               d.first_name || ' ' || d.last_name,
               s.first_name || ' ' || s.last_name,
               'Admin'
             ) AS full_name
        FROM users u
   LEFT JOIN patients p ON u.user_id = p.user_id
   LEFT JOIN doctors d ON u.user_id = d.user_id
   LEFT JOIN staff s ON u.user_id = s.user_id
       WHERE u.email = $1 AND u.deleted_at IS NULL;
    `;
    const res = await client.query(query, [email]);
    return res.rows[0] || null;
  }

  async findById(id, client = db) {
    const query = `
    SELECT u.user_id, u.email, u.role, u.is_active, u.created_at,
        COALESCE(p.patient_id, d.doctor_id, s.staff_id) AS profile_id,
        COALESCE(
            p.first_name || ' ' || p.last_name,
            d.first_name || ' ' || d.last_name,
            s.first_name || ' ' ||s.last_name,
            'Admin'
        ) AS full_name
        FROM users u
    LEFT JOIN patients p ON u.user_id = p.user_id
    LEFT JOIN doctors d ON u.user_id = d.doctor_id
    LEFT JOIN staffs s ON u.user_id = s.user_Id
    WHERE u.user_id = $1 AND u.deleted_at IS NULL;
    `;

    const res = await client.query(query, [id]);
    return res.rows[0] || null;
  }

  async createUser({email, passwordHash, role}, client = db) {
    const query = `
    CREATE users(email, password_hash, role) 
    VALUES($1, $2, $3)
    RETURNING user_id, email, role, is_active, created_at;
    `;
    const res = await client.query(query, [email, passwordHash, role]);
    return res.rows[0];
  }

  async updatePassword(userId, newPasswordHash, client = db){
    const query = `
    UPDATE users
    SET password_hash = $1, updated_at = NOW()
    WHERE user_id = $2;
    `;
    await client.query(query, [newPasswordHash, userId]);
  }

  async updateLastLogin(userId, client = db){
    const query = `
    UPDATE users SET last_login_at = NOW()
    WHERE user_id = $1;
    `;
    await client.query(query, [userId]);
  }

  
}

module.exports = new UserRepository();


