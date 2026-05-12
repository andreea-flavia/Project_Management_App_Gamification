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


async function useVoucher(userId, purchaseId) {
    const purchase = await User_Purchases.findOne({
        where: {
            purchase_id: purchaseId,
            user_id: userId,
            status: 'ACTIVE'
        },
        include: [Nom_Prizes]
    })
    if (!purchase) {
        throw new Error("Voucher not found or already activated/expired");
    }
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);
    const code = "WC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    purchase.status = 'USED';
    purchase.redemption_code = code;
    purchase.expiry_date = expiration;
    await purchase.save();
    return {
        message: "Voucher activated! Valid for 24 hours.",
        code: code,
        expiresAt: expiration
    };
}

export {
    getPrizes,
    getUserPurchases,
    buyPrize,
    useVoucher
}