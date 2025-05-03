import { fetchJSON, renderProjects } from '../global.js';

let projects = [];
let query = '';
let selectedIndex = -1;

const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
const svg = d3.select('svg');
const legend = d3.select('.legend');
const box = document.querySelector('.box'); // Assuming the box has a class 'box'

function updateBoxColor() {
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color');
    const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (box) {
        box.style.backgroundColor = themeColor;
        box.style.border = '2px solid pink'; // Add pink outline to the border
        box.style.color = isDarkTheme ? 'white' : 'black'; // Adjust text color for contrast
    }
}

function updateBoxLayout() {
    const dates = projects.map((project) => project.year).filter((year, index, self) => self.indexOf(year) === index);
    const maxColumns = 4;
    const maxRows = 3;
    const totalDates = dates.length;
    const rows = Math.min(Math.ceil(totalDates / maxColumns), maxRows);
    const columns = Math.min(totalDates, maxColumns);

    if (box) {
        box.style.display = 'grid';
        box.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        box.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        box.style.width = `${columns * 100}px`; // Dynamically adjust width
        box.style.height = `${rows * 100}px`; // Dynamically adjust height
        box.innerHTML = ''; // Clear existing content

        dates.forEach((date) => {
            const cell = document.createElement('div');
            cell.textContent = date;
            cell.style.border = '1px solid pink';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            box.appendChild(cell);
        });
    }
}

// Update the box layout whenever projects are updated
function updateBox() {
    updateBoxColor();
    updateBoxLayout();
}

// Listen for changes in the color scheme
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBox);

// Call updateBox whenever the theme changes
const themeObserver = new MutationObserver(updateBox);
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

// Initial call to set the box color and layout
updateBox();

function getFilteredProjects() {
    return projects.filter((project) => {
        const matchesQuery = Object.values(project).join('\n').toLowerCase().includes(query);
        const matchesYear = selectedIndex === -1 || project.year === data[selectedIndex].label;
        return matchesQuery && matchesYear;
    });
}

function renderPieChart() {
    const filteredProjects = getFilteredProjects();

    const rolledData = d3.rollups(
        filteredProjects,
        (v) => v.length,
        (d) => d.year
    );

    const data = rolledData.map(([year, count]) => ({ label: year, value: count }));
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(40);

    const arcs = pie(data);

    svg.selectAll('path')
        .data(arcs)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (_, i) => colors(i))
        .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
        .on('click', (_, i) => {
            selectedIndex = selectedIndex === i ? -1 : i;
            renderProjects(getFilteredProjects(), projectsContainer, 'h2');
            renderPieChart();
        });

    legend.selectAll('li')
        .data(data)
        .enter()
        .append('li')
        .attr('style', (_, i) => `--color:${colors(i)}`)
        .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
        .text((d) => `${d.label} (${d.value})`)
        .on('click', (_, i) => {
            selectedIndex = selectedIndex === i ? -1 : i;
            renderProjects(getFilteredProjects(), projectsContainer, 'h2');
            renderPieChart();
        });
}

searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();
    renderProjects(getFilteredProjects(), projectsContainer, 'h2');
    renderPieChart();
});

try {
    const projectsData = await fetchJSON('https://satrunsdream.github.io/Portfolio/lib/projects.json');
    if (projectsData && projectsData.projects) {
        projects = projectsData.projects;
        renderProjects(projects, projectsContainer, 'h2');
        renderPieChart();
        updateBox(); // Update the box after loading projects
    } else {
        console.error('Failed to load projects.');
    }
} catch (error) {
    console.error('Error loading projects:', error);
}
