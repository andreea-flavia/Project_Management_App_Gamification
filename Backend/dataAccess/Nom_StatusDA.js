import Statuses from '../entities/Nom_status.js';

async function getStatuses() {
    return await Statuses.findAll();
}

export {
    getStatuses
}