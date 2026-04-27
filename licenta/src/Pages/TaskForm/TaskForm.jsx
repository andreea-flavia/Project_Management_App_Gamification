import './TaskForm.css';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api.js';
import { Link } from 'react-router-dom';


const TaskForm = () => {
    // const navigate = useNavigate();
    const [task, setTask] = useState({ 
        task_title: '', 
        task_description: '', 
        status: '', 
        priority: '', 
        tags: [],
        xp_points: 0  // Inițializare XP points
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
    
    //NOTITA VIRTUALA: fac o ruta in router, daca statusul e completed, i se atribuie xp userului (al carui id il pot lua din localStorage) si se verifica daca a depasit xp ul maxim pe nivelul respectiv cu formula 100 * nivel^2,
    // daca da, se incrementeaza nivelul si se reseteaza xp ul curent la 0, iar xp ul total se pastreaza (pentru statistici), daca taskul e marcat ca completed, nu mai poate fi editat

    useEffect (() => {
        const fetchData = async() => {
            try{
                if (id) {
                    const r = await api.get(`/task/${id}`);
                    setTask(r.data);
                    setSelectedTagIds(r.data.tags?.map(tag => tag.tag_id) || []);
                    setInitialStatus(r.data.status);
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
                [name]: name === 'status' || name === 'priority' || name === 'xp_points'
                    ? (value ? parseInt(value, 10) : (name === 'xp_points' ? 0 : ''))
                    : value
            }));
        } catch (e) {
            console.error('Error: ', e);
        }
    };

    const isCompleted = task.status === 4;
    const user_id = localStorage.getItem("user_id");

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');

        if (!task.task_title.trim() || !task.task_description.trim() || !task.status || !task.priority) {
            setError("Error: Complete all fields!");
            return;
        }

        if(task.end_date && task.start_date && new Date(task.end_date) < new Date(task.start_date)){
            setError("Error: The deadline cannot be before the start date!");
            return;
        }

        // Validare XP: trebuie să fie număr și >= 0 (0 este valid!)
        if(task.xp_points === null || task.xp_points === undefined || isNaN(task.xp_points) || task.xp_points < 0){
            setError("Error: Invalid XP points!");
            return;
        }

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
                    //fac upd la task
                    await api.put(`/task/${id}`, task);
                    alert('Task updated successfully!');

                    //adaug xp la user
                    if(task.status === 4 && initialStatus !== 4){  //daca statusul a fost schimbat la completed, atunci adaug xp, altfel nu
                        const r = await api.patch(`/user_stats/${user_id}`, {
                            xp: task.xp_points || 0,
                            w_coins: task.xp_points ? Math.floor(task.xp_points / 10) : 0  // coins = nr xp / 10
                        });
                        

                        console.log('XP update result:', r.data);
                    }

                } else {
                    await api.post('/task', task);
                    alert('Task created successfully!');
                }
                // navigate('/tasks');
                
            } catch (e) {
                console.error('Error saving task:', e);
                alert('Unable to save task.');
                const m = e.response?.data?.error || 'Error occurred while saving the task';
                setError(m);
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
                    {initialStatus !== 4 &&(
                        <button className='btn_commit'  onClick={handleSave} >  {/*to={`/tasks`}*/}
                            Commit Changes {'>>'} 
                        </button>
                    )}
                    {initialStatus === 4 &&(
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
                                disabled={isCompleted}
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
                                disabled={isCompleted}
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
                                disabled={isCompleted}
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
                                disabled={isCompleted}
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
                                disabled={isCompleted}
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
                                             disabled={isCompleted}
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
                                disabled={isCompleted}
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