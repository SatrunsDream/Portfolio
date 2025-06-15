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