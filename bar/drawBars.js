function drawBars() {

	let yScale0 = d3.scaleBand();
	let yScale1 = d3.scaleBand();
	let xScale = d3.scaleLinear()


	function bars(parent) {
		console.log("bars")
		parent.attr("transform", function(d) { return "translate(0," + yScale0(d.name) + ")"; })
		
		parent.selectAll("rect")
		.data(function(d) {return d.groups})
		.enter()
		.append("rect")
		.attr("class","bars")
		.attr("y",(d)=> {return yScale1(d.name)})
        .attr("height",(d)=> {return yScale1.bandwidth()})
		.attr("x",(d)=> {return xScale(Math.min(0, d.value))})
		.attr("width", (d)=> {return 200})
		.attr("fill","#f3e5c3")

	}

	bars.yScale0 = (d)=>{
        yScale0 = d;
        return bars;
    }
    bars.yDomain0 = (d)=>{
        yScale0.domain(d);
        return bars;
    };
    bars.yRange0 = (d)=>{
        yScale0.rangeRound(d);
        return bars;
    };
    bars.yScale1 = (d)=>{
    	if(!d) return yScale1;
        yScale1 = d;
        return bars;
    }
    bars.yDomain1 = (d)=>{
        yScale1.domain(d);
        return bars;
    };
    bars.yRange1 = (d)=>{
        yScale1.rangeRound(d);
        return bars;
    };
    bars.xScale = (d)=>{
    	if(!d) return xScale;
        xScale = d;
        return bars;
    }
    bars.xDomain = (d)=>{
        xScale.domain(d);
        return bars;
    };
    bars.xRange = (d)=>{
        xScale.range(d);
        return bars;
    };

return bars
}