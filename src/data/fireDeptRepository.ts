import { ENDPOINT, GENERIC_CLASSIFICATION } from "./constants.ts";

export { fetchData, mergeMetrics, ClassificationDict, Datapoint, GENERIC_CLASSIFICATION };

type ClassificationDict = { [classification: string]: Datapoint[] }
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
    yearmonth: prev.yearmonth,
    classification: prev.classification,
    borough: prev.borough,
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