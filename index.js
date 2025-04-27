import { fetchJSON, renderProjects } from './global.js';

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');

const profileStats = document.querySelector('#profile-stats');
if (profileStats) {
  const githubData = await fetchJSON('https://api.github.com/users/SatrunsDream');
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
}