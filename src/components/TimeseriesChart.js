import { Chart, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js"
import { Line } from "react-chartjs-2"

export { TimeseriesChart };
export default TimeseriesChart;

Chart.register(CategoryScale, LinearScale, PointElement, LineElement);

function TimeseriesChart({labels, counts}) {
  const combinedData = {
    labels,
    datasets: counts
  };

  const options = {
    scales: {
      x: {
        type: 'category',
        position: 'bottom',
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={combinedData} options={options} />;
}
