const width = window.innerWidth,height = width/2 -15;
const title = 'Top 10 Countries for Each Day'
const xValue = d => d.date;
const xAxisLabel = 'Date';
console.log(height,width)
const yValue = d => d.country;
const yAxisLabel = 'Number of Patients';

const margin = { top: 60, right: 150, bottom: 70, left: 100 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

var parseDate = d3.timeParse("%Y/%m/%d");
const getLineData = (covidData) => {
    let data = {}, finalData = [];
    covidData.forEach(date => {
        date.country.forEach(countryMember => {
            if (!data[countryMember.name]) { data[countryMember.name] = [] }
            data[countryMember.name].push({
                "date": date.date,
                "value": countryMember.number
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
    finalData.forEach(country => {
        for (let i = country.datapoints.length; i >= 0; i--) {
            if (i !== country.datapoints.length && i !== 0) {
                country.datapoints[i].value = country.datapoints[i].value - country.datapoints[i - 1].value;
            }
        }
    })
    return finalData;
}

d3.csv('./covid-19_may.csv').then(countries => {
    const covidData = [];
    countries.forEach(country => {
        let obj = { date: "", country: [] };
        Object.keys(country).forEach((day, index) => {
            if (day !== 'date' && day !== 'World' && day !== 'International') {
                let countryData = {};
                countryData.name = day;
                countryData.number = +country[day];
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
    
    const yScale = d3.scaleLinear()
        .domain([0, 90000])
        .range([innerHeight, 0])

    const xScale = d3.scaleTime()
        .domain(d3.extent(covidData, d => parseDate(d.date)))
        .range([0, innerWidth])

    var color = d3.scaleOrdinal().range(d3.schemeCategory10);

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    const yAxis = g.append('g').call(d3.axisLeft(yScale))
    const xAxis = g.append('g').call(d3.axisBottom(xScale).ticks(Math.max(width / 175, 5)))
        .attr('transform', `translate(${0},${innerHeight})`)
        .attr('class', 'bottomtick')

    // Define lines
    const line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(parseDate(d["date"])))
        .y(d => yScale(d["value"]))

    var lineData = getLineData(covidData);
    //find max for y axis

    console.log("lineData",lineData)
    var country = g.selectAll(".country")
        .data(lineData)
        .enter()
        .append("g")
        .attr("class", d => "country " + d.country);

    country.append("path")
        .attr("class", "line")
        .attr("d", d => line(d.datapoints))
        .style("stroke", d => color(d.country))
    //adding color legend------------------

    var keys = []
    lineData.forEach(country => {
        keys.push(country.country)
    })

    // Add one dot in the legend for each name.
    const Legends = svg.append('g')
        .attr('transform',`translate(${innerWidth+10},${20})`);
    Legends.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", 110)
        .attr("cy", (d, i) => i * 25 - 5)
        .attr("r", 3)
        .style("fill", d => color(d))

    // Add one dot in the legend for each name.
    Legends.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 120)
        .attr("y", (d, i) => i * 25)
        .style("fill", d => color(d))
        .style('font-size','12px')
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