let results = {mutual: [], fans: [], unf: []};
let profiles = new Map();
let activeTab = 'mutual';
let revision = 0;
let statusKey = '';

function extractProfiles(html) {
  const entries = new Map();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('a[href]').forEach(link => {
    try {
      const url = new URL(link.getAttribute('href'));
      const match = url.pathname.match(/^\/(?:_u\/)?([a-zA-Z0-9._]+)\/?$/);
      if (url.protocol === 'https:' && ['www.instagram.com', 'instagram.com'].includes(url.hostname) && !url.username && !url.password && match) {
        entries.set(match[1].toLowerCase(), url.href);
      }
    } catch { /* Ignore non-profile links. */ }
  });
  return entries;
}

function compareLists(followers, following) {
  return {
    mutual: [...followers.keys()].filter(u => following.has(u)).sort(),
    fans: [...followers.keys()].filter(u => !following.has(u)).sort(),
    unf: [...following.keys()].filter(u => !followers.has(u)).sort()
  };
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
function setStatus(key) {
  statusKey = key;
  const status = document.getElementById('status');
  status.hidden = !key;
  status.textContent = key ? t(key) : '';
}
function resetResults() {
  revision++;
  results = {mutual: [], fans: [], unf: []};
  profiles = new Map();
  document.getElementById('results').hidden = true;
  document.getElementById('result').replaceChildren();
  document.getElementById('exportDialog').close();
  setStatus('');
}
async function analyze() {
  resetResults();
  const currentRevision = revision;
  const followersFiles = [...document.getElementById('followersFile').files];
  const followingFile = document.getElementById('followingFile').files[0];
  if (!followersFiles.length || !followingFile) { setStatus('missing'); return; }
  setStatus('reading');
  try {
    const [followerDocuments, followingHTML] = await Promise.all([
      Promise.all(followersFiles.map(readFile)), readFile(followingFile)
    ]);
    if (currentRevision !== revision) return;
    const followers = new Map();
    followerDocuments.forEach(html => extractProfiles(html).forEach((url, name) => followers.set(name, url)));
    const following = extractProfiles(followingHTML);
    profiles = new Map([...followers, ...following]);
    results = compareLists(followers, following);
    for (const key of Object.keys(results)) document.getElementById('count-' + key).textContent = results[key].length;
    document.getElementById('results').hidden = false;
    document.getElementById('tabs').style.display = '';
    setStatus('');
    showTab('mutual');
  } catch {
    if (currentRevision === revision) setStatus('readError');
  }
}
function showTab(key) {
  activeTab = key;
  for (const name of Object.keys(results)) {
    const btn = document.getElementById('tab-' + name);
    btn.classList.toggle('active', name === key);
    btn.setAttribute('aria-pressed', String(name === key));
  }
  const list = document.getElementById('result');
  const fragment = document.createDocumentFragment();
  results[key].forEach((username, idx) => {
    const row = document.createElement('div');
    const number = document.createElement('span');
    number.className = 'item-num';
    number.textContent = idx + 1;
    const name = document.createElement('span');
    name.className = 'username';
    name.textContent = username;
    const link = document.createElement('a');
    link.className = 'profile-link';
    link.href = profiles.get(username);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '↗';
    link.title = t('profile');
    link.setAttribute('aria-label', t('profile') + ': ' + username);
    row.append(number, name, link);
    fragment.append(row);
  });
  if (!results[key].length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = t('empty');
    fragment.append(empty);
  }
  list.replaceChildren(fragment);
}
function buildExport(format, names, links, labels) {
  const rows = names.map(name => [name, links.get(name) || '']);
  if (format === 'csv') {
    const quote = value => '"' + value.replace(/"/g, '""') + '"';
    return '\uFEFF' + [[labels.username, labels.profileUrl], ...rows].map(row => row.map(quote).join(',')).join('\r\n') + '\r\n';
  }
  if (format === 'md') {
    return '# ' + labels.title + '\n\n' + rows.map(([name, url]) => '- [' + name.replace(/_/g, '\\_') + '](<' + url + '>)').join('\n') + '\n';
  }
  return rows.map(([name, url]) => name + '\t' + url).join('\n') + (rows.length ? '\n' : '');
}
function updateExportSummary() {
  document.getElementById('exportSummary').textContent = t('exportSummary').replace('{list}', t(activeTab)).replace('{count}', results[activeTab].length);
}
document.getElementById('exportButton').addEventListener('click', () => {
  updateExportSummary();
  document.getElementById('exportDialog').showModal();
});
document.getElementById('cancelExport').addEventListener('click', () => document.getElementById('exportDialog').close());
document.getElementById('exportForm').addEventListener('submit', event => {
  event.preventDefault();
  const format = document.getElementById('exportFormat').value;
  const types = {txt: 'text/plain', csv: 'text/csv', md: 'text/markdown'};
  const text = buildExport(format, results[activeTab], profiles, {username: t('username'), profileUrl: t('profileUrl'), title: t(activeTab)});
  const url = URL.createObjectURL(new Blob([text], {type: types[format] + ';charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mutualist-' + activeTab + '.' + format;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.getElementById('exportDialog').close();
});
for (const id of ['followersFile', 'followingFile']) document.getElementById(id).addEventListener('change', resetResults);
document.addEventListener('languagechange', () => {
  setStatus(statusKey);
  if (!document.getElementById('results').hidden) showTab(activeTab);
  if (document.getElementById('exportDialog').open) updateExportSummary();
});
