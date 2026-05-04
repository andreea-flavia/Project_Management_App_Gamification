import './Projects.css';
import { useState, useEffect } from 'react';
import api from '../../api.js';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMap, setStatusMap] = useState({});

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const [projectsRes, statusesRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/statuses')
                ]);

                const sMap = {};
                statusesRes.data.forEach(s => {
                    sMap[s.status_id] = s.status_name;
                });

                setStatusMap(sMap);
                setProjects(projectsRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data: ", error);
                setLoading(error);
            }
        };
        fetchProjects();
    }, []);


    return (
        <main className='prj_main_content'>
            <section className='prj_header_section'>
                <div className="prj_title_block">
                    <p className="prj_system_code">SYSTEM_OVERVIEW</p>
                    <h2 className="prj_main_title">MY PROJECTS</h2>
                </div>
                <div className="prj_stats_row">
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
                    {projects.map((proj, index) => (
                        <div key={proj.project_id || index} className="project_card">
                            <div className="prj_card_header">
                                <div className="prj_icon_box">
                                    <span className="material-symbols-outlined icon_filled">
                                        {'deployed_code'}
                                    </span>
                                </div>
                                <span className="prj_status_badge">{statusMap[proj.status] || 'NO_STATUS'}</span>
                            </div>

                            <h3 className="project_name">{proj.project_name || 'NEURAL_INTERFACE_V2'}</h3>
                            <p className="project_desc">{proj.project_description || 'Biometric integration for high-fidelity lens projection systems.'}</p>

                            <div className="prj_card_footer">
                                <div className="prj_load_info">
                                    <span className="prj_load_label">TASK_LOAD </span>
                                    <span className="prj_load_value"> --!!-- REMAINING </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </main>
        // <div>
        //     <p>My projects</p>
        //     {loading ? (
        //         <p>Loading projects...</p>
        //     ) : (
        //         <ul>
        //             {projects.map((proj) => (
        //                 <li key={proj.project_id}>
        //                     {proj.project_name}
        //                 </li>
        //             ))}
        //         </ul>
        //     )}
        // </div>
    )
}

export default Projects;