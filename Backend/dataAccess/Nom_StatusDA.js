import Statuses from '../entities/Nom_status.js';

async function getStatuses() {
    return await Statuses.findAll();
}

async function getStatusessByType(type) {
    const statuses = await Statuses.findAll({
        where: { status_type: type }
    });
    return statuses;
}


export {
    getStatuses,
    getStatusessByType
}