import './ProjectForm.css';
import { useState, useEffect } from 'react';
import api from '../../api.js';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles.js';

const ProjectForm = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const getToday = () => new Date().toISOString().split('T')[0];
    const getTomorrow = () => {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        return t.toISOString().split('T')[0];
    }
    const [project, setProject] = useState({
        project_name: '',
        project_description: '',
        start_date: getToday(),
        end_date: getTomorrow(),
        status: 11,
        priority: 1
    });
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [statusMap, setStatusMap] = useState({});
    const [statusColorMap, setStatusColorMap] = useState({});
    const [taskStatusMap, setTaskStatusMap] = useState({});
    const [taskStatusColorMap, setTaskStatusColorMap] = useState({});
    const [priorityMap, setPriorityMap] = useState({});
    const [usersMap, setUsersMap] = useState({});
    const [members, setMembers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const userRole = localStorage.getItem('user_role');
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (id) {
                    const r = await api.get(`/project/${id}`);
                    setProject(r.data);
                    // const logsResponse = await api.get(`/logs/${id}`);
                    // setLogs(logsResponse.data);
                    if (userRole === ROLES.ADMIN) {
                        try {
                            const logsResponse = await api.get(`/logs/${id}`);
                            setLogs(logsResponse.data);
                        } catch (logError) {
                            console.error('Error fetching logs:', logError);
                        }
                    }

                    const statsResponse = await api.get(`/project/${id}/stats`);
                    setStats(statsResponse.data);

                    const statusesRes = await api.get('/statuses/PROJECT');
                    const sMap = {};
                    const sColorMap = {};
                    statusesRes.data.forEach(s => {
                        sMap[s.status_id] = s.status_name;
                        sColorMap[s.status_id] = s.color;
                    });
                    setStatusMap(sMap);
                    setStatusColorMap(sColorMap);

                    // Fetch data for tasks table
                    const [taskStatusesRes, prioritiesRes, usersRes] = await Promise.all([
                        api.get('/statuses/TASK'),
                        api.get('/priorities/TASK'),
                        api.get('/user')
                    ]);

                    const tsMap = {};
                    const tsColorMap = {};
                    taskStatusesRes.data.forEach(s => {
                        tsMap[s.status_id] = s.status_name;
                        tsColorMap[s.status_id] = s.color;
                    });
                    setTaskStatusMap(tsMap);
                    setTaskStatusColorMap(tsColorMap);

                    const pMap = {};
                    prioritiesRes.data.forEach(p => {
                        pMap[p.priority_id] = p.priority_name;
                    });
                    setPriorityMap(pMap);

                    const uMap = {};
                    usersRes.data.forEach(u => {
                        uMap[u.user_id] = u.username;
                    });
                    setUsersMap(uMap);

                    // Fetch members
                    const membersRes = await api.get(`/project/${id}/members`);
                    setMembers(membersRes.data);
                }
            } catch (e) {
                console.error('Error fetching task data:', e);
            }
        }
        fetchData();
    }, [id]);

    const calculateDaysRemaining = (endDateStr) => {
        if (!endDateStr) return 0;
        const endDate = new Date(endDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleAddMember = async () => {
        if (!selectedUser) return;
        try {
            await api.post(`/project/${id}/members`, { userId: selectedUser });
            // Refresh members
            const membersRes = await api.get(`/project/${id}/members`);
            setMembers(membersRes.data);
            setSelectedUser('');
        } catch (e) {
            console.error('Error adding member:', e);
        }
    };

    const handleFinishProject = async () => {
        if (window.confirm("Are you sure you want to finish this project?")) {
            try {
                await api.put(`/project/${id}/close`);
                // Refresh data
                const projectRes = await api.get(`/project/${id}`);
                setProject(projectRes.data);
            } catch (error) {
                console.error("Error finishing project:", error);
            }
        }
    };

    const daysRemaining = calculateDaysRemaining(project.end_date);
    const isOverdue = daysRemaining < 0;
    const formattedEndDate = project.end_date
        ? project.end_date.split('T')[0].replace(/-/g, '.')
        : 'NO DATE';

    return (
        <main className='prj_form_main'>
            <Link className="prj_form_btn_back" to={`/projects`}>
                {'<<'} Back
            </Link>
            <section className="prj_form_header_container">
                <div className="prj_form_header_flex">
                    <div>
                        <h1 className="prj_form_project_title">
                            {project.project_name || 'TITLE'}
                        </h1>
                        <span className="prj_form_system_log">
                            {project.project_description || 'DESCRIPTION'}
                        </span>
                    </div>
                    {(userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) && project.status !== 12 && (
                        <button className="prj_form_btn_finish" onClick={handleFinishProject}>
                            FINISH PROJECT
                        </button>
                    )}
                </div>
            </section>

            <section>
                <div class="prj_form_parent">
                    <div class="prj_form_div1 ">
                        <label className="prj_form_status_label">Target Date</label>
                        <div className="prj_form_status_value">{formattedEndDate}</div>
                        <div className={`prj_form_status_meta ${isOverdue ? 'prj_form_overdue' : ''}`}>
                            {isOverdue ? `OVERDUE BY ${Math.abs(daysRemaining)} DAYS` : `T-MINUS ${daysRemaining} DAYS`}
                        </div>
                    </div>
                    <div className="prj_form_div2">
                        <label className="prj_form_status_label">Current Status</label>
                        <div
                            className="prj_form_status_value"
                            style={{ color: statusColorMap[project.status] || '#fff' }}
                        >
                            {statusMap[project.status] || 'NO STATUS'}
                        </div>
                        <div className="prj_form_status_meta">
                            {stats.pending} REMAINING / {stats.total} TOTAL TASKS
                        </div>
                    </div>
                    <div className="prj_form_div3 prj_tasks_section">
                        <div className="prj_tasks_header">
                            <span className="prj_tasks_title">PROJECT TASKS</span>
                            {(userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) && (
                                <Link
                                    to={`/tasks/new`}
                                    className="prj_form_btn_back prj_btn_small"
                                >
                                    + NEW TASK
                                </Link>
                            )}
                        </div>
                        <table className="prj_tasks_table">
                            <thead>
                                <tr>
                                    <th>TITLE</th>
                                    <th>DESCRIPTION</th>
                                    <th>ASSIGNED TO</th>
                                    <th>PRIORITY</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.Tasks && project.Tasks.map(task => (
                                    <tr className='prj_form_table_row'
                                        key={task.task_id}
                                        onClick={() => navigate(`/tasks/edit/${task.task_id}`)}
                                    >
                                        <td>{task.task_title}</td>
                                        <td>{task.task_description}</td>
                                        <td>{usersMap[task.assigned_to] || 'UNASSIGNED'}</td>
                                        <td>{priorityMap[task.priority] || 'N/A'}</td>
                                        <td style={{ color: taskStatusColorMap[task.status] || '#fff', fontWeight: 'bold' }}>
                                            {taskStatusMap[task.status] || 'NO STATUS'}
                                        </td>
                                    </tr>
                                ))}
                                {(!project.Tasks || project.Tasks.length === 0) && (
                                    <tr>
                                        <td colSpan="5" className="prj_no_data">No tasks found for this project.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="prj_form_div4 prj_team_panel">
                        <h3 className="prj_form_status_label">Project Team</h3>
                        <div className="prj_members_list">
                            {members.map(member => (
                                <div key={member.user_id} className="prj_member_item">
                                    <div className="prj_member_avatar">
                                        {member.picture_url ? (
                                            <img src={member.picture_url} alt="Profile" className="prj_member_img" />
                                        ) : (
                                            <>{member.user_first_name?.[0]}{member.user_last_name?.[0]}</>
                                        )}
                                    </div>
                                    <div className="prj_member_info">
                                        <div className="prj_member_name">{member.user_first_name} {member.user_last_name}</div>
                                        <div className="prj_member_role">{member.Project_Members?.role || 'MEMBER'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) && (
                            <div className="prj_add_member_section">
                                <h4 className="prj_form_status_label prj_add_member_title">Add Member</h4>
                                <div className="prj_add_member_form">
                                    <select
                                        className="prj_form_select"
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                    >
                                        <option value="">Select User</option>
                                        {Object.entries(usersMap).map(([uid, name]) => {
                                            if (members.some(m => m.user_id === parseInt(uid))) return null;
                                            return <option key={uid} value={uid}>{name}</option>
                                        })}
                                    </select>
                                    <button className="prj_form_btn_add" onClick={handleAddMember}>ADD TO TEAM</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* <p>
                {project.project_name}
            </p> */}
        </main>

    )
}

export default ProjectForm;