'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import * as planningService from '@/lib/planningSimple';
import { PlanningDetailView } from '@/components/planning/components/PlanningDetailView';

export default function PlanningDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [planning, setPlanning] = useState<any>(null);
  const [projectPlannings, setProjectPlannings] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  const projectId = params?.projectId as string;
  const planningId = params?.planningId as string;

  useEffect(() => {
    if (projectId && planningId) {
      // Obtener todos los plannings del proyecto
      const plannings = planningService.getPlanningsByProject(projectId);
      setProjectPlannings(plannings);
      
      // Encontrar el planning actual
      const currentPlanning = planningService.getPlanningById(planningId);
      setPlanning(currentPlanning || null);
      
      // Encontrar el índice actual
      const index = plannings.findIndex(p => p.id === planningId);
      setCurrentIndex(index);
    }
    setLoading(false);
  }, [projectId, planningId]);

  const navigateToPlanning = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < projectPlannings.length) {
      const targetPlanning = projectPlannings[newIndex];
      router.push(`/planning/${projectId}/${targetPlanning.id}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!planning) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Planning no encontrado</h2>
            <p className="text-muted-foreground mb-6">
              El planning que buscas no existe o ha sido eliminado.
            </p>
            <Link href="/planning">
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver a plannings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Navegación superior */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/planning')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a plannings
          </Button>
          
          {projectPlannings.length > 1 && (
            <div className="flex items-center gap-1 border rounded-lg p-1 ml-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={currentIndex <= 0}
                onClick={() => navigateToPlanning(currentIndex - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                {currentIndex + 1} de {projectPlannings.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={currentIndex === projectPlannings.length - 1}
                onClick={() => navigateToPlanning(currentIndex + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Proyecto: {planning.projectName}
        </div>
      </div>

      {/* Detalle del planning */}
      <PlanningDetailView
        planning={planning}
        onBack={() => router.push('/planning')}
        onPlanningChange={(updatedPlanning) => {
          if (updatedPlanning) {
            setPlanning(updatedPlanning);
          } else {
            router.push('/planning');
          }
        }}
        formatWeeks={(weeks) => {
          if (!weeks || weeks.length === 0) return 'Sin semanas';
          if (weeks.length === 1) {
            return weeks[0];
          }
          return `${weeks.length} semanas`;
        }}
      />
    </div>
  );
}