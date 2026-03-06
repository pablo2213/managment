import { tasks, modules, users, projects, areas } from './data';

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
}

// ============================================
// DATOS MOCK
// ============================================

let plannings: Planning[] = [];

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

// Obtener todos los plannings
export function getAllPlannings(): Planning[] {
  return [...plannings].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Obtener plannings por proyecto
export function getPlanningsByProject(projectId: string): Planning[] {
  return plannings.filter(p => p.projectId === projectId);
}

// Obtener un planning por ID
export function getPlanningById(id: string): Planning | undefined {
  return plannings.find(p => p.id === id);
}

// Crear nuevo planning
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
    id: Date.now().toString(),
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
  return newPlanning;
}

// Obtener módulos disponibles para un proyecto (excluyendo los ya agregados en este planning)
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

// Agregar módulos a un planning específico
export function addModulesToPlanning(planningId: string, moduleIds: string[]) {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return [];

  const modulesToAdd = getAvailableModulesForPlanning(planningId, planning.projectId)
    .filter(m => moduleIds.includes(m.id))
    .map(m => ({
      id: Date.now() + Math.random().toString(36).substring(2),
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

// Eliminar módulo de un planning
export function removeModuleFromPlanning(planningId: string, moduleInstanceId: string) {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return;
  
  planning.modules = planning.modules.filter(m => m.id !== moduleInstanceId);
}

// Actualizar estado de un módulo
export function updateModuleStatus(planningId: string, moduleInstanceId: string, status: PlanningModule['status']) {
  const planning = plannings.find(p => p.id === planningId);
  if (!planning) return;
  
  const module = planning.modules.find(m => m.id === moduleInstanceId);
  if (module) module.status = status;
}

// Obtener participantes de un planning
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

// Obtener resumen de un planning
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