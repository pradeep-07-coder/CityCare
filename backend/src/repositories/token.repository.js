const db = require('../config/db');

class tokenRepository {
    async saveRefreshToken(userId, tokenHash, expiresAt, client = db){
        const query = `
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
        VALUES($1, &2, $3)
        RETURNING token_id;
        `;
        await client.query(query, [userId, tokenHash, expiresAt]);
    }

    async findRefreshtoken(tokenHash, client = db){
        const query = `
        SELECT token_id, user_id, expires_at, revoked_at
        FROM refresh_tokens
        WHERE token_hash = $1;
        `;

        const res = await client.query(query, [tokenHash]);
        return res.rows[0] || null;
    }

    async revokeRefreshToken(tokenHash, client = db){
        const query = `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE token_hash = $1;
        `;

        await client.query(query, [tokenHash]);
    }

    async savePasswordResetToken(userId, tokenHash, expiresAt){
        const query = `
        INSERT INTO password_reset_tokens(user_id, token_hash, expires_at)
        VALUES($1, $2, $3);
        `;

        await client.query(query, [userId, tokenHash, expiresAt]);
    }

    async findPasswordResetToken(tokenHash, client = db){
        const query = `
        SELECT reset_id, user_id, expires_at, used_at
        FROM password_reset_tokens
        WHERE token_hash = $1;
        `;

        const res = await client.query(query, [tokenHash]);
        return res.rows[0] || null;
    }

    async markPasswordResetTokenUsed(resetId, client = db){
        const query = `
        UPDATE password_reset_tokens
        SET revoked_at = NOW()
        WHERE reset_id = $1;
        `;

        await client.query(query, [resetId]);
    }

}

module.exports = new tokenRepository();