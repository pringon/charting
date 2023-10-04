export { getUnique, groupBy, mapRecord, reduceRecord }

function getUnique<T extends object, U extends keyof T>(data: T[], key: U): T[U][] {
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

// TODO: Find a better way to copy non-primitive types such that users don't need to pass a
// constructor function
function reduceRecord<T, U>(
  data: Record<string, T[]>,
  reducer: (acc: U, val: T, index: number) => U,
  startingValue: () => U
): Record<string, U> {
  const reducedRecord: Record<string, U> = {};
  for (const key of Object.keys(data)) {
    reducedRecord[key] = data[key].reduce(reducer, startingValue());
  }
  return reducedRecord; 
}
  
function mapRecord<T, U>(data: Record<string, T[]>, mapper: (T) => U): Record<string, U[]> {
  const mappedRecord: Record<string, U[]> = {};
  for (const key in Object.keys(data)) {
    mappedRecord[key] = data[key].map(mapper);
  }
  return mappedRecord;
}