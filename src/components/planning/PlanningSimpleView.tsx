'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar, Clock, Users, FolderTree,
  Plus, ChevronDown, ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { projects } from '@/lib/data';
import * as planningService from '@/lib/planningSimple';
import { getWeekStart } from '@/lib/dateUtils';
import { CreatePlanningDialog } from './components/CreatePlanningDialog';

// Generar semanas disponibles
const generateWeeks = () => {
  const weeks = [];
  const today = new Date();

  for (let i = -4; i < 12; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + (i * 7));
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const value = startDate.toISOString().split('T')[0];
    const label = `${startDate.getDate()}/${startDate.getMonth() + 1}`;
    const fullLabel = `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;

    weeks.push({ value, label, fullLabel });
  }

  return weeks;
};

const AVAILABLE_WEEKS = generateWeeks();

export function PlanningSimpleView() {
  const router = useRouter();
  const [allPlannings, setAllPlannings] = useState<planningService.Planning[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Dialog creación
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [planningDescription, setPlanningDescription] = useState('');
  const [previousPlanning, setPreviousPlanning] = useState<string>('none');
  const [dependsOn, setDependsOn] = useState<string[]>([]);

  useEffect(() => {
    setAllPlannings(planningService.getAllPlannings());
  }, []);

  const planningsByProject = () => {
    const grouped: Record<string, {
      projectId: string;
      projectName: string;
      plannings: planningService.Planning[];
    }> = {};

    allPlannings.forEach(planning => {
      if (!grouped[planning.projectId]) {
        grouped[planning.projectId] = {
          projectId: planning.projectId,
          projectName: planning.projectName,
          plannings: []
        };
      }
      grouped[planning.projectId].plannings.push(planning);
    });

    return Object.values(grouped).sort((a, b) => a.projectName.localeCompare(b.projectName));
  };

  const sortPlanningsByStatus = (plannings: planningService.Planning[]) => {
    const now = new Date();
    const currentWeekStart = getWeekStart(now);

    const inProgress: planningService.Planning[] = [];
    const upcoming: planningService.Planning[] = [];
    const completed: planningService.Planning[] = [];
    const past: planningService.Planning[] = [];

    plannings.forEach(planning => {
      const sortedWeeks = [...planning.weeks].sort();
      const firstWeek = new Date(sortedWeeks[0]);

      const isCurrentWeek = planning.weeks.some(week => {
        const weekDate = new Date(week);
        return weekDate >= currentWeekStart && weekDate < new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      });

      if (planning.status === 'completado') {
        completed.push(planning);
      } else if (isCurrentWeek || planning.status === 'en progreso') {
        inProgress.push(planning);
      } else if (firstWeek > currentWeekStart) {
        upcoming.push(planning);
      } else {
        past.push(planning);
      }
    });

    const sortByDate = (a: planningService.Planning, b: planningService.Planning) => {
      const aDate = new Date(a.weeks[0]);
      const bDate = new Date(b.weeks[0]);
      return aDate.getTime() - bDate.getTime();
    };

    return {
      inProgress: inProgress.sort(sortByDate),
      upcoming: upcoming.sort(sortByDate),
      past: past.sort(sortByDate),
      completed: completed.sort((a, b) => new Date(b.weeks[0]).getTime() - new Date(a.weeks[0]).getTime())
    };
  };

  const toggleProject = (projectId: string) => {
    const newSet = new Set(expandedProjects);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);
    } else {
      newSet.add(projectId);
    }
    setExpandedProjects(newSet);
  };

  const handleCreatePlanning = () => {
    if (!selectedProject || selectedWeeks.length === 0) return;

    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;

    const newPlanning = planningService.createPlanningWithContinuation(
      selectedProject,
      project.name,
      selectedWeeks,
      planningDescription,
      previousPlanning !== 'none' ? previousPlanning : undefined,
      dependsOn.length > 0 ? dependsOn : undefined
    );

    setAllPlannings(planningService.getAllPlannings());
    setExpandedProjects(new Set([selectedProject]));
    setShowCreateDialog(false);
    setSelectedProject('');
    setSelectedWeeks([]);
    setPlanningDescription('');
    setPreviousPlanning('none');
    setDependsOn([]);
  };

  const formatWeeks = (weeks: string[]) => {
    if (!weeks || weeks.length === 0) return 'Sin semanas';
    if (weeks.length === 1) {
      const week = AVAILABLE_WEEKS.find(w => w.value === weeks[0]);
      return week?.fullLabel || weeks[0];
    }
    return `${weeks.length} semanas`;
  };

  const renderPlanningCard = (planning: planningService.Planning, type: 'in-progress' | 'upcoming' | 'past' | 'completed') => {
    const today = new Date();
    const firstWeekDate = new Date(planning.weeks[0]);
    const daysUntilStart = Math.ceil((firstWeekDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const lastWeekDate = new Date(planning.weeks[planning.weeks.length - 1]);
    const daysLate = Math.ceil((today.getTime() - lastWeekDate.getTime()) / (1000 * 60 * 60 * 24));

    const getCardStyle = () => {
      switch (type) {
        case 'in-progress':
          return 'border-l-4 border-l-blue-500 bg-blue-50/20 hover:bg-blue-50/40';
        case 'upcoming':
          return 'border-l-4 border-l-green-500 bg-green-50/20 hover:bg-green-50/40';
        case 'past':
          return 'border-l-4 border-l-amber-500 bg-amber-50/20 hover:bg-amber-50/40';
        case 'completed':
          return 'border-l-4 border-l-gray-400 bg-gray-50/20 hover:bg-gray-50/40';
        default:
          return '';
      }
    };

    return (
      <Card
        key={planning.id}
        className={`cursor-pointer transition-all hover:shadow-md ${getCardStyle()}`}
        onClick={() => router.push(`/planning/${planning.projectId}/${planning.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h4 className="font-semibold">{planning.name}</h4>
                <Badge className={
                  type === 'in-progress' ? 'bg-blue-500' :
                    type === 'upcoming' ? 'bg-green-500' :
                      type === 'past' ? 'bg-amber-500' :
                        'bg-gray-500'
                }>
                  {type === 'in-progress' ? 'En marcha' :
                    type === 'upcoming' ? 'Próximo' :
                      type === 'past' ? 'Pendiente' :
                        'Completado'}
                </Badge>
                {type === 'upcoming' && daysUntilStart > 0 && daysUntilStart <= 7 && (
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    ¡Esta semana!
                  </Badge>
                )}
                {type === 'upcoming' && daysUntilStart > 7 && (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    En {daysUntilStart} días
                  </Badge>
                )}
                {type === 'past' && (
                  <Badge variant="destructive" className="text-xs">
                    {daysLate} {daysLate === 1 ? 'día' : 'días'} de retraso
                  </Badge>
                )}
              </div>

              {planning.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                  {planning.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Calendar className="h-3 w-3" />
                <span>{formatWeeks(planning.weeks)}</span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <FolderTree className="h-3 w-3" />
                  {planning.modules.length} módulos
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {new Set(planning.modules.flatMap(m => m.assignedUsers)).size} participantes
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {planning.modules.reduce((acc, m) => acc + m.estimatedHours, 0)}h
                </span>
              </div>

              {(type === 'in-progress' || type === 'past') && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Progreso</span>
                    <span>
                      {planning.modules.filter(m => m.status === 'completado').length}/
                      {planning.modules.length} módulos
                    </span>
                  </div>
                  <Progress
                    value={planning.modules.length > 0
                      ? (planning.modules.filter(m => m.status === 'completado').length / planning.modules.length) * 100
                      : 0
                    }
                    className={`h-1.5 ${type === 'past' ? 'bg-amber-100' : 'bg-blue-100'}`}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListView = () => {
    const projects = planningsByProject();

    return (
      <div className="space-y-4">
        {projects.map(project => {
          const sorted = sortPlanningsByStatus(project.plannings);
          const hasAny = sorted.inProgress.length > 0 || sorted.upcoming.length > 0 || sorted.past.length > 0 || sorted.completed.length > 0;

          if (!hasAny) return null;

          return (
            <Card key={project.projectId} className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/20">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleProject(project.projectId)}
                >
                  <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                    {expandedProjects.has(project.projectId) ?
                      <ChevronDown className="h-4 w-4" /> :
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                  <CardTitle className="text-lg">{project.projectName}</CardTitle>
                  <Badge variant="outline">{project.plannings.length} plannings</Badge>
                </div>
              </CardHeader>

              {expandedProjects.has(project.projectId) && (
                <CardContent className="pt-4 space-y-6">
                  {sorted.inProgress.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        En marcha ({sorted.inProgress.length})
                      </h3>
                      <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                        {sorted.inProgress.map(planning => renderPlanningCard(planning, 'in-progress'))}
                      </div>
                    </div>
                  )}

                  {sorted.upcoming.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Próximos ({sorted.upcoming.length})
                      </h3>
                      <div className="space-y-3 pl-4 border-l-2 border-green-200">
                        {sorted.upcoming.map(planning => renderPlanningCard(planning, 'upcoming'))}
                      </div>
                    </div>
                  )}

                  {sorted.past.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Pendientes de semanas anteriores ({sorted.past.length})
                      </h3>
                      <div className="space-y-3 pl-4 border-l-2 border-amber-200">
                        {sorted.past.map(planning => renderPlanningCard(planning, 'past'))}
                      </div>
                    </div>
                  )}

                  {sorted.completed.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        Completados ({sorted.completed.length})
                      </h3>
                      <div className="space-y-3 pl-4 border-l-2 border-gray-200 opacity-70">
                        {sorted.completed.map(planning => renderPlanningCard(planning, 'completed'))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plannings</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo planning
        </Button>
      </div>

      {allPlannings.length > 0 ? (
        renderListView()
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No hay plannings</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer planning para comenzar
            </p>
          </CardContent>
        </Card>
      )}

      <CreatePlanningDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onPlanningCreated={() => {
          setAllPlannings(planningService.getAllPlannings());
        }}
        availableWeeks={AVAILABLE_WEEKS}
        allPlannings={allPlannings}
      />
    </div>
  );
}