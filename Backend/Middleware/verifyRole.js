
const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'Unauthorized: User role not found' });
        }
        const hasRole = allowedRoles.includes(req.user.role);

        if (!hasRole) {
            return res.status(403).json({ error: 'Forbidden: You do not have the right permissions' });
        }

        next();
    }
}

export default verifyRole;