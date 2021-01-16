import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";

// set draw figure options
const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};

// transfer input data into casesType for drawing the graph
// for line chart we need x and y in an object and these objects in an big array
// the input data for line chart should be like the following
// // data: [{
//      x: 10,
//      y: 20
//    }, {
//      x: 15,
//      y: 10
//    }]
// casesType : cases, deaths, recovered, thus we need to pass the type as a parameter
const buildChartData = (data, casesType) => {
  let chartData = [];
  let lastDataPoint;
  for (let date in data.cases) {
    if (lastDataPoint) {
      let newDataPoint = {
        x: date,
        // calculate the new case of data, because in data is the total number cases
        y: data[casesType][date] - lastDataPoint,
      };
      // push this object into final result chartData
      chartData.push(newDataPoint);
    }
    // update the lastDataPoint to the current total case number
    lastDataPoint = data[casesType][date];
  }
  return chartData;
};

// Graph component in the right bottom
function LineGraph({ casesType }) {

  // hooks to set the data
  const [data, setData] = useState({});

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      await fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=120")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          let chartData  = buildChartData(data, casesType);
          setData(chartData);
          console.log(chartData);
          // buildChart(chartData);
        });
    };
    // call fetchData()
    fetchData();
  }, [casesType]);

  // return the line graph
  return (
    <div>
      {data?.length > 0 && (
        <Line
          data={{
            datasets: [
              {
                // backgroundColor: "rgba(204, 16, 52, 0.5)",
                backgroundColor: "rgb(211, 84, 0, 0.5)",
                borderColor: "#db0a5b",
                borderWidth: '1',
                data: data,
              },
            ],
          }}
          options={options}
        />
      )}
    </div>
  );
}

export default LineGraph;
