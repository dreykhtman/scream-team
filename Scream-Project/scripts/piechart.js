function loadPieChart(data) {
    // on first use before data is aggregated, populate a fake chart
    !data[0] ? data.push({ 'key': "Start Browsing!", 'browsingTime': 100 }) : null;

    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
        targetDiv = "svg";

    let color = d3.scaleOrdinal(["#CDA34F", "#373F27", "#636B46", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    // grouping data by redlist/greenlist/other categories
    let dataByTime = d3.nest()
        .key((d) => {
            if (d.type === 'red') { return 'blacklist' }
            else if (d.type === 'green') { return 'whitelist' }
            else if (d.key === 'Start Browsing!') { return 'Start Browsing' }
            else { return 'other' }
        })
        .rollup((v) => { return d3.sum(v, (d) => { return d.browsingTime; }); })
        .entries(data);

    // calculating total browsing time for all categories
    let allTime = dataByTime.reduce((prev, next) => { return prev += next.value }, 0)

    // value = browsingTime
    let pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return Number(d.value);
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
        .attr("data", function (d) {
            d.data.value = (d.endAngle - d.startAngle) / (2 * Math.PI) * 100;
            return JSON.stringify(d.data);
        });

    // redlist/greenlist/other labels, if browsingtime is zero then no label
    arc.append("text")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.35em")
        .text(function (d) { return !!d.data.value ? d.data.key : ''; });

    // hover over event setup here:
    pathSection.on("mouseover", function (d) {
        let currElement = d3.select(this);
        currElement.attr("style", "fill-opacity:0.7;");

        let fadeInSpeed = 100;
        d3.select("#tooltip_" + targetDiv)
            .transition()
            .duration(fadeInSpeed)
            .style("opacity", function () {
                return 1;
            });
        d3.select("#tooltip_" + targetDiv)
            .attr("transform", function (d) {
                let mouseCoords = d3.mouse(this.parentNode);
                let xCo = mouseCoords[0] + 10;;
                let yCo = mouseCoords[0] + 10;
                return "translate(" + xCo + "," + yCo + ")";
            });

        // hover over div inner text
        let tooltipData = JSON.parse(currElement.attr("data"));
        let tooltipsText = "";
        d3.selectAll("#tooltipText_" + targetDiv).text("");
        let yPos = 0;
        d3.selectAll("#tooltipText_" + targetDiv).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text(tooltipData.key + ":  " + d3.format("0.2f")(tooltipData.value) + "%");
        let dims = helpers.getDimensions("tooltipText_" + targetDiv);
        d3.selectAll("#tooltipText_" + targetDiv + " tspan")
            .attr("x", dims.w + 2);

        d3.selectAll("#tooltipRect_" + targetDiv)
            .attr("width", dims.w + 10)
            .attr("height", dims.h + 20);
    });

    pathSection.on("mousemove", function (d) {
        let currElement = d3.select(this);
        d3.selectAll("#tooltip_" + targetDiv)
            .attr("transform", function (d) {
                let mouseCoords = d3.mouse(this.parentNode);
                let xCo = mouseCoords[0] + 10;
                let yCo = mouseCoords[1] + 10;
                return "translate(" + xCo + "," + yCo + ")";
            });
    });
    pathSection.on("mouseout", function (d) {
        let currElement = d3.select(this);
        currElement.attr("style", "fill-opacity:0.85;");

        d3.select("#tooltip_" + targetDiv)
            .style("opacity", function () {
                return 0;
            });
        d3.select("#tooltip_" + targetDiv).attr("transform", function (d, i) {
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
        .text(function (d, i) {
            return "";
        });
    // hover over div ends

    let helpers = {
        getDimensions: function (id) {
            let el = document.getElementById(id);
            let w = 0,
                h = 0;
            if (el) {
                let dimensions = el.getBBox();
                w = dimensions.width;
                h = dimensions.height;
            } else {
                console.log("error: getDimensions() " + id + " not found.");
            }
            return { w, h };
        }
    }
}


