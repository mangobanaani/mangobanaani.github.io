/* GitHub profile & repos viewer for GH Pages */
(function () {
  const username = document.body.dataset.username || 'mangobanaani';
  const avatarEl = document.getElementById('avatar');
  const nameEl = document.getElementById('name');
  const bioEl = document.getElementById('bio');
  const statReposEl = document.getElementById('statRepos');
  const statFollowersEl = document.getElementById('statFollowers');
  const statFollowingEl = document.getElementById('statFollowing');
  const statLocationEl = document.getElementById('statLocation');
  const githubLink = document.getElementById('githubLink');
  const repoGrid = document.getElementById('repoGrid');
  const emptyState = document.getElementById('emptyState');
  const errorState = document.getElementById('errorState');
  const searchInput = document.getElementById('search');
  const languageChips = document.getElementById('languageChips');
  const toggleForks = document.getElementById('toggleForks');
  const yearEl = document.getElementById('year');
  yearEl.textContent = new Date().getFullYear();

  const GITHUB = 'https://api.github.com';
  const headers = { 'Accept': 'application/vnd.github+json' };

  const state = {
    repos: [],
    langs: new Map(),
    langFilter: null,
    includeForks: false,
    search: ''
  };

  function num(n){
    if (n == null) return '0';
    return Intl.NumberFormat().format(n);
  }

  function trimDesc(d){
    if (!d) return '';
    if (d.length <= 180) return d;
    return d.slice(0, 177) + '…';
  }

  function langColor(name){
    // lightweight palette for common languages
    const colors = {
      'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5', 'Go': '#00ADD8', 'Rust': '#DEA584',
      'C': '#555555', 'C++': '#f34b7d', 'C#': '#178600', 'Java': '#b07219', 'HTML': '#e34c26', 'CSS': '#563d7c',
      'Shell': '#89e051', 'Ruby': '#701516', 'PHP': '#4F5D95', 'Kotlin': '#A97BFF', 'Swift': '#F05138', 'Dart': '#00B4AB'
    };
    return colors[name] || '#9b8afc';
  }

  function repoCard(r){
    const href = r.homepage && r.homepage.startsWith('http') ? r.homepage : r.html_url;
    const lang = r.language ? `<span class="lang"><span class="dot" style="background:${langColor(r.language)}"></span>${r.language}</span>` : '';
    const star = r.stargazers_count > 0 ? `<span class="badge">★ ${num(r.stargazers_count)}</span>` : '';
    const fork = r.forks_count > 0 ? `<span class="badge">⑂ ${num(r.forks_count)}</span>` : '';
    const topics = (r.topics || []).slice(0, 3).map(t => `<span class="badge">#${t}</span>`).join('');
    return `
      <article class="card glass">
        <h3>${r.name}</h3>
        <p class="desc">${trimDesc(r.description)}</p>
        <div class="meta">${lang}${star}${fork}${topics}</div>
        <a class="stretched" href="${href}" target="_blank" rel="noopener"></a>
      </article>
    `;
  }

  function applyFilters(){
    const q = state.search.toLowerCase().trim();
    const filtered = state.repos.filter(r => {
      if (!state.includeForks && r.fork) return false;
      if (state.langFilter && r.language !== state.langFilter) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.description || ''} ${(r.topics||[]).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });

    repoGrid.innerHTML = filtered.map(repoCard).join('');
    emptyState.hidden = filtered.length !== 0;
  }

  function renderChips(){
    // sort by frequency desc
    const entries = Array.from(state.langs.entries()).sort((a,b)=>b[1]-a[1]);
    const chips = [
      `<button class="chip ${state.langFilter? '' : 'active'}" data-lang="">All (${num(state.repos.length)})</button>`,
      ...entries.map(([lang,count]) => `<button class="chip ${state.langFilter===lang?'active':''}" data-lang="${lang}">${lang} (${num(count)})</button>`)
    ];
    languageChips.innerHTML = chips.join('');
    languageChips.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang || null;
        state.langFilter = lang;
        renderChips();
        applyFilters();
      });
    });
  }

  function indexLanguages(repos){
    const map = new Map();
    repos.forEach(r => { if (r.language) map.set(r.language, (map.get(r.language) || 0) + 1); });
    state.langs = map;
  }

  async function fetchJSON(url){
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  }

  async function loadProfile(){
    try {
      const u = await fetchJSON(`${GITHUB}/users/${username}`);
      avatarEl.src = u.avatar_url;
      avatarEl.alt = `${u.name || u.login} avatar`;
      nameEl.textContent = u.name || u.login;
      bioEl.textContent = u.bio || bioEl.textContent;
      statReposEl.textContent = `${num(u.public_repos)} repos`;
      statFollowersEl.textContent = `${num(u.followers)} followers`;
      statFollowingEl.textContent = `${num(u.following)} following`;
      
      // Add Philippines alongside GitHub location
      const locations = [];
      if (u.location) locations.push(u.location);
      locations.push('Philippines');
      statLocationEl.textContent = locations.join(' • ');
      
      githubLink.href = u.html_url;
    } catch (e) {
      // profile is optional; show minimal fallback
      console.warn(e);
    }
  }

  async function loadRepos(){
    try {
      // GitHub API: paginate up to ~300 repos (more than enough typically)
      const perPage = 100;
      let page = 1, all = [], more = true;
      while (more && page <= 3) {
        const batch = await fetchJSON(`${GITHUB}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`);
        all = all.concat(batch);
        more = batch.length === perPage;
        page++;
      }

      // sort by stars desc then updated desc
      all.sort((a,b) => {
        if (b.stargazers_count !== a.stargazers_count) return b.stargazers_count - a.stargazers_count;
        return new Date(b.updated_at) - new Date(a.updated_at);
      });

      state.repos = all;
      indexLanguages(all);
      renderChips();
      applyFilters();
    } catch (e) {
      console.error(e);
      errorState.hidden = false;
    }
  }

  // Events
  searchInput.addEventListener('input', (e) => {
    state.search = e.target.value;
    applyFilters();
  });

  toggleForks.addEventListener('change', (e) => {
    state.includeForks = !!e.target.checked;
    applyFilters();
  });

  // Init
  loadProfile();
  loadRepos();
})();
