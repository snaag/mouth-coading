// lpi-api-server.js
// 사용자, 멘토 신청, 상담 데이터 예시 기반 Express 서버

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// 사용자 데이터
let users = [
  {
    username: 'mentor1',
    password: 'pass1',
    name: '홍길동',
    contact: 'mentor1@email.com',
    type: 'mentor'
  },
  {
    username: 'mentee1',
    password: 'pass2',
    name: '김철수',
    contact: '010-1234-5678',
    type: 'mentee'
  }
];

// 멘토 신청 데이터
let mentorRequests = [
  { mentee: 'mentee1', mentor: 'mentor1', status: 'pending' },
  { mentee: 'mentee2', mentor: 'mentor1', status: 'accepted' },
  { mentee: 'mentee3', mentor: 'mentor2', status: 'rejected' }
];

// 상담 데이터
let counselingPosts = [
  {
    writer: 'mentee1',
    mentor: 'mentor1',
    date: '2025-06-28T14:30:00Z',
    reply: '상담 답변 내용 예시입니다.'
  },
  {
    writer: 'mentee2',
    mentor: 'mentor2',
    date: '2025-06-27T10:00:00Z',
    reply: '답변이 아직 없습니다.'
  }
];

// 멘토 신청 (POST)
app.post('/api/mentor-request', (req, res) => {
  const { mentee, mentor } = req.body;
  if (!mentee || !mentor) {
    return res.status(400).json({ message: 'mentee, mentor are required.' });
  }
  const exists = mentorRequests.find(r => r.mentee === mentee && r.mentor === mentor);
  if (exists) {
    return res.status(409).json({ message: 'Request already exists.' });
  }
  mentorRequests.push({ mentee, mentor, status: 'pending' });
  res.json({ message: 'Mentor request submitted.', status: 'pending' });
});

// 멘토 신청 삭제 (DELETE)
app.delete('/api/mentor-request', (req, res) => {
  const { mentee, mentor } = req.body;
  const prevLength = mentorRequests.length;
  mentorRequests = mentorRequests.filter(r => !(r.mentee === mentee && r.mentor === mentor));
  if (mentorRequests.length === prevLength) {
    return res.status(404).json({ message: 'Mentor request not found.' });
  }
  res.json({ message: 'Mentor request deleted.' });
});

// 멘토 신청 전체 조회 (GET)
app.get('/api/mentor-request', (req, res) => {
  res.json(mentorRequests);
});

// 상담 글 작성 (POST)
app.post('/api/counseling', (req, res) => {
  const { writer, mentor, date, reply } = req.body;
  if (!writer || !mentor || !date) {
    return res.status(400).json({ message: 'writer, mentor, date are required.' });
  }
  counselingPosts.push({ writer, mentor, date, reply: reply || '' });
  res.json({ message: 'Counseling post created.' });
});

// 상담 글 삭제 (DELETE)
app.delete('/api/counseling', (req, res) => {
  const { writer, mentor, date } = req.body;
  const prevLength = counselingPosts.length;
  counselingPosts = counselingPosts.filter(
    post => !(post.writer === writer && post.mentor === mentor && post.date === date)
  );
  if (counselingPosts.length === prevLength) {
    return res.status(404).json({ message: 'Counseling post not found.' });
  }
  res.json({ message: 'Counseling post deleted.' });
});

// 상담 글 전체 조회 (GET)
app.get('/api/counseling', (req, res) => {
  res.json(counselingPosts);
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LPI API server running on port ${PORT}`);
});
