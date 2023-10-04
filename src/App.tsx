import React from "react";
import { useEffect, useState } from "react";

import TimeseriesChart from "./components/TimeseriesChart.tsx";
import { GENERIC_CLASSIFICATION, fetchData, mergeMetrics, ClassificationDict, Datapoint } from "./data/fireDeptRepository.ts";
import { getUnique, groupBy, reduceRecord } from "./data/transforms.ts";

type ClassificationTimeSeriesData = {
  classificationKeys: string[],
  countData: TimeseriesDatapoint<number>[],
  responseTimeData: TimeseriesDatapoint<number>[],
};
type LabelProp = { yearmonth: string }
type TimeseriesDatapoint<T> = LabelProp | Record<string, T>

function App() {
  const [{ classificationKeys, countData, responseTimeData }, setData] = useState<ClassificationTimeSeriesData>({
    classificationKeys: [],
    countData: [],
    responseTimeData: [],
  });
  useEffect(() => {
    (async () => {
      const datapoints = await fetchData();
      const groups = groupBy(datapoints, 'classification');
      const classifications = reduceRecord(
        groups,
        (group, val) => {
          if (group.length > 0 && group[group.length - 1].yearmonth === val.yearmonth) {
            group[group.length - 1] =
              mergeMetrics(group[group.length - 1], val);
          } else {
              group.push(val);
          }
          return group;
        },
        () => [] as Datapoint[],
      )
      setData(generateTimeSeriesData(classifications));
    })();
  }, []);
  return (
    <div style={{ marginLeft: "5vw", height: "30vh", width: "90vw" }}>
      <h2 style={{ textAlign: "center" }}>Basic chart of fire department responses</h2>
      <TimeseriesChart
        dataKeys={classificationKeys}
        data={countData}
      />
      <TimeseriesChart
        dataKeys={classificationKeys}
        data={responseTimeData}
      />
    </div>
  );
};

function generateTimeSeriesData(classifications: ClassificationDict): ClassificationTimeSeriesData {
  const labels: TimeseriesDatapoint<any>[] = getUnique(classifications[GENERIC_CLASSIFICATION], "yearmonth")
    .map<TimeseriesDatapoint<any>>((yearmonth) => ({ yearmonth }));

  delete classifications[GENERIC_CLASSIFICATION];
  const classificationKeys = Object.keys(classifications);

  const countData: TimeseriesDatapoint<number>[] = classificationKeys.reduce(
    (acc, key) => acc.map((val, index) => ({ ...val, [key]: classifications[key][index].count})),
    labels
  );
  const responseTimeData: TimeseriesDatapoint<number>[] = classificationKeys.reduce(
    (acc, key) => acc.map((val, index) => {
      const responseTime = classifications[key][index].responseTime;
      const responseTimeInSeconds = responseTime.minutes * 60 + responseTime.seconds;
      return {
        ...val,
        [key]: responseTimeInSeconds, 
      };
    }),
    labels
  );
  return {
    classificationKeys,
    countData,
    responseTimeData,
  };
}

export default App;
