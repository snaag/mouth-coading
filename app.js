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
                });
            }
        });
    }
});
