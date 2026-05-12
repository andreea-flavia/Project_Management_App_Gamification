import bcrypt from 'bcrypt';
import Users from '../entities/Users.js';
import User_Stats from '../entities/User_Stats.js';
import Nom_Badges from '../entities/Nom_Badges.js';

async function createUser(user) {
    try {
        if (!user.picture_url) {
            const default_picture = "/Flavia_Stickman.png";
            user.picture_url = default_picture;
        }

        if (user.user_first_name && user.user_last_name) {
            const first_letter = user.user_first_name.trim()[0].toLowerCase();
            const last_name_part = user.user_last_name.trim().toLowerCase();
            user.username = `${first_letter}-${last_name_part}`;
        }

        const hash_pass = await bcrypt.hash(user.user_password_hash, 10);
        user.user_password_hash = hash_pass;

        const newUser = await Users.create(user);

        await User_Stats.create({
            user_id: newUser.user_id
        });

        return newUser;

    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

async function getUsers() {
    return await Users.findAll({
        attributes: { exclude: ['user_password_hash'] }
    });
}

async function getUserById(id) {
    return await Users.findByPk(id, {
        attributes: { exclude: ['user_password_hash'] },
        include: [
            {
                model: Nom_Badges,
                as: 'badges',
                through: { attributes: [] }
            },
            {
                model: User_Stats
            }
        ]
    });
}

async function updateUser(id, userData) {
    const user = await Users.findByPk(id);
    if (!user) {
        return null;
    }
    if (userData.user_password_hash) {
        const hash_pass = await bcrypt.hash(userData.user_password_hash, 10);
        userData.user_password_hash = hash_pass;
    }
    return await user.update(userData);
}

async function deleteUser(id) {
    const user = await Users.findByPk(id);
    if (!user) {
        return null;
    }
    return await user.destroy();
}

async function getUserByEmail(email) {
    return await Users.findOne({ where: { user_mail: email } });
}



export {
    createUser,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
    getUserByEmail
}