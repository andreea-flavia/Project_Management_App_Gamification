import './Projects.css';
import { useState, useEffect } from 'react';
import api from '../../api.js';
import { Link, useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles.js';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMap, setStatusMap] = useState({});
    const [statusColorMap, setStatusColorMap] = useState({});
    const [priorityMap, setPriorityMap] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        project_name: '',
        project_description: '',
        priority: 1,
        end_date: ''
    });

    const userRole = localStorage.getItem('user_role');
    const navigate = useNavigate();


    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const [projectsRes, statusesRes, prioritiesRes] = await Promise.all([
                    api.get('/my-projects'),
                    api.get('/statuses/PROJECT'),
                    api.get('/priorities/TASK')
                ]);

                const sMap = {};
                const sColorMap = {};
                statusesRes.data.forEach(s => {
                    sMap[s.status_id] = s.status_name;
                    sColorMap[s.status_id] = s.color;
                });
                setStatusColorMap(sColorMap);
                setStatusMap(sMap);

                const pMap = {};
                prioritiesRes.data.forEach(p => {
                    pMap[p.priority_id] = p.priority_name;
                });
                setPriorityMap(pMap);

                setProjects(projectsRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data: ", error);
                setLoading(error);
            }
        };
        fetchProjects();
    }, []);


    const handleOnProjectClick = (projectId) => {
        navigate(`/projects/edit/${projectId}`);
    }

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newProject,
                start_date: new Date().toISOString().split('T')[0],
                status: 11
            };
            const response = await api.post('/project', payload);
            setIsModalOpen(false);
            setNewProject({
                project_name: '',
                project_description: '',
                priority: 1,
                end_date: ''
            });
            navigate(`/projects/edit/${response.data.project_id}`);
        } catch (error) {
            console.error("Error creating project:", error);
        }
    }




    return (
        <main className='prj_main_content'>
            <section className='prj_header_section'>
                <div className="prj_title_block">
                    <p className="prj_system_code">SYSTEM_OVERVIEW</p>
                    <h2 className="prj_main_title">MY PROJECTS</h2>
                </div>
                <div className="prj_stats_row">
                    {(userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) && (
                        <button className='new_project_btn' onClick={() => setIsModalOpen(true)}>
                            <span className="material-symbols-outlined">add</span>
                            <span className='btn_text_add_project'>NEW Project</span>
                        </button>
                    )}
                    <div className="prj_stat_box">
                        <span className="prj_stat_label">TOTAL_PROJECTS</span>
                        <span className="prj_stat_value">{projects.length}</span>
                    </div>
                    <div className="prj_stat_box">
                        <span className="prj_stat_label">ACTIVE_PROJECTS</span>
                        <span className="prj_stat_value accent_text">{projects.filter(p => p.status === 11).length}</span>
                    </div>
                </div>
            </section>

            <section className='prj_main_section'>
                <div className="prj_matrix_grid">
                    {projects.map((proj, index) => {
                        const taskList = proj.Tasks || [];
                        const totalTasks = taskList.length;
                        const completedTasks = taskList.filter(t => t.status === 4).length;
                        const remainingTasks = totalTasks - completedTasks;
                        return (
                            <div key={proj.project_id || index} className="project_card" onClick={() => handleOnProjectClick(proj.project_id)}>
                                <div className="prj_card_header">
                                    <div className="prj_icon_box">
                                        <span className="material-symbols-outlined icon_filled">
                                            {'deployed_code'}
                                        </span>
                                    </div>
                                    <span
                                        className="prj_status_badge"
                                        style={{
                                            color: statusColorMap[proj.status] || '#444',
                                            border: `1px solid ${statusColorMap[proj.status] || '#444'}`,
                                            boxShadow: `0 0 10px ${statusColorMap[proj.status] || '#444'}`
                                        }}
                                    >
                                        {statusMap[proj.status] || 'NO_STATUS'}
                                    </span>
                                </div>

                                <h3 className="project_name">{proj.project_name || 'NEURAL_INTERFACE_V2'}</h3>
                                <p className="project_desc">{proj.project_description || 'Biometric integration for high-fidelity lens projection systems.'}</p>

                                <div className="prj_card_footer">
                                    <div className="prj_load_info">
                                        <span className="prj_load_label">TASK_LOAD </span>
                                        <span className="prj_load_value">{remainingTasks} REMAINING | {totalTasks} TOTAL</span>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    )}
                </div>
            </section>

            {isModalOpen && (
                <div className="prj_modal_overlay">
                    <div className="prj_modal_content">
                        <div className="prj_modal_header">
                            <h3>INITIATE_NEW_PROJECT</h3>
                            <button className="prj_modal_close" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateProject} className="prj_modal_form">
                            <div className="prj_form_group">
                                <label>PROJECT_NAME</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter project title..."
                                    value={newProject.project_name}
                                    onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                                />
                            </div>
                            <div className="prj_form_group">
                                <label>DESCRIPTION</label>
                                <textarea
                                    placeholder="Short project overview..."
                                    value={newProject.project_description}
                                    onChange={(e) => setNewProject({ ...newProject, project_description: e.target.value })}
                                />
                            </div>
                            <div className="prj_form_row">
                                <div className="prj_form_group">
                                    <label>PRIORITY</label>
                                    <select
                                        value={newProject.priority}
                                        onChange={(e) => setNewProject({ ...newProject, priority: parseInt(e.target.value) })}
                                    >
                                        {Object.entries(priorityMap).map(([id, name]) => (
                                            <option key={id} value={id}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="prj_form_group">
                                    <label>TARGET_DATE</label>
                                    <input
                                        type="date"
                                        required
                                        value={newProject.end_date}
                                        onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="prj_modal_footer">
                                <button type="button" className="prj_btn_cancel" onClick={() => setIsModalOpen(false)}>CANCEL</button>
                                <button type="submit" className="prj_btn_create">CREATE_PROJECT</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </main>
    )
}

export default Projects;