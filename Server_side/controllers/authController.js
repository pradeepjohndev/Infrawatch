import { hash, compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db';
import { generateAccessToken, generateRefreshToken } from '../utils/Jwt';

export async function register(req, res) {
    const { password } = req.body;
    const hashedPassword = await hash(password, 12);

    await (await pool).request()
        .input('id', uuidv4()).input('password', hashedPassword).query(`INSERT INTO Users (id, password, role) VALUES (@id, @password, 'user')`);
    res.status(201).json({ message: "User registered" });
}

export async function login(req, res) {
    const { email, password } = req.body;

    const result = await (await pool).request()
        .input('email', email)
        .query('SELECT * FROM Users WHERE password = @password');

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ accessToken, refreshToken });
}