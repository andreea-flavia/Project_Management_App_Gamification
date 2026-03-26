import bcrypt from 'bcrypt';
import Users from '../entities/Users.js';
import usersRouter from '../routes/usersRouter.js';

async function createUser(user) {
    try{
        if(!user.picture_url){
            const default_picture = "Resurse\Flavia_Stickman.png";
            user.picture_url = default_picture;
        }

        const hash_pass = await bcrypt.hash(user.user_password_hash, 10);
        user.user_password_hash = hash_pass;

        return await Users.create(user);
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
        attributes: { exclude: ['user_password_hash'] }
    });
}

async function updateUser(id, userData){
    const user = await Users.findByPk(id);
    if(!user){
        return null;
    }
    if(userData.user_password_hash){
        const hash_pass = await bcrypt.hash(userData.user_password_hash, 10);
        userData.user_password_hash = hash_pass;
    }
    return await user.update(userData);
}

async function deleteUser(id){
    const user = await Users.findByPk(id);
    if(!user){
        return null;
    }
    return await user.destroy();
}

async function getUserByEmail(email){
    return await Users.findOne({where: {user_mail: email}});
}

// async function login (req, res) {
//     const { email, password } = req.body;

//     try{
//         const user = await getUserByEmail(email);
//         if(!user){
//             return res.status(404).json({ message: 'Utilizatorul nu exista!' });
//         }

//         const gasit = await bcrypt.compare(password, user.user_password_hash);
//         if(gasit){
//             return res.status(200).json({ 
//                 success: true, 
//                 user: {
//                     id: user.user_id,
//                     first_name: user.first_name,
//                     picture_url: user.picture_url
//                 } 
//             });
//         } else {
//             return res.status(401).json({ message: 'Parola incorecta!' });
//         }
//     } catch (e){
//         res.status(500).json({ success: false, message: "Eroare de server" });
//     }
// }



export{
    createUser,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
    getUserByEmail
}