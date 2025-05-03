import { fetchJSON, renderProjects } from '../global.js';

let projects = [];
let query = '';
let selectedIndex = -1;

const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
const svg = d3.select('svg');
const legend = d3.select('.legend');

function renderPieChart(filteredProjects) {
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
            const filteredByYear = selectedIndex === -1
                ? projects
                : projects.filter((p) => p.year === data[i].label);
            renderProjects(filteredByYear, projectsContainer, 'h2');
            renderPieChart(filteredByYear);
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
            const filteredByYear = selectedIndex === -1
                ? projects
                : projects.filter((p) => p.year === data[i].label);
            renderProjects(filteredByYear, projectsContainer, 'h2');
            renderPieChart(filteredByYear);
        });
}

searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();
    const filteredProjects = projects.filter((project) => {
        const values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});

try {
    const projectsData = await fetchJSON('https://satrunsdream.github.io/Portfolio/lib/projects.json');
    if (projectsData && projectsData.projects) {
        projects = projectsData.projects;
        renderProjects(projects, projectsContainer, 'h2');
        renderPieChart(projects);
    } else {
        console.error('Failed to load projects.');
    }
} catch (error) {
    console.error('Error loading projects:', error);
}
