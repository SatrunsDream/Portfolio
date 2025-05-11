import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  return d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
    const first = lines[0];
    const { author, date, time, timezone, datetime } = first;
    const ret = {
      id: commit,
      url: `https://github.com/YOUR_REPO/commit/${commit}`,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };
    Object.defineProperty(ret, 'lines', { value: lines });
    return ret;
  });
}

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);
}

function calculateFileStats(data) {
  const fileGroups = d3.groups(data, (d) => d.file);
  const fileLengths = fileGroups.map(([file, lines]) => ({
    file,
    length: lines.length,
    longestLine: d3.max(lines, (d) => d.length),
  }));

  const totalLines = d3.sum(fileLengths, (d) => d.length);
  const totalFiles = fileLengths.length;
  const maxFile = d3.max(fileLengths, (d) => d.length);
  const longestFile = fileLengths.find((d) => d.length === maxFile).file;
  const avgFileLength = totalLines / totalFiles;
  const longestLine = d3.max(fileLengths, (d) => d.longestLine);
  const maxDepth = d3.max(data, (d) => d.depth);

  return {
    totalFiles,
    maxFile,
    longestFile,
    avgFileLength,
    longestLine,
    maxDepth,
  };
}

function renderFileStats(data) {
  const stats = calculateFileStats(data);
  const dl = d3.select('#language-breakdown');
  dl.html(''); // Clear existing content

  dl.append('dt').text('Number of files');
  dl.append('dd').text(stats.totalFiles);
  dl.append('dt').text('Maximum file length (lines)');
  dl.append('dd').text(stats.maxFile);
  dl.append('dt').text('Longest file');
  dl.append('dd').text(stats.longestFile);
  dl.append('dt').text('Average file length (lines)');
  dl.append('dd').text(stats.avgFileLength.toFixed(2));
  dl.append('dt').text('Longest line length');
  dl.append('dd').text(stats.longestLine);
  dl.append('dt').text('Maximum depth');
  dl.append('dd').text(stats.maxDepth);
}

function renderScatterPlot(data, commits) {
  const width = window.innerWidth * 0.9; // 90% of the window width
  const height = window.innerHeight * 0.7; // 70% of the window height
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const dots = svg.append('g').attr('class', 'dots');
  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
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

  svg.call(
    d3
      .brush()
      .on('start brush end', (event) => brushed(event, commits, xScale, yScale))
  );

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${String(d % 24).padStart(2, '0')}:00`);

  svg.append('g').attr('transform', `translate(0, ${usableArea.bottom})`).call(xAxis);
  svg.append('g').attr('transform', `translate(${usableArea.left}, 0)`).call(yAxis);

  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  if (!commit) return;
  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
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

function brushed(event, commits, xScale, yScale) {
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', (d) =>
    isCommitSelected(selection, d, xScale, yScale)
  );
  renderSelectionCount(selection, commits, xScale, yScale);
  renderLanguageBreakdown(selection, commits, xScale, yScale);
}

function isCommitSelected(selection, commit, xScale, yScale) {
  if (!selection) return false;
  const [x0, y0] = selection[0];
  const [x1, y1] = selection[1];
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function renderSelectionCount(selection, commits, xScale, yScale) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d, xScale, yScale))
    : [];
  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;
}

function renderLanguageBreakdown(selection, commits, xScale, yScale) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d, xScale, yScale))
    : [];
  const container = document.getElementById('language-breakdown');
  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const lines = selectedCommits.flatMap((d) => d.lines);
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );
  container.innerHTML = '';
  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);
    container.innerHTML += `<dt>${language}</dt><dd>${count} lines (${formatted})</dd>`;
  }
}

(async function () {
  const data = await loadData();
  const commits = processCommits(data);
  renderCommitInfo(data, commits);
  renderScatterPlot(data, commits);
  renderFileStats(data);
})();
