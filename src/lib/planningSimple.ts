import { tasks, modules, users, projects, areas } from './data';
import { plannings as initialPlannings } from './data';

// ============================================
// TIPOS
// ============================================

export interface PlanningTask {
  id: string;
  taskId: string;
  taskName: string;
  estimatedHours: number;
  assignedUsers: string[];
}

export interface PlanningModule {
  id: string;
  moduleId: string;
  moduleName: string;
  projectName: string;
  areaName?: string;
  areaColor?: string;
  estimatedHours: number;
  assignedUsers: string[];
  taskCount: number;
  tasks: PlanningTask[];
  status: 'pendiente' | 'en progreso' | 'completado';
  completionPercentage?: number;
  actualHours?: number;
}

export interface CapacityAlert {
  week: string;
  userId: string;
  userName: string;
  assignedHours: number;
  maxCapacity: number;
}

export interface PlanningEfficiency {
  completionPercentage: number;
  accuracyPercentage: number;
  hoursPlanned: number;
  hoursActual: number;
  status: 'exitoso' | 'en progreso' | 'riesgo' | 'retrasado';
}

export interface Planning {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  weeks: string[];
  description?: string;
  modules: PlanningModule[];
  createdAt: Date;
  status: 'planificado' | 'en progreso' | 'completado';
  
  // NUEVOS CAMPOS
  previousPlanningId?: string;
  nextPlanningId?: string;
  dependsOn?: string[];
  blockedBy?: string[];
  capacityAlerts?: CapacityAlert[];
  efficiency?: PlanningEfficiency;
}

// ============================================
// DATOS MOCK
// ============================================

console.log('Initial plannings from data.ts:', initialPlannings?.length || 0);
let plannings: Planning[] = initialPlannings || [];

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

export function getAllPlannings(): Planning[] {
  console.log('getAllPlannings returning:', plannings.length);
  return [...plannings].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getPlanningsByProject(projectId: string): Planning[] {
  return plannings.filter(p => p.projectId === projectId);
}

export function getPlanningById(id: string): Planning | undefined {
  return plannings.find(p => p.id === id);
}

export function createPlanning(
  projectId: string,
  projectName: string,
  weeks: string[],
  description?: string
): Planning {
  const weekLabel = weeks.length === 1 
    ? `Semana ${weeks[0]}`
    : `Planning ${weeks.length} semanas`;
  
  const newPlanning: Planning = {
    id: `plan-${Date.now()}`,
    projectId,
    projectName,
    name: weekLabel,
    weeks,
    description,
    modules: [],
    createdAt: new Date(),
    status: 'planificado'
  };
  
  plannings.push(newPlanning);
  console.log('New planning created:', newPlanning);
  return newPlanning;
}

// ============================================
// NUEVA FUNCIÓN: Crear planning con continuidad
// ============================================

export function createPlanningWithContinuation(
  projectId: string,
  projectName: string,
  weeks: string[],
  description?: string,
  previousPlanningId?: string,
  dependsOn?: string[]
): Planning {
  const newPlanning = createPlanning(projectId, projectName, weeks, description);
  
  if (previousPlanningId) {
    newPlanning.previousPlanningId = previousPlanningId;
    
    const previous = plannings.find(p => p.id === previousPlanningId);
    if (previous) {
      previous.nextPlanningId = newPlanning.id;
    }
  }

  if (dependsOn && dependsOn.length > 0) {
    newPlanning.dependsOn = dependsOn;
  }

  return newPlanning;
}

// ============================================
// FUNCIÓN: Obtener histórico de plannings
// ============================================

export function getPlanningHistory(projectId: string): Planning[] {
  const projectPlannings = plannings
    .filter(p => p.projectId === projectId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  for (let i = 0; i < projectPlannings.length; i++) {
    if (i > 0) {
      projectPlannings[i].previousPlanningId = projectPlannings[i - 1].id;
    }
    if (i < projectPlannings.length - 1) {
      projectPlannings[i].nextPlanningId = projectPlannings[i + 1].id;
    }
  }

  return projectPlannings;
}

// ============================================
// FUNCIÓN: Verificar dependencias
// ============================================

export function checkPlanningDependencies(planningId: string): { 
  blocked: boolean; 
  blockers: string[] 
} {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning || !planning.dependsOn) {
    return { blocked: false, blockers: [] };
  }

  const blockers: string[] = [];
  
  planning.dependsOn.forEach(depId => {
    const depPlanning = plannings.find(p => p.id === depId);
    if (depPlanning && depPlanning.status !== 'completado') {
      blockers.push(depPlanning.name);
    }
  });

  return {
    blocked: blockers.length > 0,
    blockers
  };
}

// ============================================
// FUNCIÓN: Verificar capacidad del equipo
// ============================================

export function checkTeamCapacity(planningId: string): CapacityAlert[] {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return [];

  const alerts: CapacityAlert[] = [];
  const MAX_HOURS_PER_WEEK = 40;

  planning.weeks.forEach(week => {
    const usersHours: Record<string, { hours: number; name: string }> = {};

    planning.modules.forEach(module => {
      module.assignedUsers.forEach(userId => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        if (!usersHours[userId]) {
          usersHours[userId] = { hours: 0, name: user.name };
        }
        const hoursPerWeek = module.estimatedHours / planning.weeks.length;
        usersHours[userId].hours += hoursPerWeek;
      });
    });

    Object.entries(usersHours).forEach(([userId, data]) => {
      if (data.hours > MAX_HOURS_PER_WEEK) {
        alerts.push({
          week,
          userId,
          userName: data.name,
          assignedHours: Math.round(data.hours * 10) / 10,
          maxCapacity: MAX_HOURS_PER_WEEK
        });
      }
    });
  });

  planning.capacityAlerts = alerts;
  return alerts;
}

// ============================================
// FUNCIÓN: Calcular eficiencia del planning
// ============================================

export function calculatePlanningEfficiency(planningId: string): PlanningEfficiency | null {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return null;

  let totalPlannedHours = 0;
  let completedHours = 0;
  let actualHours = 0;

  planning.modules.forEach(module => {
    totalPlannedHours += module.estimatedHours;
    if (module.status === 'completado') {
      completedHours += module.estimatedHours;
    }

    const moduleTasks = tasks.filter(t => t.moduleId === module.moduleId);
    moduleTasks.forEach(task => {
      if (task.timeEntries) {
        actualHours += task.timeEntries.reduce((acc, te) => acc + te.hours, 0);
      }
    });
  });

  const completionPercentage = totalPlannedHours > 0 
    ? Math.round((completedHours / totalPlannedHours) * 100) 
    : 0;

  const accuracyPercentage = totalPlannedHours > 0 
    ? Math.round((actualHours / totalPlannedHours) * 100) 
    : 0;

  let status: 'exitoso' | 'en progreso' | 'riesgo' | 'retrasado' = 'en progreso';
  
  if (planning.status === 'completado') {
    status = accuracyPercentage <= 110 ? 'exitoso' : 'riesgo';
  } else {
    const today = new Date();
    const lastWeek = new Date(planning.weeks[planning.weeks.length - 1]);
    if (today > lastWeek && completionPercentage < 100) {
      status = 'retrasado';
    } else if (completionPercentage < 30 && planning.weeks.length > 1) {
      status = 'riesgo';
    }
  }

  const efficiency = {
    completionPercentage,
    accuracyPercentage,
    hoursPlanned: totalPlannedHours,
    hoursActual: actualHours,
    status
  };

  planning.efficiency = efficiency;
  return efficiency;
}

// ============================================
// FUNCIONES EXISTENTES
// ============================================

export function getAvailableModulesForPlanning(
  planningId: string,
  projectId: string,
  projectFilter?: string,
  areaFilter?: string
) {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return [];

  let filteredModules = modules.filter(m => m.projectId === projectId);
  
  if (projectFilter && projectFilter !== 'all') {
    filteredModules = filteredModules.filter(m => m.projectId === projectFilter);
  }
  if (areaFilter && areaFilter !== 'all') {
    filteredModules = filteredModules.filter(m => m.areaId === areaFilter);
  }

  const existingModuleIds = planning.modules.map(m => m.moduleId);

  return filteredModules
    .filter(m => !existingModuleIds.includes(m.id))
    .map(module => {
      const project = projects.find(p => p.id === module.projectId);
      const area = module.areaId ? areas.find(a => a.id === module.areaId) : null;
      
      const moduleTasks = tasks.filter(t => t.moduleId === module.id);
      
      const assignedUsers = new Set<string>();
      moduleTasks.forEach(task => {
        task.assignedTo?.forEach(userId => assignedUsers.add(userId));
      });

      const tasksList = moduleTasks.map(t => ({
        id: t.id,
        taskId: t.id,
        taskName: t.name,
        estimatedHours: t.estimatedHours,
        assignedUsers: t.assignedTo || []
      }));

      return {
        id: module.id,
        moduleId: module.id,
        name: module.name,
        projectName: project?.name || 'Sin proyecto',
        areaName: area?.name,
        areaColor: area?.color,
        totalHours: moduleTasks.reduce((acc, t) => acc + t.estimatedHours, 0),
        taskCount: moduleTasks.length,
        assignedUsers: Array.from(assignedUsers),
        tasks: tasksList
      };
    });
}

export function addModulesToPlanning(planningId: string, moduleIds: string[]) {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return [];

  const modulesToAdd = getAvailableModulesForPlanning(planningId, planning.projectId)
    .filter(m => moduleIds.includes(m.id))
    .map(m => ({
      id: `planmod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      moduleId: m.moduleId,
      moduleName: m.name,
      projectName: m.projectName,
      areaName: m.areaName,
      areaColor: m.areaColor,
      estimatedHours: m.totalHours,
      assignedUsers: m.assignedUsers,
      taskCount: m.taskCount,
      tasks: m.tasks,
      status: 'pendiente' as const
    }));

  planning.modules = [...planning.modules, ...modulesToAdd];
  return modulesToAdd;
}

export function removeModuleFromPlanning(planningId: string, moduleInstanceId: string) {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return;
  
  planning.modules = planning.modules.filter(m => m.id !== moduleInstanceId);
}

export function updateModuleStatus(planningId: string, moduleInstanceId: string, status: PlanningModule['status']) {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return;
  
  const module = planning.modules.find(m => m.id === moduleInstanceId);
  if (module) module.status = status;
}

export function getPlanningParticipants(planningId: string) {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return [];

  const participantsMap = new Map();

  planning.modules.forEach(module => {
    module.assignedUsers.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (!participantsMap.has(userId)) {
        participantsMap.set(userId, {
          userId,
          userName: user.name,
          userRole: user.role,
          avatar: user.avatar,
          totalHours: 0,
          modules: []
        });
      }

      const participant = participantsMap.get(userId);
      participant.totalHours += module.estimatedHours;
      participant.modules.push(module.moduleName);
    });
  });

  return Array.from(participantsMap.values());
}

export function getPlanningSummary(planningId: string) {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return null;

  const totalHours = planning.modules.reduce((acc, m) => acc + m.estimatedHours, 0);
  const completedHours = planning.modules
    .filter(m => m.status === 'completado')
    .reduce((acc, m) => acc + m.estimatedHours, 0);

  return {
    totalModules: planning.modules.length,
    totalHours,
    completedHours,
    progress: totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0,
    weeks: planning.weeks
  };
}