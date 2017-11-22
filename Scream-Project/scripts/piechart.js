function loadPieChart () {

    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    let color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    let pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d.population;
        });

    let path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    let label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    let data = [
        {
            age: "<5",
            population: 2704659
        }, {
            age: "5-13",
            population: 4499890
        }
    ]

    // let dataInput = {
    //         'catisnsinks.com': {
    //             browsingTime: 55,
    //             goalHrs: "2",
    //             goalMins: "22",
    //             type: "green"
    //         },
    //         'walmart.com': {
    //             browsingTime: 88,
    //             goalHrs: "3",
    //             goalMins: "33",
    //             type: "red"
    //         }
    //     }

    let arc = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function (d) { return color(d.data.age); });

    arc.append("text")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.35em")
        .text(function (d) { return d.data.age; });
}
