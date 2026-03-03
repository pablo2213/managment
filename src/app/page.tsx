import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyCard } from '@/components/dashboard/CompanyCard';
import { CompletedProjectCard } from '@/components/dashboard/CompletedProjectCard';
import { getCompaniesWithMetrics, getCompletedProjectsStats, getProjectCompletionType   } from '@/lib/utils';
import { projects } from '@/lib/data';
import { Building2, FolderKanban, CheckCircle2, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const companiesWithMetrics = getCompaniesWithMetrics();
  const stats = getCompletedProjectsStats();
  
  // Separar proyectos completados
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companiesWithMetrics.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Proyectos Totales</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.completionRate}% del total</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Antes de tiempo</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.early}</div>
            <p className="text-xs text-muted-foreground">Promedio: {stats.avgEarlyDays} días antes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas las empresas</TabsTrigger>
          <TabsTrigger value="completed">Proyectos completados</TabsTrigger>
          <TabsTrigger value="early">Entregas anticipadas</TabsTrigger>
          <TabsTrigger value="on-time">En fecha exacta</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {companiesWithMetrics.map(company => (
            <CompanyCard 
              key={company.id} 
              company={company} 
              metrics={company.metrics} 
            />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Todos los proyectos completados ({completedProjects.length})
          </h2>
          <div className="grid gap-4">
            {completedProjects.map(project => (
              <CompletedProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="early" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-green-500" />
            Entregas anticipadas ({stats.early})
          </h2>
          <div className="grid gap-4">
            {completedProjects
              .filter(p => getProjectCompletionType(p) === 'early')
              .map(project => (
                <CompletedProjectCard key={project.id} project={project} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="on-time" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
            Entregas en fecha exacta ({stats.onTime})
          </h2>
          <div className="grid gap-4">
            {completedProjects
              .filter(p => getProjectCompletionType(p) === 'on-time')
              .map(project => (
                <CompletedProjectCard key={project.id} project={project} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}