async function loadProfile() {
  let meRes = await fetch('/api/me');
  let meData = await meRes.json();
  if (!meData.success) {
    window.location.href = '/login';
    return;
  }

  let res = await fetch(`/api/users/${meData.user._id}`);
  let data = await res.json();
  if (!data.success) return;

  let user = data.user;
  let avatar = user.name.charAt(0).toUpperCase();
  window.currentName = user.name;
window.currentBio = user.bio || '';

  document.getElementById('profileData').innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">${avatar}</div>
      <h2>${user.name}</h2>
      <p style="color:#888;">${user.email}</p>
      <p style="margin:8px 0;color:#555;">${user.bio || 'No bio yet'}</p>
      <button class="btn" style="width:auto;padding:8px 20px;" id="editBtn" onclick="toggleEdit()">✏️ Edit Profile</button>
      <div class="profile-stats">
        <div class="stat"><strong>${data.posts.length}</strong><span>Posts</span></div>
        <div class="stat"><strong>${user.followers.length}</strong><span>Followers</span></div>
        <div class="stat"><strong>${user.following.length}</strong><span>Following</span></div>
      </div>
    </div>
  `;

  let myPosts = document.getElementById('myPosts');
  myPosts.innerHTML = '';

  if (data.posts.length === 0) {
    myPosts.innerHTML = '<p style="text-align:center;color:#888;">No posts yet!</p>';
    return;
  }

  data.posts.forEach(post => {
    let imageHTML = post.image ? `<img src="/uploads/${post.image}" class="post-image">` : '';
    myPosts.innerHTML += `
      <div class="post-card">
        <div class="post-text" style="padding:16px;">${post.text}</div>
        ${imageHTML}
        <div class="post-actions">
          <span>❤️ ${post.likes.length} Likes</span>
          <span>💬 ${post.comments.length} Comments</span>
        </div>
      </div>
    `;
  });
}

function toggleEdit() {
  let box = document.getElementById('editBox');
  if (box.style.display === 'none' || box.style.display === '') {
    document.getElementById('editName').value = window.currentName;
    document.getElementById('editBio').value = window.currentBio;
    box.style.display = 'block';
  } else {
    box.style.display = 'none';
  }
}

async function saveProfile() {
  let name = document.getElementById('editName').value.trim();
  let bio = document.getElementById('editBio').value.trim();

  if (!name) {
    alert('Name cannot be empty!');
    return;
  }

  let res = await fetch('/api/profile/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, bio })
  });
  let data = await res.json();

  if (data.success) {
    showToast('Profile updated! ✅');
    document.getElementById('editBox').style.display = 'none';
    loadProfile();
  }
}

function showToast(message) {
  let toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

loadProfile();