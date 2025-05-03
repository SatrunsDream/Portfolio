import { fetchJSON, renderProjects } from '../global.js';

let projects = [];
let query = '';
let selectedIndex = -1;

const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
const svg = d3.select('svg');
const legend = d3.select('.legend');
const box = document.querySelector('.box'); // Assuming the box has a class 'box'

// Color scale for the pie chart - using a more diverse and vibrant palette
const colors = d3.scaleOrdinal()
    .range([
        '#FF6B6B', // Coral Red
        '#4ECDC4', // Turquoise
        '#45B7D1', // Sky Blue
        '#96CEB4', // Sage Green
        '#FFEEAD', // Cream
        '#D4A5A5', // Dusty Rose
        '#9B59B6', // Purple
        '#3498DB', // Blue
        '#2ECC71', // Emerald
        '#F1C40F', // Yellow
        '#E67E22', // Orange
        '#E74C3C'  // Red
    ]);

function updateBoxColor() {
    // Dynamically fetch the current theme color
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
    const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (box) {
        box.style.backgroundColor = themeColor;
        box.style.border = '2px solid #FF69B4'; // Hot Pink border
        box.style.boxShadow = '0 0 10px rgba(255, 105, 180, 0.3)'; // Subtle pink glow
        box.style.color = isDarkTheme ? 'white' : 'black';

        // Update the color of numbers inside the box
        const cells = box.querySelectorAll('div');
        cells.forEach((cell) => {
            cell.style.color = isDarkTheme ? 'white' : 'black';
        });
    }
}

function updateBoxLayout() {
    const dates = projects.map((project) => project.year).filter((year, index, self) => self.indexOf(year) === index);
    const maxColumns = 4;
    const maxRows = 3;
    const totalDates = dates.length;
}

// Function to render the pie chart and legend
function renderPieChart(filteredProjects) {
    // Clear existing content
    svg.selectAll('*').remove();
    legend.selectAll('*').remove();

    // Group projects by year and count
    const yearData = d3.rollups(
        filteredProjects,
        v => v.length,
        d => d.year
    ).map(([year, count]) => ({ year, count }));

    // Create pie chart data
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(45);

    const hoverArc = d3.arc()
        .innerRadius(0)
        .outerRadius(50); // Larger radius for hover effect

    const arcs = pie(yearData);

    // Draw pie chart slices
    svg.selectAll('path')
        .data(arcs)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colors(i))
        .attr('stroke', 'var(--border-color)')
        .attr('stroke-width', 1)
        .attr('class', 'pie-slice')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('d', hoverArc(d))
                .attr('filter', 'drop-shadow(0 0 5px rgba(0,0,0,0.3))');
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('d', arc(d))
                .attr('filter', null);
        })
        .on('click', (event, d) => {
            const index = arcs.indexOf(d);
            selectedIndex = selectedIndex === index ? -1 : index;
            updateSelection();
        });

    // Create legend items
    const legendItems = legend.selectAll('li')
        .data(yearData)
        .enter()
        .append('li')
        .attr('style', (d, i) => `--color: ${colors(i)}`)
        .on('click', (event, d) => {
            const index = yearData.indexOf(d);
            selectedIndex = selectedIndex === index ? -1 : index;
            updateSelection();
        });

    // Add swatch and text to each legend item
    legendItems.append('span')
        .attr('class', 'swatch');

    legendItems.append('span')
        .text(d => `${d.year} (${d.count})`);

    // Update selection state
    function updateSelection() {
        // Update pie chart slices
        svg.selectAll('path')
            .attr('class', (d, i) => i === selectedIndex ? 'selected pie-slice' : 'pie-slice');

        // Update legend items
        legend.selectAll('li')
            .attr('class', (d, i) => i === selectedIndex ? 'selected' : '');

        // Filter projects based on selection
        const filtered = selectedIndex === -1 
            ? filteredProjects 
            : filteredProjects.filter(p => p.year === yearData[selectedIndex].year);
        
        renderProjects(filtered, projectsContainer, 'h2');
    }
}

// Initialize the page
async function init() {
    try {
        const projectsData = await fetchJSON('https://satrunsdream.github.io/Portfolio/lib/projects.json');
        if (projectsData && projectsData.projects) {
            projects = projectsData.projects;
            renderPieChart(projects);
            renderProjects(projects, projectsContainer, 'h2');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Handle search input
searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();
    const filteredProjects = projects.filter(project => {
        const values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });
    renderPieChart(filteredProjects);
    renderProjects(filteredProjects, projectsContainer, 'h2');
});

// Initialize the page
init();
