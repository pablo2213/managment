'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, FolderKanban, ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { Company } from '@/lib/data';
import { getCompanyProjects } from '@/lib/utils';

interface CompanyCardProps {
  company: Company;
  metrics: {
    totalProjects: number;
    activeProjects: number;
  };
}

export function CompanyCard({ company, metrics }: CompanyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const companyProjects = getCompanyProjects(company.id);

  return (
    <Card className="border-2 border-border/50 hover:border-primary/20 transition-colors">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Building2 className="h-10 w-10 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-xl">{company.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {metrics.totalProjects} proyectos
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{company.description}</p>
              
              {/* Solo proyectos asignados y activos */}
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm">
                  <FolderKanban className="h-4 w-4 text-blue-500" />
                  <span>Total: {metrics.totalProjects}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Activos: {metrics.activeProjects}</span>
                </div>
              </div>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Proyectos de {company.name}
          </h3>
          <div className="space-y-4">
            {companyProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}