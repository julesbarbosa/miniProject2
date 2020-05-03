function vis1Data(data) {
  const donors = d3.nest()
    .key(d => d.donor)
    .key(d => d.year)
    .rollup(d => d3.sum(d, v => v.commitment_amount_usd_constant))
    .entries(data)
    // filter top 5 purposes
    .map(d => ({
      country: d.key,
      date: d.values
        .map(v => ({ year: v.key, donated: v.value }))
    }))
  const recipiente = d3.nest()
    .key(d => d.recipient)
    .key(d => d.year)
    .rollup(d => d3.sum(d, v => v.commitment_amount_usd_constant))
    .entries(data)
    // filter top 5 purposes
    .map(d => ({
      country: d.key,
      date: d.values
        .map(v => ({ year: v.key, recieved: v.value }))
    }))

  const allCountries = [...new Set([...data.map(d => d.recipient), ...data.map(d => d.donor)])]
  const allYears = [...new Set(data.map(d => d.year))].sort((a, b) => d3.ascending(a, b))
  return allCountries.map(country => ({
    country: country,
    transactions: allYears.map(year => {
      let donated = 0;
      let received = 0;
      let net = 0;
      let donorCountry = donors.find(c => c.country == country);
      if (donorCountry) {
        const donation = donorCountry.date.find(d => d.year == year);
        if (donation) {
          donated = donation.donated;
        }
      }
      let recipientCountry = recipiente.find(c => c.country == country);
      if (recipientCountry) {
        const donation = recipientCountry.date.find(d => d.year == year);
        if (donation) {
          received = donation.recieved;
        }
      }
      return {
        country,
        year,
        donated,
        received,
        net: donated - received
      }

    })
  })).map(d => ({
    ...d,
    total: d3.sum(d.transactions, c => c.net)
  })).slice().sort((a, b) => d3.descending(a.total, b.total))
}


function vis1(data, div) {
  const margin = { top: 30, right: 20, bottom: 20, left: 110 };

  const visWidth = 1000 - margin.left - margin.right;

  const x = d3.scaleBand()
    .domain(allYears)
    .range([0, visWidth])
    .padding(0.05);

  const visHeight = x.step() * 50;

  const svg = div.append('svg')
    .attr('width', visWidth + margin.left + margin.right)
    .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

  const flatData = data.map(d => d.transactions).flat()

  const allCountries = [...new Set([...flatData.map(d => d.country)])]

  const y = d3.scaleBand()
    .domain(allCountries)
    .range([0, visHeight])
    .padding(0.01)

  const yAxis = d3.axisLeft(y)
    .tickPadding(10)
    .tickSize(3);

  g.append('g')
    .call(yAxis)
    .call(g => g.selectAll('.domain').remove());

  const xAxis = d3.axisTop(x)
    .tickPadding(5)
    .tickSize(0)

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(100," + margin.top + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 5)
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "start");


  const extent = d3.extent(flatData, d => d.net)

  const color = d3.scaleDiverging(t => d3.interpolateRdBu(t))
    .domain([extent[0], 0, extent[1]])


  g.selectAll('rect')
    .data(flatData)
    .join('rect')
    .attr('x', d => x(d.year))
    .attr('y', d => y(d.country))
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .attr('fill', d => color(d.net))

}

function legend1(div) {

  const sequentialScale = d3.scaleDiverging(t => d3.interpolateRdBu(t))
    .domain([-9141850218, 0, 11399278504]);

  const svg = div.append('svg')
    .attr('width', 500)

  svg.append("g")
    .attr('class', "legendDiverging")
    .attr('transform', "translate(0,70)");

  const legendDiverging = d3.legendColor()
    .shapeWidth(40)
    .scale(sequentialScale)
    .orient("horizontal")
    .title("NET Donations")
    .labelFormat(d3.format(".2s"))
    .cells(10)

  svg.select(".legendDiverging")
    .call(legendDiverging)


}