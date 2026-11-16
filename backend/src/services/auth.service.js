const crypto = require('crypto');
const { withTransaction } = require('../config/db');
const userRepository = require('../repositories/user.repository');
const patientRepository = require('../repositories/patient.repository');
const tokenRepository = require('../repositories/token.repository');
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const ROLES = require('../constants/roles');
const { error } = require('console');
const { access } = require('fs');

class AuthService {
    async registerPatient(data){
        const existingUser = await userRepository.findByEmail(data.email);
        if(existingUser){
            throw new ApiError(401, 'Email is already registered');
        }
        const hashedPass = await hashPassword(data.password);

        return await withTransaction(async (client) => {
            const user = await userRepository.createUser({
                email: data.email,
                passwordHash: hashedPass,
                role: ROLES.PATIENT,
            }, client);

            const patient = await patientRepository.createPatient({
                userId: user.user_id,
                firstName: data.first_name,
                lastName: data.last_name,
                dateOfBirth: data.date_of_birth,
                gender: data.gender,
                bloodGroup: data.blood_group,
                phone: data.phone,
                address: data.address,
                emergencyContactName: data.emergency_contact_name,
                emergencyContactPhone: data.emergency_contact_phone,
                
            }, client);

            return {
                userId: user.user_id,
                patient_id: patient.patient_id,
                email: user.email,
                role: user.role,
            };
        });
    }

    async login(email, password){
        const user = await userRepository.findByEmail(email);
        if(!user || !user.is_active){
            throw new ApiError(401, 'Invalid email or password');
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if(!isMatch){
            throw new ApiError(401, 'Invalid email or password');
        }

        const payload = {
            sub: user.user_id,
            role: user.role,
            profile_id: parseInt(user.profile_id, 10),
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await tokenRepository.saveRefreshToken(user.user_id, tokenHash, expiresAt);
        await userRepository.updateLastLogin(user.user_id);

        return {
            access_token: accessToken,
            refreshToken: refreshToken,
            expires_in: 900,
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
                profile_id: user.profile_id,
                full_name: user.full_name,
            },
        };

    }

    async refreshSession(refreshToken){
        let decoded;
        try{
            decoded = verifyRefreshToken(refreshToken);

        } catch(err){
            throw new ApiError(401, 'Invalid or expired refresh token');
        }

        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const storedToken = await tokenRepository.findRefreshtoken(tokenHash);

        if(!storedToken || storedToken.revoked_at || new Date() > new Date(storedToken.expires_at)) {
            throw new ApiError(401, 'Refresh token has been revoked or expired');
        }

        const newAccessToken = generateAccessToken({
            sub: decoded.sub,
            role: decoded.role,
            profile_id: decoded.profile_id,
        });

        return {
            access_token: newAccessToken,
            expires_in: 900,
        };
    }


    async logout(refreshToken){
        if(!refreshToken){
            return;
        }
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await tokenRepository.revokeRefreshToken(tokenHash);
    }

    async changePassword(userId, currentPassword, newPassword){
        const user = await userRepository.findById(userId);
        const fullUser = await userRepository.findByEmail(user.email);

        const isMatch = await comparePassword(currentPassword, fullUser.password_hash);

        if(!isMatch){
            throw new ApiError(400, "current password is incorrect");
        }

        const newPasswordHass = await hashPassword(newPassword);
        await userRepository.updatePassword(userId, newPasswordHass);

    }

    async forgetPassword(email){
        const user = await userRepository.findByEmail(email);
        if(!user){
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHass = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date( Date.now() + 60 * 60 * 1000);

        await tokenRepository.savePasswordResetToken(user.user_id, tokenHass, expiresAt);

        console.log(`[RESET LINK] /auth/reset-password?token=${resetToken}`);

    }

    async resetPassword(resetToken, newPassword){

        const tokenHass = crypto.createHash('sha256').update(resetToken).digest('hex');

        const storedToken = await tokenRepository.findPasswordResetToken(tokenHass);

        if(!storedToken || storedToken.used_at || new Date() > new Date(storedToken.expires_at)) {
            throw new ApiError(401, 'Invalid or expired password reset token');
        }

        const newPasswordHass = await hashPassword(newPassword);

        await withTransaction( async (client) => {
            await userRepository.updatePassword(storedToken.user_id, newPassword, client);
            await tokenRepository.markPasswordResetTokenUsed(storedToken.reset_id, client);
        });

    }

}

module.exports = new AuthService();