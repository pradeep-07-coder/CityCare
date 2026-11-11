const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address format'),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        first_name: z.string().min(1, 'first name is required'),
        last_name: z.string().min(1, 'Last name is required'),
        date_of_birth: z.string().regex(/^\d{4}-d{2}-d{2}$/, 'Formet must be YYYY-MM-DD'),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
        blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
        phone: z.string().min(10, 'valid phone number required'),
        address: z.string().optional(),
        emergency_contact_name: z.string().optional(),
        emergency_contact_phone: z.string().optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

const refreshTokenSchema = z.object({
    body: z.object({
        refresh_token: z.string().min(1, 'Refresh token required'),
    }),
});

const changePasswordSchema = z.object({
    body: z.object({
        current_password: z.string().min(1, 'Current password is required'),
        new_password: z.string().min(8, 'New password must be at least 8 characters long'),

    }),
});

const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});

const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Reset token required'),
        new_password: z.string().min(8, 'New password must be at least 8 characters long')
    }),
});


module.exports = {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    refreshTokenSchema,
    resetPasswordSchema,
    forgotPasswordSchema,
};