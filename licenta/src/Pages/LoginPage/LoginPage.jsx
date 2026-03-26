import './LoginPage.css'
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {

            if (!email.trim() && !password.trim()) {
                setError("Completeaza ambele campuri!");
                return;
            }
            if (!email.trim()) {
                setError("Completeaza campul mail!");
                return;
            }
            if (!password.trim()) {
                setError("Completeaza campul parola!");
                return;
            }

            const r = await axios.post('http://localhost:9000/api/login', { email, password });
            if (r.data.success) {
                localStorage.setItem('user_name', r.data.user.first_name);
                navigate('/home');
            }
        } catch(e) {
            const m = e.response?.data?.error || 'Eroare de autentificare';
            setError(m);
        }
    }

    return (
        <div className='background'>
            <main className='grid'>
                <section className="sectiune_imagine">
                    <div className ='brand'>
                        <span className="brand_name">RHODON</span>
                        <span className="brand_tagline">SECURE_TERMINAL_v2.0</span>
                    </div>
                    <img src='/green_bg.jpg' alt="Dream Big" className='imagine'/>
                </section>
                <section className="formular">
                    <div className="glow1"></div>
                    <div className="glow2"></div>
                    <div className='form_wrapper'>
                        <h2 className='form_header'>Intra in cont</h2>
                        <p className = "form_description">Introdu datele de autentificare pentru a incepe</p>
                        
                        <div className='inputuri'>
                            <div class = 'input_line'>
                                <label className="input_label">Mail</label>
                                <div className = "input_container">
                                    <input 
                                        type="email" 
                                        placeholder="ex: flavia.tanasescu@rhodon.ro" 
                                        spellCheck="false" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div class = 'input_line'>
                                <label className="input_label">Parola</label>
                                <div className = "input_container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="clean_input"
                                    />
                                    <button 
                                        type="button" 
                                        className="toggle_btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="auth_error_text">
                                {error}
                            </div>
                        )}

                        <button className='btn_auth' onClick={handleLogin}>
                            <span className="btn_text">Autentificare</span>
                        </button>

                        <div className ="req_access">
                            <p className="req_text">Prima oara?</p>
                            <button type="button" className="req_btn">
                                Solicita un cont!
                            </button>
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
};


export default LoginPage