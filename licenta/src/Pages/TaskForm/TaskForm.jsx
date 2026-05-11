import './TaskForm.css';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api.js';
import { Link, useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles.js';


const TaskForm = () => {
    const navigate = useNavigate();
    const getToday = () => new Date().toISOString().split('T')[0];
    const getTomorrow = () => {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        return t.toISOString().split('T')[0];
    }
    const [task, setTask] = useState({
        task_title: '',
        task_description: '',
        status: 1,
        priority: 1,
        tags: [],
        xp_points: 0,
        start_date: getToday(),
        end_date: getTomorrow(),
        project_id: 6
    });
    // const [loading] = useState(true);
    const { id } = useParams();
    // const navigate = useNavigate();
    const [statusOptions, setStatusOptions] = useState([]);
    const [priorityOptions, setPriorityOptions] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);

    const [initialStatus, setInitialStatus] = useState();
    const [error, setError] = useState('');

    const userRole = localStorage.getItem('user_role');
    // const userId = localStorage.getItem('user_id');

    const [logs, setLogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

    //NOTITA VIRTUALA: fac o ruta in router, daca statusul e completed, i se atribuie xp userului (al carui id il pot lua din localStorage) si se verifica daca a depasit xp ul maxim pe nivelul respectiv cu formula 100 * nivel^2,
    // daca da, se incrementeaza nivelul si se reseteaza xp ul curent la 0, iar xp ul total se pastreaza (pentru statistici), daca taskul e marcat ca completed, nu mai poate fi editat

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (id) {
                    const r = await api.get(`/task/${id}`);
                    setTask(r.data);
                    setSelectedTagIds(r.data.tags?.map(tag => tag.tag_id) || []);
                    setInitialStatus(r.data.status);

                    if (userRole === ROLES.ADMIN) {
                        try {
                            const logsResponse = await api.get(`/logs/${id}`);
                            setLogs(logsResponse.data);
                        } catch (e) {
                            console.error("Error fetching logs:", e);
                        }
                    }
                }
                try {
                    const statusRes = await api.get('/statuses/TASK');
                    setStatusOptions(statusRes.data);
                } catch (e) {
                    console.error('Error fetching statuses:', e);
                }
                try {
                    const priorityRes = await api.get('/priorities/TASK');
                    setPriorityOptions(priorityRes.data);
                } catch (e) {
                    console.error('Error fetching priorities:', e);
                }
                try {
                    const tagsRes = await api.get('/tags');
                    setAllTags(tagsRes.data);
                } catch (e) {
                    console.error('Error fetching tags:', e);
                }
                try {
                    const projectRes = await api.get('/my-projects');
                    setProjects(projectRes.data);
                } catch (e) {
                    console.error('Error fetching projects:', e);
                }
                if (userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) {
                    try {
                        const usersRes = await api.get('/user');
                        setUsers(usersRes.data);
                    } catch (e) {
                        console.error('Error fetching users:', e);
                    }
                }
            } catch (e) {
                console.error('Error fetching task data:', e);
            }
        }
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        try {
            const { name, value } = e.target;
            setTask(prev => {
                const updatedTask = {
                    ...prev,
                    [name]: name === 'status' || name === 'priority' || name === 'xp_points' || name === 'project_id' || name === 'assigned_to'
                        ? (value ? parseInt(value, 10) : (name === 'xp_points' ? 0 : ''))
                        : value
                };
                // if (name === 'assigned_to' && (value === '' || value === null)) {
                //     updatedTask.status = 1;
                // }
                if (name === 'assigned_to') {
                    if (value === '' || value === null) {
                        updatedTask.status = 1;
                    } else {
                        updatedTask.status = 2;
                    }
                }
                return updatedTask;
            });
        } catch (e) {
            console.error('Error: ', e);
        }
    };


    const isCompleted = initialStatus === 4;
    const user_id = localStorage.getItem("user_id");
    const isViewOnly = userRole === ROLES.STANDARD && task.assigned_to !== parseInt(user_id);

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');

        if (!task.task_title.trim() || !task.task_description.trim() || !task.status || !task.priority) {
            setError("Error: Complete all fields!");
            return;
        }
        if (task.end_date && task.start_date && new Date(task.end_date) < new Date(task.start_date)) {
            setError("Error: The deadline cannot be before the start date!");
            return;
        }
        if (task.xp_points === null || task.xp_points === undefined || isNaN(task.xp_points) || task.xp_points < 0) {
            setError("Error: Invalid XP points!");
            return;
        }

        var mesaj_status = "";
        if (task.status === 4) {
            mesaj_status = 'Mark this task as completed?';
        }
        else {
            mesaj_status = 'Save changes to this task?';
        }
        const confirm_panel = window.confirm(mesaj_status);
        // console.log(initialStatus, ',' , task.status);
        if (confirm_panel) {
            try {
                const taskToSave = { ...task };

                if (taskToSave.assigned_to === '') {
                    taskToSave.assigned_to = null;
                }
                if (taskToSave.project_id === '') {
                    taskToSave.project_id = null;
                }

                if (id) {
                    //fac upd la task
                    const response = await api.put(`/task/${id}`, taskToSave);
                    setTask(response.data);

                    const logsResponse = await api.get(`/logs/${id}`);
                    setLogs(logsResponse.data);
                    alert('Task updated successfully!');
                    window.location.reload();

                } else {
                    const response = await api.post('/task', taskToSave);
                    setTask(response.data);
                    navigate('/tasks');
                }
                // navigate('/tasks');

            } catch (error) {
                console.error('Error saving task:', error);
                if (error.response?.status === 409) {
                    alert("Attention! This task has been modified by another user. Refresh the page to see the changes!")
                } else {
                    alert(error.response?.data?.error || "An error occurred");
                    const m = error.response?.data?.error || 'Error occurred while saving the task';
                    setError(m);
                }
            }
        }

    };

    const handleDelete = async (e) => {
        e.preventDefault();
        const isConfirmed = window.confirm("Are you sure you want to delete this task? This action cannot be undone.");
        if (isConfirmed) {
            try {
                if (id) {
                    await api.delete(`/task/${id}`);
                    alert('Task deleted successfully!');
                    navigate('/tasks');
                }
                else {
                    navigate('/tasks');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                if (error.response?.status === 403) {
                    alert("You don't have permission to delete tasks.");
                } else {
                    alert('Unable to delete task.');
                }
            }
        }
    };

    const handleTagToggle = (tagId) => {
        setSelectedTagIds(prev => {
            const next = prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId];

            setTask(prevTask => ({
                ...prevTask,
                tags: allTags.filter(tag => next.includes(tag.tag_id))
            }));

            return next;
        });
    };

    return (
        <main className="main_content">
            <div className='header_section'>
                <div className='action_buttons'>
                    <Link className='btn_back' to={`/tasks`}>
                        {'<<'} Back
                    </Link>
                    {initialStatus !== 4 && !isViewOnly && (
                        <div>
                            {/* <button className='btn_delete_task' onClick={handleDelete}>
                                Delete task
                            </button> */}

                            <button className='btn_commit' onClick={handleSave} >  {/*to={`/tasks`}*/}
                                Commit Changes {'>>'}
                            </button>
                        </div>
                    )}
                    {initialStatus === 4 && (
                        <div className='label_task_completed'> {'<<'} Task already completed {'>>'} </div>
                    )}

                    {error && (
                        <div className="task_error_text">
                            {error}
                        </div>
                    )}
                </div>
                <h1 className='header_title'>{id ? `Editing task ID: #${id}` : 'Create a new task'}</h1>
                <div className="status_line">
                    <div className='line'></div>
                </div>

                <div className='form_section'>
                    <div className='section_1'>
                        {/* Task title & description */}
                        <div className='s1_section'>
                            <label className="section_label">Task Name</label>
                            <input
                                name="task_title"
                                value={task.task_title || ''}
                                onChange={handleChange}
                                className='s1_input'
                                disabled={isCompleted || isViewOnly}
                            />
                        </div>

                        <div className='s1_section'>
                            <   label className="section_label">Task Description</label>
                            <textarea
                                name="task_description"
                                value={task.task_description || ''}
                                onChange={handleChange}
                                className='s1_input'
                                rows="10"
                                disabled={isCompleted || isViewOnly}
                            />
                        </div>

                    </div>

                    <div className='section_2'>
                        <div className='s1_section'>
                            <label className="section_label">Starting Date</label>
                            <input
                                type="date"
                                className='s1_input'
                                value={task.start_date ? task.start_date.split('T')[0] : ''}
                                onChange={handleChange}
                                name="start_date"
                                disabled={isCompleted || isViewOnly}
                            />
                        </div>


                        <div className='s1_section'>
                            <label className="section_label">Deadline</label>
                            <input
                                type="date"
                                className='s1_input'
                                value={task.end_date ? task.end_date.split('T')[0] : ''}
                                onChange={handleChange}
                                name="end_date"
                            />
                        </div>
                    </div>

                    <div className='section_3'>
                        <div className='s1_section'>
                            <label className="section_label">Priority</label>
                            <select
                                className='s1_input'
                                value={task.priority || ''}
                                name="priority"
                                onChange={handleChange}
                                disabled={isCompleted || isViewOnly}
                            >
                                <option value="" disabled>Select priority</option>
                                {priorityOptions.map(op => (
                                    <option key={op.priority_id} value={op.priority_id}>{op.priority_name}</option>
                                ))}
                            </select>

                        </div>


                        <div className='s1_section'>
                            <label className="section_label">Status</label>
                            <select
                                className='s1_input'
                                value={task.status || ''}
                                name="status"
                                onChange={handleChange}
                                disabled={isCompleted || isViewOnly}
                            >
                                <option value="" disabled>Select status</option>
                                {statusOptions.map(op => (
                                    <option key={op.status_id} value={op.status_id}>{op.status_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='section_4'>
                        <label className="section_label">All tags</label>
                        <div className='tag_list'>
                            {allTags.length > 0 ? (
                                allTags.map(tag => {
                                    const selected = selectedTagIds.includes(tag.tag_id);
                                    return (
                                        <button
                                            type='button'
                                            key={tag.tag_id}
                                            className={`tag_chip ${selected ? 'active' : ''}`}
                                            //  style={{ backgroundColor: tag.color || '#424242' }}
                                            onClick={() => handleTagToggle(tag.tag_id)}
                                            disabled={isCompleted || isViewOnly}
                                        >
                                            {tag.tag_name}
                                        </button>
                                    );
                                })
                            ) : (
                                <p className='no_tags'>No tags available</p>
                            )}
                        </div>
                    </div>

                    <div className='section_5'>
                        {/* <label className="section_label">XP Points, Assigned to, Teams, Project</label> */}
                        <div className='section_xp'>
                            <label className="section_label_xp">XP Points</label>
                            <input
                                type="number"
                                className='input_xp'
                                value={task.xp_points}
                                onChange={handleChange}
                                name="xp_points"
                                disabled={isCompleted || userRole === ROLES.STANDARD}
                            />
                        </div>

                        <div className='s1_section'>
                            <label className="section_label">Part of project</label>
                            <select
                                className='s1_input'
                                name="project_id"
                                value={task.project_id || ''}
                                onChange={handleChange}
                                disabled={isCompleted || userRole === ROLES.STANDARD}
                            >
                                <option value="" disabled>Select a project</option>
                                {projects.map(project => (
                                    <option key={project.project_id} value={project.project_id}>
                                        {project.project_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='s1_section'>
                            <label className="section_label">Assigned Member</label>
                            <select
                                className='s1_input'
                                name="assigned_to"
                                value={task.assigned_to || ''}
                                onChange={handleChange}
                                disabled={isCompleted || userRole === ROLES.STANDARD}
                            >
                                <option value="">Unassigned</option>
                                {users.map(user => (
                                    <option key={user.user_id} value={user.user_id}>
                                        {user.username}
                                    </option>
                                ))}
                                {userRole === ROLES.STANDARD && task.assigned_to && !users.find(u => u.user_id === task.assigned_to) && (
                                    <option value={task.assigned_to}>
                                        {task.assignedUser?.username || `Operative #${task.assigned_to}`}
                                    </option>
                                )}
                            </select>
                        </div>


                        {(userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) && id && (
                            <div>

                                <div>
                                    <button className='btn_delete_task' onClick={handleDelete}>
                                        DELETE TASK
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                <div className="comments_section">
                    <h2>Comments</h2>
                    <p className='no_comments'>No comments yet.</p>
                </div>

                {userRole === ROLES.ADMIN && (
                    <div className="comments_section">
                        <h2>Audit Logs</h2>
                        {logs.length > 0 ? (
                            <table className='logs_table'>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>User ID</th>
                                        <th>Username</th>
                                        <th>Action</th>
                                        <th>Entity Type</th>
                                        <th>Entity ID</th>
                                        <th>Modification Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.log_id}>
                                            <td>{new Date(log.createdAt).toLocaleString('ro-RO')}</td>
                                            <td><strong>{log.user_id}</strong></td>
                                            <td><strong>{log.User.username}</strong></td>
                                            <td>{log.action}</td>
                                            <td>{log.entity_type}</td>
                                            <td>#{log.entity_id}</td>
                                            <td className="details_cell">
                                                {log.details ? (
                                                    <details>
                                                        <summary>See data</summary>
                                                        <pre>{JSON.stringify(JSON.parse(log.details), null, 2)}</pre>
                                                    </details>
                                                ) : (
                                                    <span className="no_details">No logs yet.</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No logs yet.</p>
                        )
                        }
                    </div>
                )}

            </div>

        </main>
    );
}

export default TaskForm