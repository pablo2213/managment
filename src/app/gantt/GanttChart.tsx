"use client";
import { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
}

const tasks: GanttTask[] = [
  {
    id: "1",
    name: "Diseño UI",
    start: "2024-01-01",
    end: "2024-01-15",
    progress: 100,
  },
  {
    id: "2",
    name: "Desarrollo Frontend",
    start: "2024-01-10",
    end: "2024-02-20",
    progress: 60,
    dependencies: "1",
  },
  {
    id: "3",
    name: "Desarrollo Backend",
    start: "2024-01-15",
    end: "2024-03-01",
    progress: 40,
    dependencies: "1",
  },
  {
    id: "4",
    name: "Pruebas",
    start: "2024-03-01",
    end: "2024-03-15",
    progress: 0,
    dependencies: "2,3",
  },
];

export function GanttChart() {
  const ganttRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ganttRef.current) {
      new Gantt(ganttRef.current, tasks, {
        header_height: 50,
        column_width: 30,
        step: 24,
        view_modes: ["Quarter Day", "Half Day", "Day", "Week", "Month"],
        bar_height: 30,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        view_mode: "Week",
        date_format: "YYYY-MM-DD",
        language: "es",
      });
    }
  }, []);

  return <div ref={ganttRef} className="w-full overflow-x-auto" style={{ minWidth: "800px" }}></div>;
}