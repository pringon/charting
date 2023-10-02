import { ENDPOINT } from "./constants.ts";

export { fetchData };

type ClassificationDict = { [classification: string]: Classification[] }
type Classification = {
  yearmonth: string,
  count: number,
  responseTime: ResponseTime,
};
type ResponseTime = { minutes: number, seconds: number }

type ResponsePayload = {
  yearmonth: string,
  incidentclassification: string,
  incidentcount: number,
  averageresponsetime: string,
};

async function fetchData(): Promise<{ labels: string[], classifications: ClassificationDict }> {
  const res = await fetch(ENDPOINT)
  const datapoints = (await res.json()) as ResponsePayload[]
  datapoints.sort((a, b) => {
    if (a.yearmonth === b.yearmonth) {
        return 0
    }
    return a.yearmonth < b.yearmonth ? -1 : 1
  });
  const labels: string[] = [];
  const classifications: ClassificationDict = {};
  let prev: string | null = null;
  for (let { yearmonth, incidentclassification, incidentcount, averageresponsetime } of datapoints) {
    if (yearmonth.includes("FY")) {
      continue;
    }
    if (yearmonth !== prev) {
      prev = yearmonth;
      labels.push(yearmonth);
    }
    const parsedResponseTime = averageresponsetime.split(":");
    const data = {
      yearmonth: yearmonth,
      count: Number(incidentcount),
      responseTime: {
        minutes: Number(parsedResponseTime[0]),
        seconds: Number(parsedResponseTime[1]),
      },
    };
    if (incidentclassification in classifications) {
        const classification = classifications[incidentclassification];
        const prevLast = classification[classification.length - 1]
        if (prevLast.yearmonth === data.yearmonth) {
            const prevTimeInSeconds = responseTimeAsSeconds(prevLast.responseTime);
            const currTimeInSeconds = responseTimeAsSeconds(data.responseTime)
            const aggregateTimeInSeconds = Math.floor((
                prevTimeInSeconds * prevLast.count +
                currTimeInSeconds * data.count
                ) /
                (prevLast.count + data.count)
            );
            prevLast.count += prevLast.count;
            prevLast.responseTime = {
                minutes: Math.floor(aggregateTimeInSeconds / 60),
                seconds: aggregateTimeInSeconds % 60,
            };
        } else {
            classifications[incidentclassification].push(data);
        }
    } else {
      classifications[incidentclassification] = [data];
    }
  }
  return {labels, classifications};
}

function responseTimeAsSeconds(responseTime: ResponseTime): number {
    return responseTime.minutes * 60 + responseTime.seconds;
}