import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { companies, projects, modules, tasks, Module, Task, Project, TimeEntry } from './data';

// ============================================
// FUNCIONES BÁSICAS
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// FUNCIONES DE RETRASO - OPTIMIZADAS
// ============================================

export function getDelayDays(endDate: string, progress: number): number {
  if (progress === 100) return 0;

  const today = new Date();
  const end = new Date(endDate);

  if (today <= end) return 0;

  const diffTime = today.getTime() - end.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDelay(days: number): string {
  if (days === 0) return 'En plazo';
  if (days === 1) return '1 día de retraso';
  return `${days} días de retraso`;
}

// ============================================
// FUNCIONES DE EMPRESA - OPTIMIZADAS
// ============================================

export function getCompanyProjects(companyId: string) {
  return projects.filter(p => p.companyId === companyId);
}

export function getCompanyMetrics(companyId: string) {
  const companyProjects = getCompanyProjects(companyId);
  return {
    totalProjects: companyProjects.length,
    activeProjects: companyProjects.filter(p => p.status === 'active').length
  };
}

export function getCompaniesWithMetrics() {
  return companies.map(company => ({
    ...company,
    metrics: getCompanyMetrics(company.id),
  }));
}

// ============================================
// FUNCIONES AUXILIARES REUTILIZABLES
// ============================================

// Cache simple para evitar recalcular lo mismo
const taskCache = new Map<string, Task[]>();
const moduleCache = new Map<string, Module[]>();

function getProjectModulesCached(projectId: string): Module[] {
  if (!moduleCache.has(projectId)) {
    moduleCache.set(projectId, modules.filter(m => m.projectId === projectId));
  }
  return moduleCache.get(projectId)!;
}

function getProjectTasksCached(projectId: string): Task[] {
  if (!taskCache.has(projectId)) {
    const projectModules = getProjectModulesCached(projectId);
    const moduleIds = projectModules.map(m => m.id);
    taskCache.set(projectId, tasks.filter(t => moduleIds.includes(t.moduleId)));
  }
  return taskCache.get(projectId)!;
}

// Limpiar caché cuando sea necesario (útil para desarrollo)
export function clearCache() {
  taskCache.clear();
  moduleCache.clear();
}

// ============================================
// FUNCIONES DE PROYECTO - OPTIMIZADAS
// ============================================

export function getProjectTasks(projectId: string): Task[] {
  return getProjectTasksCached(projectId);
}

export function getProjectEstimatedHours(projectId: string): number {
  const projectModules = getProjectModulesCached(projectId);
  return projectModules.reduce((acc, m) => acc + m.estimatedHours, 0);
}

export function getTaskActualHours(task: Task): number {
  // Si hay time entries, sumarlos
  if (task.timeEntries && Array.isArray(task.timeEntries) && task.timeEntries.length > 0) {
    return task.timeEntries.reduce((sum, entry) => sum + (entry?.hours || 0), 0);
  }

  // Si no hay time entries pero hay actualHours, usarlo
  if (task.actualHours !== undefined && task.actualHours !== null) {
    return task.actualHours;
  }

  // Valor por defecto
  return 0;
}

// Ejemplo en getProjectActualHours:
export function getProjectActualHours(projectId: string): number {
  const projectTasks = getProjectTasksCached(projectId);
  console.log("====================")
  console.log(projectTasks)
  console.log("====================")
  let total = 0;
  for (const task of projectTasks) {
    console.info(getTaskActualHours(task))
    total += getTaskActualHours(task); // Ya está corregido
  }
  return total;
}

// Ejemplo en getProjectHoursByStatus:
export function getProjectHoursByStatus(projectId: string) {
  const projectTasks = getProjectTasksCached(projectId);

  const result = {
    completed: 0,
    inProgress: 0,
    pending: 0
  };

  for (const task of projectTasks) {
    const hours = getTaskActualHours(task); // Ya está corregido

    switch (task.status) {
      case 'completed':
        result.completed += hours;
        break;
      case 'in-progress':
      case 'review':
        result.inProgress += hours;
        break;
      case 'pending':
      case 'blocked':
      default:
        result.pending += hours;
        break;
    }
  }

  return result;
}

export function getProjectHours(projectId: string) {
  return {
    estimated: getProjectEstimatedHours(projectId),
    actual: getProjectActualHours(projectId)
  };
}

export function getProjectWeightedProgress(projectId: string): number {
  const projectModules = getProjectModulesCached(projectId);
  if (projectModules.length === 0) return 0;

  let totalEstimated = 0;
  let completedEstimated = 0;

  for (const module of projectModules) {
    totalEstimated += module.estimatedHours;
    if (module.status === 'completed') {
      completedEstimated += module.estimatedHours;
    }
  }

  return Math.round((completedEstimated / totalEstimated) * 100);
}

export function getProjectModulesHours(projectId: string) {
  const projectModules = getProjectModulesCached(projectId);

  return projectModules.map(module => {
    const moduleTasks = tasks.filter(t => t.moduleId === module.id);
    let estimated = 0;
    let actual = 0;

    for (const task of moduleTasks) {
      estimated += task.estimatedHours;
      actual += getTaskActualHours(task);
    }

    return {
      moduleId: module.id,
      moduleName: module.name,
      estimated,
      actual,
      progress: estimated > 0 ? Math.round((actual / estimated) * 100) : 0,
      status: module.status
    };
  });
}

// ============================================
// COLORES DE PRIORIDAD
// ============================================

export const priorityColors = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

// ============================================
// TIPOS DE FINALIZACIÓN DE PROYECTOS - OPTIMIZADOS
// ============================================

export type CompletionType = 'on-time' | 'early' | 'late' | 'in-progress';

export function getProjectCompletionType(project: Project): CompletionType {
  if (project.status !== 'completed') return 'in-progress';
  if (!project.completedAt) return 'on-time';

  const endDate = new Date(project.endDate).getTime();
  const completedAt = new Date(project.completedAt).getTime();

  if (completedAt < endDate) return 'early';
  if (completedAt > endDate) return 'late';
  return 'on-time';
}

export function getCompletionDaysDiff(project: Project): number {
  if (project.status !== 'completed' || !project.completedAt) return 0;

  const endDate = new Date(project.endDate).getTime();
  const completedAt = new Date(project.completedAt).getTime();

  return Math.ceil((completedAt - endDate) / (1000 * 60 * 60 * 24));
}

export function getCompletionColor(type: CompletionType): string {
  const colors = {
    'early': 'text-green-500 bg-green-500/10 border-green-500',
    'on-time': 'text-blue-500 bg-blue-500/10 border-blue-500',
    'late': 'text-red-500 bg-red-500/10 border-red-500',
    'in-progress': 'text-gray-500 bg-gray-500/10 border-gray-500'
  };
  return colors[type];
}

export function getCompletedProjectsStats() {
  const completedProjects = projects.filter(p => p.status === 'completed');

  let early = 0;
  let onTime = 0;
  let late = 0;
  let totalEarlyDays = 0;

  for (const project of completedProjects) {
    const type = getProjectCompletionType(project);

    switch (type) {
      case 'early':
        early++;
        totalEarlyDays += Math.abs(getCompletionDaysDiff(project));
        break;
      case 'on-time':
        onTime++;
        break;
      case 'late':
        late++;
        break;
    }
  }

  return {
    total: completedProjects.length,
    early,
    onTime,
    late,
    avgEarlyDays: early > 0 ? Math.round(totalEarlyDays / early) : 0,
    completionRate: Math.round((completedProjects.length / projects.length) * 100)
  };
}

// ============================================
// FUNCIÓN PARA RECALCULAR MÓDULO DESDE TAREAS
// ============================================

export function recalculateModuleFromTasks(moduleId: string, tasksList: Task[]) {
  const moduleTasks = tasksList.filter(t => t.moduleId === moduleId);

  let totalEstimated = 0;
  let completedEstimated = 0;

  for (const task of moduleTasks) {
    totalEstimated += task.estimatedHours;
    if (task.status === 'completed') {
      completedEstimated += task.estimatedHours;
    }
  }

  const progress = totalEstimated > 0
    ? Math.round((completedEstimated / totalEstimated) * 100)
    : (moduleTasks.length > 0 ? 100 : 0);

  return { progress };
}

// ============================================
// FUNCIÓN PARA OBTENER HORAS REALES DE UN MÓDULO
// ============================================

export function getModuleActualHours(moduleId: string, moduleTasks: Task[]): number {
  // Validar que moduleTasks sea un array
  if (!moduleTasks || !Array.isArray(moduleTasks)) {
    console.warn(`getModuleActualHours: moduleTasks no es un array para módulo ${moduleId}`);
    return 0;
  }

  let total = 0;
  for (const task of moduleTasks) {
    if (task.timeEntries && task.timeEntries.length > 0) {
      total += task.timeEntries.reduce((sum, entry) => sum + (entry?.hours || 0), 0);
    } else {
      total += task.actualHours || 0;
    }
  }
  return total;
}

// ============================================
// FUNCIONES DE RIESGO - OPTIMIZADAS
// ============================================

export function getCriticalModules(projectId: string) {
  const projectModules = getProjectModulesCached(projectId);
  const result = [];

  for (const module of projectModules) {
    if (module.status === 'blocked') {
      result.push(module);
      continue;
    }

    if (module.status === 'in-progress') {
      const delayDays = getDelayDays(module.endDate, module.progress);
      if (delayDays > 0) {
        result.push(module);
      }
    }
  }

  return result;
}

export function getHighRiskTasks(projectId: string) {
  const projectTasks = getProjectTasksCached(projectId);
  const result = [];

  for (const task of projectTasks) {
    if (task.status === 'blocked') {
      result.push(task);
      continue;
    }

    if (task.status === 'in-progress') {
      const taskActual = getTaskActualHours(task);
      if (task.estimatedHours - taskActual > 20) {
        result.push(task);
      }
    }

    if ((task.priority === 'high' || task.priority === 'critical') && task.status === 'pending') {
      result.push(task);
    }
  }

  return result;
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS AVANZADAS - OPTIMIZADAS
// ============================================

export function getProjectAdvancedStats(projectId: string) {
  const projectTasks = getProjectTasksCached(projectId);

  const stats = {
    totalTasks: projectTasks.length,
    completedTasks: 0,
    blockedTasks: 0,
    inProgressTasks: 0,
    reviewTasks: 0,
    pendingTasks: 0,
    overCostTasks: 0,
    underCostTasks: 0,
    totalDays: 0,
    totalCompletedHours: 0,
    avgSpeed: 0
  };

  let tasksWithDates = 0;

  for (const task of projectTasks) {
    // Contar por estado
    switch (task.status) {
      case 'completed':
        stats.completedTasks++;
        break;
      case 'blocked':
        stats.blockedTasks++;
        break;
      case 'in-progress':
        stats.inProgressTasks++;
        break;
      case 'review':
        stats.reviewTasks++;
        break;
      case 'pending':
        stats.pendingTasks++;
        break;
    }

    // Calcular sobrecosto/ahorro
    const taskActual = getTaskActualHours(task);
    if (task.status === 'completed') {
      if (taskActual > task.estimatedHours * 1.2) {
        stats.overCostTasks++;
      } else if (taskActual < task.estimatedHours * 0.8) {
        stats.underCostTasks++;
      }
    }

    // Calcular velocidad
    if (task.completedAt && task.timeEntries && task.timeEntries.length > 0) {
      const start = new Date(task.createdAt).getTime();
      const end = new Date(task.completedAt).getTime();
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      stats.totalDays += days;
      stats.totalCompletedHours += taskActual;
      tasksWithDates++;
    }
  }

  stats.avgSpeed = stats.totalDays > 0
    ? Math.round((stats.totalCompletedHours / stats.totalDays) * 10) / 10
    : 0;

  return {
    ...stats,
    completionRate: stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0,
  };
}

// ============================================
// FUNCIONES JERÁRQUICAS - OPTIMIZADAS
// ============================================

export function calculateHierarchicalHours(projectId: string, allModules: Module[], allTasks: Task[]) {
  const projectModules = allModules.filter(m => m.projectId === projectId);
  const moduleIds = new Set(projectModules.map(m => m.id));
  const projectTasks = allTasks.filter(t => moduleIds.has(t.moduleId));

  // Proyecto
  const projectEstimated = projectModules.reduce((acc, m) => acc + m.estimatedHours, 0);

  // Módulos
  const moduleStats = {
    count: projectModules.length,
    estimated: projectEstimated,
    average: projectModules.length > 0
      ? Math.round((projectEstimated / projectModules.length) * 10) / 10
      : 0
  };

  // Tareas
  let tasksEstimated = 0;
  let tasksActual = 0;

  for (const task of projectTasks) {
    tasksEstimated += task.estimatedHours;
    tasksActual += getTaskActualHours(task);
  }

  const taskStats = {
    count: projectTasks.length,
    estimated: tasksEstimated,
    actual: tasksActual,
    deviation: tasksActual - tasksEstimated,
    average: projectTasks.length > 0
      ? Math.round((tasksActual / projectTasks.length) * 10) / 10
      : 0
  };

  // Time Entries
  const allTimeEntries = projectTasks.flatMap(t => t.timeEntries || []);
  const timeEntriesTotal = allTimeEntries.reduce((acc, te) => acc + te.hours, 0);

  const sortedEntries = [...allTimeEntries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const timeEntryStats = {
    count: allTimeEntries.length,
    total: timeEntriesTotal,
    average: allTimeEntries.length > 0
      ? Math.round((timeEntriesTotal / allTimeEntries.length) * 10) / 10
      : 0,
    last: sortedEntries.length > 0 ? sortedEntries[0].hours : 0
  };

  return {
    project: { estimated: projectEstimated },
    modules: moduleStats,
    tasks: taskStats,
    timeEntries: timeEntryStats
  };
}

export function calculateAccuracyByLevel(projectId: string, allTasks: Task[]) {
  const projectTasks = allTasks.filter(t => {
    const taskModule = modules.find(m => m.id === t.moduleId);
    return taskModule?.projectId === projectId;
  });

  if (projectTasks.length === 0) {
    return { tasks: { value: 100, color: 'text-green-500' } };
  }

  let totalAccuracy = 0;
  let taskCount = 0;

  for (const task of projectTasks) {
    if (task.estimatedHours === 0) continue;

    const taskActual = getTaskActualHours(task);
    const accuracy = Math.min(200, Math.round((taskActual / task.estimatedHours) * 100));
    totalAccuracy += accuracy;
    taskCount++;
  }

  const avgAccuracy = taskCount > 0 ? Math.round(totalAccuracy / taskCount) : 100;

  const getColorClass = (value: number): string => {
    if (value <= 80) return 'text-red-500';
    if (value <= 95) return 'text-yellow-500';
    if (value <= 105) return 'text-green-500';
    if (value <= 120) return 'text-yellow-500';
    return 'text-red-500';
  };

  return {
    tasks: {
      value: avgAccuracy,
      color: getColorClass(avgAccuracy)
    }
  };
}

export function calculateBurnRate(projectId: string, allTasks: Task[]) {
  const projectTasks = allTasks.filter(t => {
    const taskModule = modules.find(m => m.id === t.moduleId);
    return taskModule?.projectId === projectId;
  });

  const allTimeEntries = projectTasks.flatMap(t => t.timeEntries || []);

  if (allTimeEntries.length === 0) {
    return { average: 0, lastWeek: 0 };
  }

  const entriesByDate: Record<string, number> = {};
  let lastWeekHours = 0;
  let lastWeekDays = 0;

  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const entry of allTimeEntries) {
    entriesByDate[entry.date] = (entriesByDate[entry.date] || 0) + entry.hours;

    const entryDate = new Date(entry.date);
    if (entryDate >= lastWeek) {
      lastWeekHours += entry.hours;
      lastWeekDays++;
    }
  }

  const dates = Object.keys(entriesByDate);
  const totalHours = Object.values(entriesByDate).reduce((a, b) => a + b, 0);

  return {
    average: dates.length > 0 ? Math.round((totalHours / dates.length) * 10) / 10 : 0,
    lastWeek: lastWeekDays > 0 ? Math.round((lastWeekHours / lastWeekDays) * 10) / 10 : 0
  };
}

export function predictCompletion(projectId: string, allTasks: Task[], project: any) {
  const projectTasks = allTasks.filter(t => {
    const taskModule = modules.find(m => m.id === t.moduleId);
    return taskModule?.projectId === projectId;
  });

  const allTimeEntries = projectTasks.flatMap(t => t.timeEntries || []);

  if (allTimeEntries.length < 5) {
    return {
      date: new Date(project.endDate).toLocaleDateString(),
      isDelayed: false,
      confidence: 30,
      message: "Pocos datos para proyección confiable"
    };
  }

  // Calcular promedio últimos 30 días
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  let recentHours = 0;
  let recentCount = 0;

  for (const entry of allTimeEntries) {
    const entryDate = new Date(entry.date);
    if (entryDate >= thirtyDaysAgo) {
      recentHours += entry.hours;
      recentCount++;
    }
  }

  const avgDaily = recentCount > 0 ? recentHours / 30 : 4;

  // Horas restantes
  let remainingEstimated = 0;
  for (const task of projectTasks) {
    if (task.status !== 'completed') {
      remainingEstimated += task.estimatedHours;
    }
  }

  const estimatedDays = Math.ceil(remainingEstimated / avgDaily);

  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + estimatedDays);

  const plannedEnd = new Date(project.endDate);

  return {
    date: predictedDate.toLocaleDateString(),
    isDelayed: predictedDate > plannedEnd,
    confidence: Math.min(90, 30 + Math.round((allTimeEntries.length / 20) * 70)),
    message: "Proyección basada en time entries"
  };
}
