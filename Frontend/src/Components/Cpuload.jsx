import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, BarController, Tooltip } from "chart.js"; 
import { Bar } from "react-chartjs-2"; 
ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip);

export default function Cpuload({ label = "CPU", value = 0, color = "#22c55e" }) {
  const safeValue = Number(value) || 0;

  const data = {
    labels: [label],
    datasets: [
      {
        data: [Math.min(safeValue, 100)],
        backgroundColor: color,
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: true,
    scales: {
      x: {
        min: 0,
        max: 100,
        ticks: {
          callback: (v) => `${v}%`,
        },
      },
      y: {
        display: false,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw}%`,
        },
      },
    },
  };

  return (
    <div style={{ height: "50px", width: "100%", marginBottom: "12px" }}>
      <Bar data={data} options={options} />
    </div>
  );
}
