import Nom_Badges from "../entities/Nom_Badges.js";
import User_Badges from "../entities/User_Badges.js";
import Users from "../entities/Users.js";
import Nom_Tags from "../entities/Nom_tags.js";
import Tasks from "../entities/Tasks.js";
import { Op, Sequelize } from "sequelize";
import { logAction } from "./AuditLogDA.js";
import { LOG_ENTITY_TYPES } from '../constants/log_entity_type.js';
import { LOG_ACTIONS } from '../constants/log_action.js';
import { createNotification } from './notificationsDA.js';

async function createBadge(data) {
    return await Nom_Badges.create(data);
}

async function getAllBadges() {
    return await Nom_Badges.findAll();
}

async function getBadgesByType(type) {
    return await Nom_Badges.findAll({
        where: { requirement_type: type }
    });
}

async function updateBadge(badgeId, data) {
    const badge = await Nom_Badges.findByPk(badgeId);
    if (badge) {
        return await badge.update(data);
    }
    return null;
}

async function deleteBadge(badgeId) {
    const badge = await Nom_Badges.findByPk(badgeId);
    if (badge) {
        return await badge.destroy();
    }
    return null;
}



async function getUserBadges(userId) {
    const user = await Users.findByPk(userId, {
        include: [{
            model: Nom_Badges,
            as: 'badges',
            through: { attributes: ['date_earned'] }
        }]
    });
    return user ? user.badges : [];
}

async function awardBadgeToUser(userId, badgeId) {
    const badge = await Nom_Badges.findByPk(badgeId);
    const badgeName = badge ? badge.name : "New Badge";
    await createNotification(
        userId,
        "Honors Awarded",
        `You have earned the badge: ${badgeName}`,
        "BADGE_EARNED"
    );
    return await User_Badges.create({
        user_id: userId,
        badge_id: badgeId,
        date_earned: new Date()
    });
}

async function checkUserForBadges(userId) {
    try {
        const user = await Users.findByPk(userId);
        if (!user) return;
        const currentBadges = await User_Badges.findAll({
            where: { user_id: userId },
            attributes: ['badge_id']
        });
        const currentBadgeIds = currentBadges.map(b => b.badge_id);
        const potentialBadges = await Nom_Badges.findAll({
            where: {
                badge_id: { [Op.notIn]: currentBadgeIds }
            }
        });
        if (potentialBadges.length === 0) return;

        const totalTasksCompleted = await Tasks.count({
            where: { assigned_to: userId, status: 4 }
        });
        const tagStats = await Tasks.findAll({
            where: { assigned_to: userId, status: 4 },
            include: [{
                model: Nom_Tags,
                as: 'tags',
                through: { attributes: [] },
                required: true
            }],
            attributes: [
                [Sequelize.col('tags.tag_name'), 'tagName'],
                [Sequelize.fn('COUNT', Sequelize.col('Tasks.task_id')), 'count']
            ],
            group: ['tags.tag_name'],
            raw: true
        });
        const statsMap = {};
        tagStats.forEach(s => {
            statsMap[s.tagName] = parseInt(s.count);
        });

        for (const badge of potentialBadges) {
            let earned = false;
            if (badge.requirement_type == 'LEVEL') {
                if (user.level >= badge.requirement_value) {
                    earned = true;
                }
            } else if (badge.requirement_type == 'TOTAL_TASKS') {
                if (totalTasksCompleted >= badge.requirement_value) {
                    earned = true;
                }
            } else if (badge.requirement_type == 'TAG_COUNT') {
                const currentCount = statsMap[badge.target_tag] || 0;
                if (currentCount >= badge.requirement_value) {
                    earned = true;
                }
            }
            if (earned) {
                await awardBadgeToUser(userId, badge.badge_id);
                await logAction(userId, LOG_ACTIONS.CREATE, LOG_ENTITY_TYPES.BADGE, badge.badge_id, `User earned badge: ${badge.name}`);
            }
        }

    } catch (error) {
        console.error("Error checkUserForBadges:", error);
    }
}



export {
    createBadge,
    getAllBadges,
    updateBadge,
    deleteBadge,
    getUserBadges,
    awardBadgeToUser,
    getBadgesByType,
    checkUserForBadges
}