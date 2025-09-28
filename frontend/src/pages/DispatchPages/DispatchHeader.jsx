// src/components/Header.js
import React from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';

export default function Header({ title = 'Dashboard', user = { name: 'Dispatch Manager' } }) {
  return (
    <header style={{
      height: '60px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'fixed',
      top: 0,
      left: '200px',
      right: 0,
      zIndex: 100,
    }}>
      <h2 style={{ margin: 0, fontSize: '20px', color: '#2d3e50' }}>{title}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', cursor: 'pointer', color: '#2d3e50' }}>
          <FaBell size={20} />
          <span style={{
            position: 'absolute', top: '-5px', right: '-8px', background: 'red', color: '#fff',
            fontSize: '10px', padding: '2px 5px', borderRadius: '50%'
          }}>3</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <FaUserCircle size={30} color="#2d3e50" />
          <span style={{ color: '#2d3e50', fontWeight: 'bold' }}>{user.name}</span>
        </div>
      </div>
    </header>
  );
}
