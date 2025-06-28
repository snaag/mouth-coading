console.log('첼로 월드 가장 좋아');

window.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginResult = document.getElementById('loginResult');

    // 매칭 폼 동적 생성
    const matchSection = document.createElement('section');
    matchSection.id = 'matchSection';
    matchSection.style.display = 'none';
    matchSection.innerHTML = `
        <h2>멘토 신청</h2>
        <form id="matchForm">
            <label>신청할 멘토:
                <select id="mentorSelect"></select>
            </label>
            <button type="submit">신청하기</button>
        </form>
        <div id="matchResult"></div>
    `;
    document.body.appendChild(matchSection);

    // 상담 신청 폼 동적 생성
    const counselSection = document.createElement('section');
    counselSection.id = 'counselSection';
    counselSection.style.display = 'none';
    counselSection.innerHTML = `
        <h2>상담 신청</h2>
        <form id="counselForm">
            <label>상담 내용:
                <textarea id="counselMessage" required></textarea>
            </label>
            <button type="submit">상담 신청</button>
        </form>
        <div id="counselResult"></div>
    `;
    document.body.appendChild(counselSection);

    // 로그인 폼 제출 이벤트
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = document.getElementById('role').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });
            const data = await response.json();
            if (data.token) {
                loginResult.textContent = '로그인 성공!';
                // 멘티로 로그인한 경우 매칭 폼 표시
                if (role === 'mentee') {
                    showMatchForm(username, data.token);
                }
            } else {
                loginResult.textContent = '로그인 실패: ' + (data.message || '알 수 없는 오류');
            }
        } catch (err) {
            loginResult.textContent = '서버 오류: ' + err.message;
        }
    });

    // 멘토 신청 폼 표시 함수
    async function showMatchForm(mentee, token) {
        // 멘토 목록 동적 생성
        const mentorSelect = document.getElementById('mentorSelect');
        mentorSelect.innerHTML = '';
        // 서버에서 멘토 목록 받아오기
        let mentors = [];
        try {
            // 예시: mentors 배열을 반환하는 API
            // 실제로는 DB에서 멘토 목록을 조회해야 함
            const res = await fetch('/api/mentors', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            mentors = await res.json();
        } catch (err) {
            alert('멘토 목록을 불러오지 못했습니다: ' + err.message);
            return;
        }
        mentors.forEach(m => {
            const option = document.createElement('option');
            option.value = m.username;
            option.textContent = `${m.username} (${m.contact})`;
            mentorSelect.appendChild(option);
        });
        matchSection.style.display = 'block';
        const matchForm = document.getElementById('matchForm');
        const matchResult = document.getElementById('matchResult');
        matchForm.onsubmit = async (e) => {
            e.preventDefault();
            const mentor = mentorSelect.value;
            try {
                const res = await fetch('/api/match', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mentor, mentee })
                });
                const result = await res.json();
                if (res.ok) {
                    matchResult.textContent = '매칭 성공!';
                } else {
                    matchResult.textContent = result.message;
                }
            } catch (err) {
                matchResult.textContent = '서버 오류: ' + err.message;
            }
        };

        // 이미 멘토가 있는지 서버에 확인
        fetch('/api/check-mentee-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mentee })
        })
        .then(res => res.json())
        .then(data => {
            if (data.hasMentor) {
                // 이미 배정된 멘토의 아이디를 요청
                fetch('/api/get-mentor-for-mentee', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mentee })
                })
                .then(res => res.json())
                .then(result => {
                    matchForm.style.display = 'none';
                    matchResult.textContent = `이미 배정된 멘토: ${result.mentor || '정보 없음'}`;
                    // 상담 신청 폼 표시 (멘토가 있을 때만)
                    if (result.mentor) {
                        showCounselForm(mentee, result.mentor);
                    }
                });
            }
        });
    }

    // 상담 신청 폼 표시 함수
    function showCounselForm(mentee, mentor) {
        counselSection.style.display = 'block';
        const counselForm = document.getElementById('counselForm');
        const counselResult = document.getElementById('counselResult');
        counselForm.onsubmit = async (e) => {
            e.preventDefault();
            const message = document.getElementById('counselMessage').value;
            try {
                const res = await fetch('/api/request-counsel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mentor, mentee, message })
                });
                const result = await res.json();
                if (res.ok) {
                    counselResult.textContent = '상담 신청이 전송되었습니다!';
                    counselForm.reset();
                } else {
                    counselResult.textContent = result.message;
                }
            } catch (err) {
                counselResult.textContent = '서버 오류: ' + err.message;
            }
        };
    }
});
