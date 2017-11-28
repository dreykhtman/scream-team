function loadPieChart(data) {

    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    let color = d3.scaleOrdinal(["#CDA34F", "#373F27", "#636B46", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    // grouping data by redlist/greenlist/other categories
    let dataByTime = d3.nest()
        .key((d) => {
            if (d.type === 'red') {return 'less'}
            else if (d.type === 'green') {return 'more'}
            else {return 'other'}
        })
        .rollup((v) => { return d3.mean(v, (d) => { return d.browsingTime; }); })
        .entries(data);

    // calculating total browsing time for all categories to create percentage time in case any category has 0 value
    let allTime = dataByTime.reduce((prev,next) => { return prev += next.value},0)
    let fluffTime = allTime * 0.08

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
        .attr("class", "arc");

    // key = list category
    arc.append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            return color(d.data.key);
        });

    arc.append("text")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.35em")
        .text(function (d) { return d.data.key; });
}
