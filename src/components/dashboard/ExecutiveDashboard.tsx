'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Clock, Layers, CheckSquare, Timer, TrendingUp,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Info 
} from 'lucide-react';
import { Project, Module, Task } from '@/lib/data';
import {
  getModuleEstimatedHours,
  getModuleActualHours,
  getCompletedModulesHours,
  getCompletedTasksHours,
  getCompletedTasksActualHours,
  getTotalActualHours,
  getTotalEstimatedHours,
  getProjectEstimatedHours
} from '@/lib/utils';

interface ExecutiveDashboardProps {
  project: Project;
  modules: Module[];
  tasks: Task[];
}

export function ExecutiveDashboard({ project, modules, tasks }: ExecutiveDashboardProps) {
  // ============================================
  // CÁLCULOS GLOBALES
  // ============================================
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const today = new Date();
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const timeProgress = Math.min(100, Math.round((daysPassed / totalDays) * 100));
  
  // Cálculos de horas
  const projectEstimated = getProjectEstimatedHours(project);
  const totalEstimatedTasks = getTotalEstimatedHours(tasks);
  const totalActualHours = getTotalActualHours(tasks);
  
  const completedModulesHours = getCompletedModulesHours(modules, tasks);
  const completedTasksHours = getCompletedTasksHours(tasks);
  const completedTasksActualHours = getCompletedTasksActualHours(tasks);
  
  console.info(projectEstimated+"=="+totalEstimatedTasks+"=="+totalActualHours+"=="+completedModulesHours+"=="+completedTasksHours+"=="+completedTasksActualHours)
  
  // Porcentajes
  const projectConsumption = projectEstimated > 0 
    ? Math.round((totalActualHours / projectEstimated) * 100) 
    : 0;
    
  const tasksProgress = totalEstimatedTasks > 0
    ? Math.round((completedTasksHours / totalEstimatedTasks) * 100)
    : 0;
    
  const modulesProgress = totalEstimatedTasks > 0
    ? Math.round((completedModulesHours / totalEstimatedTasks) * 100)
    : 0;

  // ============================================
  // COLUMNA 1: PROYECTO
  // ============================================
  const ProjectColumn = () => {
    // Horas de tareas completadas (estimadas)
    const completedTasksHours = tasks
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    // Horas reales de tareas completadas
    const completedTasksActualHours = tasks
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fechas */}
          <div>
            <h4 className="text-xs font-medium mb-2">📅 Fechas</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inicio:</span>
                <span className="font-medium">{startDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fin:</span>
                <span className="font-medium">{endDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="text-muted-foreground">Días totales:</span>
                <span className="font-medium">{totalDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transcurridos:</span>
                <span className="font-medium">{daysPassed} ({timeProgress}%)</span>
              </div>
            </div>
          </div>

          {/* Horas del Proyecto */}
          <div>
            <h4 className="text-xs font-medium mb-2">⏱️ Horas Proyecto</h4>
            
            {/* Métrica 1: Horas asignadas al proyecto */}
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold">{projectEstimated}h</span>
            </div>

            {/* Métrica: Horas de tareas totales (estimadas) */}
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Horas planificadas (est):</span>
              <span className="font-medium text-green-600">{totalEstimatedTasks}h</span>
            </div>

            {/* Métrica: Total horas reales (todos los estados) */}
            <div className="flex justify-between text-xs mb-2 pt-1 ">
              <span className="text-muted-foreground font-medium">Total horas utilizadas:</span>
              <span className="font-medium text-blue-600">{totalActualHours}h</span>
            </div>

            {/* Barra de consumo comparativa */}
            <div className="mt-2 space-y-1 pt-1 border-t border-dashed">
              <div className="flex justify-between text-[10px]">
                <span>Consumo</span>
                <span>{projectConsumption}%</span>
              </div>
              <Progress value={projectConsumption} className="h-1.5" />
              
              <div className="flex justify-between text-[10px] mt-1">
                <span>Precisión en completadas</span>
                <span className={completedTasksHours > 0 
                  ? (completedTasksActualHours / completedTasksHours) > 1.1 
                    ? 'text-red-500' 
                    : (completedTasksActualHours / completedTasksHours) < 0.9 
                      ? 'text-yellow-500' 
                      : 'text-green-500'
                  : 'text-muted-foreground'
                }>
                  {completedTasksHours > 0 
                    ? Math.round((completedTasksActualHours / completedTasksHours) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================
  // COLUMNA 2: MÓDULOS
  // ============================================
  const ModulesColumn = () => {
    const completedModules = modules.filter(m => m.status === 'completed').length;
    const inProgressModules = modules.filter(m => m.status === 'in-progress').length;
    const pendingModules = modules.filter(m => m.status === 'pending').length;
    const blockedModules = modules.filter(m => m.status === 'blocked').length;

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Módulos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumen de estados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Total: {modules.length}</span>
              <Badge variant="outline">{completedModules} completados</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-500/10 p-2 rounded text-center">
                <div className="text-lg font-bold text-green-500">{completedModules}</div>
                <div className="text-[10px]">Completados</div>
              </div>
              <div className="bg-blue-500/10 p-2 rounded text-center">
                <div className="text-lg font-bold text-blue-500">{inProgressModules}</div>
                <div className="text-[10px]">En progreso</div>
              </div>
              <div className="bg-gray-500/10 p-2 rounded text-center">
                <div className="text-lg font-bold text-gray-500">{pendingModules}</div>
                <div className="text-[10px]">Pendientes</div>
              </div>
              <div className="bg-red-500/10 p-2 rounded text-center">
                <div className="text-lg font-bold text-red-500">{blockedModules}</div>
                <div className="text-[10px]">Bloqueados</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================
  // COLUMNA 3: TAREAS (CON HORAS REALES, ESTIMADAS Y %)
  // ============================================
  const TasksColumn = () => {
    // Conteo de tareas por estado
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const reviewTasks = tasks.filter(t => t.status === 'review').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;

    // ============================================
    // HORAS REALES CONSUMIDAS POR ESTADO
    // ============================================
    const completedHoursReal = tasks
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    const inProgressHoursReal = tasks
      .filter(t => t.status === 'in-progress')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    const reviewHoursReal = tasks
      .filter(t => t.status === 'review')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    const pendingHoursReal = tasks
      .filter(t => t.status === 'pending')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    const blockedHoursReal = tasks
      .filter(t => t.status === 'blocked')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    // ============================================
    // HORAS ESTIMADAS POR ESTADO
    // ============================================
    const completedHoursEst = tasks
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    const inProgressHoursEst = tasks
      .filter(t => t.status === 'in-progress')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    const reviewHoursEst = tasks
      .filter(t => t.status === 'review')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    const pendingHoursEst = tasks
      .filter(t => t.status === 'pending')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    const blockedHoursEst = tasks
      .filter(t => t.status === 'blocked')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    // Totales
    const totalHoursReal = completedHoursReal + inProgressHoursReal + reviewHoursReal + pendingHoursReal + blockedHoursReal;
    const totalHoursEst = completedHoursEst + inProgressHoursEst + reviewHoursEst + pendingHoursEst + blockedHoursEst;

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tareas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumen de conteo */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Total: {tasks.length} tareas</span>
            <Badge variant="outline">{completedTasks} completadas</Badge>
          </div>

          {/* TABLA DE HORAS POR ESTADO - CON 3 COLUMNAS */}
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-4 text-[10px] font-medium text-muted-foreground pb-1 border-b">
              <div>Estado</div>
              <div className="text-right">Real</div>
              <div className="text-right">Est</div>
              <div className="text-right">%</div>
            </div>

            {/* Completadas */}
            <div className="grid grid-cols-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Completadas</span>
              </div>
              <div className="text-right font-medium">{completedHoursReal}h</div>
              <div className="text-right text-muted-foreground">{completedHoursEst}h</div>
              <div className="text-right font-medium">
                <span className={completedHoursReal > completedHoursEst * 1.1 ? 'text-red-500' : 
                               completedHoursReal < completedHoursEst * 0.9 ? 'text-yellow-500' : 
                               'text-green-500'}>
                  {completedHoursEst > 0 ? Math.round((completedHoursReal / completedHoursEst) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* En progreso */}
            <div className="grid grid-cols-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>En progreso</span>
              </div>
              <div className="text-right font-medium">{inProgressHoursReal}h</div>
              <div className="text-right text-muted-foreground">{inProgressHoursEst}h</div>
              <div className="text-right text-muted-foreground">
                {inProgressHoursEst > 0 ? Math.round((inProgressHoursReal / inProgressHoursEst) * 100) : 0}%
              </div>
            </div>

            {/* Revisión */}
            <div className="grid grid-cols-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span>Revisión</span>
              </div>
              <div className="text-right font-medium">{reviewHoursReal}h</div>
              <div className="text-right text-muted-foreground">{reviewHoursEst}h</div>
              <div className="text-right text-muted-foreground">
                {reviewHoursEst > 0 ? Math.round((reviewHoursReal / reviewHoursEst) * 100) : 0}%
              </div>
            </div>

            {/* Pendientes */}
            <div className="grid grid-cols-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                <span>Pendientes</span>
              </div>
              <div className="text-right font-medium">{pendingHoursReal}h</div>
              <div className="text-right text-muted-foreground">{pendingHoursEst}h</div>
              <div className="text-right text-muted-foreground">
                {pendingHoursEst > 0 ? Math.round((pendingHoursReal / pendingHoursEst) * 100) : 0}%
              </div>
            </div>

            {/* Bloqueadas */}
            <div className="grid grid-cols-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>Bloqueadas</span>
              </div>
              <div className="text-right font-medium">{blockedHoursReal}h</div>
              <div className="text-right text-muted-foreground">{blockedHoursEst}h</div>
              <div className="text-right text-muted-foreground">
                {blockedHoursEst > 0 ? Math.round((blockedHoursReal / blockedHoursEst) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Totales */}
          <div className="pt-2 border-t space-y-1">
            <div className="grid grid-cols-4 text-xs font-medium">
              <div className="text-muted-foreground">TOTALES</div>
              <div className="text-right text-blue-600">{totalHoursReal}h</div>
              <div className="text-right text-muted-foreground">{totalHoursEst}h</div>
              <div className="text-right font-bold">
                <span className={totalHoursReal > totalHoursEst * 1.1 ? 'text-red-500' : 
                               totalHoursReal < totalHoursEst * 0.9 ? 'text-yellow-500' : 
                               'text-green-500'}>
                  {totalHoursEst > 0 ? Math.round((totalHoursReal / totalHoursEst) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================
  // FILA 1: TIEMPOS REALES - VERSIÓN PREMIUM
  // ============================================
  const TimeEntriesRow = () => {
    const totalEntries = tasks.reduce((acc, t) => acc + (t.timeEntries?.length || 0), 0);
    
    // Calcular tendencia últimos 30 días
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let dailyTotal = 0;
      tasks.forEach(task => {
        task.timeEntries?.forEach(entry => {
          if (entry.date === dateStr) dailyTotal += entry.hours;
        });
      });
      last30Days.push(dailyTotal);
    }
    
    const avgDaily = Math.round((last30Days.reduce((a, b) => a + b, 0) / 30) * 10) / 10;
    const maxDaily = Math.max(...last30Days);
    const yesterday = last30Days[last30Days.length - 1] || 0;
    const dayBefore = last30Days[last30Days.length - 2] || 0;
    const trendVsYesterday = dayBefore > 0 ? Math.round(((yesterday - dayBefore) / dayBefore) * 100) : 0;

    // ============================================
    // HORAS REALES POR ESTADO (para breakdown)
    // ============================================
    const completedHours = tasks
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    const inProgressHours = tasks
      .filter(t => t.status === 'in-progress')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    const reviewHoursReal = tasks
      .filter(t => t.status === 'review')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    const pendingHours = tasks
      .filter(t => t.status === 'pending')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    const blockedHours = tasks
      .filter(t => t.status === 'blocked')
      .reduce((acc, t) => {
        if (t.timeEntries && t.timeEntries.length > 0) {
          return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
        }
        return acc + (t.actualHours || 0);
      }, 0);

    // ============================================
    // HORAS ESTIMADAS POR ESTADO (para comparativas)
    // ============================================
    const completedEst = tasks
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    const inProgressEst = tasks
      .filter(t => t.status === 'in-progress')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    const reviewHoursEst = tasks
      .filter(t => t.status === 'review')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    const pendingEst = tasks
      .filter(t => t.status === 'pending')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    const blockedEst = tasks
      .filter(t => t.status === 'blocked')
      .reduce((acc, t) => acc + t.estimatedHours, 0);

    // Proyección
    const remainingEst = totalEstimatedTasks - completedEst;
    const daysRemaining = avgDaily > 0 ? Math.ceil(remainingEst / avgDaily) : 0;
    const projectedDate = new Date(today);
    projectedDate.setDate(today.getDate() + daysRemaining);
    
    const isOnTrack = projectedDate <= endDate;
    const daysDiff = Math.ceil((projectedDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

    // Datos para sparkline (últimos 14 días)
    const sparklineData = last30Days.slice(-14);

    return (
      <Card className="w-full bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            Tiempos Reales - Análisis de Horas
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* PRIMERA FILA: Métricas principales */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-background/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Total Horas</div>
              <div className="text-2xl font-bold text-primary">{totalActualHours}h</div>
              <div className="text-xs text-muted-foreground">{totalEntries} registros</div>
            </div>
            
            <div className="bg-background/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Ritmo Diario</div>
              <div className="text-2xl font-bold">{avgDaily}h/día</div>
              <div className={`text-xs ${trendVsYesterday > 0 ? 'text-green-500' : trendVsYesterday < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {trendVsYesterday > 0 ? '▲' : trendVsYesterday < 0 ? '▼' : '◆'} {Math.abs(trendVsYesterday)}% vs ayer
              </div>
            </div>
            
            <div className="bg-background/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Consumo</div>
              <div className="text-2xl font-bold">{projectConsumption}%</div>
              <div className="text-xs text-muted-foreground">vs asignado</div>
            </div>
            
            <div className="bg-background/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Proyección</div>
              <div className="text-sm font-bold">{projectedDate.toLocaleDateString()}</div>
              <div className={`text-xs ${isOnTrack ? 'text-green-500' : 'text-red-500'}`}>
                {isOnTrack ? 'Adelantado' : `${daysDiff} días retraso`}
              </div>
            </div>
          </div>

          {/* SEGUNDA FILA: Heat Gauge y Sparkline */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Heat Gauge */}
            <div className="bg-background/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-2">Termómetro de Consumo</div>
              <div className="relative h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg"
                  style={{ left: `calc(${Math.min(projectConsumption, 100)}% - 8px)` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                    {projectConsumption}%
                  </div>
                </div>
              </div>
            </div>

            {/* Sparkline */}
            <div className="bg-background/50 p-3 rounded-lg">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Tendencia 14d</span>
                <span>pico {maxDaily}h</span>
              </div>
              <div className="h-8 flex items-end gap-[2px]">
                {sparklineData.map((value, i) => {
                  const height = Math.max(4, (value / maxDaily) * 28);
                  const color = value > avgDaily * 1.2 ? 'bg-primary' : 
                               value < avgDaily * 0.8 ? 'bg-muted-foreground' : 
                               'bg-primary/60';
                  return (
                    <div
                      key={i}
                      className={`flex-1 ${color} rounded-t transition-all duration-300 hover:opacity-80`}
                      style={{ height: `${height}px` }}
                      title={`${value}h`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* TERCERA FILA: Breakdown por estado */}
          <div className="grid grid-cols-5 gap-3">
            {/* Completadas */}
            <div className="bg-green-500/5 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Completadas
                </span>
                <span className="text-xs font-bold">{Math.round((completedHours / totalActualHours) * 100)}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold">{completedHours}h</span>
                <span className={`text-[10px] ${
                  completedHours > completedEst * 1.1 ? 'text-red-500' :
                  completedHours < completedEst * 0.9 ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {completedEst > 0 ? Math.round((completedHours / completedEst) * 100) : 0}% efic
                </span>
              </div>
            </div>

            {/* En progreso */}
            <div className="bg-blue-500/5 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  En progreso
                </span>
                <span className="text-xs font-bold">{Math.round((inProgressHours / totalActualHours) * 100)}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold">{inProgressHours}h</span>
                <span className="text-[10px] text-muted-foreground">
                  {inProgressEst > 0 ? Math.round((inProgressHours / inProgressEst) * 100) : 0}% avance
                </span>
              </div>
            </div>

            {/* Revisión */}
            <div className="bg-yellow-500/5 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Revisión
                </span>
                <span className="text-xs font-bold">{Math.round((reviewHoursReal / totalActualHours) * 100)}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold">{reviewHoursReal}h</span>
                <span className="text-[10px] text-muted-foreground">
                  {reviewHoursEst > 0 ? Math.round((reviewHoursReal / reviewHoursEst) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Pendientes */}
            <div className="bg-gray-500/5 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  Pendientes
                </span>
                <span className="text-xs font-bold">{Math.round((pendingHours / totalActualHours) * 100)}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold">{pendingHours}h</span>
                <span className="text-[10px] text-muted-foreground">
                  {pendingEst > 0 ? Math.round((pendingHours / pendingEst) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Bloqueadas */}
            <div className="bg-red-500/5 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Bloqueadas
                </span>
                <span className="text-xs font-bold">{Math.round((blockedHours / totalActualHours) * 100)}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold">{blockedHours}h</span>
                <span className="text-[10px] text-muted-foreground">
                  {blockedEst > 0 ? Math.round((blockedHours / blockedEst) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================
  // GANTT REDISEÑADO - INTUITIVO Y FÁCIL DE NAVEGAR
  // ============================================
  const GanttSection = () => {
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'quarter'>('month');
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [showLegend, setShowLegend] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [zoomLevel, setZoomLevel] = useState(1);

    // Filtrar módulos por búsqueda
    const filteredModules = modules.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calcular escala de tiempo
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const today = new Date();
    const todayOffset = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Función para obtener color según estado
    const getStatusColor = (status: string) => {
      switch(status) {
        case 'completed': return 'bg-green-500';
        case 'in-progress': return 'bg-blue-500';
        case 'blocked': return 'bg-red-500';
        case 'pending': return 'bg-gray-300';
        default: return 'bg-gray-300';
      }
    };

    // Función para obtener ícono según estado
    const getStatusIcon = (status: string) => {
      switch(status) {
        case 'completed': return '✅';
        case 'in-progress': return '🔄';
        case 'blocked': return '⚠️';
        case 'pending': return '⏳';
        default: return '⏳';
      }
    };

    // Calcular el ancho de visualización según el modo
    const getTimeScale = () => {
      switch(viewMode) {
        case 'week': return 7; // 1 semana = 7 días
        case 'month': return 30; // 1 mes = 30 días
        case 'quarter': return 90; // 1 trimestre = 90 días
        default: return 30;
      }
    };

    const timeScale = getTimeScale();
    const visibleModules = filteredModules.slice(0, 15); // Mostrar máximo 15

    return (
      <Card className="w-full overflow-hidden border-2 border-primary/10">
        <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Diagrama Gantt - Módulos del Proyecto
          </CardTitle>

          {/* CONTROLES DE NAVEGACIÓN */}
          <div className="flex items-center gap-3">
            {/* Búsqueda */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-40 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Selector de vista */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  viewMode === 'week' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  viewMode === 'month' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setViewMode('quarter')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  viewMode === 'quarter' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted'
                }`}
              >
                Trimestre
              </button>
            </div>

            {/* Botón de leyenda */}
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title={showLegend ? 'Ocultar leyenda' : 'Mostrar leyenda'}
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* LEYENDA (toggle) */}
          {showLegend && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg flex flex-wrap items-center gap-4 text-xs">
              <span className="font-medium text-muted-foreground">Leyenda:</span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span> Completado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> En progreso
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Pendiente
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> Bloqueado
              </span>
              <span className="flex items-center gap-1 ml-4">
                <span className="w-5 h-3 bg-primary/30 border border-primary"></span> Progreso actual
              </span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-0.5 bg-red-400"></span> Retraso
              </span>
              <span className="flex items-center gap-1">
                <span className="w-0.5 h-4 bg-amber-500"></span> Hoy
              </span>
            </div>
          )}

          {/* CONTROLES DE ZOOM Y NAVEGACIÓN */}
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <button className="p-1 rounded hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-medium">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </span>
              <button className="p-1 rounded hover:bg-muted">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="p-1 rounded hover:bg-muted"
                onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button 
                className="p-1 rounded hover:bg-muted"
                onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button className="p-1 rounded hover:bg-muted">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CONTENEDOR PRINCIPAL DEL GANTT */}
          <div className="relative border rounded-lg overflow-x-auto" style={{ maxHeight: '450px' }}>
            {/* CABECERA DE TIEMPO */}
            <div className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b">
              <div className="flex h-10">
                {/* Columna de nombres (fija) */}
                <div className="sticky left-0 z-20 w-48 bg-muted/80 backdrop-blur-sm border-r px-3 py-2 font-medium text-xs">
                  Módulo
                </div>
                
                {/* Escala de tiempo */}
                <div className="flex-1 flex" style={{ transform: `scaleX(${zoomLevel})`, transformOrigin: 'left' }}>
                  {Array.from({ length: Math.ceil(totalDays / timeScale) }).map((_, i) => {
                    const start = i * timeScale;
                    const end = Math.min((i + 1) * timeScale, totalDays);
                    const startDate = new Date(project.startDate);
                    startDate.setDate(startDate.getDate() + start);
                    
                    return (
                      <div
                        key={i}
                        className="flex-1 border-r last:border-r-0 px-2 py-1 text-[10px] font-medium text-muted-foreground whitespace-nowrap"
                      >
                        {viewMode === 'week' && `Sem ${i + 1}`}
                        {viewMode === 'month' && startDate.toLocaleDateString('es', { month: 'short' })}
                        {viewMode === 'quarter' && `Q${i + 1}`}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LISTA DE MÓDULOS */}
            <div className="divide-y">
              {visibleModules.length > 0 ? (
                visibleModules.map((module) => {
                  const moduleStart = new Date(module.startDate);
                  const moduleEnd = new Date(module.endDate);
                  const startOffset = Math.ceil((moduleStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  const duration = Math.ceil((moduleEnd.getTime() - moduleStart.getTime()) / (1000 * 60 * 60 * 24));
                  const progressWidth = Math.round((module.progress / 100) * duration);
                  
                  // Calcular retraso (si la fecha actual es mayor a la fecha fin y no está completado)
                  const isDelayed = today > moduleEnd && module.status !== 'completed';
                  const delayDays = isDelayed ? Math.ceil((today.getTime() - moduleEnd.getTime()) / (1000 * 60 * 60 * 24)) : 0;

                  return (
                    <div
                      key={module.id}
                      className={`flex hover:bg-muted/50 transition-colors ${
                        selectedModule === module.id ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedModule(module.id)}
                    >
                      {/* Columna de nombre (fija) */}
                      <div className="sticky left-0 z-10 w-48 bg-inherit border-r px-3 py-3 flex items-center gap-2">
                        <span className="text-base">{getStatusIcon(module.status)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate" title={module.name}>
                            {module.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {module.progress}% · {module.estimatedHours}h
                          </div>
                        </div>
                      </div>

                      {/* Barra de tiempo */}
                      <div className="flex-1 relative h-16 py-2" style={{ transform: `scaleX(${zoomLevel})`, transformOrigin: 'left' }}>
                        {/* Línea de HOY */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-20"
                          style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                        />

                        {/* Barra del módulo */}
                        <div
                          className="absolute top-3 h-10 rounded-md transition-all hover:shadow-md cursor-pointer group"
                          style={{
                            left: `${(startOffset / totalDays) * 100}%`,
                            width: `${(duration / totalDays) * 100}%`,
                            minWidth: '4px'
                          }}
                        >
                          {/* Fondo de la barra */}
                          <div
                            className={`absolute inset-0 rounded-md ${
                              module.status === 'completed' ? 'bg-green-500/20' :
                              module.status === 'in-progress' ? 'bg-blue-500/20' :
                              module.status === 'blocked' ? 'bg-red-500/20' :
                              'bg-gray-300/30'
                            }`}
                          />

                          {/* Progreso actual */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 rounded-l-md ${
                              module.status === 'completed' ? 'bg-green-500' :
                              module.status === 'in-progress' ? 'bg-blue-500' :
                              module.status === 'blocked' ? 'bg-red-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${(progressWidth / duration) * 100}%` }}
                          />

                          {/* Indicador de retraso */}
                          {isDelayed && (
                            <div
                              className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"
                              title={`${delayDays} días de retraso`}
                            />
                          )}

                          {/* Tooltip al hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30">
                            <div className="bg-popover text-popover-foreground text-xs rounded-md shadow-lg p-2 whitespace-nowrap">
                              <div className="font-medium">{module.name}</div>
                              <div className="text-muted-foreground">
                                {new Date(module.startDate).toLocaleDateString()} → {new Date(module.endDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span>Progreso: {module.progress}%</span>
                                {isDelayed && (
                                  <span className="text-red-500">({delayDays}d retraso)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Líneas de cuadrícula (para referencia) */}
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 w-px bg-border/50"
                            style={{ left: `${(i * 25)}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No se encontraron módulos que coincidan con la búsqueda
                </div>
              )}
            </div>
          </div>

          {/* PIE DE PÁGINA CON ESTADÍSTICAS RÁPIDAS */}
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-4">
              <span>📊 Total módulos: {modules.length}</span>
              <span>✅ Completados: {modules.filter(m => m.status === 'completed').length}</span>
              <span>🔄 En progreso: {modules.filter(m => m.status === 'in-progress').length}</span>
              <span>⚠️ Con retraso: {modules.filter(m => {
                const end = new Date(m.endDate);
                return today > end && m.status !== 'completed';
              }).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Completado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Progreso
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500"></span> Retraso
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">      
      {/* FILA 1: 3 COLUMNAS (Proyecto, Módulos, Tareas) */}
      <div className="grid grid-cols-3 gap-4">
        <ProjectColumn />
        <ModulesColumn />
        <TasksColumn />
      </div>

      {/* FILA 2: TIEMPOS REALES (OCUPA ANCHO COMPLETO) */}
      <TimeEntriesRow />

      {/* FILA 3: GANTT */}
      <GanttSection />
    </div>
  );
}