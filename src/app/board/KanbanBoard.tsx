'use client';
import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { ModuleModal } from '@/app/board/ModuleModal';
import { modules as initialModules, tasks as allTasks, Module, projects } from '@/lib/data';
import {
  recalculateModuleFromTasks,
  calculateHierarchicalHours,
  calculateAccuracyByLevel,
  calculateBurnRate,
  predictCompletion,
  getTaskActualHours,
  getProjectWeightedProgress,
  clearCache
} from '@/lib/utils';

interface KanbanBoardProps {
  projectId: string;
  onMetricsUpdate?: (metrics: any) => void;
  onModulesUpdate?: (modules: Module[]) => void;    // ← NUEVO
  onTasksUpdate?: (tasks: any[]) => void;            // ← NUEVO
}

const columns = [
  { id: 'todo', title: 'Por hacer' },
  { id: 'doing', title: 'En progreso' },
  { id: 'blocked', title: 'Bloqueados' },
  { id: 'done', title: 'Completado' },
];

export function KanbanBoard({
  projectId,
  onMetricsUpdate,
  onModulesUpdate,
  onTasksUpdate
}: KanbanBoardProps) {
  const [modules, setModules] = useState<Module[]>(
    initialModules.filter(m => m.projectId === projectId)
  );
  const [tasks, setTasks] = useState(allTasks);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Notificar cambios a la página padre
  useEffect(() => {
    onModulesUpdate?.(modules);
  }, [modules, onModulesUpdate]);

  useEffect(() => {
    onTasksUpdate?.(tasks);
  }, [tasks, onTasksUpdate]);

  // Función para calcular y enviar métricas actualizadas
  const updateMetrics = () => {
    console.log('🔄🔄🔄 updateMetrics EJECUTÁNDOSE 🔄🔄🔄');
    console.log('📦 modules actuales:', modules.length);
    console.log('✅ tasks actuales:', tasks.length);

    // Recalcular jerarquía completa
    const hierarchical = calculateHierarchicalHours(projectId, modules, tasks);
    console.log('📊 hierarchical:', hierarchical);

    const accuracy = calculateAccuracyByLevel(projectId, tasks);
    const burnRate = calculateBurnRate(projectId, tasks);
    const project = projects.find(p => p.id === projectId);
    const prediction = project ? predictCompletion(projectId, tasks, project) : null;

    // Calcular progreso ponderado del proyecto
    const weightedProgress = getProjectWeightedProgress(projectId);
    console.log('🎯 weightedProgress:', weightedProgress);

    // Calcular estadísticas de módulos por estado
    const moduleStats = {
      completed: modules.filter(m => m.status === 'completed').length,
      inProgress: modules.filter(m => m.status === 'in-progress').length,
      pending: modules.filter(m => m.status === 'pending').length,
      blocked: modules.filter(m => m.status === 'blocked').length,
      onHold: modules.filter(m => m.status === 'on-hold').length,
    };
    console.log('📦 moduleStats:', moduleStats);

    // Calcular estadísticas de tareas por estado
    const taskStats = {
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      review: tasks.filter(t => t.status === 'review').length,
    };
    console.log('✅ taskStats:', taskStats);

    // Calcular horas totales del proyecto
    const projectEstimated = modules.reduce((acc, m) => acc + m.estimatedHours, 0);
    const projectActual = tasks.reduce((acc, t) => {
      if (t.timeEntries && t.timeEntries.length > 0) {
        return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
      }
      return acc + (t.actualHours || 0);
    }, 0);
    console.log('⏱️ projectEstimated:', projectEstimated);
    console.log('⏱️ projectActual:', projectActual);

    console.log('📤 Enviando metrics a onMetricsUpdate...');
    onMetricsUpdate?.({
      hierarchical,
      accuracy,
      burnRate,
      prediction,
      moduleStats,
      taskStats,
      weightedProgress,
      projectEstimated,
      projectActual
    });
    console.log('✅ Metrics enviadas');
  };

  // Efecto para recalcular módulos cuando cambian las tareas
  useEffect(() => {
    const updatedModules = modules.map(module => {
      const { progress } = recalculateModuleFromTasks(module.id, tasks);
      return {
        ...module,
        progress
      };
    });
    setModules(updatedModules);
  }, [tasks]);

  // Efecto para actualizar métricas cuando cambian módulos o tareas
  useEffect(() => {
    updateMetrics();
  }, [modules, tasks]);

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
    setModalOpen(true);
  };

  const handleTasksUpdate = (moduleId: string, updatedTasks: any[]) => {
    setTasks(prev => {
      const otherTasks = prev.filter(t => t.moduleId !== moduleId);
      return [...otherTasks, ...updatedTasks];
    });
    clearCache();
    updateMetrics();
  };

  const handleModuleUpdate = (moduleId: string, updatedModule: Partial<Module>) => {
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId ? { ...m, ...updatedModule } : m
      )
    );
    if (selectedModule?.id === moduleId) {
      setSelectedModule(prev => prev ? { ...prev, ...updatedModule } : null);
    }
    clearCache();
    updateMetrics();
  };

  const handleModuleDelete = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
    setTasks(prev => prev.filter(t => t.moduleId !== moduleId));
    clearCache();
    updateMetrics();
  };

  const handleAddModule = (columnId: string, moduleData: any) => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      projectId,
      name: moduleData.name,
      description: moduleData.description,
      progress: 0,
      status: 'pending',
      column: columnId as any,
      priority: moduleData.priority,
      estimatedHours: 0,
      actualHours: 0,
      startDate: moduleData.startDate,
      endDate: moduleData.endDate,
      assignedTeam: moduleData.assignedTeam || undefined,
      areaId: moduleData.areaId,        // ← NUEVO
      leadId: moduleData.leadId,        // ← NUEVO
    };

    setModules(prev => [...prev, newModule]);
    clearCache();
    updateMetrics();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeModule = modules.find(m => m.id === active.id);
    const overModule = modules.find(m => m.id === over.id);

    if (!activeModule) return;

    // Si se suelta sobre una columna, cambiar estado del módulo
    if (columns.some(col => col.id === over.id)) {
      setModules(prev =>
        prev.map(m =>
          m.id === active.id ? { ...m, column: over.id as any, status: over.id === 'done' ? 'completed' : m.status } : m
        )
      );
      return;
    }

    // Si se suelta sobre otra tarjeta (reordenar dentro de la misma columna)
    if (activeModule.column === overModule?.column) {
      const columnModules = modules.filter(m => m.column === activeModule.column);
      const oldIndex = columnModules.findIndex(m => m.id === active.id);
      const newIndex = columnModules.findIndex(m => m.id === over.id);

      const newColumnModules = arrayMove(columnModules, oldIndex, newIndex);
      const newModules = modules.map(m => {
        if (m.column === activeModule.column) {
          return newColumnModules.find(nm => nm.id === m.id) || m;
        }
        return m;
      });
      setModules(newModules);
    }
  };

  const moduleTasks = selectedModule
    ? tasks.filter(t => t.moduleId === selectedModule.id)
    : [];

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
          {columns.map(col => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              modules={modules.filter(m => m.column === col.id)}
              tasks={tasks}
              projectId={projectId}
              onModuleClick={handleModuleClick}
              onAddModule={handleAddModule}
            />
          ))}
        </div>
      </DndContext>

      <ModuleModal
        module={selectedModule}
        tasks={moduleTasks}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onTasksUpdate={handleTasksUpdate}
        onModuleUpdate={handleModuleUpdate}
        onModuleDelete={handleModuleDelete}
      />
    </>
  );
}