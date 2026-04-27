import User_Stats from '../entities/User_Stats.js';

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

async function addXP_checkLevel(user_id, xp, w_coins){
    const userStats = await User_Stats.findOne({ where: { user_id } });
    if (!userStats) {
        return null;
    }

    userStats.xp_points += xp;
    userStats.total_xp_points += xp;
    var lvlUp = false;
    userStats.w_coins += w_coins;


    console.log("User stats before update:", userStats.toJSON());

    while(userStats.xp_points >= userStats.xp_points_req){
        userStats.level += 1;
        userStats.xp_points = userStats.xp_points - userStats.xp_points_req;
        // Formula pentru nivelul următor: 100 * (level următor)^2
        userStats.xp_points_req = 100 * ((userStats.level + 1) ** 2);
        lvlUp = true;
    }

    console.log("User stats after update:", userStats.toJSON());

    await userStats.save();

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

export {
    createUserStats,
    getUserStatsByUserId,
    updateUserStats,
    deleteUserStats,
    addXP_checkLevel,
    resertUserStats
};