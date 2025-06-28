import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function MatchRequestsPage() {
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get('mentorId');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequest = async e => {
    e.preventDefault();
    setError(''); setResult('');
    try {
      const res = await fetch('http://localhost:8080/api/match-requests', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mentorId: Number(mentorId), message })
      });
      if (res.ok) {
        setResult('매칭 요청 완료!');
      } else {
        const data = await res.json();
        setError(data.message || '요청 실패');
      }
    } catch (e) {
      setError('서버 오류');
    }
  };

  return (
    <div className="match-requests-page">
      <h2>매칭 요청</h2>
      <form onSubmit={handleRequest}>
        <input type="text" placeholder="요청 메시지" value={message} onChange={e => setMessage(e.target.value)} required />
        <button type="submit">요청 보내기</button>
      </form>
      {result && <div style={{color:'green'}}>{result}</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      <button onClick={() => navigate('/mentors')}>멘토 목록</button>
    </div>
  );
}
