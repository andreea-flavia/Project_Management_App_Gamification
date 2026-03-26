import React, { useEffect, useState } from 'react';

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
            <h1>Home Page</h1>
            <p>Bine ai venit, {user}!</p>
            <p className="system_status">SYSTEM_ACCESS_GRANTED // SESSION_ACTIVE</p>
        </div>
    )
}

export default HomePage