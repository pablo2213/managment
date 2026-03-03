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
import { ProjectProgressChart } from '@/components/charts/ProjectProgressChart';
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
      {/* KPI UNIFICADO - 4 COLUMNAS CON FECHAS Y ESTADOS */}
      {/* ============================================ */}

      {/* BARRA DE PROGRESO PRINCIPAL */}
      <Card className="border-2 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Progreso general</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Basado en módulos completados</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-2xl font-bold">{weightedProgress}%</span>
          </div>
          <Progress value={weightedProgress} className="h-3" />

          {/* 4 COLUMNAS - Siempre visibles */}
          <div className="grid grid-cols-4 gap-4 mt-4">

            {/* COLUMNA 1: TIEMPO (con fechas) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-blue-500/10 rounded flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-blue-500" />
                </div>
                <span className="text-xs font-medium">Tiempo</span>
              </div>
              <div className="pl-8 space-y-1">
                <div className="text-[10px] flex items-center justify-between">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span className="font-medium">{fechaInicio.toLocaleDateString()}</span>
                </div>
                <div className="text-[10px] flex items-center justify-between">
                  <span className="text-muted-foreground">Fin:</span>
                  <span className="font-medium">{fechaFin.toLocaleDateString()}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold">{diasTranscurridos}d</span>
                  <span className="text-xs text-muted-foreground">/ {diasTotales}d</span>
                </div>
                <p className="text-xs text-muted-foreground">{porcentajeTiempo}% consumido</p>
              </div>
            </div>

            {/* COLUMNA 2: HORAS PROYECTO */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-purple-500/10 rounded flex items-center justify-center">
                  <Clock className="h-3 w-3 text-purple-500" />
                </div>
                <span className="text-xs font-medium">Proyecto</span>
              </div>
              <div className="pl-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold">{projectEstimated}h</span>
                  <span className="text-xs text-muted-foreground">est</span>
                </div>
                <p className="text-xs text-green-500">{projectActual}h reales</p>
              </div>
            </div>

            {/* COLUMNA 3: MÓDULOS (con estados) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-amber-500/10 rounded flex items-center justify-center">
                  <Layers className="h-3 w-3 text-amber-500" />
                </div>
                <span className="text-xs font-medium">Módulos</span>
                <Badge variant="outline" className="text-[10px] h-4">
                  {moduleStats.total}
                </Badge>
              </div>
              <div className="pl-8 space-y-1">
                <div className="text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Completados:
                  </span>
                  <span className="font-medium">{moduleStats.completed}</span>
                </div>
                <div className="text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    En progreso:
                  </span>
                  <span className="font-medium">{moduleStats.inProgress}</span>
                </div>
                <div className="text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Pendientes:
                  </span>
                  <span className="font-medium">{moduleStats.pending}</span>
                </div>
                <div className="text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Bloqueados:
                  </span>
                  <span className="font-medium">{moduleStats.blocked}</span>
                </div>
                {moduleStats.onHold > 0 && (
                  <div className="text-[10px] flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-500" />
                      En espera:
                    </span>
                    <span className="font-medium">{moduleStats.onHold}</span>
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground mt-1">
                  {moduleStats.estimated}h est
                </div>
              </div>
            </div>

            {/* COLUMNA 4: TAREAS (con estados) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-green-500/10 rounded flex items-center justify-center">
                  <CheckSquare className="h-3 w-3 text-green-500" />
                </div>
                <span className="text-xs font-medium">Tareas</span>
                <Badge variant="outline" className="text-[10px] h-4">
                  {taskStats.total}
                </Badge>
              </div>
              <div className="pl-8 space-y-1">
                <div className="text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Completadas:
                  </span>
                  <span className="font-medium">{taskStats.completed}</span>
                </div>
                <div className="text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    En progreso:
                  </span>
                  <span className="font-medium">{taskStats.inProgress}</span>
                </div>
                <div className="text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Revisión:
                  </span>
                  <span className="font-medium">{taskStats.review}</span>
                </div>
                <div className="text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Bloqueadas:
                  </span>
                  <span className="font-medium">{taskStats.blocked}</span>
                </div>
                <div className="text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-500" />
                    Pendientes:
                  </span>
                  <span className="font-medium">{taskStats.pending}</span>
                </div>
                <div className="text-[10px] text-amber-500 mt-1">
                  {taskStats.actual}h reales
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* GRÁFICA DE PROGRESO - CONECTADA EN TIEMPO REAL */}
      {/* ============================================ */}
      <ProjectProgressChart
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