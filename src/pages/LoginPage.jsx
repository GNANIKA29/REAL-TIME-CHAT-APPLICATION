import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export default function LoginPage(){
  const [name,setName] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!name.trim()) return alert('Enter username');
    const res = await axios.post(BACKEND + '/api/login', { username: name });
    const user = res.data;
    localStorage.setItem('chatterly_user', JSON.stringify(user));
    navigate('/chat');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Chatterly</h1>
        <p className="tag">Connect instantly. Chat beautifully.</p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter a display name" />
        <div className="auth-actions">
          <button onClick={handleLogin}>Continue</button>
        </div>
        <p className="small">No password — this is a demo. Change name to switch user.</p>
      </div>
    </div>
  );
}
