'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  BarChart3,
  Gauge,
  Ban,
  FolderKanban,
  Activity,
  Target
} from 'lucide-react';
import { ProjectModules } from './ProjectModules';
import { ProjectTimeMetrics } from './ProjectTimeMetrics';
import { ProjectStats } from './ProjectStats';
import { 
  getDelayDays, 
  formatDelay, 
  getProjectHours, 
  getProjectHoursByStatus,
  getProjectWeightedProgress,
  getProjectModulesHours,
  getProjectAdvancedStats,
  getCriticalModules,
  getHighRiskTasks
} from '@/lib/utils';
import { Project } from '@/lib/data';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTimeMetrics, setShowTimeMetrics] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const delayDays = getDelayDays(project.endDate, project.progress);
  const isDelayed = delayDays > 0;
  
  // Calcular métricas
  const { estimated, actual } = getProjectHours(project.id);
  const byStatus = getProjectHoursByStatus(project.id);
  const weightedProgress = getProjectWeightedProgress(project.id);
  const modulesHours = getProjectModulesHours(project.id);
  const advancedStats = getProjectAdvancedStats(project.id);
  const criticalModules = getCriticalModules(project.id);
  const highRiskTasks = getHighRiskTasks(project.id);

  // Determinar color según estado
  const getStatusColor = () => {
    if (project.status === 'completed') return 'border-l-green-500';
    if (project.status === 'cancelled') return 'border-l-gray-500';
    if (project.status === 'on-hold') return 'border-l-amber-500';
    if (isDelayed) return 'border-l-red-500';
    return 'border-l-blue-500';
  };

  // Badge de estado
  const getStatusBadge = () => {
    switch(project.status) {
      case 'active': return <Badge>Activo</Badge>;
      case 'completed': return <Badge variant="secondary">Completado</Badge>;
      case 'on-hold': return <Badge variant="outline">En espera</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelado</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card className={`hover:shadow-lg transition-all border-l-4 ${getStatusColor()}`}>
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                {getStatusBadge()}
                <Badge variant="outline" className={
                  project.priority === 'high' ? 'border-red-500 text-red-500' :
                  project.priority === 'medium' ? 'border-amber-500 text-amber-500' :
                  'border-blue-500 text-blue-500'
                }>
                  {project.priority === 'high' ? 'Alta' :
                   project.priority === 'medium' ? 'Media' : 'Baja'} prioridad
                </Badge>
                {isDelayed && project.status === 'active' && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {formatDelay(delayDays)}
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {actual}/{estimated}h
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
              
              {/* Fechas y categoría */}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Inicio: {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Fin: {new Date(project.endDate).toLocaleDateString()}</span>
                  {isDelayed && project.status === 'active' && (
                    <span className="text-red-500 font-medium ml-1">(original)</span>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {project.category === 'development' ? 'Desarrollo' :
                   project.category === 'design' ? 'Diseño' :
                   project.category === 'research' ? 'Investigación' : 'Mantenimiento'}
                </Badge>
              </div>

              {/* Mini KPIs */}
              <div className="flex gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {advancedStats.completedTasks}/{advancedStats.totalTasks} tareas
                </span>
                <span className="flex items-center gap-1">
                  <Gauge className="h-3 w-3 text-blue-500" />
                  {advancedStats.completionRate}% completado
                </span>
                {advancedStats.blockedTasks > 0 && (
                  <span className="flex items-center gap-1 text-red-500">
                    <Ban className="h-3 w-3" />
                    {advancedStats.blockedTasks} bloqueadas
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStats(!showStats);
                }}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                title="Ver estadísticas"
              >
                <Gauge className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTimeMetrics(!showTimeMetrics);
                }}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                title="Ver métricas de tiempo"
              >
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </button>
              {!isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Progreso del proyecto</span>
              <span className={isDelayed && project.status === 'active' ? 'text-red-500 font-medium' : ''}>
                {project.progress}%
              </span>
            </div>
            <div className="relative">
              <Progress value={project.progress} className={`h-2 ${isDelayed ? 'bg-red-100' : ''}`} />
              {isDelayed && project.status === 'active' && (
                <div 
                  className="absolute top-0 h-2 w-0.5 bg-red-500"
                  style={{ left: `${(100 / (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) * delayDays)}%` }}
                />
              )}
            </div>
          </div>
        </CardHeader>
        
        {/* Estadísticas avanzadas */}
        {showStats && (
          <CardContent className="border-t pt-4">
            <ProjectStats 
              stats={advancedStats}
              criticalModules={criticalModules}
              highRiskTasks={highRiskTasks}
            />
          </CardContent>
        )}
        
        {/* Métricas de tiempo */}
        {showTimeMetrics && (
          <CardContent className="border-t pt-4">
            <ProjectTimeMetrics
              estimated={estimated}
              actual={actual}
              byStatus={byStatus}
              weightedProgress={weightedProgress}
              modulesHours={modulesHours}
            />
          </CardContent>
        )}
        
        {/* Módulos del proyecto */}
        {(project.status === 'completed' || isExpanded) && (
          <CardContent className="border-t pt-4">
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                {project.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Módulos y tareas completadas</span>
                  </>
                ) : (
                  <>
                    <span>Módulos del proyecto</span>
                    <Badge variant="outline">
                      {modulesHours.length} módulos | 
                      {modulesHours.filter(m => m.status === 'blocked').length} bloqueados
                    </Badge>
                  </>
                )}
              </h3>
              <ProjectModules 
                projectId={project.id} 
                showAllTasks={project.status === 'completed'} 
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}