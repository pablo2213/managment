'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock, Settings, TrendingUp, BarChart3, Info, CheckCircle2, Layers, ListChecks } from 'lucide-react';
import { Project, Module, Task } from '@/lib/data';

interface ProjectProgressChartProps {
  project: Project;
  modules: Module[];
  tasks: Task[];
}

type TimeUnit = 'days' | 'weeks' | 'months';

interface WorkConfig {
  hoursPerDay: number;
  daysPerWeek: number;
  workDays: string[];
  timeUnit: TimeUnit;
}

export function ProjectProgressChart({ project, modules, tasks }: ProjectProgressChartProps) {
  // ============================================
  // CONFIGURACIÓN EDITABLE (mantenida)
  // ============================================
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<WorkConfig>({
    hoursPerDay: 8,
    daysPerWeek: 5,
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timeUnit: 'days'
  });

  // ============================================
  // CÁLCULOS DE AVANCE DEL PROYECTO (tu código base + mejoras)
  // ============================================
  const projectProgress = useMemo(() => {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const today = new Date();
    
    // Días totales y transcurridos
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const timeProgress = Math.min(100, Math.round((daysPassed / totalDays) * 100));
    
    // Avance por módulos completados
    const totalModules = modules.length;
    const completedModules = modules.filter(m => m.status === 'completed').length;
    const moduleProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    
    // Avance por tareas completadas
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Horas estimadas vs reales (tu código original)
    const estimatedModuleHours = modules.reduce((acc, m) => acc + m.estimatedHours, 0);
    const estimatedTaskHours = tasks.reduce((acc, t) => acc + t.estimatedHours, 0);
    
    // Cálculo de horas reales (tu función getTaskActualHours)
    const actualHours = tasks.reduce((acc, t) => {
      if (t.timeEntries && t.timeEntries.length > 0) {
        return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
      }
      return acc + (t.actualHours || 0);
    }, 0);
    
    // Horas de tareas completadas
    const completedTaskHours = tasks
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);
    
    return {
      startDate,
      endDate,
      today,
      totalDays,
      daysPassed,
      timeProgress,
      moduleProgress,
      taskProgress,
      estimatedModuleHours,
      estimatedTaskHours,
      actualHours,
      completedTaskHours
    };
  }, [project, modules, tasks]);

  // ============================================
  // PROYECCIÓN (reactivada)
  // ============================================
  const projection = useMemo(() => {
    if (projectProgress.taskProgress < 5) {
      return { 
        estimatedEndDate: projectProgress.endDate, 
        confidence: 30,
        message: "Pocos datos para proyección confiable"
      };
    }
    
    // Calcular velocidad de avance
    const progressPerDay = projectProgress.taskProgress / projectProgress.daysPassed;
    const remainingProgress = 100 - projectProgress.taskProgress;
    const estimatedDays = Math.ceil(remainingProgress / progressPerDay);
    
    const estimatedEndDate = new Date();
    estimatedEndDate.setDate(estimatedEndDate.getDate() + estimatedDays);
    
    const confidence = Math.min(90, 30 + Math.round((projectProgress.taskProgress / 10) * 7));
    
    return {
      estimatedEndDate,
      confidence,
      message: confidence > 70 ? "Proyección confiable" : "Proyección preliminar"
    };
  }, [projectProgress]);

  // ============================================
  // RENDIMIENTO (reactivado)
  // ============================================
  const performance = useMemo(() => {
    const schedulePerformance = projectProgress.timeProgress > 0
      ? Math.round((projectProgress.moduleProgress / projectProgress.timeProgress) * 100)
      : 100;
    
    const estimateAccuracy = projectProgress.estimatedTaskHours > 0
      ? Math.round((projectProgress.actualHours / projectProgress.estimatedTaskHours) * 100)
      : 100;
    
    return {
      schedulePerformance,
      estimateAccuracy,
      status: schedulePerformance > 110 ? 'retrasado' :
              schedulePerformance > 90 ? 'buen-ritmo' : 'adelantado'
    };
  }, [projectProgress]);

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Progreso del Proyecto
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            performance.status === 'buen-ritmo' ? 'bg-green-500/10 text-green-500' :
            performance.status === 'retrasado' ? 'bg-red-500/10 text-red-500' :
            'bg-blue-500/10 text-blue-500'
          }`}>
            {performance.status === 'buen-ritmo' ? '✓ Buen ritmo' :
             performance.status === 'retrasado' ? '⚠️ Con retraso' : '⚡ Adelantado'}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setShowConfig(!showConfig)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* ============================================ */}
        {/* CONFIGURACIÓN EDITABLE (tu código) */}
        {/* ============================================ */}
        {showConfig && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración de Jornada Laboral
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hoursPerDay">Horas por día</Label>
                <Input
                  id="hoursPerDay"
                  type="number"
                  value={config.hoursPerDay}
                  onChange={(e) => setConfig({ ...config, hoursPerDay: Number(e.target.value) })}
                  min={1}
                  max={24}
                  step={0.5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="daysPerWeek">Días por semana</Label>
                <Input
                  id="daysPerWeek"
                  type="number"
                  value={config.daysPerWeek}
                  onChange={(e) => setConfig({ ...config, daysPerWeek: Number(e.target.value) })}
                  min={1}
                  max={7}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Días laborables</Label>
              <div className="flex flex-wrap gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <Button
                    key={day}
                    variant={config.workDays.includes(day) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (config.workDays.includes(day)) {
                        setConfig({
                          ...config,
                          workDays: config.workDays.filter(d => d !== day)
                        });
                      } else {
                        setConfig({
                          ...config,
                          workDays: [...config.workDays, day]
                        });
                      }
                    }}
                    className="capitalize"
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label>Unidad de tiempo</Label>
                <Select
                  value={config.timeUnit}
                  onValueChange={(value: TimeUnit) => setConfig({ ...config, timeUnit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Días</SelectItem>
                    <SelectItem value="weeks">Semanas</SelectItem>
                    <SelectItem value="months">Meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={() => setShowConfig(false)}>
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* MÉTRICAS DE AVANCE (reactivadas) */}
        {/* ============================================ */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-blue-500/10 rounded p-2 text-center">
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3" />
              Tiempo
            </div>
            <div className="text-lg font-bold text-blue-500">{projectProgress.timeProgress}%</div>
            <div className="text-[10px] text-muted-foreground">
              {projectProgress.daysPassed}/{projectProgress.totalDays} días
            </div>
          </div>
          
          <div className="bg-purple-500/10 rounded p-2 text-center">
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Layers className="h-3 w-3" />
              Módulos
            </div>
            <div className="text-lg font-bold text-purple-500">{projectProgress.moduleProgress}%</div>
            <div className="text-[10px] text-muted-foreground">
              {modules.filter(m => m.status === 'completed').length}/{modules.length} compl.
            </div>
          </div>
          
          <div className="bg-green-500/10 rounded p-2 text-center">
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <ListChecks className="h-3 w-3" />
              Tareas
            </div>
            <div className="text-lg font-bold text-green-500">{projectProgress.taskProgress}%</div>
            <div className="text-[10px] text-muted-foreground">
              {tasks.filter(t => t.status === 'completed').length}/{tasks.length} compl.
            </div>
          </div>
          
          <div className="bg-amber-500/10 rounded p-2 text-center">
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Horas
            </div>
            <div className="text-lg font-bold text-amber-500">{projectProgress.actualHours}h</div>
            <div className="text-[10px] text-muted-foreground">
              de {projectProgress.estimatedTaskHours}h estimadas
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* GRÁFICA DE AVANCE (reactivada con 3 líneas) */}
        {/* ============================================ */}
        <div className="relative h-64 w-full mt-6 mb-8">
          {/* Eje Y */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
          
          {/* Área de la gráfica */}
          <div className="absolute left-12 right-0 top-0 bottom-0">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              
              {/* Línea de progreso de TIEMPO (calendarizada) */}
              <line
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              
              {/* Línea de progreso de MÓDULOS */}
              <line
                x1="0%"
                y1={`${100 - projectProgress.moduleProgress}%`}
                x2="100%"
                y2={`${100 - projectProgress.moduleProgress}%`}
                stroke="#8b5cf6"
                strokeWidth="2"
              />
              
              {/* Línea de progreso de TAREAS */}
              <line
                x1="0%"
                y1={`${100 - projectProgress.taskProgress}%`}
                x2="100%"
                y2={`${100 - projectProgress.taskProgress}%`}
                stroke="#10b981"
                strokeWidth="3"
              />
              
              {/* Línea vertical de HOY */}
              <line
                x1={`${(projectProgress.daysPassed / projectProgress.totalDays) * 100}%`}
                y1="0%"
                x2={`${(projectProgress.daysPassed / projectProgress.totalDays) * 100}%`}
                y2="100%"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              
              {/* Puntos representativos */}
              <circle
                cx={`${(projectProgress.daysPassed / projectProgress.totalDays) * 100}%`}
                cy={`${100 - projectProgress.moduleProgress}%`}
                r="4"
                fill="#8b5cf6"
                stroke="white"
                strokeWidth="2"
              />
              
              <circle
                cx={`${(projectProgress.daysPassed / projectProgress.totalDays) * 100}%`}
                cy={`${100 - projectProgress.taskProgress}%`}
                r="4"
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
            
            {/* Eje X (fechas) */}
            <div className="absolute left-0 right-0 bottom-0 transform translate-y-6 flex justify-between text-[10px] text-muted-foreground">
              <span>{new Date(project.startDate).toLocaleDateString()}</span>
              <span className="text-amber-500 font-medium">Hoy</span>
              <span className={projection.estimatedEndDate > new Date(project.endDate) ? 'text-red-500' : 'text-green-500'}>
                {projection.estimatedEndDate.toLocaleDateString()} (proy)
              </span>
              <span>{new Date(project.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* DESGLOSE DE HORAS (reactivado) */}
        {/* ============================================ */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t">
          
          {/* Columna 1: Horas de Módulos */}
          <div>
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Horas de Módulos
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimadas:</span>
                <span className="font-medium">{projectProgress.estimatedModuleHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completados:</span>
                <span className="font-medium text-purple-500">
                  {modules.filter(m => m.status === 'completed').reduce((acc, m) => acc + m.estimatedHours, 0)}h
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="text-muted-foreground">Pendientes:</span>
                <span className="font-medium">
                  {projectProgress.estimatedModuleHours - 
                   modules.filter(m => m.status === 'completed').reduce((acc, m) => acc + m.estimatedHours, 0)}h
                </span>
              </div>
            </div>
          </div>

          {/* Columna 2: Horas de Tareas */}
          <div>
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
              <ListChecks className="h-3 w-3" />
              Horas de Tareas
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimadas:</span>
                <span className="font-medium">{projectProgress.estimatedTaskHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reales (time entries):</span>
                <span className="font-medium text-green-500">{projectProgress.actualHours}h</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="text-muted-foreground">Completadas:</span>
                <span className="font-medium text-green-500">{projectProgress.completedTaskHours}h</span>
              </div>
            </div>
          </div>

          {/* Columna 3: Comparativas */}
          <div>
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Comparativas
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Módulos vs Tareas:</span>
                <span className={projectProgress.estimatedModuleHours !== projectProgress.estimatedTaskHours ? 'text-yellow-500' : 'text-green-500'}>
                  {projectProgress.estimatedModuleHours - projectProgress.estimatedTaskHours}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Real vs Estimado:</span>
                <span className={projectProgress.actualHours > projectProgress.estimatedTaskHours ? 'text-red-500' : 'text-green-500'}>
                  {projectProgress.actualHours - projectProgress.estimatedTaskHours > 0 ? '+' : ''}
                  {projectProgress.actualHours - projectProgress.estimatedTaskHours}h
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="text-muted-foreground">Precisión:</span>
                <span className={performance.estimateAccuracy > 110 ? 'text-red-500' : performance.estimateAccuracy < 90 ? 'text-yellow-500' : 'text-green-500'}>
                  {performance.estimateAccuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* RESUMEN DE AVANCE (reactivado) */}
        {/* ============================================ */}
        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Resumen de avance:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Comparativa entre progreso de tiempo, módulos y tareas</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Módulos: <span className="font-bold">{projectProgress.moduleProgress}%</span>
              </span>
              <span className="text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Tareas: <span className="font-bold">{projectProgress.taskProgress}%</span>
              </span>
              <span className="text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Tiempo: <span className="font-bold">{projectProgress.timeProgress}%</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}