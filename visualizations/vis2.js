function top10purposes(data) {
  return d3.nest()
    .key(d => d.coalesced_purpose_name)
    .rollup(v => d3.sum(v, d => d.commitment_amount_usd_constant))
    .entries(data)
    // get only the top 5 entries
    .sort((a, b) => d3.descending(a.value, b.value))
    .slice(0, 11)
    // get entry objects to their names
    .filter(d => d.key != "Sectors not specified")
    .map(d => d.key);
}

function allPurposes(data) {
  return d3.nest()
    .key(d => d.coalesced_purpose_name)
    .key(d => d.year)
    .rollup(d => d3.sum(d, v => v.commitment_amount_usd_constant))
    .entries(data)
    // filter top 5 purposes
    .map(d => ({
      purpose: d.key,
      date: d.values
        .map(v => ({ year: v.key, recieved: v.value }))
    }))
}

function vis2Data(data) {
  const top10 = top10purposes(data);
  const purposes = allPurposes(data);

  const vis2 = top10.map(purpose => ({
    purpose: purpose,
    transactions: allYears.map(year => {
      let total = 0;
      year = year
      let purposeType = purposes.find(c => c.purpose == purpose);
      if (purposeType) {
        const date = purposeType.date.find(d => d.year == year);
        if (date) {
          total = date.recieved
        }
      }
      return {
        purpose,
        total,
        year,

      }
    })
  }))
  return vis2
}


function vis2(data, div) {
  const margin = { top: 30, right: 150, bottom: 10, left: 200 };
  const visWidth = 1500 - margin.left - margin.right;

  const flatdata = vis2Data(data).map(d => d.transactions).flat()
  console.log(flatdata);

  const x = d3.scaleBand()
    .domain(allYears)
    .range([0, visWidth])
    .padding(0.05);

  const visHeight = x.step() * 20;

  const svg = div.append('svg')
    .attr('width', visWidth + margin.left + margin.right)
    .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const y = d3.scaleBand()
    .domain(top10)
    .range([0, visHeight])
    .padding(0.1)

  const maxDonation = d3.max(vis2Data(data), purpose => d3.max(purpose.transactions, c => c.total));

  const yAxis = d3.axisLeft(y)
    .tickPadding(10)
    .tickSize(3);

  g.append('g')
    .call(yAxis)
    .call(g => g.selectAll('.domain').remove());

  // month labels

  const xAxis = d3.axisTop(x)
    .tickPadding(5)
    .tickSize(3)


  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(200," + margin.top + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 5)
    //.attr("dy", ".35em")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "start");


  const color = d3.scaleSequential(d3.interpolateBlues).domain([0, maxDonation])

  g.selectAll('rect')
    .data(flatdata)
    .join('rect')
    .attr('x', d => x(d.year))
    .attr('y', d => y(d.purpose))
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .attr('fill', d => color(d.total))
    .attr("stroke", '#D3D3D3');

}

function legend2(div) {

  const sequentialScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, 8344866729]);

  const svg = div.append('svg')
    .attr('width', 500)

  svg.append("g")
    .attr('class', "legendSequential")
    .attr('transform', "translate(0,30)");

  const legendSequential = d3.legendColor()
    .shapeWidth(50)
    .scale(sequentialScale)
    .orient("horizontal")
    .title("Total Donated")
    .labelFormat(d3.format(".2s"))
    .cells(8)

  svg.select(".legendSequential")
    .call(legendSequential)


}



