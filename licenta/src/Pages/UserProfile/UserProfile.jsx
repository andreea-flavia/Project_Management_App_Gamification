import './UserProfile.css';

import React, { useEffect, useState } from 'react';
import api from '../../api.js';

const UserProfile =() => {
    const [first_name, setFirstName] = useState("Guest");
    const [last_name, setLastName] = useState("Guest");

    const user_id = localStorage.getItem("user_id");
    
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedName = localStorage.getItem("user_first_name");
        const savedSurname = localStorage.getItem("user_last_name");
        if (savedName && savedSurname) {
            setFirstName(savedName);
            setLastName(savedSurname);
        }

        const fetchUser = async () => {
            try{
                const response = await api.get(`/user/${user_id}`);
                setUser(response.data);
                console.log("User data:", response.data);
            } catch(e){
                console.error("Eroare la preluarea datelor utilizatorului:", e);
            }
        };
        fetchUser();
        
    }, [user_id]);

    // {user?.xp_points}

    return (
        <main className='main_content_account'>
            <div className='header_section_account'>
                <div className='name_section_account'>
                    <span className="profile_tag">System Identity // User Profile #{user_id}</span>
                    <h1 className="profile_title">{first_name} {last_name}</h1>
                    {/* <h1 className="profile_title">{last_name}</h1> */}
                </div>
            </div>

            <div className='main_section'>
               

                    <div className="sec_1">
                        <div className='profile_avatar_wrapper'>
                            {user?.picture_url ? (
                                <img 
                                    src={user?.picture_url}
                                    alt="User Profile"
                                    className='prf_image'
                                />
                            ) : (
                                <div className='prp_placeholder'>
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                            )}
                        </div> 
                        <span className="lvl_number">LVL {user?.level}</span>
                        <div className='xp_section'>
                            <span className="current_xp">{user?.xp_points?.toLocaleString()}</span>
                            <span className="divider"> / </span>
                            <span className="total_xp">2,000 XP</span>
                        </div>
                        
                    </div>
                    <div className="sec_2">2</div>
                    <div className="sec_3">3</div>
                    {/* <div className="sec_4">4</div> */}

            </div>
            {/* <img
                src={user?.picture_url}
                alt="User Profile"
            /> */}
        </main>
    )
}

export default UserProfile

