import Nom_Prizes from '../entities/Nom_Prizes.js';
import User_Purchases from '../entities/User_Purchases.js';
import User_Stats from '../entities/User_Stats.js';
import db from '../dbConfig.js';

async function getPrizes() {
    return await Nom_Prizes.findAll();
}

async function getUserPurchases(userId) {
    return await User_Purchases.findAll({
        where: { user_id: userId },
        include: [{ model: Nom_Prizes }]
    });
}

async function buyPrize(userId, prizeId) {
    const prize = await Nom_Prizes.findByPk(prizeId);
    const stats = await User_Stats.findOne({ where: { user_id: userId } });
    if (!prize) throw new Error("Prize not found");
    if (!stats || stats.w_coins < prize.cost) throw new Error("Not enough coins!");

    stats.w_coins -= prize.cost;
    await stats.save();

    let extraData = {};
    if (prize.type === 'BOOSTER') extraData.uses_left = 3;
    if (prize.type === 'STYLE') {
        let exp = new Date();
        exp.setDate(exp.getDate() + 7);
        extraData.expiry_date = exp;
    }
    return await User_Purchases.create({
        user_id: userId,
        prize_id: prizeId,
        status: 'ACTIVE',
        ...extraData
    });
}

export {
    getPrizes,
    getUserPurchases,
    buyPrize
}