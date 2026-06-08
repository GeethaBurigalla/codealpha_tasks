async function loadUserProfile() {
  let userId = window.location.search.split('=')[1];
  if (!userId) return;

  let meRes = await fetch('/api/me');
  let meData = await meRes.json();
  let currentUser = meData.success ? meData.user : null;

  let res = await fetch(`/api/users/${userId}`);
  let data = await res.json();
  if (!data.success) return;

  let user = data.user;
  let avatar = user.name.charAt(0).toUpperCase();
  let isFollowing = currentUser && user.followers.includes(currentUser._id);
  let isOwnProfile = currentUser && currentUser._id === userId;

  let followBtn = !isOwnProfile ? `
    <button class="btn-follow ${isFollowing ? 'following' : ''}" onclick="toggleFollow('${userId}', this)">
      ${isFollowing ? 'Following' : 'Follow'}
    </button>
  ` : '';

  document.getElementById('userProfile').innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">${avatar}</div>
      <h2>${user.name}</h2>
      <p style="color:#888;">${user.email}</p>
      ${followBtn}
      <div class="profile-stats">
        <div class="stat">
          <strong>${data.posts.length}</strong>
          <span>Posts</span>
        </div>
        <div class="stat">
          <strong id="followersCount">${user.followers.length}</strong>
          <span>Followers</span>
        </div>
        <div class="stat">
          <strong>${user.following.length}</strong>
          <span>Following</span>
        </div>
      </div>
    </div>
  `;

  let userPosts = document.getElementById('userPosts');
  userPosts.innerHTML = '';

  if (data.posts.length === 0) {
    userPosts.innerHTML = '<p style="text-align:center;color:#888;">No posts yet!</p>';
    return;
  }

  data.posts.forEach(post => {
    let imageHTML = post.image ? `<img src="/uploads/${post.image}" class="post-image">` : '';
    userPosts.innerHTML += `
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

async function toggleFollow(userId, btn) {
  let res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' });
  let data = await res.json();

  if (data.success) {
    btn.textContent = data.following ? 'Following' : 'Follow';
    btn.classList.toggle('following', data.following);
    let count = document.getElementById('followersCount');
    count.textContent = parseInt(count.textContent) + (data.following ? 1 : -1);
  }
}

loadUserProfile();