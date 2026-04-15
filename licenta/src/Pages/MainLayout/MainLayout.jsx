import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavMenu from '../NavMenu';
import './MainLayout.css';

const MainLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="main_layout">
            <button className="menu_trigger_btn" onClick={toggleMenu}>
                <span className="material-symbols-outlined">menu</span>
            </button>

            <div className='titlu_vertical'>
                RHODON
            </div>

            <NavMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <div className="page_content">
                <Outlet />
            </div>
        </div>
    )
};

export default MainLayout;