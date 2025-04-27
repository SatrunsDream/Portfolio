import { fetchJSON, renderProjects } from '../global.js';

try {
  const projects = await fetchJSON(`${BASE_PATH}lib/projects.json`);
  if (projects) {
    const projectsContainer = document.querySelector('.projects');
    if (projectsContainer) {
      renderProjects(projects, projectsContainer, 'h2');
      document.querySelector('.projects-title').textContent = `Projects (${projects.length})`;
    } else {
      console.error('Projects container not found.');
    }
  } else {
    console.error('Failed to load projects.');
  }
} catch (error) {
  console.error('Error loading projects:', error);
}