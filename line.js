const height = 600, width = 1200;
const title = 'Top 10 Countries for Each Day'
const xValue = d => d.date;
const xAxisLabel = 'Date';

const yValue = d => d.country;
const yAxisLabel = 'Number of Patients';

const margin = { top: 60, right: 40, bottom: 70, left: 100 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Define date parser

const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

var parseDate = d3.timeParse("%Y/%m/%d");
const getLineData = (covidData) => {
    let data = {}, finalData = [];
    covidData.forEach(e => {
        e.country.forEach(c => {
            if (!data[c.name]) { data[c.name] = [] }
            data[c.name].push({
                "date": e.date,
                "value": c.number
            })
        })
    })
    Object.keys(data).forEach(name => {
        finalData.push({
            "country": name,
            "datapoints": data[name].sort(function (a, b) {
                return parseDate(a.date).getTime() > parseDate(b.date).getTime()
            })
        })
    })
    return finalData
}

d3.csv('./covid-19_may.csv').then(countries => {

    const covidData = [];

    countries.forEach(country => {
        let obj = { date: "", country: [] };
        Object.keys(country).forEach((day, index) => {
            if (day !== 'date' && day !== 'World') {
                let countryData = {};
                countryData.name = day;
                countryData.number = +country[day];
                countryData.date = country.date;
                obj.country.push(countryData);
            }
        })
        obj.date = country.date;
        covidData.push(obj);
    });

    for (let i = 0; i < covidData.length; i++) {
        covidData[i].country.sort((a, b) => {
            return b.number - a.number;
        })
    }

    //remove remaining data
    for (let i = 0; i < covidData.length; i++) {
        covidData[i].country.splice(10);
    }

    const xAxisTitle = []

    const yScale = d3.scaleLinear()
        .domain([0, covidData[covidData.length - 1].country[0].number])
        .range([innerHeight, 0])

    var xScale = d3.scaleTime()
        .domain([d3.min(covidData, d => parseDate(d.date)), d3.max(covidData, d => parseDate(d.date))])
        .range([0, innerWidth])

    // Define lines
    var line = d3
        .line()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(parseDate(d["date"])))
        .y(d => yScale(d["value"]))

    var color = d3.scaleOrdinal().range(d3.schemeCategory10);

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    g.append('g').call(d3.axisLeft(yScale))
    g.append('g').call(d3.axisBottom(xScale).ticks(Math.max(width / 75, 5)))
        .attr('transform', `translate(${0},${innerHeight})`)
        .attr('class', 'bottomtick')

    var lineData = getLineData(covidData);
    console.log(lineData)
    var country = g.selectAll(".country")
        .data(lineData)
        .enter()
        .append("g")
        .attr("class", d => "country " + d.country);

    country
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.datapoints))
        .style("stroke", d => color(d.country))
    //adding color legend------------------

    var keys = []
    lineData.forEach(country => {
        keys.push(country.country)
    })

    // Usually you have a color scale in your chart already
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSet2);

    // Add one dot in the legend for each name.
    g.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", 110)
        .attr("cy", (d, i) => i * 25 - 5)
        .attr("r", 5)
        .style("fill", d => color(d))

    // Add one dot in the legend for each name.
    g.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 120)
        .attr("y", (d, i) => i * 25)
        .style("fill", d => color(d))
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    //adding headings ---------------------
    g.append('text')
        .attr('x', innerWidth / 2 - margin.left - margin.right)
        .attr('y', -10)
        .attr('class', 'headings')
        .style('font-size', '28px')
        .html(title)
    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 50)
        .attr('class', 'headings')
        .style('font-size', '28px')
        .html(xAxisLabel)
    g.append('text')
        .attr('x', -innerHeight / 2 - 110)
        .attr('y', 0 - 70)
        .attr('class', 'headings')
        .attr('transform', 'rotate(-90)')
        .style('font-size', '28px')
        .html(yAxisLabel)
});