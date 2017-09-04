import * as d3 from 'd3';
import gChartframe from 'g-chartframe';
import * as gLegend from 'g-legend';
import * as gAxis from 'g-axis';
import * as parseData from './parseData.js';
import * as circleTimeline from './circleTimeline.js';

// User defined constants similar to version 2
const dateStructure = '%Y';

const dataFile = 'data.csv';

const sharedConfig = {
    title: 'Title not yet added',
    subtitle: 'Subtitle not yet added',
    source: 'Source not yet added',
};
const yMin = 0;// sets the minimum value on the yAxis
const yMax = 0;// sets the maximum value on the yAxis
const yAxisHighlight = 100; // sets which tick to highlight on the yAxis
const numTicksy = 5;// Number of tick on the uAxis
const yAxisAlign = 'left';// alignment of the axis
const xAxisAlign = 'bottom';// alignment of the axis
const legendAlign = 'hori';// hori or vert, alignment of the legend
const legendType = 'rect'; // rect, line or circ, geometry of legend marker

// Individual frame configuratiuon, used to set margins (defaults shown below) etc
const frame = {
    webS: gChartframe.webFrameS(sharedConfig)
   .margin({ top: 100, left: 15, bottom: 82, right: 50 })
   // .title("Put headline here") //use this if you need to override the defaults
   // .subtitle("Put headline |here") //use this if you need to override the defaults
   .height(700),

    webM: gChartframe.webFrameM(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 86, right: 50 })
   // .title("Put headline here")
   .height(800),

    webMDefault: gChartframe.webFrameMDefault(sharedConfig)
    .margin({ top: 100, left: 20, bottom: 86, right: 50 })
    // .title("Put headline here")
    .height(800),

    webL: gChartframe.webFrameL(sharedConfig)
   .margin({ top: 100, left: 20, bottom: 104, right: 50 })
   // .title("Put headline here")
   .height(1000)
   .fullYear(true),

    print: gChartframe.printFrame(sharedConfig)
   .margin({ top: 40, left: 7, bottom: 35, right: 15 })
   // .title("Put headline here")
   .height(150)
   .width(55),

    social: gChartframe.socialFrame(sharedConfig)
   .margin({ top: 100, left: 50, bottom: 100, right: 80 })
   // .title("Put headline here")
   .width(612)
   .height(612),

    video: gChartframe.videoFrame(sharedConfig)
   .margin({ left: 150, right: 207, bottom:150, top: 233 }),
   // .title("Put headline here")
};


// add the frames to the page...
d3.selectAll('.framed')
    .each(function addFrames() {
        const figure = d3.select(this);
        figure.select('svg')
            .call(frame[figure.node().dataset.frame]);
    });

parseData.fromCSV(dataFile, dateStructure).then(({ valueExtent, columnNames, seriesNames, plotData, dateDomain }) => {
    // make sure all the dates in the date column are a date object
    // var parseDate = d3.timeParse("%d/%m/%Y")
    // data.forEach(function(d) {
    //             d.date=parseDate(d.date);
    //         });

    // automatically calculate the seriesnames excluding the "name" column

    // define chart
    const myChart = circleTimeline.draw() // eslint-disable-line
          .seriesNames(seriesNames)

    const countCategories = plotData.length;

        console.log(countCategories)

    Object.keys(frame).forEach((frameName) => {
        const currentFrame = frame[frameName];

        const myXAxis = gAxis.xDate();// sets up yAxis
        const myChart = circleTimeline.draw(); // eslint-disable-line
        const myLegend = gLegend.legend();

        // define other functions to be called
        const tickSize = currentFrame.dimension().width;// Used when drawing the yAxis ticks

         //Get the size of the container to set scales for each box
        const h = currentFrame.dimension().height;
        const w = currentFrame.dimension().width;
        const chartWidth = w - currentFrame.margin().left - currentFrame.margin().right;
        const chartHeight = h - currentFrame.margin().bottom;

        //calculate the size of the max circle - here using height
        const maxCircle = (chartHeight / 100) * countCategories;
        console.log(frameName,h,)

        //set radius scale
        const rScale = d3.scalePow().exponent(0.5)
            .domain([0, valueExtent[1]])
            .range([0, maxCircle]);

        myChart
            .plotDim(currentFrame.dimension())
            .rem(currentFrame.rem())
            .colourPalette((frameName));

        const base = currentFrame.plot().append('g'); // eslint-disable-line

        d3.select(currentFrame.plot().node().parentNode)
            .call(currentFrame);

        myXAxis
            .align(xAxisAlign)
            .domain(dateDomain)
            .range([0, currentFrame.dimension().width])
            .frameName(frameName);

        myChart
            .rScale(rScale)
            .maxCircle(maxCircle)
            .xScale(myXAxis.scale())
            // .yScale(myYAxis.yScale())

        // currentFrame.plot()
        //   .call(myXAxis);

        // if (xAxisAlign == 'bottom' ){
        //     myXAxis.xLabel().attr('transform', `translate(0,${currentFrame.dimension().height})`);
        // }
        // if (xAxisAlign == 'top' ){
        //     myXAxis.xLabel().attr('transform', `translate(0,${myXAxis.tickSize()})`);
        // }


        currentFrame.plot()
            .selectAll('.timelineHolder')
            .data(plotData)
            .enter()
            .append('g')
                .attr('transform', (d,i) => `translate(${currentFrame.margin().left}, ${(i*maxCircle*2.75)})`)
                .attr('class', 'timelineHolder')
            .call(myChart)
            .call(myXAxis);


        // Set up legend for this frame
        myLegend
            .seriesNames(seriesNames)
            .geometry(legendType)
            .frameName(frameName)
            .rem(myChart.rem())
            .alignment(legendAlign)
            .colourPalette((frameName));

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
    });
    // addSVGSavers('figure.saveable');
});
