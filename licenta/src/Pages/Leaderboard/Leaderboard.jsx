import React, { useEffect, useState } from 'react';
import './Leaderboard.css';
import api from '../../api.js';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await api.get('/user_stats/leaderboard');
                setUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
                setError("Failed to load leaderboard data.");
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, []);

    if (loading) return <div className="loading">Loading rankings...</div>;
    if (error) return <div className="error">{error}</div>;

    const topThree = users.slice(0, 3);
    const theRest = users.slice(3);

    return (
        <main className="lb_main">
            <header className="ld_rankings_header">
                <div className="ld_title_group">
                    <h1 className="ld_rankings_title">
                        OPERATOR RANKINGS
                    </h1>
                    <div className="ld_subtitle_row">
                        <span className="ld_accent_line"></span>
                        <p className="ld_sequence_code">
                            Leaderboard Top 15 Users
                        </p>
                    </div>
                </div>
            </header>

            <section className="ld_podium_section">
                {/* Locul 2 */}
                <div className="ld_podium_card ld_rank_2">
                    <div className="ld_rank_number">#02</div>
                    <div className="ld_operator_info">
                        <div className="ld_avatar_wrapper">
                            <img src={topThree[1]?.picture_url} alt="Op 2" />
                            <div className="ld_lvl_tag">LVL {topThree[1]?.User_Stat?.level}</div>
                        </div>
                        <h3 className="ld_op_name">
                            {topThree[1]?.username} {topThree[1]?.role === 'Admin' ? '(A)' : topThree[1]?.role === 'Manager' ? '(M)' : ''}
                        </h3>
                        <div className="ld_op_xp">{topThree[1]?.User_Stat?.total_xp_points} XP</div>
                    </div>
                </div>

                {/* Locul 1 */}
                <div className="ld_podium_card ld_rank_1">
                    <div className="ld_rank_number">#01</div>
                    <div className="ld_operator_info">
                        <div className="ld_avatar_wrapper ld_prime">
                            <img src={topThree[0]?.picture_url} alt="Op 1" />
                            <div className="ld_lvl_tag">LVL {topThree[0]?.User_Stat?.level}</div>
                        </div>
                        <h3 className="ld_op_name">
                            {topThree[0]?.username} {topThree[0]?.role === 'Admin' ? '(A)' : topThree[0]?.role === 'Manager' ? '(M)' : ''}
                        </h3>
                        <div className="ld_op_xp">{topThree[0]?.User_Stat?.total_xp_points} XP</div>
                    </div>
                </div>

                {/* Locul 3 */}
                <div className="ld_podium_card ld_rank_3">
                    <div className="ld_rank_number">#03</div>
                    <div className="ld_operator_info">
                        <div className="ld_avatar_wrapper">
                            <img src={topThree[2]?.picture_url} alt="Op 3" />
                            <div className="ld_lvl_tag">LVL {topThree[2]?.User_Stat?.level}</div>
                        </div>
                        <h3 className="ld_op_name">
                            {topThree[2]?.username} {topThree[2]?.role === 'Admin' ? '(A)' : topThree[2]?.role === 'Manager' ? '(M)' : ''}
                        </h3>
                        <div className="ld_op_xp">{topThree[2]?.User_Stat?.total_xp_points} XP</div>
                    </div>
                </div>

            </section>
            <div className="leaderboard-table">
                <h1>Global Rankings</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>User</th>
                            <th>Level</th>
                            <th>XP</th>
                            <th>Tasks</th>
                            <th>Badges</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.user_id} className={index < 3 ? `top-rank rank-${index + 1}` : ""}>
                                <td>{index + 1}</td>
                                <td className={`username_text ${user.hasGoldenName > 0 ? 'golden_name_text' : ''}`}>
                                    {user.username} {user.role === 'Admin' ? '(A)' : user.role === 'Manager' ? '(M)' : ''}
                                </td>
                                <td>{user.User_Stat?.level}</td>
                                <td>{user.User_Stat?.total_xp_points}</td>
                                <td>{user.completedTasksCount}</td>
                                <td>{user.badgesCount}</td>
                                <td> {user.User_Stat?.w_coins} W-Coins</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

export default Leaderboard;