'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { KanbanBoard } from '@/app/board/KanbanBoard';
import { ProjectSelector } from '@/app/board/ProjectSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Layers,
  CheckSquare,
  Timer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { projects } from '@/lib/data';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import {
  getDelayDays,
  formatDelay,
  getProjectEstimatedHours,
  getProjectActualHours,
  getProjectWeightedProgress
} from '@/lib/utils';
import { Module, Task } from '@/lib/data';

export default function BoardPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      setSelectedProject(project);
    } else {
      setSelectedProject(null);
      setMetrics(null);
      setModules([]);
      setTasks([]);
    }
  }, [projectId]);

  const handleMetricsUpdate = (updatedMetrics: any) => {
    setMetrics(updatedMetrics);
  };

  const handleModulesUpdate = (updatedModules: Module[]) => {
    setModules(updatedModules);
  };

  const handleTasksUpdate = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Tablero Kanban</h1>
        </div>
        <ProjectSelector />
      </div>
    );
  }

  const delayDays = getDelayDays(selectedProject.endDate, selectedProject.progress);
  const isDelayed = delayDays > 0 && selectedProject.status === 'active';
  const projectEstimated = selectedProject.estimatedHours || 0;

  // Calcular días del proyecto
  const fechaInicio = new Date(selectedProject.startDate);
  const fechaFin = new Date(selectedProject.endDate);
  const hoy = new Date();
  const diasTotales = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
  const diasTranscurridos = Math.max(0, Math.ceil((hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)));
  const porcentajeTiempo = Math.min(100, Math.round((diasTranscurridos / diasTotales) * 100));

  // Usar valores de metrics si existen
  const weightedProgress = metrics?.weightedProgress || 0;
  const projectActual = metrics?.projectActual || 0;

  // Los moduleStats y taskStats vienen calculados desde KanbanBoard
  const moduleStats = {
    total: metrics?.hierarchical?.modules?.count || 0,
    estimated: metrics?.hierarchical?.modules?.estimated || 0,
    completed: metrics?.moduleStats?.completed || 0,
    inProgress: metrics?.moduleStats?.inProgress || 0,
    pending: metrics?.moduleStats?.pending || 0,
    blocked: metrics?.moduleStats?.blocked || 0,
    onHold: metrics?.moduleStats?.onHold || 0
  };

  const taskStats = {
    total: metrics?.hierarchical?.tasks?.count || 0,
    estimated: metrics?.hierarchical?.tasks?.estimated || 0,
    actual: metrics?.hierarchical?.tasks?.actual || 0,
    completed: metrics?.taskStats?.completed || 0,
    inProgress: metrics?.taskStats?.inProgress || 0,
    pending: metrics?.taskStats?.pending || 0,
    blocked: metrics?.taskStats?.blocked || 0,
    review: metrics?.taskStats?.review || 0
  };

  // Determinar estado general
  const getOverallStatus = () => {
    if (selectedProject.status === 'completed') return { color: 'bg-green-500', text: 'Completado', icon: CheckCircle2 };
    if (isDelayed) return { color: 'bg-red-500', text: 'Con retraso', icon: AlertTriangle };
    if (weightedProgress >= porcentajeTiempo) return { color: 'bg-green-500', text: 'Buen ritmo', icon: TrendingUp };
    return { color: 'bg-yellow-500', text: 'Atención', icon: TrendingDown };
  };

  const status = getOverallStatus();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Cabecera del proyecto */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link href="/board">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cambiar proyecto
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
            <Badge className={`${status.color} text-white border-0`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.text}
            </Badge>
            {isDelayed && (
              <Badge variant="destructive">
                {formatDelay(delayDays)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
        </div>
      </div>

      {/* ============================================ */}
      {/* DASHBOARD EJECUTIVO - 4 COLUMNAS + GRÁFICA + GANTT */}
      {/* ============================================ */}
      <ExecutiveDashboard
        project={selectedProject}
        modules={modules}
        tasks={tasks}
      />

      {/* Tablero Kanban */}
      <div className="flex-1 min-h-0">
        <KanbanBoard
          projectId={selectedProject.id}
          onMetricsUpdate={handleMetricsUpdate}
          onModulesUpdate={handleModulesUpdate}
          onTasksUpdate={handleTasksUpdate}
        />
      </div>
    </div>
  );
}