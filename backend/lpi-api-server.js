// lpi-api-server.js
// 사용자, 멘토 신청, 상담 데이터 예시 기반 Express 서버

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// CORS 설정: 클라이언트 주소 명시
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

// JWT 비밀 키
const JWT_SECRET = process.env.JWT_SECRET || 'lpi_secret_key';

// 사용자 데이터
let users = [
  {
    id: 1,
    email: 'mentor1@naver.com',
    password: 'pass1',
    name: '홍길동',
    contact: 'mentor1@naver.com',
    role: 'mentor'
  },
  {
    id: 2,
    email: 'mentee1@naver.com',
    password: 'pass2',
    name: '김철수',
    contact: '010-1234-5678',
    role: 'mentee'
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

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

// 멘토 신청 생성 (POST /api/mentor-request)
app.post('/api/mentor-request', authenticateToken, (req, res) => {
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

// 멘토 신청 삭제 (DELETE /api/mentor-request)
app.delete('/api/mentor-request', authenticateToken, (req, res) => {
  const { mentee, mentor } = req.body;
  const prevLength = mentorRequests.length;
  mentorRequests = mentorRequests.filter(r => !(r.mentee === mentee && r.mentor === mentor));
  if (mentorRequests.length === prevLength) {
    return res.status(404).json({ message: 'Mentor request not found.' });
  }
  res.json({ message: 'Mentor request deleted.' });
});

// 멘토 신청 상태 변경 (PUT /api/mentor-request/status)
app.put('/api/mentor-request/status', authenticateToken, (req, res) => {
  const { mentee, mentor, status } = req.body;
  if (!mentee || !mentor || !status) {
    return res.status(400).json({ message: 'mentee, mentor, status are required.' });
  }
  const request = mentorRequests.find(r => r.mentee === mentee && r.mentor === mentor);
  if (!request) {
    return res.status(404).json({ message: 'Mentor request not found.' });
  }
  request.status = status;
  res.json({ message: 'Mentor request status updated.', status });
});

// 멘토 신청 전체 조회 (GET /api/mentor-request)
app.get('/api/mentor-request', (req, res) => {
  res.json(mentorRequests);
});

// 상담 글 작성 (POST)
app.post('/api/counseling', authenticateToken, (req, res) => {
  const { writer, mentor, date, reply } = req.body;
  if (!writer || !mentor || !date) {
    return res.status(400).json({ message: 'writer, mentor, date are required.' });
  }
  counselingPosts.push({ writer, mentor, date, reply: reply || '' });
  res.json({ message: 'Counseling post created.' });
});

// 상담 글 삭제 (DELETE)
app.delete('/api/counseling', authenticateToken, (req, res) => {
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

// 회원가입 (POST /api/signup)
app.post('/api/signup', (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role || !['mentor', 'mentee'].includes(role)) {
    return res.status(400).json({ message: 'Invalid signup payload.' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Email already exists.' });
  }
  const id = users.length ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
  const newUser = { id, email, password, name, role, profile: { name, bio: '', imageUrl: `/images/${role}/${id}`, skills: role === 'mentor' ? [] : undefined } };
  users.push(newUser);
  res.status(201).json({ id, email, role, name });
});

// 로그인 (POST /api/login)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Invalid login payload.' });
  }
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// 내 정보 조회 (GET /api/me)
app.get('/api/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(401).json({ message: 'User not found.' });
  // 비밀번호 제외
  const { password, ...userInfo } = user;
  res.json(userInfo);
});

// 멘토 전체 리스트 조회 (GET /api/mentors)
app.get('/api/mentors', authenticateToken, (req, res) => {
  // skill, order_by 쿼리 파라미터 지원
  let mentors = users.filter(u => u.role === 'mentor');
  const { skill, order_by } = req.query;
  if (skill) {
    mentors = mentors.filter(m => (m.profile?.skills || []).map(s => s.toLowerCase()).includes(skill.toLowerCase()));
  }
  if (order_by === 'name') {
    mentors.sort((a, b) => (a.profile?.name || '').localeCompare(b.profile?.name || ''));
  } else if (order_by === 'skill') {
    mentors.sort((a, b) => ((a.profile?.skills || []).join(',')).localeCompare((b.profile?.skills || []).join(',')));
  } else {
    mentors.sort((a, b) => (a.id || 0) - (b.id || 0));
  }
  res.json(mentors);
});

// 기존 users 배열에 email 기반 사용자만 남기고, username/contact/type 기반 예시 제거
users = users.filter(u => u.email);

// 서버 시작
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`LPI API server running on port ${PORT}`);
});
