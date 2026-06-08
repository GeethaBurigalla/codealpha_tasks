let currentUser = null;

// Get logged in user
async function getMe() {
  let res = await fetch('/api/me');
  let data = await res.json();
  if (!data.success) {
    window.location.href = '/login';
    return;
  }
  currentUser = data.user;
}

// Load feed
async function loadFeed() {
  let res = await fetch('/api/posts');
  let data = await res.json();
  let feed = document.getElementById('feed');
  feed.innerHTML = '';

  if (data.posts.length === 0) {
    feed.innerHTML = '<p style="text-align:center;color:#888;margin-top:20px;">No posts yet! Be the first to post.</p>';
    return;
  }

  data.posts.forEach(post => {
    feed.innerHTML += createPostHTML(post);
  });
}

// Create post HTML
function createPostHTML(post) {
  let isOwner = currentUser && post.user._id === currentUser._id;
  let isLiked = currentUser && post.likes.includes(currentUser._id);
  let avatar = post.user.name.charAt(0).toUpperCase();
  let timeAgo = getTimeAgo(post.createdAt);
  let imageHTML = post.image ? `<img src="/uploads/${post.image}" class="post-image">` : '';
  let deleteBtn = isOwner ? `<button class="btn-danger" onclick="deletePost('${post._id}')">🗑️</button>` : '';
let editBtn = isOwner ? `<button class="btn-edit" onclick="editPost('${post._id}', this)">✏️</button>` : '';
  let postUrl = `${window.location.origin}/?post=${post._id}`;

  let commentsHTML = post.comments.map(c => `
    <div class="comment">
      <strong>${c.name}</strong>: ${c.text}
    </div>
  `).join('');

  return `
    <div class="post-card" id="post-${post._id}">
      <div class="post-header">
        <div class="post-avatar" onclick="window.location.href='/user?id=${post.user._id}'">${avatar}</div>
        <div>
          <div class="post-username" onclick="window.location.href='/user?id=${post.user._id}'">${post.user.name}</div>
          <div class="post-time">${timeAgo}</div>
        </div>
<div style="margin-left:auto; display:flex; gap:8px;">${editBtn}${deleteBtn}</div>
      </div>
      <div class="post-text">${post.text}</div>
      ${imageHTML}
      <div class="post-actions">
        <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="likePost('${post._id}', this)">
          ❤️ <span class="like-count">${post.likes.length}</span> Likes
        </button>
        <button class="action-btn" onclick="toggleComments('${post._id}')">
          💬 ${post.comments.length} Comments
        </button>
        <button class="action-btn" onclick="sharePost('${postUrl}')">
          🔗 Share
        </button>
      </div>
      <div class="comments-section" id="comments-${post._id}">
        <div id="commentsList-${post._id}">${commentsHTML}</div>
        <div class="comment-input">
          <input type="text" id="commentInput-${post._id}" placeholder="Write a comment...">
          <button onclick="addComment('${post._id}')">Post</button>
        </div>
      </div>
    </div>
  `;
}

// Image preview before posting
function previewImage(input) {
  let preview = document.getElementById('imagePreview');
  preview.innerHTML = '';
  if (input.files && input.files[0]) {
    let reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `
        <div style="position:relative;display:inline-block;">
          <img src="${e.target.result}" style="max-width:100%;max-height:200px;border-radius:8px;margin-top:10px;">
          <button onclick="removeImage()" style="position:absolute;top:5px;right:5px;background:red;color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;">✕</button>
        </div>
      `;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Remove selected image
function removeImage() {
  document.getElementById('postImage').value = '';
  document.getElementById('imagePreview').innerHTML = '';
}

// Create post
async function createPost() {
  let text = document.getElementById('postText').value;
  let imageFile = document.getElementById('postImage').files[0];

  if (!text.trim()) {
    showToast('Please write something!');
    return;
  }

  let formData = new FormData();
  formData.append('text', text);
  if (imageFile) formData.append('image', imageFile);

  let res = await fetch('/api/posts', { method: 'POST', body: formData });
  let data = await res.json();

  if (data.success) {
    document.getElementById('postText').value = '';
    removeImage();
    showToast('Post created! 🎉');
    loadFeed();
  }
}

// Like post
async function likePost(postId, btn) {
  let res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
  let data = await res.json();
  if (data.success) {
    btn.querySelector('.like-count').textContent = data.likes;
    btn.classList.toggle('liked', data.liked);
  }
}

// Toggle comments
function toggleComments(postId) {
  let section = document.getElementById(`comments-${postId}`);
  section.classList.toggle('open');
}

// Add comment
async function addComment(postId) {
  let input = document.getElementById(`commentInput-${postId}`);
  if (!input) return;
  let text = input.value.trim();
  if (!text) {
    showToast('Please write a comment!');
    return;
  }

  try {
    let res = await fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    let data = await res.json();
    console.log('Comment response:', data); // DEBUG

    if (data.success) {
      input.value = '';
      let commentsList = document.getElementById(`commentsList-${postId}`);
      commentsList.innerHTML += `
        <div class="comment">
          <strong>${currentUser.name}</strong>: ${text}
        </div>
      `;
      showToast('Comment added! 💬');
    } else {
      showToast(data.message || 'Failed to post comment!');
    }
  } catch (err) {
    console.error('Comment error:', err);
  }
}
// Delete post
async function deletePost(postId) {
  if (!confirm('Delete this post?')) return;
  let res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
  let data = await res.json();
  if (data.success) {
    document.getElementById(`post-${postId}`).remove();
    showToast('Post deleted!');
  }
}

// Share post
function sharePost(url) {
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied to clipboard! 🔗');
  });
}

// Search users
async function searchUsers() {
  let query = document.getElementById('searchInput').value.trim();
  let resultsDiv = document.getElementById('searchResults');

  if (!query) {
    resultsDiv.innerHTML = '';
    resultsDiv.style.display = 'none';
    return;
  }

  let res = await fetch(`/api/users/search/${query}`);
  let data = await res.json();

  if (!data.success || data.users.length === 0) {
    resultsDiv.innerHTML = '<p style="padding:10px;color:#888;">No users found</p>';
    resultsDiv.style.display = 'block';
    return;
  }

  resultsDiv.style.display = 'block';
  resultsDiv.innerHTML = data.users.map(user => `
    <div class="search-result-item" onclick="window.location.href='/user?id=${user._id}'">
      <div class="search-avatar">${user.name.charAt(0).toUpperCase()}</div>
      <span>${user.name}</span>
    </div>
  `).join('');
}

// Close search results when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.search-container')) {
    document.getElementById('searchResults').style.display = 'none';
  }
});

// Time ago
function getTimeAgo(dateStr) {
  let diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// Toast
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

async function init() {
  await getMe();
  await loadFeed();
  checkSharedPost(); // ✅ add this
}

init();
// Highlight post from shared link
function checkSharedPost() {
  let params = new URLSearchParams(window.location.search);
  let postId = params.get('post');
  if (postId) {
    setTimeout(() => {
      let postEl = document.getElementById(`post-${postId}`);
      if (postEl) {
        postEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        postEl.style.border = '2px solid #1877f2';
        postEl.style.borderRadius = '12px';
        setTimeout(() => postEl.style.border = '', 3000);
      }
    }, 1000);
  }
}
async function editPost(postId, btn) {
  let postCard = document.getElementById(`post-${postId}`);
  let postText = postCard.querySelector('.post-text');
  let currentText = postText.textContent;

  postText.innerHTML = `
    <textarea id="editInput-${postId}" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-size:14px;">${currentText}</textarea>
    <div style="margin-top:8px;display:flex;gap:8px;">
      <button class="btn" onclick="saveEdit('${postId}')">Save</button>
      <button class="btn-danger" onclick="cancelEdit('${postId}', '${currentText}')">Cancel</button>
    </div>
  `;
}

async function saveEdit(postId) {
  let newText = document.getElementById(`editInput-${postId}`).value.trim();
  if (!newText) { showToast('Post cannot be empty!'); return; }

  let res = await fetch(`/api/posts/${postId}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: newText })
  });
  let data = await res.json();
  if (data.success) {
    showToast('Post updated! ✏️');
    loadFeed();
  }
}

function cancelEdit(postId, originalText) {
  let postCard = document.getElementById(`post-${postId}`);
  let postText = postCard.querySelector('.post-text');
  postText.innerHTML = originalText;
}