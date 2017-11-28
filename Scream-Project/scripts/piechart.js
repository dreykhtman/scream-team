function loadPieChart(data) {
    
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
        targetDiv = "svg";

    let color = d3.scaleOrdinal(["#CDA34F", "#373F27", "#636B46", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    // grouping data by redlist/greenlist/other categories
    let dataByTime = d3.nest()
        .key((d) => { return d.type || 'other'; })
        .rollup((v) => { return d3.mean(v, (d) => { return d.browsingTime; }); })
        .entries(data);

    // calculating total browsing time for all categories to create percentage time in case any category has 0 value
    let allTime = dataByTime.reduce((prev,next) => { return prev += next.value},0)
    let fluffTime = allTime * 0.1
    
    // value = browsingTime
    let pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return !!d.value ? Number(d.value) : fluffTime;
        });

    let path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    let label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    // using grouped data to create pie chart
    let arc = g.selectAll(".arc")
        .data(pie(dataByTime))
        .enter().append("g")
        .attr("class", "arc")

    // (key = list category)
    let pathSection = arc.append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            return color(d.data.key);
        })
        .attr("data", function(d) {
            d.data.value = (d.endAngle - d.startAngle) / (2 * Math.PI) * 100;
            return JSON.stringify(d.data);
        });

    arc.append("text")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.35em")
        .text(function (d) { return d.data.key; });
    
    pathSection.on("mouseover", function(d) {
        let currElement = d3.select(this);
        currElement.attr("style", "fill-opacity:1;");

        let fadeInSpeed = 100;
        d3.select("#tooltip_" + targetDiv)
            .transition()
            .duration(fadeInSpeed)
            .style("opacity", function() {
                return 1;
            });
        d3.select("#tooltip_" + targetDiv)
            .attr("transform", function(d) {
                let mouseCoords = d3.mouse(this.parentNode);
                let xCo = mouseCoords[0] + 10;;
                let yCo = mouseCoords[0] + 10;
                return "translate(" + xCo + "," + yCo + ")";
            });

        // hover over div inner text
        let tooltipData = JSON.parse(currElement.attr("data"));
        console.log('piechart line 76', tooltipData)
        let tooltipsText = "";
        d3.selectAll("#tooltipText_" + targetDiv).text("");
        let yPos = 0;
        d3.selectAll("#tooltipText_" + targetDiv).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text(tooltipData.key + ":  " + d3.format("0.2f")(tooltipData.value) + "%");
        // let dims = helpers.getDimensions("tooltipText_" + targetDiv);
        d3.selectAll("#tooltipText_" + targetDiv + " tspan")
            // .attr("x", dims.w + 2);

        d3.selectAll("#tooltipRect_" + targetDiv)
            // .attr("width", dims.w + 10)
            // .attr("height", dims.h + 20);
    });

    pathSection.on("mousemove", function(d) {
        let currElement = d3.select(this);
        d3.selectAll("#tooltip_" + targetDiv)
            .attr("transform", function(d) {
                let mouseCoords = d3.mouse(this.parentNode);
                let xCo = mouseCoords[0] + 10;
                let yCo = mouseCoords[1] + 10;
                return "translate(" + xCo + "," + yCo + ")";
            });
    });
    pathSection.on("mouseout", function(d) {
        let currElement = d3.select(this);
        currElement.attr("style", "fill-opacity:0.85;");

        d3.select("#tooltip_" + targetDiv)
            .style("opacity", function() {
                return 0;
            });
        d3.select("#tooltip_" + targetDiv).attr("transform", function(d, i) {
            let x = -500;
            let y = -500;
            return "translate(" + x + "," + y + ")";
        });
    });

    // hover over div starts
    let tooltipg = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .attr("id", "tooltip_" + targetDiv)
    .attr("style", "opacity:0")
    .attr("transform", "translate(-500,-500)");

    tooltipg.append("rect")
        .attr("id", "tooltipRect_" + targetDiv)
        .attr("x", 0)
        .attr("width", 120)
        .attr("height", 80)
        .attr("opacity", 0.8)
        .style("fill", "#000000");

    tooltipg.append("text")
        .attr("id", "tooltipText_" + targetDiv)
        .attr("x", 30)
        .attr("y", 15)
        .attr("fill", "#fff")
        .style("font-size", 10)
        .style("font-family", "arial")
        .text(function(d, i) {
            return "";
        });

    // hover over div ends
    // arc.append("text")
    //     .attr("transform", function(d) {
    //         return "translate(" + label.centroid(d) + ")";
    //     })
    //     .attr("dy", "0.35em")
    //     .text(function(d) {
    //         console.log('piechart line 149 d.data[value]?', d)
    //         return d.data.value;
    //     });

    arc.append("text")
        .attr("dx", 30)
        .attr("dy", -5)
        .append("textPath")
        .attr("xlink:href", function(d, i) {
            return "#arc-" + i;
        })
        .text(function(d) {
            return d.data.key.toString();
        })

}


