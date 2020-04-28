// Load the datasets and call the functions to make the visualizations

Promise.all([
  d3.csv('data/aiddata-countries-only.csv', d3.autoType),
  d3.json('data/countries.json'),
]).then(([data, geoJSON]) => {
  allYears = [...new Set(data.map(d => d.year))].sort((a,b) => d3.ascending(a,b)),
  storeData = vis2Data(data);
  storeData2 = vis1Data(data)
  top10 = top10purposes(data);
  purposes = allPurposes(data);
  console.log(top10);
  console.log(storeData);
  vis1(storeData2, d3.select('#vis1'));
  vis2(data, d3.select('#vis2'));
  legend1(d3.select("#vis1legend"))
  legend2(d3.select("#vis2legend"))

});
