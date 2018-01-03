import * as d3 from 'd3';
// import gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleBand();
    let yAxisAlign = 'left';
    let rem = 16;
    let fiscal = false;
    const colourScale = d3.scaleOrdinal();

    function chart(parent) {
        const cellSize = window.plotDim.width / 54;

        parent
            .attr('id', d => `calendar-${d.key}`)
            .attr('transform', (d, i) => {
                const calendarOffset = (i * ((cellSize * 7) + (rem * 2)));
                return `translate(0, ${calendarOffset})`;
            });

        // Add days
        parent
            .append('g')
            .attr('transform', `translate(0,${rem * 1.5})`)
            .attr('id', 'alldays')
            .selectAll('.day')
            .data(d => d.values)
            .enter()
            .append('rect')
            // Need to do something with date
            // .attr('id', d => d.date)
            .attr('class', 'day')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('x', (d) => {
                if (fiscal) {
                    return d.fweek * cellSize;
                }
                return getWeekOfYear(d.date) * cellSize;
            })
            .attr('y', (d) => {
                const getDayOfWeek = d3.timeFormat('%u');
                return getDayOfWeek(d.date) * cellSize;
            })
            .style('fill', d => colourScale(d.value));

        // Make this optional?
        parent
            .append('g')
            .attr('id', 'monthOutlines')
            .selectAll('.month')
            .data((d) => {
                if (fiscal) {
                    return d3.timeMonths(
                        new Date(parseInt(d.key, 10) - 1, 3, 1),
                        new Date(parseInt(d.key, 10), 2, 31),
                    );
                }
                return d3.timeMonths(
                    new Date(parseInt(d.key, 10), 0, 1),
                    new Date(parseInt(d.key, 10), 11, 31),
                );
            })
            .enter()
            .append('path')
            .attr('class', 'month')
            .attr('transform', `translate(0, ${rem * 1.5})`)
            .attr('d', d => monthPath(d, fiscal, cellSize));
    }

    chart.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return chart;
    };

    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };

    chart.fiscal = (d) => {
        if (typeof d === 'undefined') return fiscal;
        fiscal = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        colourScale.range(d);
        return chart;
    };

    return chart;
}

function monthPath(t0, fiscal, cellSize) {
    const t1 = new Date(t0.getFullYear(), t0.getMonth(), 0);

    let w0;
    let w1;

    if (fiscal) {
        w0 = getFiscalWeek(t0);
        w1 = getFiscalWeek(t1);
        if (w0 > w1) { w0 = 0; }
    } else {
        w0 = getWeekOfYear(t0);
        w1 = getWeekOfYear(t1);
    }

    let d0 = t0.getDay();
    const d1 = t1.getDay();

    if (w0 === 0) { d0 = 0; }

    w0 = parseInt(w0, 10);
    w1 = parseInt(w1, 10);

    return `M${(w0 + 1) * cellSize},${d0 * cellSize}`
        + `H${w0 * cellSize}V${7 * cellSize}`
        + `H${w1 * cellSize}V${(d1 + 1) * cellSize}`
        + `H${(w1 + 1) * cellSize}V0`
        + `H${(w0 + 1) * cellSize}Z`;
}

function getWeekOfYear(e) {
    return d3.timeFormat('%U')(e);
}

function getFiscalWeek(e, parseDate) {
    const startDate = `06/04/${e.getFullYear()}`;
    const week = getWeekOfYear(e);
    const startWeek = getWeekOfYear(parseDate(startDate));

    let fweek;
    if (e >= parseDate(startDate)) {
        fweek = week - startWeek;
    } else {
        fweek = 52 - (startWeek - week);
    }
    return fweek;
}
