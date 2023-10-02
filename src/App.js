import { useEffect, useState } from "react";

import TimeseriesChart from "./components/TimeseriesChart";
import { fetchData } from "./repositories/NYFireDept";

function App() {
  const [{ classifications, countsData }, setData] = useState({ classifications: [], data: [] });
  useEffect(() => {
    (async () => {
      const { _labels, classifications } = await fetchData();
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
    <div style={{ height: "50vh", width: "90vw" }}>
      <h2>Basic chart of fire department responses</h2>
      <TimeseriesChart
        dataKeys={classifications}
        data={countsData}
      />
    </div>
  );
};

export default App;
