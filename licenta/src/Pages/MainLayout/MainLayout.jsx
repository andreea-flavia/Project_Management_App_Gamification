import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavMenu from '../NavMenu';
import './MainLayout.css';
import api from '../../api.js';

const MainLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    const user_id = localStorage.getItem("user_id");

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/user/${user_id}`);
                setUser(response.data);

            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
        fetchUser();
    }, [user_id]);

    return (
        <div className="main_layout">
            <button className="menu_trigger_btn" onClick={toggleMenu}>
                <span className="material-symbols-outlined">menu</span>
            </button>

            <div className='titlu_vertical'>
                SYNCRO
            </div>

            <div className="user_identity_header">
                <div className="user_info_text">
                    <span className="user_name">{user?.username}</span>
                    <span className="user_role">{user?.role}</span>
                </div>
            </div>

            <NavMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <div className="page_content">
                <Outlet />
            </div>
        </div>
    )
};

export default MainLayout;