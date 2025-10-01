import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace/>} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/chat" element={<ChatPage/>} />
    </Routes>
  );
}
