'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as planningService from '@/lib/planningSimple';
import { PlanningCard } from './PlanningCard';
import { getWeekStart } from '@/lib/dateUtils';

interface PlanningListViewProps {
  projects: Array<{
    projectId: string;
    projectName: string;
    plannings: planningService.Planning[];
  }>;
  expandedProjects: Set<string>;
  onToggleProject: (projectId: string) => void;
  onSelectPlanning: (planning: planningService.Planning) => void;
  formatWeeks: (weeks: string[]) => string;
  sortPlanningsByStatus: (plannings: planningService.Planning[]) => any;
}

export function PlanningListView({
  projects,
  expandedProjects,
  onToggleProject,
  onSelectPlanning,
  formatWeeks,
  sortPlanningsByStatus
}: PlanningListViewProps) {
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
                onClick={() => onToggleProject(project.projectId)}
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
                      {sorted.inProgress.map(planning => (
                        <PlanningCard
                          key={planning.id}
                          planning={planning}
                          type="in-progress"
                          onClick={() => onSelectPlanning(planning)}
                          formatWeeks={formatWeeks}
                        />
                      ))}
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
                      {sorted.upcoming.map(planning => (
                        <PlanningCard
                          key={planning.id}
                          planning={planning}
                          type="upcoming"
                          onClick={() => onSelectPlanning(planning)}
                          formatWeeks={formatWeeks}
                        />
                      ))}
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
                      {sorted.past.map(planning => (
                        <PlanningCard
                          key={planning.id}
                          planning={planning}
                          type="past"
                          onClick={() => onSelectPlanning(planning)}
                          formatWeeks={formatWeeks}
                        />
                      ))}
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
                      {sorted.completed.map(planning => (
                        <PlanningCard
                          key={planning.id}
                          planning={planning}
                          type="completed"
                          onClick={() => onSelectPlanning(planning)}
                          formatWeeks={formatWeeks}
                        />
                      ))}
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
}