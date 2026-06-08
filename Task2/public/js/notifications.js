async function loadNotifications() {
  let meRes = await fetch('/api/me');
  let meData = await meRes.json();
  if (!meData.success) {
    window.location.href = '/login';
    return;
  }

  let res = await fetch('/api/notifications');
  let data = await res.json();
  let list = document.getElementById('notificationsList');

  if (!data.success || data.notifications.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#888;">No notifications yet!</p>';
    return;
  }

  data.notifications.forEach(n => {
    let icon = n.type === 'like' ? '❤️' : '💬';
    list.innerHTML += `
      <div class="notification-item">
        <span class="notif-icon">${icon}</span>
        <div>
          <p>${n.message}</p>
          <p class="notif-post">"${n.postText}..."</p>
        </div>
      </div>
    `;
  });
}

loadNotifications();