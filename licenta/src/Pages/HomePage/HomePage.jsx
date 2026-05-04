import React, { useEffect, useState } from 'react';
import './HomePage.css';
import api from '../../api.js';

const HomePage = () => {
    const [user, setUser] = useState("Guest");
    const user_id = localStorage.getItem("user_id");

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
        <div>
            <h1 className="basic">Home Page</h1>
            <p className="basic">Bine ai venit, {user?.user_first_name}!</p>
            <p className="basic">SYSTEM_ACCESS_GRANTED // SESSION_ACTIVE</p>
        </div>
    )
}

export default HomePage