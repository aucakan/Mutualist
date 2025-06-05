let results = {mutual: [], fans: [], unf: []};

function extractUsernames(html) {
  let usernames = new Set();
  let regex = /https:\/\/www\.instagram\.com\/([^/"']+)/g;
  let m;
  while ((m = regex.exec(html))) {
    usernames.add(m[1].toLowerCase());
  }
  return usernames;
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function analyze() {
  const followersFile = document.getElementById('followersFile').files[0];
  const followingFile = document.getElementById('followingFile').files[0];
  if (!followersFile || !followingFile) {
    alert("İki dosyayı da seçmelisiniz!");
    return;
  }

  const [followersHTML, followingHTML] = await Promise.all([
    readFile(followersFile), readFile(followingFile)
  ]);
  const followers = extractUsernames(followersHTML);
  const following = extractUsernames(followingHTML);

  const mutual = [...followers].filter(u => following.has(u)).sort();
  const fans = [...followers].filter(u => !following.has(u)).sort();
  const unf = [...following].filter(u => !followers.has(u)).sort();

  results = {mutual, fans, unf};
  document.getElementById('count-mutual').innerText = mutual.length;
  document.getElementById('count-fans').innerText = fans.length;
  document.getElementById('count-unf').innerText = unf.length;
  document.getElementById('tabs').style.display = '';
  showTab('mutual');
}

function showTab(key) {
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  document.getElementById('tab-' + (key === 'mutual' ? 'mutual' : key === 'fans' ? 'fans' : 'unf')).classList.add('active');
  let list = results[key] || [];
  let html = '';
  list.forEach((username, idx) => {
    html += `<div><span class="item-num">${String(idx+1).padStart(4,' ')}</span><span class="username">${''}${username}</span></div>`;
  });
  if (!html) html = '<i style="color:#999;">Hiç kullanıcı yok.</i>';
  document.getElementById('result').innerHTML = html;
}
