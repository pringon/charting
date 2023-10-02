import React from "react";
import { useEffect, useState } from "react";

import TimeseriesChart from "./components/TimeseriesChart.tsx";
import { fetchData } from "./repositories/NYFireDept.ts";

type ClassificationMetricsState = {
  classifications: string[],
  countsData: CountDatapoint[],
};
type CountDatapoint = { yearmonth: string } | Record<string, number>

function App() {
  const [{ classifications, countsData }, setData] = useState<ClassificationMetricsState>({ classifications: [], countsData: [] });
  useEffect(() => {
    (async () => {
      const { classifications } = await fetchData();
      const classificationKeys = Object.keys(classifications);
      const plotData = classifications[classificationKeys[0]].map(datapoint => ({
        yearmonth: datapoint.yearmonth,
        [classificationKeys[0]]: datapoint.count,
      }));
      setData(
        {
          countsData: classificationKeys.slice(1).reduce((acc, key) =>
            acc.map((val, index) => ({...val, [key]: classifications[key][index].count})),
            plotData
          ),
          classifications: classificationKeys
        }
      );
    })();
  }, []);
  return (
    <div style={{ marginLeft: "5vw", height: "50vh", width: "90vw" }}>
      <h2 style={{ textAlign: "center" }}>Basic chart of fire department responses</h2>
      <TimeseriesChart
        dataKeys={classifications}
        data={countsData}
      />
    </div>
  );
};

export default App;
