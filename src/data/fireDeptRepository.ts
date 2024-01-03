import { ENDPOINT, GENERIC_CLASSIFICATION, GENERIC_BOROUGH } from "./constants.ts";

export { fetchData, mergeMetrics, GroupedMetrics, Datapoint, GENERIC_CLASSIFICATION, GENERIC_BOROUGH };

type GroupedMetrics = { [key: string]: Datapoint[] }
type Datapoint = AggregatableProperties & NonAggregatableProperties;
type AggregatableProperties = {
  yearmonth: string,
  classification: string,
  borough: string,
}
type NonAggregatableProperties = {
  count: number,
  responseTime: ResponseTime,
}
type ResponseTime = { minutes: number, seconds: number }

type Payload = {
  yearmonth: string,
  incidentclassification: string,
  incidentborough: string,
  incidentcount: number,
  averageresponsetime: string,
};


async function fetchData(): Promise<Datapoint[]> {
  const res = await fetch(ENDPOINT);
  const datapoints = await res.json() as Payload[];
  datapoints.sort((a, b) => {
    if (a.yearmonth === b.yearmonth) {
        return 0
    }
    return a.yearmonth < b.yearmonth ? -1 : 1
  });
  return datapoints
    .filter(({yearmonth}) => !yearmonth.includes("FY"))
    .map(({ yearmonth, incidentclassification, incidentborough, incidentcount, averageresponsetime }) => {
      const parsedResponseTime = averageresponsetime.split(":");
      return {
        yearmonth,
        classification: incidentclassification,
        borough: incidentborough,
        count: Number(incidentcount),
        responseTime: {
          minutes: Number(parsedResponseTime[0]),
          seconds: Number(parsedResponseTime[1]),
        },
      };
    });
}

function mergeMetrics(prev: Datapoint, curr: Datapoint): Datapoint {
  const prevTimeInSeconds = responseTimeAsSeconds(prev.responseTime);
  const currTimeInSeconds = responseTimeAsSeconds(curr.responseTime)
  const aggregateTimeInSeconds = Math.floor((
      prevTimeInSeconds * prev.count +
      currTimeInSeconds * curr.count
      ) /
      (prev.count + curr.count)
  );
  return {
    ...prev,
    count: prev.count + curr.count,
    responseTime: {
      minutes: Math.floor(aggregateTimeInSeconds / 60),
      seconds: aggregateTimeInSeconds % 60,
    },
  };
}

function responseTimeAsSeconds(responseTime: ResponseTime): number {
    return responseTime.minutes * 60 + responseTime.seconds;
}