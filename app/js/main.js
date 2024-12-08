function _1(md) {
  return md`# Pie Chart for Each Department
  
  A single pie chart updates dynamically when you select a department from the radio button.`;
}

function _dataset(Inputs, dataByDepartment, chart) {
  // Create a radio button for each department
  const radio = Inputs.radio(
    Object.keys(dataByDepartment),
    { label: "Department", value: Object.keys(dataByDepartment)[0] }
  );

  // Update the pie chart when the radio button is clicked
  radio.addEventListener("input", () => {
    const selectedDepartment = radio.value;
    chart.change(dataByDepartment[selectedDepartment]);

  });

  return radio;
}

function _chart(d3, width, dataByDepartment) {
  const height = Math.min(300, width / 2);
  const outerRadius = height / 2 - 10;
  const innerRadius = outerRadius * 0.75;
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Create the SVG container for the pie chart
  const svg = d3.create("svg").attr("viewBox", [-width / 2, -height / 2, width, height]);

  // Define the arc generator
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

  // Define the pie generator
  const pie = d3.pie().sort(null).value((d) => d["Count"]);

  // Initialize the chart with the first department's data
  const initialData = dataByDepartment[Object.keys(dataByDepartment)[0]];
  const path = svg
    .datum(initialData)
    .selectAll("path")
    .data(pie)
    .join("path")
    .attr("fill", (d, i) => color(i))
    .attr("d", arc)
    .each(function (d) {
      this._current = d;
    });

  // Update function to change the chart based on selected department
  function change(newData) {
    path
      .data(pie(newData)) // Update the data
      .transition()
      .duration(750)
      .attrTween("d", function (a) {
        const i = d3.interpolate(this._current, a);
        this._current = i(0);
        return (t) => arc(i(t));
      });
  }

  // Return the chart node with the update function
  return Object.assign(svg.node(), { change });
}

function _dataByDepartment(data) {
  // Group the data by department
  return data.reduce((acc, item) => {
    if (!acc[item.Department]) acc[item.Department] = [];
    acc[item.Department].push({ Title: item.Title, Count: item.Count });
    return acc;
  }, {});
}

async function _data() {
  const response = await fetch('http://localhost:3000/api/departments');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json(); // Return the data as JSON
}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof dataset")).define("viewof dataset", ["Inputs", "dataByDepartment", "chart"], _dataset);
  main.variable(observer("dataset")).define("dataset", ["Generators", "viewof dataset"], (G, _) => G.input(_));
  main.variable(observer("dataByDepartment")).define("dataByDepartment", ["data"], _dataByDepartment);
  main.variable(observer("chart")).define("chart", ["d3", "width", "dataByDepartment"], _chart);
  main.variable(observer("data")).define("data", _data);
  return main;
}
