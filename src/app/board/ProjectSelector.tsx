'use client';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { projects, companies } from '@/lib/data';
import { Building2, CheckCircle2, AlertTriangle, Sparkles, Calendar, Clock } from 'lucide-react';
import { 
  getDelayDays, 
  getProjectEstimatedHours,
  getProjectActualHours 
} from '@/lib/utils';

export function ProjectSelector() {
  const router = useRouter();

  const handleProjectSelect = (projectId: string) => {
    router.push(`/board?project=${projectId}`);
  };

  const projectsByCompany = projects.reduce((acc, project) => {
    if (!acc[project.companyId]) {
      acc[project.companyId] = [];
    }
    acc[project.companyId].push(project);
    return acc;
  }, {} as Record<string, typeof projects>);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Seleccionar Proyecto</h2>
      
      {Object.entries(projectsByCompany).map(([companyId, companyProjects]) => {
        const company = companies.find(c => c.id === companyId);
        
        return (
          <div key={companyId} className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {company?.name}
            </h3>
            
            <div className="grid gap-2">
              {companyProjects.map(project => {
                const delayDays = getDelayDays(project.endDate, project.progress);
                const isDelayed = delayDays > 0 && project.status === 'active';
                const estimated = getProjectEstimatedHours(project.id);
                const actual = getProjectActualHours(project.id);
                
                return (
                  <Card 
                    key={project.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isDelayed ? 'border-l-4 border-l-red-500' : ''
                    }`}
                    onClick={() => handleProjectSelect(project.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{project.name}</span>
                            <Badge variant={
                              project.status === 'active' ? 'default' :
                              project.status === 'completed' ? 'secondary' :
                              project.status === 'on-hold' ? 'outline' :
                              'destructive'
                            }>
                              {project.status === 'active' ? 'Activo' :
                               project.status === 'completed' ? 'Completado' :
                               project.status === 'on-hold' ? 'En espera' : 'Cancelado'}
                            </Badge>
                            
                            {/* Simplificado: sin badge de anticipado */}
                            
                            {isDelayed && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {delayDays} días
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {project.description}
                          </p>
                          
                          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(project.endDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {actual}/{estimated}h
                            </div>
                            <div className="flex items-center gap-1">
                              <span>Progreso:</span>
                              <span>{project.progress}%</span>
                            </div>
                          </div>
                          
                          <Progress value={project.progress} className="h-1 mt-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}