// src/components/ChartsPanel.tsx
import type { TaskType } from "../types/TaskType";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default function ChartsPanel({ tasks }: { tasks: TaskType[] }) {
  const priorities = ["low", "medium", "high"];
  const priorityCounts = priorities.map(
    (p) => tasks.filter((t) => t.priority === p).length
  );

  const done = tasks.filter((t) => t.status === "виконано").length;
  const active = tasks.length - done;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-center font-semibold mb-3">Пріоритети завдань</h3>
        <Doughnut
          data={{
            labels: ["Низький", "Середній", "Високий"],
            datasets: [
              {
                data: priorityCounts,
                backgroundColor: ["#60a5fa", "#facc15", "#f87171"],
              },
            ],
          }}
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-center font-semibold mb-3">Статус виконання</h3>
        <Bar
          data={{
            labels: ["Активні", "Виконані"],
            datasets: [
              {
                label: "Кількість завдань",
                data: [active, done],
                backgroundColor: ["#3b82f6", "#10b981"],
              },
            ],
          }}
          options={{
            plugins: { legend: { display: false } },
            // ЗМІНЕНО: 'precision' перенесено всередину 'ticks'
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
              },
            },
          }}
        />
      </div>
    </section>
  );
}