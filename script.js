const INVITE_CODE = 'boundd';
const SERVER_ID = '1456632196331737090';

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.server, .section-inner').forEach(group => {
    [...group.children].filter(item => !item.matches('.feature-list')).forEach((item, index) => {
      item.classList.add('load-in');
      item.style.setProperty('--load-delay', `${index * 90}ms`);
    });
  });
  document.querySelectorAll('.feature').forEach((item, index) => {
    item.classList.add('load-in');
    item.style.setProperty('--load-delay', `${520 + index * 110}ms`);
  });
  document.querySelector('footer').classList.add('load-in');
  document.querySelector('footer').style.setProperty('--load-delay', '850ms');
}

const joinButton = document.querySelector('.join-button');
const memberCount = document.querySelector('#member-count');
const serverIcon = document.querySelector('#server-icon img');
const memberButton = document.querySelector('#open-members');
const membersDialog = document.querySelector('#members-dialog');
const dialogCount = document.querySelector('#dialog-member-count');
const membersMessage = document.querySelector('#members-message');
const onlineMembers = document.querySelector('#online-members');

if (INVITE_CODE) {
  joinButton.href = `https://discord.gg/${INVITE_CODE}`;
}

serverIcon.addEventListener('error', () => {
  serverIcon.hidden = true;
});

memberButton.addEventListener('click', () => {
  membersDialog.classList.remove('is-closing', 'is-open');
  membersDialog.showModal();
  requestAnimationFrame(() => requestAnimationFrame(() => membersDialog.classList.add('is-open')));
});

let closeTimer;
function closeMembersDialog() {
  if (!membersDialog.open || membersDialog.classList.contains('is-closing')) return;
  membersDialog.classList.remove('is-open');
  membersDialog.classList.add('is-closing');
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => membersDialog.close(), 230);
}

membersDialog.querySelector('.dialog-close').addEventListener('click', closeMembersDialog);
membersDialog.addEventListener('click', event => {
  if (event.target === membersDialog) closeMembersDialog();
});
membersDialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeMembersDialog();
});
membersDialog.addEventListener('close', () => membersDialog.classList.remove('is-closing', 'is-open'));

function renderOnlineMembers(members) {
  onlineMembers.replaceChildren();
  members.forEach(member => {
    const username = member.username || member.name || 'Discord member';
    const displayName = member.nick || member.display_name || member.global_name || username;
    const item = document.createElement('li');
    item.className = 'online-member';
    item.tabIndex = 0;
    item.title = `@${username}`;

    const avatar = document.createElement('span');
    avatar.className = 'online-avatar';
    const picture = document.createElement('span');
    picture.className = 'avatar-picture';
    picture.setAttribute('aria-hidden', 'true');
    const fallback = document.createElement('span');
    fallback.className = 'avatar-fallback';
    fallback.textContent = displayName.trim().charAt(0).toUpperCase() || '?';
    picture.append(fallback);
    if (member.avatar_url) {
      const image = document.createElement('img');
      image.src = member.avatar_url;
      image.alt = '';
      image.loading = 'lazy';
      image.addEventListener('error', () => image.remove());
      picture.append(image);
    }
    const status = ['online', 'idle', 'dnd', 'offline'].includes(member.status) ? member.status : 'online';
    const statusBadge = document.createElement('span');
    statusBadge.className = `online-status status-${status}`;
    statusBadge.setAttribute('role', 'img');
    statusBadge.setAttribute('aria-label', status === 'dnd' ? 'Do not disturb' : status);
    statusBadge.title = status === 'dnd' ? 'Do not disturb' : status;
    avatar.append(picture, statusBadge);

    const nameWrap = document.createElement('span');
    nameWrap.className = 'online-name-wrap';
    const name = document.createElement('span');
    name.className = 'online-name';
    name.textContent = displayName;
    const handle = document.createElement('span');
    handle.className = 'online-username';
    handle.textContent = `@${username}`;
    nameWrap.append(name, handle);
    item.append(avatar, nameWrap);
    onlineMembers.append(item);
  });
}

if (SERVER_ID) {
  fetch(`https://discord.com/api/guilds/${SERVER_ID}/widget.json`)
    .then(response => {
      if (!response.ok) throw new Error(`Discord server widget request failed: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (Number.isFinite(data.presence_count)) {
        memberCount.textContent = data.presence_count.toLocaleString();
        dialogCount.textContent = data.presence_count.toLocaleString();
        memberButton.setAttribute('aria-label', `Show ${data.presence_count} online members`);
        const members = Array.isArray(data.members) ? data.members : [];
        renderOnlineMembers(members);
        membersMessage.hidden = members.length > 0;
        membersMessage.textContent = members.length ? '' : 'Discord did not return an online member list.';
      } else {
        memberCount.textContent = 'unavailable';
        dialogCount.textContent = '—';
        membersMessage.textContent = 'The online list is currently unavailable.';
      }
    })
    .catch(() => {
      memberCount.textContent = 'unavailable';
      dialogCount.textContent = '—';
      membersMessage.textContent = 'The online list is unavailable. Check that the server widget is enabled in Discord settings.';
    });
} else {
  memberCount.textContent = 'unavailable';
  dialogCount.textContent = '—';
  membersMessage.textContent = 'The online list is currently unavailable.';
}
