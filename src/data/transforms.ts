export { dropDuplicates, groupBy, transformRecord }

function dropDuplicates<T extends object, U extends keyof T>(data: T[], key: U): T[U][] {
  const uniqueValues: T[U][] = [];
  let prev: T[U] = null;
  for (const datapoint of data) {
    if (datapoint[key] !== prev) {
      prev = datapoint[key];
      uniqueValues.push(datapoint[key]);
    }
  }
  return uniqueValues;
}

// TODO: Find a way to strongly type keys but just selecting keys for string properties
function groupBy<T>(data: T[], key: string): Record<string, T[]> {
  const aggregatedData: Record<string, T[]> = {}
  for (let datapoint of data) {
    if (datapoint[key] in aggregatedData) {
      aggregatedData[datapoint[key]].push(datapoint);
    } else {
      aggregatedData[datapoint[key]] = [datapoint];
    }
  }
  return aggregatedData;
}

function transformRecord<T, U>(
  data: Record<string, T[]>,
  transform: (arr: T[]) => U
): Record<string, U> {
  const transformedRecord: Record<string, U> = {};
  for (const key of Object.keys(data)) {
    transformedRecord[key] = transform(data[key]);
  }
  return transformedRecord;
}
