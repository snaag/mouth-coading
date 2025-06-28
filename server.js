const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your-secret-key';

const users = [
  { username: 'mentor1', password: 'pass1', role: 'mentor', contact: 'mentor1@email.com' },
  { username: 'mentee1', password: 'pass2', role: 'mentee', contact: '010-1234-5678' }
];

// 멘토-멘티 매칭 상태를 저장할 배열
let matches = [];

// 상담 요청 상태를 저장할 배열
let requests = [];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'POST' && parsedUrl.pathname === '/api/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username, password, role } = JSON.parse(body);
        const user = users.find(u => u.username === username && u.password === password && u.role === role);
        if (user) {
          const token = jwt.sign({ username, role }, SECRET_KEY, { expiresIn: '1h' });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ token }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '인증 실패' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '잘못된 요청' }));
      }
    });
    return;
  }

  // 멘토-멘티 매칭 신청 API
  if (req.method === 'POST' && parsedUrl.pathname === '/api/match') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { mentor, mentee } = JSON.parse(body);
        // 멘토가 이미 매칭된 멘티가 있는지 확인
        const mentorHasMatch = matches.some(m => m.mentor === mentor);
        // 멘티가 이미 매칭된 멘토가 있는지 확인
        const menteeHasMatch = matches.some(m => m.mentee === mentee);
        if (mentorHasMatch) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '이 멘토는 이미 멘티가 있습니다.' }));
          return;
        }
        if (menteeHasMatch) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '이 멘티는 이미 멘토가 있습니다.' }));
          return;
        }
        // 매칭 추가
        matches.push({ mentor, mentee });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '매칭 성공' }));
      } catch (err) {
        console.error('매칭 신청 에러:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '잘못된 요청', error: err.message }));
        return;
      }
    });
    return;
  }

  // 상담 요청 API
  if (req.method === 'POST' && parsedUrl.pathname === '/api/request-counsel') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { mentor, mentee, message } = JSON.parse(body);
        // 매칭된 멘토-멘티 쌍인지 확인
        const isMatched = matches.some(m => m.mentor === mentor && m.mentee === mentee);
        if (!isMatched) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '매칭된 멘토-멘티가 아닙니다.' }));
          return;
        }
        // 상담 요청 저장
        requests.push({ mentor, mentee, message, date: new Date().toISOString() });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '상담 요청이 전송되었습니다.' }));
      } catch (err) {
        console.error('상담 요청 에러:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '잘못된 요청', error: err.message }));
        return;
      }
    });
    return;
  }

  // 멘티가 이미 멘토와 매칭되어 있는지 확인하는 API
  if (req.method === 'POST' && parsedUrl.pathname === '/api/check-mentee-match') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { mentee } = JSON.parse(body);
        const hasMentor = matches.some(m => m.mentee === mentee);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ hasMentor }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '잘못된 요청', error: err.message }));
      }
    });
    return;
  }

  // 멘티에게 배정된 멘토의 아이디를 반환하는 API
  if (req.method === 'POST' && parsedUrl.pathname === '/api/get-mentor-for-mentee') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { mentee } = JSON.parse(body);
        const match = matches.find(m => m.mentee === mentee);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mentor: match ? match.mentor : null }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '잘못된 요청', error: err.message }));
      }
    });
    return;
  }

  // 정적 파일 서비스
  let filePath = '.' + parsedUrl.pathname;
  if (filePath === './') filePath = './index.html';
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.svg': 'application/image/svg+xml'
  };

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': mimeTypes[extname] || 'application/octet-stream' });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(3000, () => {
  console.log('서버가 http://localhost:3000 에서 실행 중입니다.');
});
