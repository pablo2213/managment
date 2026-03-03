import { GanttChart } from '@/app/gantt/GanttChart';

export default function GanttPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Diagrama Gantt</h1>
      <GanttChart />
    </div>
  );
}