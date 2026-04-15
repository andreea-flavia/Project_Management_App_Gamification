import './Tasks.css';
import { useState,useEffect } from 'react';
import api from '../../api.js';

const Tasks =() => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sMap, setSMap] = useState({});
    const [pMap, setPMap] = useState({});
    const [pColorMap, setPColorMap] = useState({});


    useEffect( () => {
        const fetch = async () => {
            try{
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                    console.error('No user ID found');
                    setLoading(false);
                    return;
                }
                const r = await api.get(`/tasks/user/${userId}`);
                setTasks(r.data);

                const statusR = await api.get('/statuses');
                const sMap = {};
                statusR.data.forEach(s => {
                    sMap[s.status_id] = s.status_name;
                });
                setSMap(sMap);

                const priorityR = await api.get('/priorities');
                const pMap = {};
                priorityR.data.forEach(p => {
                    pMap[p.priority_id] = p.priority_name;
                });
                setPMap(pMap);

                const pColorMap = {};
                priorityR.data.forEach(p => {
                    pColorMap[p.priority_id] = p.color;
                });
                setPColorMap(pColorMap);

                setLoading(false);
            } catch(e) {
                console.error('Error fetching tasks:', e);
                setLoading(false);
            }
        }
        fetch();
    }, []);

    const formatareData = (date) => {
        if(!date) return 'No Deadline Specified';
        const d = new Date(date);
        return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    };


    // const getStatusName = (id) => {
    //     const gasit = status
    // }

    if(loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className='tasks_main'>
            <section className="title_section">
                <h2 className='title'>TASKS</h2>
                <div className="status_line">
                    <div className='line'></div>
                    <span>SYSTEM ACTIVE OPERATIONS</span>
                </div>
            </section>
            
            <section className="metrics_section">
                {/* DE COMPLETAT LATER */}
            </section>

            <button className='btn_add_task'>
                <span className="material-symbols-outlined">add</span>
                <span className='btn_text'>New Task</span>
            </button>

            <section className="tasks_section">
                {tasks.length > 0 ? (
                    tasks.map( (task) => (
                        <div key={task.task_id} className='task_row'>
                            <div className='task_info'>
                                <h4>{task.task_title}</h4>
                                <p>{task.task_description}</p>
                                <p>tagurile</p>
                            </div>
                            <div className='task_status'>
                                <div className="tag" style={{ backgroundColor: pColorMap[task.priority] || '#7a7878' }}>
                                    {/* {task.priority_name || task.priority} */}
                                    {pMap[task.priority] || task.priority}
                                </div>
                                <div className="status_text">
                                    <p className="label">Status</p>
                                    {/* <p className="val">{task.status_name || task.status}</p> */}
                                    <p className='val'>{sMap[task.status] || task.status}</p>
                                </div>
                                <div className="status_text">
                                    <p className="label">Deadline</p>
                                    {/* <p className="val">{task.status_name || task.status}</p> */}
                                    <p className='val'>{formatareData(task.end_date)}</p>
                                </div>
                                <div className='status_text'>
                                    <p className='val'>{task.xp_points} XP</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className='no_tasks'>No tasks assigned.</p>
                )}
            </section>

        </div>
    )
}

export default Tasks