import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MentorListPage() {
  const [mentors, setMentors] = useState([]);
  const [skill, setSkill] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    let url = 'http://localhost:8080/api/mentors';
    const params = [];
    if (skill) params.push('skill=' + encodeURIComponent(skill));
    if (orderBy) params.push('order_by=' + encodeURIComponent(orderBy));
    if (params.length) url += '?' + params.join('&');
    try {
      const res = await fetch(url, {
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
      <div>
        <input placeholder="기술스택 검색" value={skill} onChange={e => setSkill(e.target.value)} />
        <select value={orderBy} onChange={e => setOrderBy(e.target.value)}>
          <option value="">정렬 없음</option>
          <option value="name">이름순</option>
          <option value="skill">기술스택순</option>
        </select>
        <button onClick={fetchMentors}>검색</button>
      </div>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {mentors.map(m => (
          <li key={m.id} style={{marginBottom:16}}>
            <img src={m.profile?.imageUrl} alt="profile" width={60} height={60} style={{objectFit:'cover',borderRadius:8}} />
            <b>{m.profile?.name}</b> <span>({m.profile?.skills?.join(', ')})</span>
            <div>{m.profile?.bio}</div>
            <button onClick={() => navigate(`/match-requests?mentorId=${m.id}`)}>매칭 요청</button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/profile')}>내 프로필</button>
    </div>
  );
}
