import './TaskForm.css';
import { data, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api.js';
import { Link, useNavigate } from 'react-router-dom';


const TaskForm = () => {
    const navigate = useNavigate();
    const [task, setTask] = useState({ task_title: '', task_description: '', status: '', priority: '', tags: [] });
    // const [loading] = useState(true);
    const { id } = useParams();
    // const navigate = useNavigate();
    const [statusOptions, setStatusOptions] = useState([]);
    const [priorityOptions, setPriorityOptions] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);

    // const [initialStatus, setInitialStatus] = useState();
    
    //NOTITA VIRTUALA: fac o ruta in router, daca statusul e completed, i se atribuie xp userului (al carui id il pot lua din localStorage) si se verifica daca a depasit xp ul maxim pe nivelul respectiv cu formula 100 * nivel^2,
    // daca da, se incrementeaza nivelul si se reseteaza xp ul curent la 0, iar xp ul total se pastreaza (pentru statistici), daca taskul e marcat ca completed, nu mai poate fi editat

    useEffect (() => {
        const fetchData = async() => {
            try{
                if (id) {
                    const r = await api.get(`/task/${id}`);
                    setTask(r.data);
                    setSelectedTagIds(r.data.tags?.map(tag => tag.tag_id) || []);
                }

                const [statusRes, priorityRes, tagsRes] = await Promise.all([
                    api.get('/statuses'),
                    api.get('/priorities'),
                    api.get('/tags')
                ]);

                setStatusOptions(statusRes.data);
                setPriorityOptions(priorityRes.data);
                setAllTags(tagsRes.data);
            } catch(e){
                console.error('Error fetching task data:', e);
            }
        }
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        try {
            const { name, value } = e.target;
            setTask(prev => ({
                ...prev,
                [name]: name === 'status' || name === 'priority'
                    ? (value ? parseInt(value, 10) : '')
                    : value
            }));
        } catch (e) {
            console.error('Error: ', e);
        }
    };

    const isLocked = task.status === 4;

    const handleSave = async (e) => {
        e.preventDefault();
        var mesaj_status= "";
        if(task.status === 4){
            mesaj_status =  'Mark this task as completed?';
        }
        else {
            mesaj_status = 'Save changes to this task?';
        }
        const confirm_panel = window.confirm(mesaj_status);
        // console.log(initialStatus, ',' , task.status);
        if(confirm_panel){
            try {
                if (id) {
                    await api.put(`/task/${id}`, task);
                    alert('Task updated successfully!');
                } else {
                    await api.post('/task', task);
                    alert('Task created successfully!');
                }
                // navigate('/tasks');
                
            } catch (e) {
                console.error('Error saving task:', e);
                alert('Unable to save task.');
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
                    <button className='btn_commit'  onClick={handleSave} disabled={isLocked}>  {/*to={`/tasks`}*/}
                        Commit Changes {'>>'} 
                    </button>
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
                                disabled={isLocked}
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
                                disabled={isLocked}
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
                                disabled={isLocked}
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
                                disabled={isLocked}
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
                                disabled={isLocked}
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
                                             disabled={isLocked}
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
                                value={task.xp_points || ''}
                                onChange={handleChange}
                                name="xp_points"
                                disabled={isLocked}
                            />
                        </div>

                        <div className='s1_section'>
                            <label className="section_label">Part of project</label>
                        </div>

                        <div className='s1_section'>
                            <label className="section_label">Assigned Member</label>
                        </div>

                        <div className='s1_section'>
                            <label className="section_label">Assigned Team</label>
                        </div>

                        
                    </div>
                </div>

                <div className="comments_section">
                    <h2>Comments</h2>
                    <p className='no_comments'>No comments yet.</p>
                </div>

            </div>

        </main>
    );
}

export default TaskForm