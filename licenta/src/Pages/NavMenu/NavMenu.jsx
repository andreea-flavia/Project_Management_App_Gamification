import React from "react";
import { useNavigate } from "react-router-dom";
import './NavMenu.css';

const NavMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) {
        return null;
    }

    const items = [
        { name: 'Home', path: '/home', icon: 'home' },
        { name: 'Tasks', path: '/tasks', icon: 'checklist' },
        { name: 'Projects', path: '/projects', icon: 'account_tree' },
        { name: 'My Team (Leaderboard)', path: '/leaderboard', icon: 'group' },
        { name: 'My Progress', path: '/profile', icon: 'account_circle' },
        { name: 'Analytics', path: '/analytics', icon: 'insights' }

    ];

    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    }

    const handleLogout = () => {
        //sa nu uit sa fac clear session , token
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        navigate('/login');
        onClose();
    }

    return (
        <div className="menu_overlay" onClick={onClose}>
            <div className="menu_container" onClick={(e) => e.stopPropagation()}>
                <div className="menu_grid">
                    {items.map((item) => (
                        <div
                            key={item.name}
                            className="menu_card"
                            onClick={() => handleNavigation(item.path)} >
                            <span className="material-symbols-outlined menu_icon">{item.icon}</span>
                            <span className="menu_label">{item.name}</span>
                        </div>
                    ))}
                </div>
                <div className="menu_actions">
                    <button className="close_btn" onClick={onClose}>{'<<'} Back</button>
                    <button className="logout_btn" onClick={handleLogout}>
                        Log Out {'>>'}
                    </button>
                </div>

            </div>
        </div>
    )

};

export default NavMenu;