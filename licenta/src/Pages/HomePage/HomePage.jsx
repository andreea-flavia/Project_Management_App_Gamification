import React, { useEffect, useState } from 'react';
import './HomePage.css';
import api from '../../api.js';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [user, setUser] = useState("Guest");
    const user_id = localStorage.getItem("user_id");
    const [dashboardData, setDashboardData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/user/${user_id}`);
                setUser(response.data);

            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
        const fetchDashboard = async () => {
            try {
                const response = await api.get(`/dashboard/${user_id}`);
                setDashboardData(response.data);
            } catch (error) {
                console.error("Error fetching dashboard:", error);
            }
        };
        fetchDashboard();
        fetchUser();
    }, [user_id]);

    return (
        <main className='home_main'>
            <div className='home_header'>
                <section className="home_section_container">
                    <h1 className="home_title">
                        Welcome back, <span className="home_operative_name">{user?.user_first_name}!</span>
                    </h1>
                    <p className="home_session_id">System Role: {user?.role} | Date: {new Date().toLocaleDateString('en-GB')}</p>
                    <div className="home_divider"></div>
                </section>
            </div>
            <div className='home_sections'>
                <div className="home_section1 metric_box">
                    <span className="m_value">{dashboardData?.metrics?.totalAssigned || 0}</span>
                    <span className="m_label">Tasks Assigned</span>
                </div>
                <div className="home_section2 metric_box completed_box">
                    <span className="m_value">{dashboardData?.metrics?.totalCompleted || 0}</span>
                    <span className="m_label">Tasks Completed</span>
                </div>
                <div className="home_section3 metric_box pending_box">
                    <span className="m_value">{dashboardData?.metrics?.totalPending || 0}</span>
                    <span className="m_label">Tasks Pending</span>
                </div>
                <div className="home_section4 metric_box missed_box">
                    <span className="m_value">{dashboardData?.metrics?.totalMissed || 0}</span>
                    <span className="m_label">Tasks Missed</span>
                </div>

                <div className="home_section5 radar_card">
                    <div className="radar_header">
                        <h2>Urgent Tasks</h2>
                    </div>

                    {dashboardData?.urgentTasks?.length > 0 ? (
                        <div className="urgent_list">
                            {dashboardData.urgentTasks.map(task => (
                                <div key={task.task_id} className="urgent_item" onClick={() => navigate('/tasks')}>
                                    <div className="urgent_left">
                                        <div className="urgent_info">
                                            <span className="urgent_id">#{task.task_id}</span>
                                            <span className="urgent_title">{task.task_title}</span>
                                        </div>
                                        <span className="urgent_deadline">
                                            Due: {new Date(task.end_date).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                    <div className="urgent_priority">
                                        Priority: {task.priority === 3 ? 'HIGH' : (task.priority === 2 ? 'MEDIUM' : 'URGENT')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty_radar">
                            <p>Clear skies! No urgent tasks.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className='home_active_buffs buffs_card'>
                <div className="buffs_header">
                    <h2>Active Buffs</h2>
                </div>

                {dashboardData?.activeBuffs?.length > 0 ? (
                    <div className="buffs_list">
                        {dashboardData.activeBuffs.map((buff, index) => (
                            <div key={index} className={`buff_item ${buff.type.toLowerCase()}`}>
                                <span className="buff_name">{buff.name}</span>
                                <span className="buff_details">
                                    {buff.type === 'BOOSTER' ? `${buff.uses_left} uses left` : 'Active'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty_state">No active buffs. Visit the Shop to enhance your stats.</p>
                )}
            </div>
            <div className="home_quick_actions">
                <button className="quick_btn" onClick={() => navigate('/projects')}>
                    {">>"} ACTIVE PROJECTS
                </button>
                <button className="quick_btn" onClick={() => navigate('/shop')}>
                    {">>"} REWARD SHOP
                </button>
                <button className="quick_btn" onClick={() => navigate('/leaderboard')}>
                    {">>"} LEADERBOARD
                </button>
            </div>

            <footer className="home_footer">
                <p>ACADEMIA DE STUDII ECONOMICE DIN BUCURESTI </p>
                <p>FACULTATEA DE CIBERNETICA, STATISTICA SI INFORMATICA ECONOMICA</p>
                <p>LICENTA 2026 </p>
            </footer>
        </main>

    )
}

export default HomePage

// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../../api.js'; // Verifică dacă calea către api e corectă
// import './HomePage.css';

// const HomePage = () => {
//     const [dashboardData, setDashboardData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate();
//     const user_id = localStorage.getItem("user_id");

//     useEffect(() => {
//         const fetchDashboard = async () => {
//             try {
//                 const response = await api.get(`/dashboard/${user_id}`);
//                 setDashboardData(response.data);
//             } catch (error) {
//                 console.error("Eroare la aducerea datelor:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchDashboard();
//     }, [user_id]);

//     if (loading) {
//         return <div className="loading_dash">Initializing Command Center...</div>;
//     }

//     if (!dashboardData) return null;

//     const { metrics, urgentTasks, activeBuffs } = dashboardData;

//     return (
//         <div className="dashboard_container">
//             <h1 className="dash_title">Command Center</h1>

//             <div className="bento_grid">

//                 {/* 1. URGENT RADAR (Card Mare - Lat) */}
//                 <div className="bento_card radar_card">
//                     <div className="card_header">
//                         <span className="material-symbols-outlined icon_red">radar</span>
//                         <h2>Urgent Radar</h2>
//                     </div>

//                     {urgentTasks.length > 0 ? (
//                         <div className="urgent_list">
//                             {urgentTasks.map(task => (
//                                 <div key={task.task_id} className="urgent_item" onClick={() => navigate('/tasks')}>
//                                     <div className="urgent_info">
//                                         <span className="urgent_id">#{task.task_id}</span>
//                                         <span className="urgent_title">{task.task_title}</span>
//                                     </div>
//                                     <span className="urgent_deadline">
//                                         Due: {new Date(task.end_date).toLocaleDateString()}
//                                     </span>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <p className="empty_state">Clear skies! No urgent tasks on the radar.</p>
//                     )}
//                 </div>

//                 {/* 2. PRODUCTIVITY METRICS (Card Pătrat cu 4 numere) */}
//                 <div className="bento_card metrics_card">
//                     <div className="card_header">
//                         <span className="material-symbols-outlined icon_blue">analytics</span>
//                         <h2>Productivity</h2>
//                     </div>

//                     <div className="metrics_grid">
//                         <div className="metric_box">
//                             <span className="m_value">{metrics.totalAssigned}</span>
//                             <span className="m_label">Assigned</span>
//                         </div>
//                         <div className="metric_box pending_box">
//                             <span className="m_value">{metrics.totalPending}</span>
//                             <span className="m_label">Pending</span>
//                         </div>
//                         <div className="metric_box missed_box">
//                             <span className="m_value">{metrics.totalMissed}</span>
//                             <span className="m_label">Missed</span>
//                         </div>
//                         <div className="metric_box completed_box">
//                             <span className="m_value">{metrics.totalCompleted}</span>
//                             <span className="m_label">Completed</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 3. ACTIVE BUFFS (Card Pătrat Inventar) */}
//                 <div className="bento_card buffs_card">
//                     <div className="card_header">
//                         <span className="material-symbols-outlined icon_gold">bolt</span>
//                         <h2>Active Buffs</h2>
//                     </div>

//                     {activeBuffs.length > 0 ? (
//                         <div className="buffs_list">
//                             {activeBuffs.map((buff, index) => (
//                                 <div key={index} className={`buff_item ${buff.type.toLowerCase()}`}>
//                                     <span className="buff_name">{buff.name}</span>
//                                     <span className="buff_details">
//                                         {buff.type === 'BOOSTER' ? `${buff.uses_left} uses left` : 'Active'}
//                                     </span>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <p className="empty_state">No active buffs. Visit the shop!</p>
//                     )}
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default HomePage;
