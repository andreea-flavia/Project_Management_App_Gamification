import { useState, useEffect } from "react";
import api from '../../api.js';
import './Notifications.css';
import { useNavigate } from "react-router-dom";


const Notifications = ({ isOpen, onClose, onRefreshCount }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const user_id = localStorage.getItem("user_id");
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!user_id) return;
        try {
            const response = await api.get(`/notifications/${user_id}`);
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleNotifClick = (notif) => {
        handleMarkAsRead(notif.notification_id);

        if (notif.type === 'TASK_ASSIGNED' || notif.type === 'TASK_UPDATED') {
            navigate(`/tasks/edit/${notif.resource_id}`);
        } else if (notif.type === 'BADGE_EARNED' || notif.type === 'LEVEL_UP') {
            navigate(`/profile`);
        }

        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const handleMarkAsRead = async (notifId) => {
        try {
            await api.put(`/notifications/read/${notifId}`);
            setNotifications(notifications.map(n =>
                n.notification_id === notifId ? { ...n, is_read: true } : n
            ));
            if (onRefreshCount) {
                onRefreshCount();
            }
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="notifications_overlay" onClick={onClose}>
            <div className="notifications_panel" onClick={(e) => e.stopPropagation()}>
                <div className="notif_header">
                    <div className="notif_title_group">
                        <h3>NOTIFICATIONS INBOX</h3>
                    </div>
                    <button className="notif_close_btn" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="notif_list">
                    {notifications.length === 0 ? (
                        <div className="notif_empty">
                            <p>NO NOTIFICATIONS DETECTED</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.notification_id}
                                className={`notif_card ${notif.is_read ? 'read' : 'unread'}`}
                                onClick={() => handleNotifClick(notif)}
                            >
                                <div className="notif_type_icon">
                                    <span className="material-symbols-outlined">
                                        {notif.type === 'TASK_ASSIGNED' ? 'assignment_ind' :
                                            notif.type === 'BADGE_EARNED' ? 'military_tech' : 'info'}
                                    </span>
                                </div>
                                <div className="notif_content">
                                    <div className="notif_meta">
                                        <span className="notif_type_label">{notif.type}</span>
                                        <span className="notif_date">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <h4 className="notif_subject">{notif.title}</h4>
                                    <p className="notif_body">{notif.message}</p>
                                </div>
                                {!notif.is_read && <div className="unread_dot"></div>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;