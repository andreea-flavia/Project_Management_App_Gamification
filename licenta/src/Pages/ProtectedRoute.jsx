import { Navigate, Outlet } from 'react-router-dom';

const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const decoded = JSON.parse(decodedJson);
        const expDate = decoded.exp * 1000;
        return Date.now() < expDate;
    } catch (err) {
        return false;
    }
}

const getUserRoleFromToken = (token) => {
    if (!token)
        return false;
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const decoded = JSON.parse(decodedJson);
        return decoded.role;
    } catch (error) {
        return null;
    }
}


const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('user_token');

    if (!isTokenValid(token)) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        return <Navigate to="/login" replace />;
    }

    //ca userul STANDARD sa nu poata da din bara de cautare /tasks/new
    if (allowedRoles) {
        const userRole = getUserRoleFromToken(token);
        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/home" replace />;
        }
    }

    return <Outlet />;

    // if (!token) {
    //     return <Navigate to="/login" replace />;
    // }
    // return <Outlet />;
};

export default ProtectedRoute;