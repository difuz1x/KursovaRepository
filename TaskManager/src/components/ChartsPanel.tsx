import type { TaskType, PriorityType, StatusType } from "../types/TaskType";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend,
         BarElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface Props {
  tasks:      TaskType[];
  priorities: PriorityType[];
  statuses:   StatusType[];
}

export default function ChartsPanel({ tasks, priorities, statuses }: Props) {
  // Дані для Doughnut — по кожному пріоритету
  const priorityCounts = priorities.map(p =>
    tasks.filter(t => t.priorityId === p.id).length
  );
  const priorityColors = priorities.map(p => p.color);
  const priorityLabels = priorities.map(p => p.label_ua);

  // Дані для Bar — по кожному статусу
  const statusCounts = statuses.map(s =>
    tasks.filter(t => t.statusId === s.id).length
  );
  const statusColors = statuses.map(s => s.color);
  const statusLabels = statuses.map(s => s.label_ua);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-center font-semibold mb-3">Пріоритети завдань</h3>
        <Doughnut
          data={{
            labels:   priorityLabels,
            datasets: [{ data: priorityCounts, backgroundColor: priorityColors }],
          }}
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-center font-semibold mb-3">Статус виконання</h3>
        <Bar
          data={{
            labels:   statusLabels,
            datasets: [{
              label:           "Кількість завдань",
              data:            statusCounts,
              backgroundColor: statusColors,
            }],
          }}
          options={{
            plugins: { legend: { display: false } },
            scales:  { y: { beginAtZero: true, ticks: { precision: 0 } } },
          }}
        />
      </div>
    </section>
  );
}