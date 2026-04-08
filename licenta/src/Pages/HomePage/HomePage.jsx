import React, { useEffect, useState } from 'react';
import './HomePage.css';

const HomePage =() => {
    const [user, setUser] = useState("Guest");

    useEffect(() => {
        const savedName = localStorage.getItem("user_name");
        if (savedName) {
            setUser(savedName);
        }
    }, []);
    
    return (
        <div>
            <h1 className="basic">Home Page</h1>
            <p className="basic">Bine ai venit, {user}!</p>
            <p className="basic">SYSTEM_ACCESS_GRANTED // SESSION_ACTIVE</p>
        </div>
    )
}

export default HomePage