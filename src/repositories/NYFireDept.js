import { ENDPOINT } from "./constants";

export { fetchData };

async function fetchData() {
  const res = await fetch(ENDPOINT)
  const datapoints = await res.json()
  datapoints.sort((a, b) => {
    if (a.yearmonth === b.yearmonth) {
        return 0
    }
    return a.yearmonth < b.yearmonth ? -1 : 1
  });
  const labels = [];
  const classifications = {};
  let prev = undefined;
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
      // TODO: There's duplicate yearmonths, group by the value, sum up counts
      // and weighted average response time. For response time, we should convert
      // it to a time primite at this point to make operations easier.
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

function responseTimeAsSeconds(responseTime) {
    return responseTime.minutes * 60 + responseTime.seconds;
}