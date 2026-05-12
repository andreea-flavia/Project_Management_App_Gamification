import './Tasks.css';
import { useState, useEffect } from 'react';
import api from '../../api.js';
import { Link, useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles.js';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sMap, setSMap] = useState({});
    const [sColorMap, setSColorMap] = useState({});
    const [pMap, setPMap] = useState({});
    const [pColorMap, setPColorMap] = useState({});

    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortOrder, setSortOrder] = useState('task_id_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();
    const userRole = localStorage.getItem('user_role');


    useEffect(() => {
        const fetch = async () => {
            try {
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                    console.error('No user ID found');
                    setLoading(false);
                    return;
                }
                // const r = await api.get(`/tasks/user/${userId}`);
                const r = await api.get(`/task`);
                setTasks(r.data);

                const statusR = await api.get('/statuses/TASK');
                const sMap = {};
                statusR.data.forEach(s => {
                    sMap[s.status_id] = s.status_name;
                });
                setSMap(sMap);

                const sColorMap = {};
                statusR.data.forEach(s => {
                    sColorMap[s.status_id] = s.color;
                });
                setSColorMap(sColorMap);

                const priorityR = await api.get('/priorities/TASK');
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
            } catch (e) {
                console.error('Error fetching tasks:', e);
                setLoading(false);
            }
        }
        fetch();
    }, []);

    const formatareData = (date) => {
        if (!date) return 'No Deadline Specified';
        const d = new Date(date);
        return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    };

    const renderTags = (tags = []) => {
        if (!tags.length) {
            return <p className='no_tags'> </p>;
        }
        return (
            <div className='task_tags'>
                {tags.map(tag => (
                    <span key={tag.tag_id} className='task_tag' style={{ backgroundColor: tag.color || '#777' }}>
                        {tag.tag_name}
                    </span>
                ))}
            </div>
        );
    };

    const tagOptions = Array.from(
        new Map(tasks.flatMap(task => task.tags || []).map(tag => [tag.tag_id, tag]))
    ).map(([, tag]) => tag);

    //filtare dupa status, priority, tag, search
    const filterTasks = tasks.filter(task => {
        const match_status = selectedStatus ? task.status === parseInt(selectedStatus) : true;
        const match_priority = selectedPriority ? task.priority === parseInt(selectedPriority) : true;
        const match_tag = selectedTags.length
            ? (task.tags || []).some(tag => selectedTags.includes(tag.tag_id))
            : true;
        const search = searchText.trim().toLowerCase();
        const match_search = !search ||
            String(task.task_id).includes(search) ||
            (task.task_title || '').toLowerCase().includes(search) ||
            (task.task_description || '').toLowerCase().includes(search);
        return match_status && match_priority && match_tag && match_search;
    });

    const sortedTasks = [...filterTasks];
    if (sortOrder === 'deadline_asc') {
        sortedTasks.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
    } else if (sortOrder === 'deadline_desc') {
        sortedTasks.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
    } else if (sortOrder === 'xp_asc') {
        sortedTasks.sort((a, b) => a.xp_points - b.xp_points);
    } else if (sortOrder === 'xp_desc') {
        sortedTasks.sort((a, b) => b.xp_points - a.xp_points);
    } else if (sortOrder === 'task_id_asc') {
        sortedTasks.sort((a, b) => a.task_id - b.task_id);
    } else if (sortOrder === 'task_id_desc') {
        sortedTasks.sort((a, b) => b.task_id - a.task_id);
    }
    //task_id_asc
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTasks = sortedTasks.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);


    const handleOnTaskClick = (taskId) => {
        // console.log('Task clicked:', taskId);
        navigate(`/tasks/edit/${taskId}`);
    }

    const completeTask = async (task_id) => {
        const confirm = window.confirm('Mark this task as completed? You will receive XP and potentially level up.');
        if (!confirm) return;

        try {
            const resp = await api.patch(`/task/${task_id}`);
            const updatedTask = resp.data;
            setTasks(prevTasks => prevTasks.map(t => t.task_id === task_id ? updatedTask : t));
            alert('Task completed! XP added to your profile.');
        } catch (e) {
            console.error('Error completing task:', e);
            alert('Failed to complete task');
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className='tasks_main'>
            <section className="title_section">
                <h2 className='title'>ASSIGNED TASKS</h2>
                <div className="status_line">
                    <div className='line'></div>
                    <span>SYSTEM ACTIVE OPERATIONS</span>
                </div>
            </section>

            <section className="metrics_section">
                {/* DE COMPLETAT LATER */}
            </section>

            <section className='actiuni'>
                {(userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) && (
                    <Link className='btn_add_task' to={`/tasks/new`}>
                        <span className="material-symbols-outlined">add</span>
                        <span className='btn_text'>New Task</span>
                    </Link>)}

                <button type='button' className='filter_toggle' onClick={() => setShowFilters(prev => !prev)}>
                    {showFilters ? 'Hide filters' : 'Show filters'}
                </button>

                <select
                    className='sort_select'
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value='none'>Sort by</option>
                    <option value='deadline_asc'>Deadline Asc</option>
                    <option value='deadline_desc'>Deadline Desc</option>
                    <option value='xp_asc'>XP Asc</option>
                    <option value='xp_desc'>XP Desc</option>
                    <option value='task_id_asc'>ID Asc</option>
                    <option value='task_id_desc'>ID Desc</option>
                </select>

                <input
                    className='search_input'
                    type='text'
                    placeholder='Search by ID, name, description'
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </section>



            {showFilters && (
                <section className="filters_section">
                    <div className="filter_group">
                        <span className='filter_label'>Status</span>
                        <button
                            type='button'
                            className={`filter_btn ${selectedStatus === '' ? 'active' : ''}`}
                            onClick={() => setSelectedStatus('')}
                        >
                            All
                        </button>
                        {Object.entries(sMap).map(([id, name]) => (
                            <button
                                key={id}
                                type='button'
                                className={`filter_btn ${selectedStatus === id ? 'active' : ''}`}
                                onClick={() => setSelectedStatus(id)}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                    <div className="filter_group">
                        <span className='filter_label'>Priority</span>
                        <button
                            type='button'
                            className={`filter_btn ${selectedPriority === '' ? 'active' : ''}`}
                            onClick={() => setSelectedPriority('')}
                        >
                            All
                        </button>
                        {Object.entries(pMap).map(([id, name]) => (
                            <button
                                key={id}
                                type='button'
                                className={`filter_btn ${selectedPriority === id ? 'active' : ''}`}
                                onClick={() => setSelectedPriority(id)}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                    <div className="filter_group">
                        <span className='filter_label'>Tag</span>
                        <button
                            type='button'
                            className={`filter_btn ${selectedTags.length === 0 ? 'active' : ''}`}
                            onClick={() => setSelectedTags([])}
                        >
                            All
                        </button>
                        {tagOptions.map(tag => {
                            const tagId = tag.tag_id;
                            const active = selectedTags.includes(tagId);
                            return (
                                <button
                                    key={tagId}
                                    type='button'
                                    className={`filter_btn ${active ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tagId)
                                                ? prev.filter(id => id !== tagId)
                                                : [...prev, tagId]
                                        );
                                    }}
                                >
                                    {tag.tag_name}
                                </button>
                            );
                        })}
                    </div>
                    <button type='button' className='filter_clear' onClick={() => {
                        setSelectedStatus('');
                        setSelectedPriority('');
                        setSelectedTags([]);
                    }}>
                        Clear filters
                    </button>
                </section>
            )}

            <section className="tasks_section">
                {currentTasks.length > 0 ? (
                    currentTasks.map((task) => (
                        <div key={task.task_id} className='task_row' onClick={() => handleOnTaskClick(task.task_id)}>
                            <div className='task_info'>
                                <h4>#{task.task_id} {task.task_title}</h4>
                                <p>{task.task_description}</p>
                                {renderTags(task.tags)}
                            </div>
                            <div className='task_status'>
                                <div className="status_text">
                                    <p className="label">Status</p>
                                    {/* <p className="val">{task.status_name || task.status}</p> */}
                                    <p className='val' style={{ color: sColorMap[task.status] || '#7a7878' }}>
                                        {sMap[task.status] || task.status}
                                    </p>
                                </div>
                                <div className="status_text">
                                    <p className="label">Deadline</p>
                                    {/* <p className="val">{task.status_name || task.status}</p> */}
                                    <p className='val'>{formatareData(task.end_date)}</p>
                                </div>
                                <div className="status_text">
                                    <p className="label">Priority</p>
                                    <div className="tag" style={{ backgroundColor: pColorMap[task.priority] || '#7a7878' }}>
                                        {pMap[task.priority] || task.priority}
                                    </div>
                                </div>

                                {/* <div className="status_text">
                                    <p className="label">Priority</p>
                                    <p className='val' style={{ color: pColorMap[task.priority] || '#7a7878' }}>
                                        {pMap[task.priority] || task.priority}
                                    </p>
                                </div> */}
                                <div className='status_text'>
                                    <p className='val'>{task.xp_points} XP</p>
                                </div>

                                <div className='status_text'>
                                    {task.status !== 4 && (
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            completeTask(task.task_id);
                                        }}
                                            className='btn_mark_comp'>Mark Completed</button>
                                    )}

                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className='no_tasks'>No tasks assigned.</p>
                )}
            </section>

            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                        {'<<'}
                    </button>
                    <span className="page_info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} >
                        {'>>'}
                    </button>
                </div>
            )}
        </div>
    )
}

export default Tasks