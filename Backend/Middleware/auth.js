import jwt from 'jsonwebtoken';

export const verifToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No acces! Token missing' });
    }
    try{
        const dec = jwt.verify(token, process.env.JWT_SECRET);
        req.user = dec;
        next();
    } catch(e){
        return res.status(403).json({ error: 'Invalid token' });
    }
};