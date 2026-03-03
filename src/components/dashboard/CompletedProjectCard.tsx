'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, CheckCircle2, Award, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Project } from '@/lib/data';
import { 
  getProjectCompletionType, 
  getCompletionDaysDiff,
  getProjectHours,
  getProjectWeightedProgress 
} from '@/lib/utils';
import { CompletionBadge } from './CompletionBadge';

interface CompletedProjectCardProps {
  project: Project;
}

export function CompletedProjectCard({ project }: CompletedProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const completionType = getProjectCompletionType(project);
  const daysDiff = getCompletionDaysDiff(project);
  const absDaysDiff = Math.abs(daysDiff);
  
  const { estimated, actual } = getProjectHours(project.id);
  const weightedProgress = getProjectWeightedProgress(project.id);
  
  const isEarly = completionType === 'early';
  const isOnTime = completionType === 'on-time';

  return (
    <Card className={`border-l-4 ${
      isEarly ? 'border-l-green-500' : 'border-l-blue-500'
    } hover:shadow-lg transition-all`}>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CompletionBadge type={completionType} days={absDaysDiff} />
              {isEarly && (
                <Badge variant="default" className="bg-green-500">
                  <Award className="h-3 w-3 mr-1" />
                  Entrega anticipada
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
            
            {/* Fechas del proyecto */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Inicio: {new Date(project.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Fin planificado: {new Date(project.endDate).toLocaleDateString()}</span>
              </div>
              {project.completedAt && (
                <div className={`flex items-center gap-1 text-sm ${
                  isEarly ? 'text-green-500' : 'text-blue-500'
                }`}>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Entregado: {new Date(project.completedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Métricas rápidas */}
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Horas: {actual}/{estimated}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Progreso: {weightedProgress}%
              </span>
            </div>

            {/* Expandir/contraer */}
            <div className="mt-2 flex justify-end">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t pt-4">
          {/* Métricas de éxito */}
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="bg-green-500/5 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">Cumplimiento</div>
              <div className="text-xl font-semibold text-green-500">100%</div>
            </div>
            <div className="bg-blue-500/5 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">Eficiencia</div>
              <div className="text-xl font-semibold text-blue-500">
                {Math.round((estimated / actual) * 100)}%
              </div>
            </div>
            <div className="bg-amber-500/5 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">Prioridad</div>
              <div className="text-xl font-semibold text-amber-500 capitalize">
                {project.priority}
              </div>
            </div>
          </div>

          {/* Lecciones aprendidas (si es early) */}
          {isEarly && (
            <div className="mt-4 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
              <h4 className="text-sm font-medium flex items-center gap-2 text-green-500">
                <TrendingUp className="h-4 w-4" />
                Lecciones aprendidas
              </h4>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Buena planificación inicial
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Equipo dedicado y enfocado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Sin dependencias externas críticas
                </li>
              </ul>
            </div>
          )}

          {/* Categoría y detalles adicionales */}
          <div className="mt-4 flex gap-2">
            <Badge variant="outline">
              {project.category === 'development' ? 'Desarrollo' :
               project.category === 'design' ? 'Diseño' :
               project.category === 'research' ? 'Investigación' : 'Mantenimiento'}
            </Badge>
            <Badge variant="outline">
              Prioridad: {project.priority}
            </Badge>
          </div>
        </CardContent>
      )}
    </Card>
  );
}