import Projects from '../entities/Projects.js';
import Project_Members from '../entities/Project_Members.js';


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
            as: 'projects'
        }]
    });
    if (!user) return [];
    return user.projects;
}

async function getAllProjects() {
    return await Projects.findAll();
}

export {
    createProject,
    deleteProject,
    getMyProjects,
    getAllProjects
}

