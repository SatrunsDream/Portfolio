import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  return d3.groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,
        configurable: true,
        writable: true
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const statsGrid = d3.select('#stats').html('').append('dl').attr('class', 'stats');
  // Total LOC
  statsGrid.append('dt').text('Total LOC');
  statsGrid.append('dd').text(data.length);
  // Total commits
  statsGrid.append('dt').text('Total commits');
  statsGrid.append('dd').text(commits.length);
  // Number of files
  const fileCount = d3.group(data, d => d.file).size;
  statsGrid.append('dt').text('Number of files');
  statsGrid.append('dd').text(fileCount);
  // Average file length
  const fileLengths = d3.rollups(
    data,
    v => d3.max(v, v => v.line),
    d => d.file
  );
  const avgFileLength = d3.mean(fileLengths, d => d[1]);
  statsGrid.append('dt').text('Avg file length');
  statsGrid.append('dd').text(Math.round(avgFileLength));
  // Average line length
  const avgLineLength = d3.mean(data, d => d.length);
  statsGrid.append('dt').text('Avg line length');
  statsGrid.append('dd').text(Math.round(avgLineLength));
}

function renderScatterPlot(data, commits, width, height) {
  d3.select('#chart').selectAll('svg').remove(); // Clear previous chart
  const margin = { top: 10, right: 10, bottom: 50, left: 40 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');
  const xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();
  const yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);
  // Add gridlines
  const gridlines = svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);
  gridlines.call(d3.axisLeft(yScale)
    .tickFormat('')
    .tickSize(-usableArea.width));
  // Create axes
  const xAxis = d3.axisBottom(xScale)
    .ticks(width < 600 ? 4 : 8)
    .tickFormat(d3.timeFormat('%b %d'));
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => String(d % 24).padStart(2, '0') + ':00');
  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis)
    .selectAll('text')
    .attr('transform', 'rotate(-35)')
    .style('text-anchor', 'end');
  // Add Y axis
  svg.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);

  const dots = svg.append('g').attr('class', 'dots');

  dots.selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

  svg.call(d3.brush()
    .on('start brush end', (event) => brushed(event, commits, xScale, yScale)));

  function brushed(event, commits, xScale, yScale) {
    const selection = event.selection;
    d3.selectAll('circle').classed('selected', (d) =>
      isCommitSelected(selection, d, xScale, yScale)
    );
    renderSelectionCount(selection, commits, xScale, yScale);
    renderLanguageBreakdown(selection, commits, xScale, yScale);
    renderSelectionStats(selection, commits, xScale, yScale);
  }

  function isCommitSelected(selection, commit, xScale, yScale) {
    if (!selection) return false;
    const [x0, y0] = selection[0];
    const [x1, y1] = selection[1];
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
  }
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter(d => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;

  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? commits.filter(d => isCommitSelected(selection, d))
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const lines = selectedCommits.flatMap(d => d.lines);
  const breakdown = d3.rollup(
    lines,
    v => v.length,
    d => d.type
  );

  container.innerHTML = '';
  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);
    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}

function renderSelectionStats(selection, commits, xScale, yScale) {
  const selectedCommits = selection
    ? commits.filter(d => isCommitSelected(selection, d, xScale, yScale))
    : [];

  const statsContainer = d3.select('#selection-stats');
  statsContainer.html(''); // Clear previous stats

  if (selectedCommits.length === 0) {
    statsContainer.append('p').text('No commits selected.');
    return;
  }

  const totalLines = d3.sum(selectedCommits, d => d.totalLines);
  const avgLineLength = d3.mean(
    selectedCommits.flatMap(d => d.lines),
    d => d.length
  );

  statsContainer.append('p').text(`Selected Commits: ${selectedCommits.length}`);
  statsContainer.append('p').text(`Total Lines of Code: ${totalLines}`);
  statsContainer.append('p').text(`Average Line Length: ${Math.round(avgLineLength)}`);
}

// Responsive chart rendering
function getChartSize() {
  const chartDiv = document.getElementById('chart');
  const width = chartDiv.offsetWidth || 900;
  const height = Math.max(window.innerHeight * 0.6, 400);
  return { width, height };
}

function drawResponsiveScatter() {
  const { width, height } = getChartSize();
  renderScatterPlot(data, commits, width, height);
}

window.addEventListener('resize', drawResponsiveScatter);

// Initial draw
let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits);
drawResponsiveScatter();
