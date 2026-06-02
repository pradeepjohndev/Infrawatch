export function validateLoginPayload(req, res, next) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }
    next();
}

export function validateRegisterPayload(req, res, next) {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: "username, password, and role are required" });
    }
    next();
}
