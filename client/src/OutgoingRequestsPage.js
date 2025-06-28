import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OutgoingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/match-requests/outgoing', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (!res.ok) throw new Error('조회 실패');
      setRequests(await res.json());
    } catch (e) {
      setError('요청 목록 조회 실패');
    }
  };

  const handleCancel = async (id) => {
    await fetch(`http://localhost:8080/api/match-requests/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    fetchRequests();
  };

  return (
    <div className="outgoing-requests-page">
      <h2>보낸 매칭 요청</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {requests.map(r => (
          <li key={r.id} style={{marginBottom:16}}>
            <b>멘토ID:</b> {r.mentorId} <b>상태:</b> {r.status}
            <div>
              <button onClick={() => handleCancel(r.id)} disabled={r.status !== 'pending'}>요청 취소</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/mentors')}>멘토 목록</button>
    </div>
  );
}
