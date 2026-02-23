import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const JWT_access = process.env.JWT_ACCESS_SECRET;

if (!JWT_access) {
    throw new Error('JWT_ACCESS_SECRET environment variable is not defined');
}

const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.sendStatus(401);

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_access);
        req.user = decoded;
        next();
    } catch {
        res.sendStatus(403);
    }
};

export default authenticate;