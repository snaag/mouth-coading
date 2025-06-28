import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MentorListPage() {
  const [mentors, setMentors] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/mentors', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (!res.ok) throw new Error('조회 실패');
      setMentors(await res.json());
    } catch (e) {
      setError('멘토 조회 실패');
    }
  };

  return (
    <div className="mentor-list-page">
      <h2>멘토 목록</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {mentors.map(m => (
          <li key={m.id || m.email} style={{marginBottom:16}}>
            <b>{m.name}</b> ({m.email})
            <button onClick={() => navigate(`/match-requests?mentorId=${m.id || m.email}`)}>매칭 요청</button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/profile')}>내 프로필</button>
    </div>
  );
}
