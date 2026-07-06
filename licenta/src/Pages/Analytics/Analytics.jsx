import './Analytics.css';
import React, { useEffect, useState } from 'react';
import api from '../../api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Legend
} from 'recharts';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(90);
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get(`/analytics?days=${timeRange}`);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [timeRange]);

    const exportToCSV = () => {
        if (!data) return;
        let csvContent = "data:text/csv;charset=utf-8,";

        csvContent += "--- GLOBAL STATS ---\n";
        csvContent += "Metric,Value\n";
        csvContent += `Total Tasks,${data.stats.totalTasks}\n`;
        csvContent += `Active Projects,${data.stats.activeProjects}\n`;
        csvContent += `Global XP,${data.stats.globalXP}\n`;
        csvContent += `Leading Skill,${data.stats.leadingSkill}\n`;
        csvContent += `Current WIP,${data.stats.currentWip}\n\n`;
        csvContent += "--- PROJECT PORTFOLIO HEALTH ---\n";
        csvContent += "Project Name,Progress (%)\n";
        data.portfolioHealth.forEach(p => {
            csvContent += `${p.name},${p.progress}\n`;
        });
        csvContent += "\n";
        csvContent += "--- PRIORITY DISTRIBUTION ---\n";
        csvContent += "Priority,Task Count\n";
        data.priorityDist.forEach(p => {
            csvContent += `${p.name},${p.value}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Analytics_Report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (loading) return <div className="loader">Loading Dashboard...</div>;

    return (
        <main className='analytics_main_content'>
            <div className="analytics_header_wrapper">
                <h1 className="analytics_title">
                    GLOBAL<br />
                    <span className="analytics_matrix_text">ANALYTICS</span>
                </h1>
            </div>

            <button className="analytics_export_btn" onClick={exportToCSV}>
                <span className="material-symbols-outlined">file_download</span>
                EXPORT_DATA_CSV
            </button>

            <section className="analytics_summary_grid">
                <div className="analytics_stat_card">
                    <span className="analytics_stat_label">Total Tasks</span>
                    <div className="analytics_stat_value">{data?.stats.totalTasks || 0}</div>
                </div>
                <div className="analytics_stat_card">
                    <span className="analytics_stat_label">Active Projects</span>
                    <div className="analytics_stat_value">{data?.stats.activeProjects || 0}</div>
                </div>
                <div className="analytics_stat_card">
                    <span className="analytics_stat_label">Global XP Generated</span>
                    <div className="analytics_stat_value">{data?.stats.globalXP?.toLocaleString() || 0} XP</div>
                </div>
                <div className="analytics_stat_card">
                    <span className="analytics_stat_label">Leading Skillset</span>
                    <div className="analytics_stat_value">{data?.stats.leadingSkill || "N/A"}</div>
                </div>
            </section>

            <section className="analytics_chart_section">
                <div className="analytics_chart_container">
                    {/* Header */}
                    <div className="analytics_chart_header">
                        <div>
                            <h2 className="analytics_chart_title">WORKFLOW DYNAMICS</h2>
                            <p className="analytics_chart_subtitle">Overall Total Tasks vs. Completed Tasks</p>
                            <p className="analytics_chart_subtitle">
                                {data?.cfdData && data.cfdData.length > 0
                                    ? `${new Date(data.cfdData[0].date).toLocaleDateString('ro-RO').replaceAll('.', '-')} — ${new Date(data.cfdData[data.cfdData.length - 1].date).toLocaleDateString('ro-RO').replaceAll('.', '-')}`
                                    : "No data flow analysis available."
                                }
                            </p>
                        </div>
                        <div className="analytics_chart_actions">
                            <button
                                className={`analytics_btn_tab ${timeRange === 1 ? 'analytics_active' : ''}`}
                                onClick={() => setTimeRange(1)}
                            >24H</button>
                            <button
                                className={`analytics_btn_tab ${timeRange === 10 ? 'analytics_active' : ''}`}
                                onClick={() => setTimeRange(10)}
                            >10D</button>
                            <button
                                className={`analytics_btn_tab ${timeRange === 30 ? 'analytics_active' : ''}`}
                                onClick={() => setTimeRange(30)}
                            >30D</button>
                            <button
                                className={`analytics_btn_tab ${timeRange === 90 ? 'analytics_active' : ''}`}
                                onClick={() => setTimeRange(90)}
                            >3M</button>
                            <button
                                className={`analytics_btn_tab ${timeRange === 180 ? 'analytics_active' : ''}`}
                                onClick={() => setTimeRange(180)}
                            >6M</button>
                        </div>
                    </div>

                    {/*graficul */}
                    <div className="analytics_chart_area">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.cfdData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false}
                                    tick={{ fill: 'var(--on-surface-variant)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                                    minTickGap={10} angle={-45} textAnchor="end" height={60}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return `${date.getMonth() + 1}-${date.getDate()}`;
                                    }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--on-surface-variant)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface-light)',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '4px',
                                        fontFamily: 'var(--font-mono)'
                                    }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone" dataKey="created" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCreated)" strokeWidth={3} name="Total Created"
                                />
                                <Area
                                    type="monotone" dataKey="completed" stroke="var(--secondary)" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} name="Total Completed"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>


                    {/* Footer info - Simplificat */}
                    <div className="analytics_chart_footer">
                        <div className="analytics_stat_group">
                            <span className="analytics_mini_label">CURRENT WIP</span>
                            <span className="analytics_mini_value">{data?.stats.currentWip || 0} Tasks</span>
                        </div>
                    </div>

                </div>
            </section>

            <section className="analytics_secondary_matrix">
                <div className="analytics_secondary_card">
                    <div className="analytics_card_header">
                        <h3 className="analytics_card_title">Active Project Portfolio Health</h3>
                        <span className="material-symbols-outlined analytics_card_icon">bar_chart</span>
                    </div>
                    <div className="analytics_chart_viewport">
                        <div className="project_health_list">
                            {data?.portfolioHealth && data.portfolioHealth.length > 0 ? (
                                data.portfolioHealth.map((project, index) => (
                                    <div key={index} className="project_health_item">
                                        <div className="project_health_info">
                                            <span className="project_health_name">{project.name}</span>
                                            <span className="project_health_percent">{project.progress}%</span>
                                        </div>
                                        <div className="project_health_bar_bg">
                                            <div
                                                className="project_health_bar_fill"
                                                style={{
                                                    width: `${project.progress}%`,
                                                    background: project.progress > 80 ? 'var(--primary)' :
                                                        project.progress > 40 ? 'var(--primary)' : 'var(--secondary)'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no_data_text">No active projects to analyze.</p>
                            )}
                        </div>

                    </div>
                </div>
                <div className="analytics_secondary_card">
                    <div className="analytics_card_header">
                        <h3 className="analytics_card_title">Priority Distribution</h3>
                        <span className="material-symbols-outlined analytics_card_icon">donut_large</span>
                    </div>
                    {/* <div className="analytics_chart_placeholder">Right Chart Area</div> */}
                    <div className="analytics_chart_viewport">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.priorityDist?.map(item => ({ ...item, fill: item.color }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface-light)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    wrapperStyle={{ paddingTop: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </section>
        </main>
    );
};
export default Analytics;