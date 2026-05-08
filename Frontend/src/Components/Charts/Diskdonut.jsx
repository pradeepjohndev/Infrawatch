import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.]/g, "");
    return Number(cleaned) || 0;
  }

  return 0;
};

const DiskDonut = ({ disk }) => {
  if (!disk) return null;
  const used = toNumber(disk.used_gb ?? disk.used);
  const free = toNumber(disk.available_gb ?? disk.available);

  if (used === 0 && free === 0) return null;

  const data = {
    labels: ["Used", "Free"],
    datasets: [
      {
        data: [used, free],
        backgroundColor: ["#ef4444", "#22c55e"],
        borderWidth: 1
      }
    ]
  };

  const options = {
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom"
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw} GB`
        }
      }
    }
  };

  return (
    <div style={{ width: "220px", textAlign: "center" }}>
      <h4>
        {disk.disk_type ?? disk.type} ({disk.mount_point ?? disk.mount})
      </h4>

      <Doughnut data={data} options={options} />

      <p>
        <b>Usage:</b>{" "}
        {toNumber(disk.usage_percent ?? disk.usage)}%
      </p>
    </div>
  );
};

export default DiskDonut;
