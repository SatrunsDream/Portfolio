console.log("IT'S ALIVE!");

export const BASE_PATH = window.location.hostname.includes("github.io")
  ? "https://satrunsdream.github.io/Portfolio/"
  : window.location.origin + "/";

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'meta/', title: 'Meta' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/SatrunsDream', title: 'GitHub' },
  { url: 'https://drive.google.com/file/d/1tDyOUQV6bGmiMTLvdvAH_JCUpUCJdNaR/view?usp=drive_link', title: 'Resume' }
];

document.addEventListener('DOMContentLoaded', () => {
    // Remove any existing navs to prevent duplicates
    document.querySelectorAll('nav').forEach(n => n.remove());
    // Inject nav with the same structure as the contact page
    const navHTML = `
    <nav>
      <a href="${BASE_PATH}">Home</a>
      <a href="${BASE_PATH}projects/">Projects</a>
      <a href="${BASE_PATH}meta/">Meta</a>
      <a href="${BASE_PATH}contact/">Contact</a>
      <a href="https://github.com/SatrunsDream" target="_blank">GitHub</a>
      <a href="https://drive.google.com/file/d/1tDyOUQV6bGmiMTLvdvAH_JCUpUCJdNaR/view?usp=drive_link" target="_blank">Resume</a>
    </nav>`;
    document.body.insertAdjacentHTML('afterbegin', navHTML);
});

export async function fetchJSON(url) {
  try {
    const options = {};
    
    // Add GitHub API specific headers if the URL is for GitHub API
    if (url.includes('api.github.com')) {
      options.headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-App'
      };
    }
    
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON:', error);
    return null; // Return null if fetching fails
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  for (const project of projects) {
    const article = document.createElement('article');
    article.innerHTML = `
      <a href="${project.link}" target="_blank" class="project-link">
        <${headingLevel}>${project.title}</${headingLevel}>
        <img src="${project.image}" alt="${project.title}">
        <p>${project.description}</p>
      </a>
    `;
    containerElement.appendChild(article);
  }
}
