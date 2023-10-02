import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export { TimeseriesChart };
export default TimeseriesChart;

function TimeseriesChart({
    data,
    dataKeys,
    height = "300px",
    width = "500px",
}) {
    return (
        <ResponsiveContainer height="100%" width="100%" >
            <LineChart
                width={300}
                height={500}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="yearmonth" />
                <YAxis tickFormatter={formatLargeInts} />
                <Tooltip
                    formatter={formatLargeInts}
                    itemSorter={({ value }) => -value}
                />
                <Legend />
                {
                    dataKeys.map(key => (
                        <Line
                            type="monotone"
                            key={key}
                            dataKey={key}
                            stroke={randomColor()}
                            dot={false}
                        />
                    ))
                }
            </LineChart>
        </ResponsiveContainer>
    )
}

function formatLargeInts(number) {
    const bil = 1_000_000_000,
          mil = 1_000_000,
          kil = 1_000;
    const floatAsString = num => num.toFixed(2).toString();
    if (number > bil) {
      return floatAsString(number / bil) + 'B';
    }
    if (number > mil) {
      return floatAsString(number / mil) + 'M';
    }
    if (number > kil) {
      return floatAsString(number / kil) + 'K';
    }
    return floatAsString(number);
  }

function randomColor() {
    return `rgba(${randomColorPart()},${randomColorPart()},${randomColorPart()},1)`;
}

function randomColorPart() {
    return Math.floor(255 * Math.random());
}