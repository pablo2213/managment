'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, DollarSign, Tag, Briefcase } from 'lucide-react';
import { Project } from '@/lib/data';
import { getDelayDays, formatDelay, getProjectCompletionType } from '@/lib/utils';

interface ProjectInfoProps {
  project: Project;
  variant?: 'full' | 'compact' | 'minimal';
  showBudget?: boolean;
  showTeam?: boolean;
  showTags?: boolean;
}

export function ProjectInfo({ 
  project, 
  variant = 'full',
  showBudget = true,
  showTeam = true,
  showTags = true 
}: ProjectInfoProps) {
  
  const delayDays = getDelayDays(project.endDate, project.progress);
  const isDelayed = delayDays > 0 && project.status === 'active';
  const completionType = project.status === 'completed' 
    ? getProjectCompletionType(project) 
    : null;
  
  const getStatusColor = () => {
    switch(project.status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'on-hold': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getPriorityColor = () => {
    switch(project.priority) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return '';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{project.name}</h3>
          <Badge variant="outline" className={getStatusColor()}>
            {project.status === 'active' ? 'Activo' :
             project.status === 'completed' ? 'Completado' :
             project.status === 'on-hold' ? 'En espera' : 'Cancelado'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(project.endDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {project.progress}%
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{project.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
            </div>
            <Badge variant="outline" className={getPriorityColor()}>
              {project.priority === 'critical' ? 'Crítica' :
               project.priority === 'high' ? 'Alta' :
               project.priority === 'medium' ? 'Media' : 'Baja'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Fin: {new Date(project.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Progreso: {project.progress}%</span>
            </div>
          </div>

          <Progress value={project.progress} className="h-2" />
        </div>
      </Card>
    );
  }

  // Variant 'full' - versión completa
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <Badge variant="outline" className={getStatusColor()}>
                {project.status === 'active' ? 'Activo' :
                 project.status === 'completed' ? 'Completado' :
                 project.status === 'on-hold' ? 'En espera' : 'Cancelado'}
              </Badge>
              <Badge variant="outline" className={getPriorityColor()}>
                {project.priority === 'critical' ? 'Crítica' :
                 project.priority === 'high' ? 'Alta' :
                 project.priority === 'medium' ? 'Media' : 'Baja'} prioridad
              </Badge>
              {isDelayed && (
                <Badge variant="destructive">
                  {formatDelay(delayDays)}
                </Badge>
              )}
              {completionType === 'early' && (
                <Badge variant="default" className="bg-green-500">
                  Entrega anticipada
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {project.category === 'development' ? 'Desarrollo' :
             project.category === 'design' ? 'Diseño' :
             project.category === 'research' ? 'Investigación' : 'Mantenimiento'}
          </Badge>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Progreso</div>
            <div className="text-2xl font-bold">{project.progress}%</div>
            <Progress value={project.progress} className="h-1.5 mt-2" />
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Fechas</div>
            <div className="text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(project.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {new Date(project.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {showBudget && project.budget && (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Presupuesto</div>
              <div className="text-2xl font-bold">${project.budget.toLocaleString()}</div>
              {project.spent && (
                <div className="text-xs text-muted-foreground mt-1">
                  Gastado: ${project.spent.toLocaleString()} ({Math.round((project.spent/project.budget)*100)}%)
                </div>
              )}
            </div>
          )}

          {project.client && (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Cliente</div>
              <div className="text-lg font-semibold">{project.client}</div>
            </div>
          )}
        </div>

        {/* Equipo y etiquetas */}
        <div className="flex flex-wrap gap-6">
          {showTeam && project.team && project.team.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Users className="h-4 w-4" />
                Equipo
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.team.map(member => (
                  <Badge key={member} variant="secondary">{member}</Badge>
                ))}
              </div>
            </div>
          )}

          {showTags && project.tags && project.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Etiquetas
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}