import Priorities from "../entities/Nom_priority.js";

async function getPriorities() {
    return await Priorities.findAll();
}

export {
    getPriorities
}