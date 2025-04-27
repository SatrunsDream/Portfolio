import { fetchJSON, renderProjects } from './global.js';

const projects = await fetchJSON(`${BASE_PATH}lib/projects.json`);
if (projects) {
  const latestProjects = projects.slice(0, 3);
  const projectsContainer = document.querySelector('.projects');
  renderProjects(latestProjects, projectsContainer, 'h2');
} else {
  console.error('Failed to load projects.');
}

const profileStats = document.querySelector('#profile-stats');
if (profileStats) {
  const githubData = await fetchJSON('https://api.github.com/users/SatrunsDream');
  if (githubData) {
    profileStats.innerHTML = `
      <h2>My GitHub Stats</h2>
      <div class="github-stats">
        <div>
          <h3>Followers</h3>
          <p>${githubData.followers}</p>
        </div>
        <div>
          <h3>Following</h3>
          <p>${githubData.following}</p>
        </div>
        <div>
          <h3>Public Repos</h3>
          <p>${githubData.public_repos}</p>
        </div>
        <div>
          <h3>Public Gists</h3>
          <p>${githubData.public_gists}</p>
        </div>
      </div>
    `;
  } else {
    profileStats.innerHTML = `<p>Failed to load GitHub stats. Please try again later.</p>`;
  }
}