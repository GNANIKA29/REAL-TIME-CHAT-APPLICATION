import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import EmojiPicker from '../components/EmojiPicker';
import Message from '../components/Message';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export default function ChatPage(){
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('chatterly_user') || 'null');
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef();

  useEffect(()=>{
    if (!user) { navigate('/login'); return; }
    const s = io(BACKEND, { auth: {} });
    setSocket(s);
    s.emit('join');
    s.on('history', (h)=> setMessages(h || []));
    s.on('message:create', m => setMessages(prev => [...prev, m]));
    s.on('message:edit', m => setMessages(prev => prev.map(x=> x.id===m.id?m:x)));
    s.on('message:delete', ({ id }) => setMessages(prev => prev.map(x=> x.id===id?{...x, deleted:true}:x)));
    s.on('message:updated', m => setMessages(prev => prev.map(x=> x.id===m.id?m:x)));
    return ()=> s.disconnect();
  },[]);

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  const send = () => {
    if (!text.trim()) return;
    const payload = { username: user.username, userId: user.id, text: text.trim() };
    socket.emit('message:create', payload);
    setText(''); setShowEmoji(false);
  };

  const edit = (id) => {
    const curr = messages.find(m=> m.id===id);
    const newText = prompt('Edit message', curr?.text || '');
    if (newText != null) socket.emit('message:edit', { id, text: newText });
  };

  const remove = (id) => {
    if (confirm('Delete this message?')) socket.emit('message:delete', { id });
  };

  const addEmoji = (e) => {
    const emoji = e?.native || e?.colons || '';
    setText(t => t + emoji);
  };

  const logout = () => {
    localStorage.removeItem('chatterly_user');
    navigate('/login');
  };

  const searchMessages = async (q) => {
    if (!q) return;
    const res = await axios.get(BACKEND + '/api/search', { params: { q } });
    setMessages(res.data || []);
  };

  return (
    <div className="chat-page">
      <div className="topbar">
        <div className="brand">Chatterly</div>
        <div className="actions">
          <input placeholder="Search messages" onKeyDown={e=> e.key==='Enter' && searchMessages(e.target.value)} />
          <button onClick={()=> { setMessages([]); axios.get(BACKEND + '/api/messages').then(r=>setMessages(r.data)); }}>Refresh</button>
          <button onClick={logout} className="logout">Logout</button>
        </div>
      </div>

      <div className="chat-wrapper">
        <div className="messages">
          {messages.map(m => <Message key={m.id} message={m} currentUser={user} onEdit={edit} onDelete={remove} />)}
          <div ref={messagesEndRef} />
        </div>

        <div className="composer">
          <button className="emoji-btn" onClick={()=>setShowEmoji(s=>!s)}>😀</button>
          {showEmoji && <div className="emoji-pop"><EmojiPicker onSelect={addEmoji} /></div>}
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" onKeyDown={e=> e.key==='Enter' && send()} />
          <button onClick={send} className="send">Send</button>
        </div>
      </div>
    </div>
  );
}
