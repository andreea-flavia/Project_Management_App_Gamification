import './UserProfile.css';

import React, { useEffect, useState } from 'react';
import api from '../../api.js';

const UserProfile =() => {

    const user_id = localStorage.getItem("user_id");
    
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    // const [maxXP, setMaxXP] = useState(0);

    useEffect(() => {

        const fetchUser = async () => {
            try{
                const response = await api.get(`/user/${user_id}`);
                setUser(response.data);
                // console.log("User data:", response.data);

                const r = await api.get(`/user_stats/${user_id}`);
                setStats(r.data);
                console.log("User stats:", r.data);
            } catch(e){
                console.error("Eroare la preluarea datelor utilizatorului:", e);
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
                        #{user?.user_id}  {user?.user_first_name ? `${user.user_first_name.charAt(0)}.` : ''}{user?.user_last_name ? `${user.user_last_name.charAt(0)}.` : ''}
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

                {/* xp points */}
                <div className="acc_s2">
                    <div className="s2_coin_section">
                        {/* W Coins: {stats?.w_coins?.toLocaleString()} */}
                        <div>
                            <p className='acc_bento_label'>W Coins</p>
                            <div className='coin_display'>
                                <h3 className="s2_bento_value_large">{stats?.w_coins || 0}</h3>
                                <span className="material-symbols-outlined icon_primary">toll</span>
                            </div>
                        </div>
                        <button className='s2_btn_redeem'>
                            REDEEM
                        </button>
                    </div>
                    {/* <div className="s2_column">Tasks Completed: </div> */}
                    <div className="s2_tasks_total_section">
                        <p className="s2_bento_label">TOTAL_TASKS_COMPLETED</p>
                        <h3 className="s2_bento_value_large">{stats?.total_tasks || '742'}</h3>
                        <div className="s2_percentile_wrapper">
                            <p className="s2_percentile_text">Network percentile: 95th</p>
                        </div>
                    </div>
                </div>

                <div class="acc_s3">3</div>
                <div class="acc_s4">4</div>
            </section>

            <h1>User Profile</h1>
            <p>Name: {user?.user_first_name} {user?.user_last_name}</p>
            <p>User ID: {user?.user_id}</p>
            <p>{stats?.xp_points?.toLocaleString()} / {stats?.xp_points_req?.toLocaleString()} XP</p>
            <p>{stats?.w_coins?.toLocaleString()} coins</p>
        </main>










        // <main className='main_content_account'>
        //     <div className='header_section_account'>
        //         <div className='name_section_account'>
        //             <span className="profile_tag">System Identity // User Profile #{user_id}</span>
        //             <h1 className="profile_title">{first_name} {last_name}</h1>
        //             <h1 className="profile_title">{last_name}</h1>
        //         </div>
        //     </div>

        //     <div className='main_section'>
               

        //             <div className="sec_1">
        //                 <div className='profile_avatar_wrapper'>
        //                     {user?.picture_url ? (
        //                         <img 
        //                             src={user?.picture_url}
        //                             alt="User Profile"
        //                             className='prf_image'
        //                         />
        //                     ) : (
        //                         <div className='prp_placeholder'>
        //                             <span className="material-symbols-outlined">person</span>
        //                         </div>
        //                     )}
        //                 </div> 
        //                 <span className="lvl_number">LVL {stats?.level}</span>
        //                 <div className='xp_section'>
        //                     <span className="current_xp">{stats?.xp_points?.toLocaleString()}</span>
        //                     <span className="divider"> / </span>
        //                     <span className="total_xp">{calcMaxXP(stats?.level)?.toLocaleString()} XP</span>
        //                 </div>
        //                 <span className="coin_number">{stats?.w_coins?.toLocaleString()} coins</span>
        //             </div>
        //             <div className="sec_2">2</div>
        //             <div className="sec_3">3</div>
        //             // <div className="sec_4">4</div> 

        //     </div> 
        //      <img
        //         src={user?.picture_url}
        //         alt="User Profile"
        //     /> 
        // </main>
    )
}

export default UserProfile

