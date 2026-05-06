import Projects from '../entities/Projects.js';
import Project_Members from '../entities/Project_Members.js';
import Users from '../entities/Users.js';
import Tasks from '../entities/Tasks.js';


async function createProject(project, userId) {
    try {
        const newProject = await Projects.create(project);
        await Project_Members.create({
            project_id: newProject.project_id,
            user_id: userId,
            role: 'OWNER'
        });
        return newProject;
    } catch (e) {
        console.error('Error creating project:', e);
        throw e;
    }
}

async function deleteProject(id) {
    const pr = await Projects.findByPk(id);
    if (!pr) {
        return null;
    }
    return await pr.destroy();
}

async function getMyProjects(userId) {
    const user = await Users.findByPk(userId, {
        include: [{
            model: Projects,
            as: 'projects',
            include: [{ model: Tasks }]
        }]
    });
    if (!user) return [];
    return user.projects;
}

async function getAllProjects() {
    return await Projects.findAll({
        include: [{ model: Tasks }]
    });
}

async function getProjectStats(projectId) {
    const total = await Tasks.count({
        where: { project_id: projectId }
    })
    const completed = await Tasks.count({
        where: { project_id: projectId, status: 4 }
    });
    return {
        total: total,
        completed: completed,
        pending: total - completed
    };
}


async function getProjectById(id) {
    return await Projects.findByPk(id, {
        include: [{ model: Tasks }]
    });
}
async function isUserInProject(userId, projectId) {
    const member = await Project_Members.findOne({
        where: { user_id: userId, project_id: projectId }
    });
    return member !== null;
}

async function archiveProject(id) {
    const pr = await Projects.findByPk(id);
    if (!pr) return null;
    return await pr.update({ status: 12 });
}

async function getProjectMembers(projectId) {
    const project = await Projects.findByPk(projectId, {
        include: [{ 
            model: Users, 
            as: 'members',
            attributes: ['user_id', 'user_first_name', 'user_last_name', 'user_mail', 'role', 'picture_url']
        }]
    });
    return project ? project.members : [];
}

async function addProjectMember(projectId, userId, role = 'MEMBER') {
    return await Project_Members.findOrCreate({
        where: { project_id: projectId, user_id: userId },
        defaults: { role: role }
    });
}

export {
    createProject,
    deleteProject,
    getMyProjects,
    getAllProjects,
    getProjectStats,
    getProjectById,
    isUserInProject,
    archiveProject,
    getProjectMembers,
    addProjectMember
}

