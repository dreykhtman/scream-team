function loadPieChart(data) {
    // console.log('the data for chart is this', data)
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    let color = d3.scaleOrdinal(["#CDA34F", "#373F27", "#636B46", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    // let dataByType = d3.nest()
    //     .key((d) => { return d.type || 'other'; })
    //     .entries(data);

    let dataByTime = d3.nest()
        .key((d) => { return d.type || 'other'; })
        .rollup((v) => { return d3.mean(v, (d) => { return d.browsingTime; }) || 1; })
        .entries(data);
    console.log(dataByTime)

    let pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return Number(d.browsingTime) || 1;
        });

    let path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    let label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    let arc = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            console.log("d in path piechart.js", d)
            return color(d.data.url);
        });

    arc.append("text")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.35em")
        .text(function (d) { return d.data.url; });
}
