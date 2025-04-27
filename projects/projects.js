import { fetchJSON, renderProjects, BASE_PATH } from '../global.js';

try {
  const projectsData = await fetchJSON('https://satrunsdream.github.io/Portfolio/lib/projects.json');
  if (projectsData && projectsData.projects) {
    const projectsContainer = document.querySelector('.projects');
    if (projectsContainer) {
      renderProjects(projectsData.projects, projectsContainer, 'h2');
      document.querySelector('.projects-title').textContent = `Projects (${projectsData.projects.length})`;
    } else {
      console.error('Projects container not found.');
    }
  } else {
    console.error('Failed to load projects.');
  }
} catch (error) {
  console.error('Error loading projects:', error);
}
