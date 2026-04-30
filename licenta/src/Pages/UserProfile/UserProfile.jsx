import './UserProfile.css';
import { ROLES } from '../../constants/roles.js';

import React, { useEffect, useState } from 'react';
import api from '../../api.js';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {

    const user_id = localStorage.getItem("user_id");
    const userRole = localStorage.getItem('user_role');

    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [compTasks, setCompTasks] = useState(0);
    const [skills, setSkills] = useState([]);
    // const [maxXP, setMaxXP] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchUser = async () => {
            try {
                const response = await api.get(`/user/${user_id}`);
                setUser(response.data);
                // console.log("User data:", response.data);

                const r = await api.get(`/user_stats/${user_id}`);
                setStats(r.data);
                // console.log("User stats:", r.data);

                const countTasksRes = await api.get(`/tasks/user/${user_id}/completed-count`);
                setCompTasks(countTasksRes.data.count);

                //pt skill tree
                const ignoredTags = ['bug', 'feature', 'improvement', 'analysing', 'testing', 'developing'];
                const taskRes = await api.get(`/tasks/user/${user_id}`);
                const userTasks = taskRes.data;
                const completedTasks = userTasks.filter(t => t.status === 4);
                // const tagCount = {};
                const tagInfo = {};
                let totalTags = 0;
                completedTasks.forEach(task => {
                    if (task.tags && task.tags.length > 0) {
                        task.tags.forEach(tag => {
                            const tagName = tag.tag_name;
                            if (ignoredTags.includes(tagName.toLowerCase())) {
                                return;
                            }
                            // tagCount[tagName] = (tagCount[tagName] || 0) + 1;
                            if (!tagInfo[tagName]) {
                                tagInfo[tagName] = { count: 0, color: tag.color || '#067522' };
                            }
                            tagInfo[tagName].count += 1;
                            totalTags++;
                        });
                    }
                });
                const skillsArray = Object.keys(tagInfo).map(tagName => {
                    return {
                        name: tagName,
                        count: tagInfo[tagName].count,
                        percentage: Math.round((tagInfo[tagName].count / totalTags) * 100),
                        color: tagInfo[tagName].color
                    };
                });
                skillsArray.sort((a, b) => b.count - a.count);
                setSkills(skillsArray);


            } catch (e) {
                console.error("Error fetching user data:", e);
            }
        };
        fetchUser();

    }, [user_id]);

    // const calcMaxXP = (nivel) => {
    //     return 100 * (nivel ** 2);
    // }

    // {user?.xp_points}

    return (
        <main className='acc_main_content'>

            <section className='acc_profile_section'>
                <div className='profile_pfp_wrapper'>
                    <div className='profile_pfp_frame'>
                        <img
                            src={user?.picture_url}
                            alt="User Profile"
                            className='pfp_image'
                        />
                    </div>
                    <div className="avatar_tag">
                        Level {stats?.level || 1} - {user?.username}
                        {/* #{user?.user_id} {user?.user_first_name} {user?.user_last_name ? ` ${user.user_last_name.charAt(0)}.` : ''} */}
                    </div>
                </div>
                <div className='acc_info'>
                    <h1 className="acc_name">
                        {user?.user_first_name} <span className="text_highlight">{user?.user_last_name}</span>
                    </h1>
                    <p className="acc_description_2"> Email: {user?.user_mail} </p>
                    <p className="acc_description"> A passionate <span className="text_accent"> {user?.function || 'Operative'} </span> </p>
                </div>
            </section>

            <section className='stats_grid_section'>
                {/* level */}
                <div class="acc_s1" >
                    <span className='bg_level'> {stats?.level || 1} </span>
                    <p className="acc_bento_label">Current Level</p>
                    <h3 className="acc_bento_value_large">{stats?.level || 1}</h3>
                    {/* <p className="acc_bento_subtext text_primary">VETERAN OPERATOR STATUS</p> */}
                    <div className='xp_header'>
                        <p className="acc_bento_label">Experience Points (XP)</p>
                        <div className='xp_value_row'>
                            <h3 className="acc_bento_value_medium">{stats?.xp_points || 0}</h3>
                            <span className="value_divider"> / {stats?.xp_points_req || 0}</span>
                        </div>
                    </div>
                </div>

                {/* xp points & completed tasks*/}
                <div className="acc_s2">
                    <div className='s2_container'>
                        <div className='s2_column'>
                            <p className="s2_acc_bento_label">W Coins</p>
                            <h3 className="acc_bento_value_large">{stats?.w_coins || 0}</h3>
                            <button className="s2_btn_redeem_reward">CLAIM REWARDS</button>
                        </div>
                        <div className='s2_column'>
                            <p className="s2_acc_bento_label">TOTAL TASKS COMPLETED</p>
                            <h3 className="acc_bento_value_large">{compTasks}</h3>
                        </div>

                    </div>
                </div>

                <div className="acc_s3">
                    <p className="s2_acc_bento_label">OPERATOR SKILL TREE</p>
                    <div className="skills_container">
                        {skills.length > 0 ? (
                            skills.map((skill, index) => (
                                <div
                                    key={index}
                                    className="skill_chip"
                                    style={{ borderLeftColor: skill.color }}
                                >
                                    <span className="skill_name">{skill.name}</span>
                                    <span className="skill_percentage" style={{ color: skill.color }}>
                                        {skill.percentage}%
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="no_skills_text">Awaiting field data. Complete tasks to map skills.</p>
                        )}
                    </div>
                </div>

                <div class="acc_s4">
                    Badges
                    {/* <p>Hello World - Primul task completat</p>
                    <p>Code Deity - peste 100 de taskuri</p>

                    <p>First Aid - primul task cu BUG</p>
                    <p>Pest Control - 5 taskuri cu BUG</p>
                    <p>The Exorcist - 15 taskuri cu BUG</p>
                    <p>Zero Bug Policy - 30 taskuri cu BUG</p>

                    <p>Hello World Plus - primul task cu FEATURE</p>
                    <p>Bricklayer - 5 taskuri cu FEATURE</p>
                    <p>Architect in Training - 15 taskuri cu FEATURE</p>
                    <p>Feature Factory - 30 taskuri cu FEATURE</p>

                    <p>Refactor Rookie - primul task cu IMPROVEMENT</p>
                    <p>Performance Tuner - 5 taskuri cu IMPROVEMENT</p>
                    <p>Clean Code Apostle - 15 taskuri cu IMPROVEMENT</p>
                    <p>The Optimizer - 30 taskuri cu IMPROVEMENT</p> */}
                </div>
            </section>

            {userRole === ROLES.ADMIN && (
                <section className="audit_navigation_section">
                    <div className="audit_card">
                        <div className="audit_content">
                            <div className="audit_header">
                                <h3 className="audit_title">System Audit Log</h3>
                            </div>
                            <p className="audit_description">
                                Review all security events, data modifications, and access history associated with this operative identity.
                            </p>
                        </div>
                        <button className="audit_action_btn" onClick={() => navigate('/audit')} >
                            <span>ACCESS AUDIT CORE {'>>'}</span>
                        </button>
                    </div>
                </section>
            )}

        </main>


    )
}

export default UserProfile

