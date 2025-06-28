import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultMentorImg = 'https://placehold.co/500x500.jpg?text=MENTOR';
const defaultMenteeImg = 'https://placehold.co/500x500.jpg?text=MENTEE';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [image, setImage] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/api/me', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setBio(data.profile?.bio || '');
        setSkills((data.profile?.skills || []).join(','));
        setImgUrl(data.profile?.imageUrl || (data.role === 'mentor' ? defaultMentorImg : defaultMenteeImg));
      });
  }, []);

  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('jpg/png만 허용'); return;
    }
    if (file.size > 1024 * 1024) {
      setError('1MB 이하만 허용'); return;
    }
    setImage(file);
    setImgUrl(URL.createObjectURL(file));
  };

  const handleSave = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    let imgBase64 = null;
    if (image) {
      const reader = new FileReader();
      reader.onload = async () => {
        imgBase64 = reader.result.split(',')[1];
        await saveProfile(imgBase64);
      };
      reader.readAsDataURL(image);
    } else {
      await saveProfile();
    }
  };

  async function saveProfile(imgBase64) {
    const body = {
      id: profile.id,
      name: profile.profile?.name || '',
      role: profile.role,
      bio,
      image: imgBase64,
      skills: profile.role === 'mentor' ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined
    };
    const res = await fetch('http://localhost:8080/api/profile', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setSuccess('저장 완료!');
    } else {
      setError('저장 실패');
    }
  }

  if (!profile) return <div>로딩중...</div>;
  return (
    <div className="profile-page">
      <h2>내 프로필</h2>
      <form onSubmit={handleSave}>
        <img src={imgUrl} alt="profile" width={150} height={150} style={{objectFit:'cover',borderRadius:8}} />
        <input type="file" accept="image/jpeg,image/png" onChange={handleImage} />
        <input type="text" placeholder="이름" value={profile.profile?.name || ''} readOnly disabled />
        <textarea placeholder="소개글" value={bio} onChange={e => setBio(e.target.value)} />
        {profile.role === 'mentor' && (
          <input type="text" placeholder="기술스택(콤마구분)" value={skills} onChange={e => setSkills(e.target.value)} />
        )}
        <button type="submit">저장</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>{success}</div>}
      <button onClick={() => navigate('/mentors')}>멘토목록</button>
    </div>
  );
}
