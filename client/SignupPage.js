import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('mentor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await fetch('http://localhost:8080/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      });
      if (res.status === 201) {
        setSuccess('회원가입 성공! 로그인 해주세요.');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        const data = await res.json();
        setError(data.message || '회원가입 실패');
      }
    } catch (err) {
      setError('서버 오류');
    }
  };

  return (
    <div className="signup-page">
      <h2>회원가입</h2>
      <form onSubmit={handleSignup}>
        <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required />
        <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} required />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="mentor">멘토</option>
          <option value="mentee">멘티</option>
        </select>
        <button type="submit">회원가입</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>{success}</div>}
      <button onClick={() => navigate('/login')}>로그인</button>
    </div>
  );
}
