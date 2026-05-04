import Priorities from "../entities/Nom_priority.js";

async function getPriorities() {
    return await Priorities.findAll();
}

async function getPrioritiesByType(type) {
    const priorities = await Priorities.findAll({
        where: { priority_type: type }
    });
    return priorities;
}

export {
    getPriorities,
    getPrioritiesByType
}