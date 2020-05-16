const height = 400, width = 600;
const title = 'Top 10 Countries for Each Day'
const xValue = d => d.date;
const xAxisLabel = 'Date';

const yValue = d => d.country;
const yAxisLabel = 'Country';

const margin = { top: 60, right: 40, bottom: 70, left: 100 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

//https://vizhub.com/curran/datasets/data-canvas-sense-your-city-one-week.csv
d3.csv('./covid-19_may.csv')
    .then(countries => {
        //console.log(countries)
        const covidData = [];

        countries.forEach(country => {
            let obj = { date: "", country: [] };
            Object.keys(country).forEach((day, index) => {
                if (day !== 'date' && day !== 'World') {
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
            //console.log(covidData[i].country);
        }

        //console.log(covidData)
        const xAxisTitle = []
        //render(covidData);
        let count=0;

        const yScale = d3.scaleLinear()
            .domain([0, covidData[covidData.length - 1].country[0].number])
            .range([0, innerHeight])
        covidData.forEach((day,index) => {
            
            //console.log(count)
            count++
            if(index<4){
                xAxisTitle.push(day.date);
                const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

                const xScale = d3.scaleBand()
                    .domain(xAxisTitle)
                    .range([0, innerWidth]);

                g.append('g').call(d3.axisLeft(yScale))
                g.append('g').call(d3.axisBottom(xScale))
                    .attr('transform',`translate(${0},${innerHeight})`)
                    .attr('class', 'bottomtick')
                //rotating x axis date
                g.selectAll('.bottomtick .tick').attr('transform', 'rotate(-60) translate(0,70)')
                //removing x-tick
                g.selectAll('.bottomtick .tick line')
                    .remove()

                //console.log(day.country)
                day.country.forEach(country=>{
                    console.log(country)
                    g.selectAll('circle')
                        .data(country)
                        .enter()
                        .append('circle')
                        .attr('r', 10)
                        .attr('cx', 25)
                        .attr('cy', 90);
                })
                
            }            
        })
    });