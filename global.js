console.log("IT'S ALIVE!");

export const BASE_PATH = window.location.hostname.includes("github.io")
  ? "https://satrunsdream.github.io/Portfolio/"
  : window.location.origin + "/";

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'meta/', title: 'Meta' },
  { url: 'https://github.com/SatrunsDream', title: 'GitHub' },
  { url: 'https://drive.google.com/file/d/1tDyOUQV6bGmiMTLvdvAH_JCUpUCJdNaR/view?usp=drive_link', title: 'Resume' }
];

document.addEventListener('DOMContentLoaded', () => {
    // Remove any existing navs to prevent duplicates
    document.querySelectorAll('nav').forEach(n => n.remove());
    // Inject nav and theme switcher
    const navHTML = `
    <nav style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;position:relative;">
      <div style="display:flex;gap:1.5rem;align-items:center;">
        <a href="${BASE_PATH}">Home</a>
        <a href="${BASE_PATH}projects/">Projects</a>
        <a href="${BASE_PATH}meta/">Meta</a>
        <a href="${BASE_PATH}contact/">Contact</a>
        <a href="https://github.com/SatrunsDream" target="_blank">GitHub</a>
        <a href="https://drive.google.com/file/d/1tDyOUQV6bGmiMTLvdvAH_JCUpUCJdNaR/view?usp=drive_link" target="_blank">Resume</a>
      </div>
      <div class="theme-switch" style="margin-left:auto;">
        <input type="checkbox" id="theme-toggle" aria-label="Toggle dark mode" checked>
        <label for="theme-toggle">
          <span class="icon moon">🌙</span>
          <span class="slider"></span>
          <span class="icon sun">☀️</span>
        </label>
      </div>
    </nav>`;
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Theme switcher logic
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let darkMode = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark);
    setTheme(darkMode ? 'dark' : 'light');
    if (themeToggle) {
        themeToggle.checked = darkMode;
        themeToggle.addEventListener('change', (e) => {
            setTheme(e.target.checked ? 'dark' : 'light');
        });
    }
    function setTheme(mode) {
        if (mode === 'dark') {
            document.documentElement.style.setProperty('--background-color', '#18181b');
            document.documentElement.style.setProperty('--text-color', '#fff');
            document.documentElement.style.setProperty('--card-bg', '#23232b');
            document.documentElement.style.setProperty('--color-accent', '#ff6b6b');
            document.body.classList.add('dark');
            document.body.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.style.setProperty('--background-color', '#f9f9f9');
            document.documentElement.style.setProperty('--text-color', '#18181b');
            document.documentElement.style.setProperty('--card-bg', '#fff');
            document.documentElement.style.setProperty('--color-accent', '#ff6b6b');
            document.body.classList.add('light');
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        if (themeToggle) themeToggle.checked = (mode === 'dark');
    }
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
