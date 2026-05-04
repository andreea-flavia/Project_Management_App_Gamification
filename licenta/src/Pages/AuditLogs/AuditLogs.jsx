import { useState, useEffect } from 'react';
import './AuditLogs.css';
import api from '../../api.js';
import { LOG_ACTIONS } from '../../constants/log_action.js';
import { LOG_ENTITY_TYPES } from '../../constants/log_entity_type.js';
import { Link } from 'react-router-dom';


const AuditLogs = () => {
    const [logs, setLogs] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            const logsResponse = await api.get(`/logs`);
            setLogs(logsResponse.data);
        }
        fetchData();
    }, []);

    const [showFilters, setShowFilters] = useState(false);
    const [sortDirection, setSortDirection] = useState('desc');
    const [selectedAction, setSelectedAction] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [searchText, setSearchText] = useState('');
    const [searchDetails, setSearchDetails] = useState('');

    const filterLogs = logs.filter(log => {
        const match_action = selectedAction ? log.action === selectedAction : true;
        const match_type = selectedType ? log.entity_type === selectedType : true;
        const search = searchText.trim().toLowerCase();
        const match_search = !search ||
            String(log.user_id || '').toLowerCase().includes(search) ||
            (log.User.username || '').toLowerCase().includes(search) ||
            String(log.entity_id || '').toLowerCase().includes(search);
        const searchDets = searchDetails.trim().toLowerCase();
        const match_s_dets = !searchDets || (log.details || '').toLowerCase().includes(searchDets)

        return match_action && match_type && match_search && match_s_dets;
    })


    const sortedLogs = [...filterLogs].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const toggleSort = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    //paginatie doar 20 de randuri pe ecran
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedLogs.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    return (
        <div className="audit_page_container">
            <header className="audit_page_header">
                <Link className='audit_btn_back' to={`/profile`}>
                    {'<<'} Back
                </Link>
                <h1 className="audit_title_main">System <span className="text_accent">Audit</span> Core</h1>
                <p className="audit_subtitle">Monitoring all operative activities and security events.</p>
            </header>

            <button type='button' className='audit_filter_toggle' onClick={() => setShowFilters(prev => !prev)}>
                {showFilters ? 'Hide filters' : 'Show filters'}
            </button>

            {showFilters && (
                <div className='audit_filters_container'>
                    <div className='audit_filter_group'>
                        <p className='audit_label'>Action Type</p>
                        <div className='audit_button_group'>
                            <button
                                type='button'
                                className={`audit_filter_btn ${selectedAction === '' ? 'active' : ''}`}
                                onClick={() => setSelectedAction('')}
                            >
                                All
                            </button>
                            {Object.entries(LOG_ACTIONS).map(([key, value]) => (
                                <button
                                    key={key}
                                    type='button'
                                    className={`audit_filter_btn ${selectedAction === key ? 'active' : ''}`}
                                    onClick={() => setSelectedAction(key)}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='audit_filter_group'>
                        <p className='audit_label'>Entity Type</p>
                        <div className='audit_button_group'>
                            <button
                                type='button'
                                className={`audit_filter_btn ${selectedType === '' ? 'active' : ''}`}
                                onClick={() => setSelectedType('')}
                            >
                                All
                            </button>
                            {Object.entries(LOG_ENTITY_TYPES).map(([key, value]) => (
                                <button
                                    key={value}
                                    type='button'
                                    className={`audit_filter_btn ${selectedType === value ? 'active' : ''}`}
                                    onClick={() => setSelectedType(value)}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='audit_search_wrapper'>
                        <div className='audit_input_container'>
                            <p className='audit_label'>Identity Search</p>
                            <input
                                className='audit_search_input'
                                type='text'
                                placeholder='Search by user_id, username, entity_id'
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className='audit_search_wrapper'>
                        <div className='audit_input_container'>
                            <p className='audit_label'>Details Search</p>
                            <input
                                className='audit_search_input'
                                type='text'
                                placeholder='Search by details'
                                value={searchDetails}
                                onChange={(e) => setSearchDetails(e.target.value)}
                            />
                        </div>
                    </div>

                </div>
            )}

            <div className="audit_table_wrapper">

                {logs.length > 0 ? (
                    <div>
                        <table className="audit_table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th onClick={toggleSort} className="sortable_header">
                                        Date
                                        <span className="material-symbols-outlined sort_icon">
                                            {sortDirection === 'asc' ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </th>
                                    <th>User ID</th>
                                    <th>Username</th>
                                    <th>Action</th>
                                    <th>Entity Type</th>
                                    <th>Entity ID</th>
                                    <th>Modification Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((log) => (
                                    <tr key={log.id}>
                                        <td>{log.log_id}</td>
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

                        <div className="audit_pagination">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => paginate(currentPage - 1)}
                                className="audit_filter_btn"
                            >
                                {'<<'}
                            </button>
                            <span className="audit_label">Page {currentPage}</span>
                            <button
                                disabled={indexOfLastItem >= sortedLogs.length}
                                onClick={() => paginate(currentPage + 1)}
                                className="audit_filter_btn"
                            >
                                {'>>'}
                            </button>
                        </div>
                    </div>

                ) : (
                    <p>No logs yet</p>
                )}
            </div>


        </div>
    )
}

export default AuditLogs;