'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, Clock, CheckCircle2, Play, Pause, 
  CheckSquare, XCircle, Edit2, Trash2 
} from 'lucide-react';
import { users, tasks, modules, projects, areas } from '@/lib/data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserCommitmentsViewProps {
  userId: string;
}

export function UserCommitmentsView({ userId }: UserCommitmentsViewProps) {
  const [selectedWeek, setSelectedWeek] = useState<Date>(getWeekStart(new Date()));
  const [editingId, setEditingId] = useState<string | null>(null);

  const user = users.find(u => u.id === userId);
  const commitments = getUserWeeklyCommitments(userId, selectedWeek);

  const getTaskDetails = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const taskModule = modules.find(m => m.id === task.moduleId);
    const taskProject = taskModule ? projects.find(p => p.id === taskModule.projectId) : null;
    const taskArea = taskModule?.areaId ? areas.find(a => a.id === taskModule.areaId) : null;

    return {
      ...task,
      project: taskProject,
      area: taskArea,
      module: taskModule
    };
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'planned': return <Calendar className="h-3 w-3 text-blue-500" />;
      case 'in-progress': return <Play className="h-3 w-3 text-green-500" />;
      case 'paused': return <Pause className="h-3 w-3 text-amber-500" />;
      case 'completed': return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'planned': return 'Planeado';
      case 'in-progress': return 'En progreso';
      case 'paused': return 'Pausado';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const handleStatusChange = (commitmentId: string, newStatus: any) => {
    updateWeeklyCommitment(commitmentId, { status: newStatus });
    setEditingId(null);
  };

  const handleDelete = (commitmentId: string) => {
    if (confirm('¿Eliminar este compromiso?')) {
      deleteWeeklyCommitment(commitmentId);
    }
  };

  if (!user) return null;

  const totalPlanned = commitments.reduce((acc, c) => acc + c.estimatedHours, 0);
  const totalActual = commitments.reduce((acc, c) => acc + c.actualHoursLogged, 0);
  const progress = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Selector de semana */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const prev = new Date(selectedWeek);
            prev.setDate(prev.getDate() - 7);
            setSelectedWeek(prev);
          }}
        >
          ← Semana anterior
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatWeek(selectedWeek)}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const next = new Date(selectedWeek);
            next.setDate(next.getDate() + 7);
            setSelectedWeek(next);
          }}
        >
          Semana siguiente →
        </Button>
      </div>

      {/* Resumen de la semana */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{totalActual}/{totalPlanned}h</div>
              <p className="text-xs text-muted-foreground">Progreso {progress}%</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
        </CardContent>
      </Card>

      {/* Lista de compromisos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Compromisos de la semana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {commitments.map(commitment => {
            const task = getTaskDetails(commitment.taskId);
            if (!task) return null;

            return (
              <div key={commitment.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{task.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {task.project && (
                        <Badge variant="outline" className="text-[10px]">
                          {task.project.name}
                        </Badge>
                      )}
                      {task.area && (
                        <Badge 
                          variant="outline" 
                          className="text-[10px]"
                          style={{ 
                            borderLeftColor: task.area.color, 
                            borderLeftWidth: '3px' 
                          }}
                        >
                          {task.area.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {editingId === commitment.id ? (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        onClick={() => handleStatusChange(commitment.id, 'in-progress')}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        onClick={() => handleStatusChange(commitment.id, 'paused')}
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        onClick={() => handleStatusChange(commitment.id, 'completed')}
                      >
                        <CheckSquare className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-red-500"
                        onClick={() => handleDelete(commitment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getStatusIcon(commitment.status)}
                              <span>{getStatusText(commitment.status)}</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Click para cambiar estado</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => setEditingId(commitment.id)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {commitment.actualHoursLogged}/{commitment.estimatedHours}h
                    </span>
                  </div>
                  {commitment.notes && (
                    <span className="text-muted-foreground">
                      📝 {commitment.notes}
                    </span>
                  )}
                </div>

                {/* Barra de progreso individual */}
                <Progress 
                  value={(commitment.actualHoursLogged / commitment.estimatedHours) * 100} 
                  className="h-1 mt-2"
                />
              </div>
            );
          })}

          {commitments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay compromisos para esta semana
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}