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
      delete classifications["All Fire/Emergency Incidents"];
      const classificationKeys = Object.keys(classifications);
      const countsData = classifications[classificationKeys[0]].map(datapoint => ({
        yearmonth: datapoint.yearmonth,
        [classificationKeys[0]]: datapoint.count,
      }));
      for (const key of classificationKeys.slice(1)) {
        for (const index in countsData) {
          countsData[index] = {
            ...countsData[index],
            [key]: classifications[key][index].count,
          };
        }
      }
      setData({
        countsData,
        classifications: classificationKeys
      });
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
