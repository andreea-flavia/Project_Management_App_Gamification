import Tasks from "../entities/Tasks.js";
import Projects from "../entities/Projects.js";
import AuditLog from "../entities/AuditLog.js";
import { Op, fn, col } from "sequelize";
import Nom_Tags from "../entities/Nom_tags.js";
import Priorities from "../entities/Nom_priority.js";

async function getOverallStats() {
    const COMPLETED_STATUS = 4;
    const totalTasks = await Tasks.count();
    const activeProjects = await Projects.count({
        where: { status: { [Op.ne]: COMPLETED_STATUS } }
    });
    const currentWip = await Tasks.count({
        where: { status: { [Op.ne]: COMPLETED_STATUS } }
    });
    const globalXP = await Tasks.sum('xp_points', {
        where: { status: COMPLETED_STATUS }
    }) || 0;
    const leadingSkillData = await Tasks.findAll({
        attributes: [[fn('COUNT', col('tags.tag_id')), 'tagCount']],
        include: [{
            model: Nom_Tags,
            as: 'tags',
            attributes: ['tag_name'],
            through: { attributes: [] },
            where: {
                tag_name: {
                    [Op.notIn]: ['BUG', 'FEATURE', 'IMPROVEMENT', 'ANALYSING', 'TESTING', 'DEVELOPING']
                }
            }
        }],
        group: ['tags.tag_id', 'tags.tag_name'],
        order: [[fn('COUNT', col('tags.tag_id')), 'DESC']],
        limit: 1,
        subQuery: false,
        raw: true
    });
    const leadingSkill = leadingSkillData.length > 0 ? leadingSkillData[0]['tags.tag_name'] : "N/A";
    return { totalTasks, activeProjects, globalXP, leadingSkill, currentWip };
}

async function getProjectPortfolioHealth() {
    const COMPLETED_STATUS = 4;

    const projectsData = await Projects.findAll({
        include: [{ model: Tasks, attributes: ['status'] }],
        where: { status: 11 }
    });

    return projectsData.map(project => {
        const total = project.Tasks.length;
        const completed = project.Tasks.filter(t => t.status === COMPLETED_STATUS).length;

        return {
            name: project.project_name,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
            totalTasks: total,
            status: project.status
        };
    });
}

async function getCFDData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const COMPLETED_STATUS = 4;

    const createdStats = await Tasks.findAll({
        attributes: [
            [fn('DATE', col('createdAt')), 'day'],
            [fn('COUNT', col('task_id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: startDate } },
        group: [fn('DATE', col('createdAt'))],
        raw: true
    });

    const completedStats = await AuditLog.findAll({
        attributes: [
            [fn('DATE', col('createdAt')), 'day'],
            [fn('COUNT', col('log_id')), 'count']
        ],
        where: {
            entity_type: 'Task',
            action: 'UPDATE',
            createdAt: { [Op.gte]: startDate },
            details: { [Op.like]: `%"status":${COMPLETED_STATUS}%` }
        },
        group: [fn('DATE', col('createdAt'))],
        raw: true
    });

    let runningCreated = 0;
    let runningCompleted = 0;
    const result = [];

    for (let i = 0; i <= days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];

        const dayCreated = createdStats.find(s => s.day === dateStr)?.count || 0;
        const dayCompleted = completedStats.find(s => s.day === dateStr)?.count || 0;

        runningCreated += parseInt(dayCreated);
        runningCompleted += parseInt(dayCompleted);

        result.push({
            date: dateStr,
            created: runningCreated,
            completed: runningCompleted,
            wip: runningCreated - runningCompleted
        });
    }

    return result;
}

async function getPriorityDistribution() {
    const distribution = await Tasks.findAll({
        attributes: [[fn('COUNT', col('Tasks.priority')), 'count']],
        include: [{
            model: Priorities,
            attributes: ['priority_name', 'color']
        }],
        group: ['Nom_Priority.priority_id', 'Nom_Priority.priority_name', 'Nom_Priority.color'],
        raw: true
    });
    return distribution.map(item => ({
        name: item['Nom_Priority.priority_name'],
        value: parseInt(item.count),
        color: item['Nom_Priority.color'] || '#ccc'
    }));
}



export {
    getOverallStats,
    getProjectPortfolioHealth,
    getCFDData,
    getPriorityDistribution
};
