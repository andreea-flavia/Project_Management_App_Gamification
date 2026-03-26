import './LoginPage.css'
import React, { useState } from 'react';

const LoginPage = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");

    return (
        <div className='background'>
            {/* <h1 className='title'>Login Page</h1> */}

            <main className='grid'>
                <section className="sectiune_imagine">
                    <div className ='brand'>
                        <span className="brand_name">RHODON</span>
                        <span className="brand_tagline">// SECURE_TERMINAL_v2.0</span>
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
                                    <input type="text" placeholder="ex: flavia.tanasescu@office.ro" spellCheck="false" />
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

                        <button className='btn_auth'>
                            <span className="btn_text">Autentificare</span>
                        </button>

                        <div className ="req_access">
                            <p className="req_text">Prima oara?</p>
                            <button type="button" className="req_btn">
                                Solicta un cont!
                            </button>
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
};


export default LoginPage