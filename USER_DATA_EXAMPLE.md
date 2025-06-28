## 사용자 데이터 예시 (2025-06-28)

```json
[
  {
    "username": "mentor1",
    "password": "pass1",
    "name": "홍길동",
    "contact": "mentor1@email.com",
    "type": "mentor"
  },
  {
    "username": "mentee1",
    "password": "pass2",
    "name": "김철수",
    "contact": "010-1234-5678",
    "type": "mentee"
  }
]
```

- username: 아이디
- password: 비밀번호
- name: 이름
- contact: 연락처(이메일 또는 전화번호)
- type: "mentor" 또는 "mentee"
<details>
<summary>API 목록</summary>

- **회원가입**: 사용자 정보를 받아 새로운 계정을 생성합니다.
- **로그인**: 아이디와 비밀번호로 인증하여 세션을 시작합니다.
- **정보변경**: 이름, 연락처 등 사용자 정보를 수정합니다.
- **정보 조회**: 사용자 정보를 조회합니다.
- **로그아웃**: 세션을 종료합니다.

</details>

---

## 멘티의 멘토 신청 데이터 예시

```json
[
  {
    "mentee": "mentee1",
    "mentor": "mentor1",
    "status": "pending"
  },
  {
    "mentee": "mentee2",
    "mentor": "mentor1",
    "status": "accepted"
  },
  {
    "mentee": "mentee3",
    "mentor": "mentor2",
    "status": "rejected"
  }
]
```

- mentee: 신청한 멘티의 username(아이디)
- mentor: 신청 대상 멘토의 username(아이디)
- status: "pending", "accepted", "rejected" 중 하나

---

## 상담 데이터 기록 예시

```json
[
  {
    "writer": "mentee1",
    "mentor": "mentor1",
    "date": "2025-06-28T14:30:00Z",
    "reply": "상담 답변 내용 예시입니다."
  },
  {
    "writer": "mentee2",
    "mentor": "mentor2",
    "date": "2025-06-27T10:00:00Z",
    "reply": "답변이 아직 없습니다."
  }
]
```

- writer: 상담을 작성한 사용자의 username(아이디)
- mentor: 상담 대상 멘토의 username(아이디)
- date: 작성 날짜 (ISO 8601 형식)
- reply: 상담 답변 내용 (없으면 빈 문자열 또는 안내 문구)