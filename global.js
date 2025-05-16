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
    // Inject nav with correct order and LinkedIn
    const navHTML = `
    <nav id="main-nav">
      <a href="${BASE_PATH}">Home</a>
      <a href="${BASE_PATH}projects/">Projects</a>
      <a href="${BASE_PATH}contact/">Contact</a>
      <a href="https://github.com/SatrunsDream" target="_blank">GitHub</a>
      <a href="https://www.linkedin.com/in/sardor-sobirov/" target="_blank">LinkedIn</a>
      <a href="https://drive.google.com/file/d/1tDyOUQV6bGmiMTLvdvAH_JCUpUCJdNaR/view?usp=drive_link" target="_blank">Resume</a>
      <a href="${BASE_PATH}meta/">Meta</a>
    </nav>
    <div class="theme-switch">
      <span class="icon sun" id="theme-sun" title="Light mode" style="cursor:pointer;">☀️</span>
      <span class="icon moon" id="theme-moon" title="Dark mode" style="cursor:pointer;">🌙</span>
    </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Theme switcher logic
    const sun = document.getElementById('theme-sun');
    const moon = document.getElementById('theme-moon');
    const nav = document.getElementById('main-nav');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let darkMode = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark);

    function setTheme(mode) {
        if (mode === 'dark') {
            document.documentElement.style.setProperty('--background-color', '#18181b');
            document.documentElement.style.setProperty('--text-color', '#fff');
            document.documentElement.style.setProperty('--nav-bg', '#23232b');
            document.documentElement.style.setProperty('--nav-link-color', '#fff');
            document.documentElement.style.setProperty('--nav-link-hover-bg', '#ff69b420');
            document.documentElement.style.setProperty('--card-bg', '#23232b');
            document.body.classList.add('dark');
            document.body.classList.remove('light');
            localStorage.setItem('theme', 'dark');
            sun.classList.remove('active');
            moon.classList.add('active');
        } else {
            document.documentElement.style.setProperty('--background-color', '#f9f9f9');
            document.documentElement.style.setProperty('--text-color', '#000');
            document.documentElement.style.setProperty('--nav-bg', '#fff');
            document.documentElement.style.setProperty('--nav-link-color', '#000');
            document.documentElement.style.setProperty('--nav-link-hover-bg', '#ff69b420');
            document.documentElement.style.setProperty('--card-bg', '#fff');
            document.body.classList.add('light');
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            sun.classList.add('active');
            moon.classList.remove('active');
        }
        // Update nav background color directly for instant effect
        if (nav) nav.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--nav-bg');
    }

    setTheme(darkMode ? 'dark' : 'light');
    sun.addEventListener('click', () => setTheme('light'));
    moon.addEventListener('click', () => setTheme('dark'));
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
