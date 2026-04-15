import Tasks_Tags from '../entities/Tasks_Tags.js';

async function getTT() {
    return await Tasks_Tags.findAll();
}

async function getTagsByTaskId(task_id) {
    return await Tasks_Tags.findAll({ where: { task_id } });
}

export {
    getTT,
    getTagsByTaskId
}
