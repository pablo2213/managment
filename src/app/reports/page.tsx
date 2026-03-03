import { TimeChart } from '@/app/reports/TimeChart';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reportes</h1>
      <TimeChart />
    </div>
  );
}