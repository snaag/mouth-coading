# API 구현 예시 (USER_DATA_EXAMPLE.md 기반)

## 1. 회원가입 (POST /api/register)
- 입력: username, password, name, contact, type
- 동작: 사용자 정보를 받아 새로운 계정을 users 배열에 추가

## 2. 로그인 (POST /api/login)
- 입력: username, password
- 동작: 아이디/비밀번호 일치 시 JWT 토큰 발급

## 3. 정보변경 (PUT /api/user)
- 입력: username, (변경할 name/contact 등)
- 동작: 해당 사용자의 정보 수정

## 4. 정보 조회 (GET /api/user?username=...)
- 입력: username (쿼리)
- 동작: 해당 사용자의 정보 반환

## 5. 로그아웃 (POST /api/logout)
- 입력: (JWT 토큰)
- 동작: 클라이언트에서 토큰 삭제(서버 세션 관리 시 세션 만료)

---

### 예시 users 배열 (메모리 기반)
```js
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
```

---

### 각 API의 기본 구조 (Node.js/Express 예시)
```js
// 회원가입
app.post('/api/register', (req, res) => {
  const { username, password, name, contact, type } = req.body;
  // 중복 체크, 유효성 검사 등 생략
  users.push({ username, password, name, contact, type });
  res.json({ message: '회원가입 성공' });
});

// 로그인
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // JWT 토큰 발급 등
    res.json({ token: 'JWT_TOKEN' });
  } else {
    res.status(401).json({ message: '인증 실패' });
  }
});

// 정보변경
app.put('/api/user', (req, res) => {
  const { username, name, contact } = req.body;
  const user = users.find(u => u.username === username);
  if (user) {
    if (name) user.name = name;
    if (contact) user.contact = contact;
    res.json({ message: '정보 수정 성공' });
  } else {
    res.status(404).json({ message: '사용자 없음' });
  }
});

// 정보 조회
app.get('/api/user', (req, res) => {
  const { username } = req.query;
  const user = users.find(u => u.username === username);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: '사용자 없음' });
  }
});

// 로그아웃 (프론트엔드에서 토큰 삭제)
app.post('/api/logout', (req, res) => {
  res.json({ message: '로그아웃 성공' });
});
```

---

## 멘토 신청 관련 API (멘티 → 멘토)

1. **멘토 신청 (POST /api/mentor-request)**
   - 설명: 멘티가 특정 멘토에게 멘토링을 신청합니다.
   - 입력: mentee(멘티 아이디), mentor(멘토 아이디)
   - 출력: 신청 결과(status: "pending")
   - 예시 요청:
     ```json
     {
       "mentee": "mentee1",
       "mentor": "mentor1"
     }
     ```
   - 예시 응답:
     ```json
     {
       "message": "Mentor request submitted.",
       "status": "pending"
     }
     ```

2. **멘토 신청 취소/삭제 (DELETE /api/mentor-request)**
   - 설명: 멘티가 자신이 신청한 멘토링 요청을 취소(삭제)합니다.
   - 입력: mentee(멘티 아이디), mentor(멘토 아이디)
   - 출력: 삭제 결과
   - 예시 요청:
     ```json
     {
       "mentee": "mentee1",
       "mentor": "mentor1"
     }
     ```
   - 예시 응답:
     ```json
     {
       "message": "Mentor request deleted."
     }
     ```
````
