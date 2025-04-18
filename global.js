console.log("IT'S ALIVE!");


const BASE_PATH = "https://satrunsdream.github.io/Portfolio/";

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/SatrunsDream', title: 'GitHub' },
  { url: 'https://drive.google.com/file/d/1tDyOUQV6bGmiMTLvdvAH_JCUpUCJdNaR/view?usp=drive_link', title: 'Resume' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  // Always use absolute paths for internal links
  let url = p.url.startsWith('http') ? p.url : new URL(p.url, BASE_PATH).href;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;

  // Highlight the current page - improved to handle case sensitivity
  const currentPath = window.location.pathname.toLowerCase();
  const linkPath = a.pathname.toLowerCase();
  a.classList.toggle(
    'current',
    a.host === location.host && 
    (currentPath === linkPath || 
     (currentPath.endsWith('/') && linkPath.endsWith('/index.html')) ||
     (currentPath.endsWith('/') && linkPath.endsWith('/')))
  );

  // Open external links in a new tab
  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.append(a);
}

// Add theme switcher
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

const select = document.querySelector('.color-scheme select');

// Function to set color scheme
function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

// Load saved preference or default to automatic
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
} else {
  setColorScheme('light dark');
}

// Save preference on change
select.addEventListener('input', (event) => {
  const colorScheme = event.target.value;
  setColorScheme(colorScheme);
  localStorage.colorScheme = colorScheme;
});

const form = document.querySelector('form');
form?.addEventListener('submit', (event) => {
  event.preventDefault(); 

  const data = new FormData(form);
  const params = new URLSearchParams();

  for (let [name, value] of data) {
    params.append(name, encodeURIComponent(value)); // Properly encode values
  }

  const mailtoUrl = `${form.action}?${params.toString()}`;
  location.href = mailtoUrl; // Open the mailto URL
});
