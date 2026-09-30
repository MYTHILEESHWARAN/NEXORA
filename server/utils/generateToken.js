import jwt from 'jsonwebtoken';
import crypto from 'crypto';
export const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
export const generateResetToken = () => crypto.randomBytes(32).toString('hex');