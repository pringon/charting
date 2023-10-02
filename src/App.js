import { useEffect, useState } from "react";

import TimeseriesChart from "./components/TimeseriesChart";
import { fetchData } from "./repositories/NYFireDept";

function App() {
  const [{ labels, counts }, setData] = useState({ labels: [], counts: [] });
  useEffect(() => {
    (async () => {
      const { labels, classifications } = await fetchData();
      const counts = []
      for (const classification of Object.keys(classifications)) {
        if (classification === "All Fire/Emergency Incidents") {
          continue;
        }
        console.log(classification, classifications[classification])
        counts.push(makeDataset(
          classification,
          classifications[classification].map(({count}) => count)
        ));
      }
      setData({labels, counts});
    })();
  }, []);
  return (
    <div>
      <h2>Basic chart of fire department responses</h2>
      <TimeseriesChart labels={labels} counts={counts} />
    </div>
  );
};
  
function makeDataset(label, data) {
  const randColorPart = () => Math.floor(255 * Math.random());
  return {
      label,
      data,
      fill: false,
      borderColor: `rgba(${randColorPart()},${randColorPart()},${randColorPart()},1)`,
  }
}

export default App;
