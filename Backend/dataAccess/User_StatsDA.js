import User_Stats from '../entities/User_Stats.js';
import Sequelize from 'sequelize';
import Users from '../entities/Users.js';
import { createNotification } from './notificationsDA.js';
import User_Purchases from '../entities/User_Purchases.js';
import Nom_Prizes from '../entities/Nom_Prizes.js';

async function createUserStats(userStats) {
    return await User_Stats.create(userStats);
}

async function getUserStatsByUserId(user_id) {
    return await User_Stats.findOne({ where: { user_id } });
}

async function updateUserStats(user_id, statsData) {
    const userStats = await User_Stats.findOne({ where: { user_id } });
    if (!userStats) {
        return null;
    }
    return await userStats.update(statsData);
}

async function deleteUserStats(user_id) {
    const userStats = await User_Stats.findOne({ where: { user_id } });
    if (!userStats) {
        return null;
    }

    return await userStats.destroy();
}

async function addXP_checkLevel(user_id, xp, w_coins) {
    const userStats = await User_Stats.findOne({ where: { user_id } });
    if (!userStats) {
        return null;
    }

    // voucher 2x xp
    let xpMultiplier = 1;
    const activeBooster = await User_Purchases.findOne({
        where: { user_id, status: 'ACTIVE' },
        include: [{
            model: Nom_Prizes,
            where: { prize_id: 3 }
        }]
    })
    if (activeBooster && activeBooster.uses_left > 0) {
        xpMultiplier = 2;
        activeBooster.uses_left -= 1;
        if (activeBooster.uses_left === 0) {
            activeBooster.status = 'USED';
        }
        await activeBooster.save();
    }
    const finalXP = xp * xpMultiplier;
    userStats.xp_points += finalXP;

    userStats.total_xp_points += xp;
    var lvlUp = false;
    userStats.w_coins += w_coins;
    // console.log("User stats before update:", userStats.toJSON());

    while (userStats.xp_points >= userStats.xp_points_req) {
        userStats.level += 1;
        userStats.xp_points = userStats.xp_points - userStats.xp_points_req;
        //formula pentru nivelul urm: 100 * (level urm)^2
        userStats.xp_points_req = 100 * ((userStats.level + 1) ** 2);
        lvlUp = true;
    }
    // console.log("User stats after update:", userStats.toJSON());
    await userStats.save();

    if (lvlUp) {
        await createNotification(
            user_id,
            "Promotion Secured!",
            `Operative, you have reached Level ${userStats.level}. Efficiency increasing.`,
            "LEVEL_UP",
            user_id
        );
    }


    return {
        level: userStats.level,
        xp_points: userStats.xp_points,
        xp_points_req: userStats.xp_points_req,
        w_coins: userStats.w_coins,
        lvlUp
    }
}


async function resertUserStats(user_id) {
    const userStats = await User_Stats.findOne({ where: { user_id } });
    if (!userStats) {
        return null;
    }
    userStats.xp_points = 0;
    userStats.level = 1;
    userStats.w_coins = 0;
    userStats.total_xp_points = 0;
    userStats.xp_points_req = 400;  // Formula: 100 * ((1 + 1)^2) = 400
    await userStats.save();
    return userStats;
}

async function getLeaderboardData() {
    return await Users.findAll(
        {
            attributes: [
                'user_id',
                'username',
                'picture_url',
                'role',
                [
                    Sequelize.literal(`(
                        select COUNT(*)
                        from Tasks AS task
                        where task.assigned_to = Users.user_id and task.status = 4
                    )`),
                    'completedTasksCount'
                ],
                [
                    Sequelize.literal(`(
                        select COUNT(*)
                        from User_Badges AS ub
                        where ub.user_id = Users.user_id
                    )`),
                    'badgesCount'
                ],
                [
                    Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM User_Purchases AS up
                        INNER JOIN Nom_Prizes AS np ON up.prize_id = np.prize_id
                        WHERE up.user_id = Users.user_id 
                        AND np.prize_id = 4
                        AND up.expiry_date > NOW()
                    )`),
                    'hasGoldenName'
                ]
            ],
            include: [{
                model: User_Stats,
                attributes: ['level', 'total_xp_points', 'w_coins']
            }],
            order: [[User_Stats, 'total_xp_points', 'DESC']],
            limit: 15
        });
}

export {
    createUserStats,
    getUserStatsByUserId,
    updateUserStats,
    deleteUserStats,
    addXP_checkLevel,
    resertUserStats,
    getLeaderboardData
};