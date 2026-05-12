import { Op } from 'sequelize';
import Tasks from '../entities/Tasks.js';
import User_Purchases from '../entities/User_Purchases.js';
import Nom_Prizes from '../entities/Nom_Prizes.js';

async function getDashboardData(user_id) {
    try {
        // 1. Aducem itemele active din Shop (Boostere sau Golden Name)
        const activePurchases = await User_Purchases.findAll({
            where: {
                user_id,
                [Op.or]: [
                    { status: 'ACTIVE', uses_left: { [Op.gt]: 0 } },
                    { status: 'ACTIVE', expiry_date: { [Op.gt]: new Date() } }
                ]
            },
            include: [{ model: Nom_Prizes, as: 'Nom_Prize' }]
        });
        const activeBuffs = activePurchases
            .filter(p => p.Nom_Prize && (p.Nom_Prize.type === 'STYLE' || p.Nom_Prize.type === 'BOOSTER'))
            .map(p => ({
                name: p.Nom_Prize.name,
                type: p.Nom_Prize.type,
                uses_left: p.uses_left,
                expiry_date: p.expiry_date
            }));
        const totalCompleted = await Tasks.count({ where: { assigned_to: user_id, status: 4 } });
        const totalPending = await Tasks.count({ where: { assigned_to: user_id, status: { [Op.notIn]: [4, 6] } } });
        const totalMissed = await Tasks.count({ where: { assigned_to: user_id, status: 6 } });
        const totalAssigned = await Tasks.count({ where: { assigned_to: user_id } });

        const urgentTasks = await Tasks.findAll({
            where: {
                assigned_to: user_id,
                status: { [Op.notIn]: [4, 6] },
                priority: { [Op.in]: [2, 3] }
            },
            order: [
                ['priority', 'DESC'],
                ['end_date', 'ASC']
            ],
            limit: 5
        });
        return {
            activeBuffs,
            metrics: {
                totalCompleted,
                totalPending,
                totalMissed,
                totalAssigned
            },
            urgentTasks
        };

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
}

export {
    getDashboardData
};
