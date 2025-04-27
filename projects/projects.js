import { fetchJSON, renderProjects, BASE_PATH } from '../global.js';

console.log("BASE_PATH in projects.js:", BASE_PATH);

try {
  console.log("Fetching projects data...");
  const projectsData = await fetchJSON('https://satrunsdream.github.io/Portfolio/lib/projects.json');
  console.log("Projects data fetched:", projectsData);

  if (projectsData && projectsData.projects) {
    const projectsContainer = document.querySelector('.projects');
    console.log("Projects container found:", !!projectsContainer);
    
    if (projectsContainer) {
      renderProjects(projectsData.projects, projectsContainer, 'h2');
      document.querySelector('.projects-title').textContent = `Projects (${projectsData.projects.length})`;
      console.log("Projects rendered successfully");
    } else {
      console.error('Projects container not found.');
    }
  } else {
    console.error('Failed to load projects.');
  }
} catch (error) {
  console.error('Error loading projects:', error);
}