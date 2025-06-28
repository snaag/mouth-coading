import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || '로그인 실패');
        return;
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setTimeout(() => {
        window.location.href = '/match-requests';
      }, 100);
    } catch (err) {
      setError('서버 오류');
    }
  };

  return (
    <div className="login-page">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="이메일 또는 아이디" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">로그인</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      <button onClick={() => navigate('/signup')}>회원가입</button>
    </div>
  );
}
