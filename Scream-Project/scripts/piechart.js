function loadPieChart(data) {

    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    let color = d3.scaleOrdinal(["#CDA34F", "#373F27", "#636B46", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    let pie = d3.pie()
        .sort(null)
        .value(function (d) {
            console.log('d is this!!!!!!!!!', d)
            return Number(d.goalMins);
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
            console.log('d.data.url is thisssss', d.data.url)
            return color(d.data.url);
        });

    arc.append("text")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.35em")
        .text(function (d) { return d.data.url; });
}
