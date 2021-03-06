import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import gChartcolour from 'g-chartcolour';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as stackedColumnChart from './stackedColumnChart.js';

const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const yMin = -15;// sets the minimum value on the yAxis
const yMax = 20;// sets the maximum value on the yAxis
const yAxisHighlight = 100; // sets which tick to highlight on the yAxis
const numTicksy = 5; // Number of tick on the xAxis
const divisor = 1;// sets the formatting on linear axis for ’000s and millions
const yAxisAlign = 'right';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const legendAlign = 'vert';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker
const invertLegend = true; // reverse order of legend items

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
        .margin({
            top: 100, left: 15, bottom: 82, right: 5,
        })
    // .title("Put headline here") //use this if you need to override the defaults
    // .subtitle("Put headline |here") //use this if you need to override the defaults
        .height(400),

    webM: gChartframe.webFrameM(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 5,
        })
    // .title("Put headline here")
        .height(500),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 86, right: 5,
        })
    // .title("Put headline here")
        .height(500),

    webL: gChartframe.webFrameL(sharedConfig)
        .margin({
            top: 100, left: 20, bottom: 104, right: 5,
        })
    // .title("Put headline here")
        .height(700)
        .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
        .margin({
            top: 40, left: 7, bottom: 35, right: 7,
        })
    // .title("Put headline here")
        .width(53.71)// 1 col
        // .width(112.25)// 2 col
        // .width(170.8)// 3 col
        // .width(229.34)// 4 col
        // .width(287.88)// 5 col
        // .width(346.43)// 6 col
        // .width(74)// markets std print
        .height(69.85), // std print (use 58.21mm for markets charts that matter)

    social: gChartframe.socialFrame(sharedConfig)
        .margin({
            top: 140, left: 50, bottom: 138, right: 40,
        })
    // .title("Put headline here")
        .width(612)
        .height(612),

    video: gChartframe.videoFrame(sharedConfig)
        .margin({
            left: 207, right: 207, bottom: 210, top: 233,
        }),
    // .title("Put headline here")
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.load(dataFile, { invertLegend })
    .then(({ valueExtent, seriesNames, plotData }) => {
    // define chart
    const myChart = stackedColumnChart.draw() // eslint-disable-line
            .seriesNames(seriesNames)
            .yAxisAlign(yAxisAlign);

        Object.keys(frame).forEach((frameName) => {
            const currentFrame = frame[frameName];

            const myXAxis = gAxis.xOrdinal();// sets up yAxis
            const myYAxis = gAxis.yLinear();
            const myChart = stackedColumnChart.draw(); // eslint-disable-line
            const myLegend = gLegend.legend();

            const divergingScaleColours = d3.scaleOrdinal();
            let setColourScale;

            // check number of categories to determine the right palette
            const getColourScale = function getColourScale(series) {
                if (series.length === 5) {
                    setColourScale = gChartcolour.diverging_5;
                } else if (series.length === 3) {
                    setColourScale = gChartcolour.diverging_3;
                } else {
                    setColourScale = gChartcolour.categorical_bar;
                }
                return setColourScale;
            };

            divergingScaleColours
                .range(getColourScale(seriesNames));

            // define other functions to be called
            const tickSize = currentFrame.dimension().width; // Used when drawing the yAxis ticks

            myChart
                .yRange([currentFrame.dimension().height, 0])
                .plotDim(currentFrame.dimension())
                .rem(currentFrame.rem())
                .colourPalette(divergingScaleColours);

            myYAxis
                .scale(myChart.yScale())
                .numTicks(numTicksy)
                .tickSize(tickSize)
                .yAxisHighlight(yAxisHighlight)
                .divisor(divisor)
                .align(myChart.yAxisAlign());

            myYAxis
                .align(yAxisAlign)
                .domain([Math.min(yMin, valueExtent[0]), Math.max(yMax, valueExtent[1])])
                .numTicks(numTicksy)
                .frameName(frameName);

        const base = currentFrame.plot().append('g'); // eslint-disable-line

            currentFrame.plot()
                .call(myYAxis);

            // return the value in the variable newMargin
            if (yAxisAlign === 'right') {
                const newMargin = myYAxis.labelWidth() + currentFrame.margin().right;
                // Use newMargin redefine the new margin and range of xAxis
                currentFrame.margin({ right: newMargin });
            // yAxis.yLabel().attr('transform', `translate(${currentFrame.dimension().width},0)`);
            }
            if (yAxisAlign === 'left') {
                const newMargin = myYAxis.labelWidth() + currentFrame.margin().left;
                // Use newMargin redefine the new margin and range of xAxis
                currentFrame.margin({ left: newMargin });
                myYAxis.yLabel().attr('transform', `translate(${(myYAxis.tickSize() - myYAxis.labelWidth())},0)`);
            }
            d3.select(currentFrame.plot().node().parentNode)
                .call(currentFrame);

            myXAxis
                .align(xAxisAlign)
                .domain(plotData.map(d => d.name))
                .rangeRound([0, currentFrame.dimension().width], 10)
                .frameName(frameName);

            myChart
                .xScale(myXAxis.scale());

            currentFrame.plot()
                .call(myXAxis);

            if (xAxisAlign === 'bottom') {
                myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
            }
            if (xAxisAlign === 'top') {
                myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
            }


            currentFrame.plot()
                .selectAll('.columnHolder')
                .data(plotData)
                .enter()
                .append('g')
                .attr('class', d => `${d.name}_columnHolder`)
                .call(myChart);


            // Set up legend for this frame
            myLegend
                .seriesNames(seriesNames)
                .geometry(legendType)
                .frameName(frameName)
                .rem(myChart.rem())
                .alignment(legendAlign)
                .colourPalette(divergingScaleColours);

            // Draw the Legend
            currentFrame.plot()
                .append('g')
                .attr('id', 'legend')
                .selectAll('.legend')
                .data(seriesNames)
                .enter()
                .append('g')
                .classed('legend', true)
                .call(myLegend);

            // myXAxis.xLabel().selectAll('.tick line').remove();
        });
    // addSVGSavers('figure.saveable');
    });
