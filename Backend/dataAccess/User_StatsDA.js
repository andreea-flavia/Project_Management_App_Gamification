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

export {
    createUserStats,
    getUserStatsByUserId,
    updateUserStats,
    deleteUserStats
};