import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' }
    );
}

export function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }
    );
}