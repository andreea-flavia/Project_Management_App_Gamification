import jwt from 'jsonwebtoken';
import express from 'express';
import bcrypt from 'bcrypt';
import {
    createUser,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
    getUserByEmail
} from '../dataAccess/usersDA.js';

let usersRouter = express.Router();

usersRouter.route('/user')
    .post(async (req, res) => {
        try {
            const new_user = await createUser(req.body);
            return res.status(201).json(new_user);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    })
    .get(async (req, res) => {
        return res.json(await getUsers());
    });



usersRouter.route('/user/:id')
    .get(async (req, res) => {
        const user = await getUserById(req.params.id);
        if (user) return res.json(user);
        return res.status(404).json({ error: 'User not found' });
    })
    .put(async (req, res) => {
        const updated = await updateUser(req.params.id, req.body);
        if (updated) return res.json(updated);
        return res.status(404).json({ error: 'User not found' });
    })
    .delete(async (req, res) => {
        const deleted = await deleteUser(req.params.id);
        if (deleted) return res.json(deleted);
        return res.status(404).json({ error: 'User not found' });
    });

usersRouter.route('/user/mail/:mail')
    .get(async (req, res) => {
        const user = await getUserByEmail(req.params.mail);
        if (user)
            return res.json(user);
        return res.status(404).json({ error: 'User not found' });
    });




//ruta login
usersRouter.route('/login')
    .post(async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await getUserByEmail(email);

            if (!user) {
                return res.status(404).json({ error: 'User doesn\'t exist!' });
            }

            const passwordMatch = await bcrypt.compare(password, user.user_password_hash);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Incorrect password!' });
            }

            const token = jwt.sign({
                userId: user.user_id,
                role: user.role
            },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            return res.status(200).json({
                message: "login succesful",
                success: true,
                token,
                user: {
                    id: user.user_id,
                    email: user.user_mail,
                    first_name: user.user_first_name,
                    last_name: user.user_last_name,
                    role: user.role
                }
            });
        } catch (e) {
            return res.status(500).json({ error: e + ' Server error' });
        }
    });

// res.status(500).json({ 
//         message: 'server error', 
//         error: err.message,   
//         details: err.original?.sqlMessage || err.name 
//     });

//ruta logout
usersRouter.route('/logout')
    .post((req, res) => {
        try {
            return res.status(200).json({
                message: 'Logout succesful!',
                succes: true
            });
        } catch (e) {
            return res.status(500).json({ error: e + ' Server error' });
        }
    })

export default usersRouter;