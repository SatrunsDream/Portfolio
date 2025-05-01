import { fetchJSON, renderProjects } from '../global.js';

try {
  const projectsData = await fetchJSON('https://satrunsdream.github.io/Portfolio/lib/projects.json');
  if (projectsData && projectsData.projects) {
    const latestProjects = projectsData.projects.slice(0, 3); // Get the latest 3 projects
    const latestProjectsContainer = document.querySelector('.latest-projects');
    if (latestProjectsContainer) {
      renderProjects(latestProjects, latestProjectsContainer, 'h3');
    } else {
      console.error('Latest Projects container not found.');
    }
  } else {
    console.error('Failed to load projects.');
  }
} catch (error) {
  console.error('Error loading latest projects:', error);
}
