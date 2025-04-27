import { fetchJSON, renderProjects, BASE_PATH } from './global.js';

try {
  const projectsData = await fetchJSON('https://satrunsdream.github.io/Portfolio/lib/projects.json');
  if (projectsData && projectsData.projects) {
    const latestProjects = projectsData.projects.slice(0, 3);
    const projectsContainer = document.querySelector('.projects');
    if (projectsContainer) {
      renderProjects(latestProjects, projectsContainer, 'h2');
    } else {
      console.error('Projects container not found.');
    }
  } else {
    console.error('Failed to load projects.');
  }
} catch (error) {
  console.error('Error loading projects:', error);
}

try {
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
      console.error('Failed to fetch GitHub data.');
    }
  } else {
    console.error('Profile stats container not found.');
  }
} catch (error) {
  console.error('Error loading GitHub stats:', error);
}