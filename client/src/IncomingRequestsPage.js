import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function IncomingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/match-requests/incoming', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (!res.ok) throw new Error('조회 실패');
      setRequests(await res.json());
    } catch (e) {
      setError('요청 목록 조회 실패');
    }
  };

  const handleAccept = async (id) => {
    await fetch(`http://localhost:8080/api/match-requests/${id}/accept`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    fetchRequests();
  };
  const handleReject = async (id) => {
    await fetch(`http://localhost:8080/api/match-requests/${id}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    fetchRequests();
  };

  return (
    <div className="incoming-requests-page">
      <h2>받은 매칭 요청</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {requests.map(r => (
          <li key={r.id} style={{marginBottom:16}}>
            <b>멘티ID:</b> {r.menteeId} <b>상태:</b> {r.status} <br/>
            <span>{r.message}</span>
            <div>
              <button onClick={() => handleAccept(r.id)} disabled={r.status !== 'pending'}>수락</button>
              <button onClick={() => handleReject(r.id)} disabled={r.status !== 'pending'}>거절</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/mentors')}>멘토 목록</button>
    </div>
  );
}
