import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavMenu from '../NavMenu';
import './MainLayout.css';
import api from '../../api.js';
import Notifications from '../Notifications';

const MainLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const user_id = localStorage.getItem("user_id");

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleNotifications = () => {
        setIsNotifOpen(!isNotifOpen);
    };

    const fetchUnreadCount = async () => {
        if (!user_id) return;
        try {
            const response = await api.get(`/notifications/${user_id}`);
            const unread = response.data.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/user/${user_id}`);
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUser();
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
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
                <button onClick={toggleNotifications} className="notif_btn">
                    <span className="material-symbols-outlined">notifications</span>
                    {unreadCount > 0 && <span className="notif_badge">{unreadCount}</span>}
                </button>
                <div className="user_info_text">

                    <span className="user_name">{user?.username}</span>
                    <span className="user_role">{user?.role}</span>
                </div>

            </div>


            <NavMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <div className="page_content">
                <Outlet />
            </div>

            <Notifications
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                onRefreshCount={fetchUnreadCount}
            />

        </div>
    )
};

export default MainLayout;