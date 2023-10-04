import React from "react";
import { useEffect, useState } from "react";

import TimeseriesChart from "./components/TimeseriesChart.tsx";
import { 
  fetchData, mergeMetrics,
  GroupedMetrics, Datapoint,
  GENERIC_BOROUGH, GENERIC_CLASSIFICATION,
} from "./data/fireDeptRepository.ts";
import { groupBy, transformRecord } from "./data/transforms.ts";

type State = {
  classifications: TimeSeries,
  boroughs: TimeSeries,
};
type TimeSeries = {
  keys: string[],
  counts: TimeseriesDatapoint<number>[],
  responseTimes: TimeseriesDatapoint<number>[],
};
type LabelProp = { yearmonth: string }
type TimeseriesDatapoint<T> = LabelProp | Record<string, T>

function App() {
  const [{ classifications, boroughs }, setData] = useState<State>({
    classifications: {
      keys: [],
      counts: [],
      responseTimes: [],
    },
    boroughs: {
      keys: [],
      counts: [],
      responseTimes: [],
    },
  });
  useEffect(() => {
    (async () => {
      const datapoints = await fetchData();
      const compact = (group: Datapoint[]) => 
        group.reduce(
          (group, val) => {
            if (group.length > 0 && group[group.length - 1].yearmonth === val.yearmonth) {
              group[group.length - 1] =
                mergeMetrics(group[group.length - 1], val);
            } else {
                group.push(val);
            }
            return group;
          },
          [] as Datapoint[]
        );
      const classifications = transformRecord(
        groupBy(datapoints, 'classification'),
        compact,
      )
      const boroughs = transformRecord(
        groupBy(datapoints, 'borough'),
        compact
      );
      setData({
        classifications: generateTimeSeriesData(classifications, GENERIC_CLASSIFICATION),
        boroughs: generateTimeSeriesData(boroughs, GENERIC_BOROUGH),
      });
    })();
  }, []);
  return (
    <div style={{ marginLeft: "5vw", height: "30vh", width: "90vw" }}>
      <h2 style={{ textAlign: "center" }}>Basic chart of fire department responses</h2>
      <TimeseriesChart
        dataKeys={classifications.keys}
        data={classifications.counts}
      />
      <TimeseriesChart
        dataKeys={classifications.keys}
        data={classifications.responseTimes}
      />
      <TimeseriesChart
        dataKeys={boroughs.keys}
        data={boroughs.counts}
      />
      <TimeseriesChart
        dataKeys={boroughs.keys}
        data={boroughs.responseTimes}
      />
    </div>
  );
};

function generateTimeSeriesData(groups: GroupedMetrics, genericLabel: string): TimeSeries {
  const labels = groups[genericLabel].map<TimeseriesDatapoint<any>>(({ yearmonth }) => ({ yearmonth }));
  delete groups[genericLabel];
  const keys = Object.keys(groups);

  const counts: TimeseriesDatapoint<number>[] = keys.reduce(
    (acc, key) => acc.map((val, index) => ({ ...val, [key]: groups[key][index].count})),
    labels
  );
  const responseTimes: TimeseriesDatapoint<number>[] = keys.reduce(
    (acc, key) => acc.map((val, index) => {
      const responseTime = groups[key][index].responseTime;
      const responseTimeInSeconds = responseTime.minutes * 60 + responseTime.seconds;
      return {
        ...val,
        [key]: responseTimeInSeconds, 
      };
    }),
    labels
  );
  return {
    keys,
    counts,
    responseTimes,
  };
}

export default App;
