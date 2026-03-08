// ============================================
// INTERFACES
// ============================================

export interface Company {
  id: string;
  name: string;
  description: string;
}

export interface Area {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'developer' | 'designer' | 'qa' | 'devops' | 'security';
  areaId?: string;
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  startDate: string;
  endDate: string;
  completedAt?: string;
  priority: 'high' | 'medium' | 'low' | 'critical';
  category: 'development' | 'design' | 'research' | 'maintenance';
  estimatedHours: number;
}

export interface Module {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'on-hold';
  column: 'todo' | 'doing' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[];
  estimatedHours: number;
  actualHours: number;
  startDate: string;
  endDate: string;
  areaId?: string;
  leadId?: string;
  assignedUsers?: string[];
}

export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  hours: number;
  date: string;
  description?: string;
}

export interface Task {
  id: string;
  moduleId: string;
  name: string;
  description?: string;
  estimatedHours: number;
  actualHours: number;
  assignedTo?: string[];
  assignedToNames?: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  completedAt?: string;
  timeEntries?: TimeEntry[];
  subtasks?: Subtask[];
}

// ============================================
// INTERFACES DE PLANNING
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
  previousPlanningId?: string;
  nextPlanningId?: string;
}

// ============================================
// EMPRESA ÚNICA
// ============================================
// ============================================
// DATOS DE RELLENO PARA CRUCES - VERSIÓN REDUCIDA
// ============================================

// ============================================
// 1. EMPRESA Y PROYECTO BASE
// ============================================

export const companies: Company[] = [
  {
    id: 'c1',
    name: 'TechCorp Solutions',
    description: 'Empresa de desarrollo de software',
  },
];

export const projects: Project[] = [
  {
    id: 'p1',
    companyId: 'c1',
    name: 'E-commerce Marketplace',
    description: 'Plataforma de comercio electrónico',
    progress: 58,
    status: 'active',
    startDate: '2026-01-15',
    endDate: '2026-07-30',
    priority: 'critical',
    category: 'development',
    estimatedHours: 2800,
  },
];

// ============================================
// 2. ÁREAS (4 principales)
// ============================================

export const areas: Area[] = [
  {
    id: 'area1',
    name: 'Backend',
    description: 'APIs y lógica de negocio',
    color: '#3b82f6',
  },
  {
    id: 'area2',
    name: 'Frontend',
    description: 'Interfaces de usuario',
    color: '#10b981',
  },
  {
    id: 'area3',
    name: 'Diseño UX/UI',
    description: 'Diseño de interfaces',
    color: '#f59e0b',
  },
  {
    id: 'area4',
    name: 'QA',
    description: 'Pruebas y calidad',
    color: '#8b5cf6',
  },
];

// ============================================
// 3. USUARIOS (8 personas - 2 por área)
// ============================================

export const users: User[] = [
  // Backend
  {
    id: 'u1',
    name: 'Ana García',
    email: 'ana.garcia@techcorp.com',
    role: 'developer',
    areaId: 'area1',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=3b82f6&color=fff',
  },
  {
    id: 'u2',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@techcorp.com',
    role: 'developer',
    areaId: 'area1',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Ruiz&background=3b82f6&color=fff',
  },
  
  // Frontend
  {
    id: 'u3',
    name: 'Javier López',
    email: 'javier.lopez@techcorp.com',
    role: 'developer',
    areaId: 'area2',
    avatar: 'https://ui-avatars.com/api/?name=Javier+Lopez&background=10b981&color=fff',
  },
  {
    id: 'u4',
    name: 'David Rodríguez',
    email: 'david.rodriguez@techcorp.com',
    role: 'developer',
    areaId: 'area2',
    avatar: 'https://ui-avatars.com/api/?name=David+Rodriguez&background=10b981&color=fff',
  },
  
  // Diseño
  {
    id: 'u5',
    name: 'Laura Méndez',
    email: 'laura.mendez@techcorp.com',
    role: 'designer',
    areaId: 'area3',
    avatar: 'https://ui-avatars.com/api/?name=Laura+Mendez&background=f59e0b&color=fff',
  },
  {
    id: 'u6',
    name: 'Carmen López',
    email: 'carmen.lopez@techcorp.com',
    role: 'designer',
    areaId: 'area3',
    avatar: 'https://ui-avatars.com/api/?name=Carmen+Lopez&background=f59e0b&color=fff',
  },
  
  // QA
  {
    id: 'u7',
    name: 'Elena Gómez',
    email: 'elena.gomez@techcorp.com',
    role: 'qa',
    areaId: 'area4',
    avatar: 'https://ui-avatars.com/api/?name=Elena+Gomez&background=8b5cf6&color=fff',
  },
  {
    id: 'u8',
    name: 'Patricia Sánchez',
    email: 'patricia.sanchez@techcorp.com',
    role: 'qa',
    areaId: 'area4',
    avatar: 'https://ui-avatars.com/api/?name=Patricia+Sanchez&background=8b5cf6&color=fff',
  },
];

// ============================================
// 4. MÓDULOS (8 módulos - 2 por área)
// ============================================

export const modules: Module[] = [
  // Backend (área1) - 2 módulos
  {
    id: 'm1',
    projectId: 'p1',
    name: 'Autenticación',
    description: 'Sistema de login, registro y perfiles',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'critical',
    estimatedHours: 120,
    actualHours: 135,
    startDate: '2026-01-15',
    endDate: '2026-02-28',
    areaId: 'area1',
    leadId: 'u1',
    assignedUsers: ['u1', 'u2'],
  },
  {
    id: 'm2',
    projectId: 'p1',
    name: 'Pasarela de Pagos',
    description: 'Integración con Stripe y PayPal',
    progress: 70,
    status: 'in-progress',
    column: 'doing',
    priority: 'critical',
    estimatedHours: 180,
    actualHours: 126,
    startDate: '2026-03-01',
    endDate: '2026-05-15',
    areaId: 'area1',
    leadId: 'u1',
    assignedUsers: ['u1', 'u2'],
    dependencies: ['m1'],
  },

  // Frontend (área2) - 2 módulos
  {
    id: 'm3',
    projectId: 'p1',
    name: 'Carrito de Compras',
    description: 'Carrito persistente y checkout',
    progress: 90,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 140,
    actualHours: 126,
    startDate: '2026-02-15',
    endDate: '2026-04-15',
    areaId: 'area2',
    leadId: 'u3',
    assignedUsers: ['u3', 'u4'],
    dependencies: ['m1'],
  },
  {
    id: 'm4',
    projectId: 'p1',
    name: 'Dashboard',
    description: 'Panel de administración',
    progress: 40,
    status: 'pending',
    column: 'todo',
    priority: 'medium',
    estimatedHours: 160,
    actualHours: 64,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    areaId: 'area2',
    leadId: 'u4',
    assignedUsers: ['u3', 'u4'],
    dependencies: ['m3'],
  },

  // Diseño (área3) - 2 módulos
  {
    id: 'm5',
    projectId: 'p1',
    name: 'Diseño UI',
    description: 'Diseño de interfaces',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 80,
    actualHours: 95,
    startDate: '2026-01-10',
    endDate: '2026-02-28',
    areaId: 'area3',
    leadId: 'u5',
    assignedUsers: ['u5', 'u6'],
  },
  {
    id: 'm6',
    projectId: 'p1',
    name: 'Prototipado',
    description: 'Mockups interactivos',
    progress: 60,
    status: 'in-progress',
    column: 'doing',
    priority: 'medium',
    estimatedHours: 60,
    actualHours: 36,
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    areaId: 'area3',
    leadId: 'u6',
    assignedUsers: ['u5', 'u6'],
  },

  // QA (área4) - 2 módulos
  {
    id: 'm7',
    projectId: 'p1',
    name: 'Testing Funcional',
    description: 'Pruebas de funcionalidades',
    progress: 50,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 100,
    actualHours: 50,
    startDate: '2026-03-15',
    endDate: '2026-05-30',
    areaId: 'area4',
    leadId: 'u7',
    assignedUsers: ['u7', 'u8'],
    dependencies: ['m2', 'm3'],
  },
  {
    id: 'm8',
    projectId: 'p1',
    name: 'Pruebas de Carga',
    description: 'Tests de rendimiento',
    progress: 20,
    status: 'pending',
    column: 'todo',
    priority: 'low',
    estimatedHours: 60,
    actualHours: 12,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    areaId: 'area4',
    leadId: 'u8',
    assignedUsers: ['u7', 'u8'],
    dependencies: ['m7'],
  },
];

// ============================================
// 5. TAREAS (16 tareas - 2 por módulo)
// ============================================

export const tasks: Task[] = [
  // Módulo 1 (Autenticación) - COMPLETADO
  {
    id: 't1',
    moduleId: 'm1',
    name: 'Implementar JWT',
    description: 'Configurar autenticación JWT',
    estimatedHours: 24,
    actualHours: 28,
    assignedTo: ['u1', 'u2'],
    assignedToNames: ['Ana García', 'Carlos Ruiz'],
    status: 'completed',
    priority: 'critical',
    createdAt: '2026-01-15',
    completedAt: '2026-02-05',
    timeEntries: [
      { id: 'te1', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 6, date: '2026-01-18' },
      { id: 'te2', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-01-22' },
      { id: 'te3', taskId: 't1', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-01-25' },
      { id: 'te4', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-01-28' },
      { id: 'te5', taskId: 't1', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-02-01' },
      { id: 'te6', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-02-04' },
    ],
  },
  {
    id: 't2',
    moduleId: 'm1',
    name: '2FA y Seguridad',
    description: 'Autenticación de doble factor',
    estimatedHours: 16,
    actualHours: 20,
    assignedTo: ['u1'],
    assignedToNames: ['Ana García'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-01-20',
    completedAt: '2026-02-10',
    timeEntries: [
      { id: 'te7', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-01-23' },
      { id: 'te8', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 6, date: '2026-01-27' },
      { id: 'te9', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-02-01' },
      { id: 'te10', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-02-08' },
    ],
  },

  // Módulo 2 (Pagos) - EN PROGRESO
  {
    id: 't3',
    moduleId: 'm2',
    name: 'Integración Stripe',
    description: 'SDK y webhooks',
    estimatedHours: 30,
    actualHours: 28,
    assignedTo: ['u1', 'u2'],
    assignedToNames: ['Ana García', 'Carlos Ruiz'],
    status: 'in-progress',
    priority: 'critical',
    createdAt: '2026-03-05',
    timeEntries: [
      { id: 'te11', taskId: 't3', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-03-18' },
      { id: 'te12', taskId: 't3', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-03-19' },
      { id: 'te13', taskId: 't3', userId: 'u2', userName: 'Carlos Ruiz', hours: 3, date: '2026-03-20' },
    ],
  },
  {
    id: 't4',
    moduleId: 'm2',
    name: 'Integración PayPal',
    description: 'API de PayPal',
    estimatedHours: 25,
    actualHours: 20,
    assignedTo: ['u1'],
    assignedToNames: ['Ana García'],
    status: 'pending',
    priority: 'high',
    createdAt: '2026-03-10',
    timeEntries: [
      { id: 'te14', taskId: 't4', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-03-17' },
    ],
  },

  // Módulo 3 (Carrito) - EN PROGRESO
  {
    id: 't5',
    moduleId: 'm3',
    name: 'Lógica de carrito',
    description: 'Añadir, eliminar, modificar',
    estimatedHours: 24,
    actualHours: 22,
    assignedTo: ['u3'],
    assignedToNames: ['Javier López'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-02-20',
    timeEntries: [
      { id: 'te15', taskId: 't5', userId: 'u3', userName: 'Javier López', hours: 5, date: '2026-03-18' },
      { id: 'te16', taskId: 't5', userId: 'u3', userName: 'Javier López', hours: 4, date: '2026-03-19' },
    ],
  },
  {
    id: 't6',
    moduleId: 'm3',
    name: 'UI del carrito',
    description: 'Interfaz de usuario',
    estimatedHours: 20,
    actualHours: 18,
    assignedTo: ['u4'],
    assignedToNames: ['David Rodríguez'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-25',
    completedAt: '2026-03-15',
  },

  // Módulo 5 (Diseño) - COMPLETADO
  {
    id: 't7',
    moduleId: 'm5',
    name: 'Diseño de componentes',
    description: 'Sistema de diseño',
    estimatedHours: 24,
    actualHours: 28,
    assignedTo: ['u5', 'u6'],
    assignedToNames: ['Laura Méndez', 'Carmen López'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-01-15',
    completedAt: '2026-02-10',
  },
  {
    id: 't8',
    moduleId: 'm5',
    name: 'Guías de estilo',
    description: 'Documentación',
    estimatedHours: 16,
    actualHours: 20,
    assignedTo: ['u5'],
    assignedToNames: ['Laura Méndez'],
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-01-20',
    completedAt: '2026-02-15',
  },

  // Módulo 7 (Testing) - EN PROGRESO
  {
    id: 't9',
    moduleId: 'm7',
    name: 'Pruebas de integración',
    description: 'Tests automatizados',
    estimatedHours: 24,
    actualHours: 20,
    assignedTo: ['u7', 'u8'],
    assignedToNames: ['Elena Gómez', 'Patricia Sánchez'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-03-20',
    timeEntries: [
      { id: 'te17', taskId: 't9', userId: 'u7', userName: 'Elena Gómez', hours: 4, date: '2026-03-21' },
      { id: 'te18', taskId: 't9', userId: 'u8', userName: 'Patricia Sánchez', hours: 3, date: '2026-03-22' },
    ],
  },
  {
    id: 't10',
    moduleId: 'm7',
    name: 'Reportes de QA',
    description: 'Documentación de pruebas',
    estimatedHours: 12,
    actualHours: 8,
    assignedTo: ['u7'],
    assignedToNames: ['Elena Gómez'],
    status: 'pending',
    priority: 'low',
    createdAt: '2026-03-25',
  },
];

// ============================================
// 6. PLANNINGS (4 plannings para cruces)
// ============================================

export const plannings: Planning[] = [
  // Planning 1: ANTIGUO (completado) - Solo módulos completados
  {
    id: 'plan-001',
    projectId: 'p1',
    projectName: 'E-commerce Marketplace',
    name: 'Sprint 1-2 - Base',
    weeks: ['2026-01-19', '2026-01-26', '2026-02-02'],
    description: 'Configuración inicial y autenticación',
    modules: [
      {
        id: 'planmod-001',
        moduleId: 'm1',
        moduleName: 'Autenticación',
        projectName: 'E-commerce Marketplace',
        areaName: 'Backend',
        areaColor: '#3b82f6',
        estimatedHours: 120,
        assignedUsers: ['u1', 'u2'],
        taskCount: 2,
        tasks: [
          { id: 'task-plan-1', taskId: 't1', taskName: 'Implementar JWT', estimatedHours: 24, assignedUsers: ['u1', 'u2'] },
          { id: 'task-plan-2', taskId: 't2', taskName: '2FA y Seguridad', estimatedHours: 16, assignedUsers: ['u1'] },
        ],
        status: 'completado',
      },
      {
        id: 'planmod-002',
        moduleId: 'm5',
        moduleName: 'Diseño UI',
        projectName: 'E-commerce Marketplace',
        areaName: 'Diseño UX/UI',
        areaColor: '#f59e0b',
        estimatedHours: 80,
        assignedUsers: ['u5', 'u6'],
        taskCount: 2,
        tasks: [
          { id: 'task-plan-3', taskId: 't7', taskName: 'Diseño de componentes', estimatedHours: 24, assignedUsers: ['u5', 'u6'] },
          { id: 'task-plan-4', taskId: 't8', taskName: 'Guías de estilo', estimatedHours: 16, assignedUsers: ['u5'] },
        ],
        status: 'completado',
      },
    ],
    createdAt: new Date('2026-01-10'),
    status: 'completado',
  },

  // Planning 2: EN MARCHA (esta semana) - Módulos en progreso
  {
    id: 'plan-002',
    projectId: 'p1',
    projectName: 'E-commerce Marketplace',
    name: 'Sprint 3-4 - Core',
    weeks: ['2026-03-16', '2026-03-23'], // Esta semana
    description: 'Pagos y carrito de compras',
    modules: [
      {
        id: 'planmod-003',
        moduleId: 'm2',
        moduleName: 'Pasarela de Pagos',
        projectName: 'E-commerce Marketplace',
        areaName: 'Backend',
        areaColor: '#3b82f6',
        estimatedHours: 180,
        assignedUsers: ['u1', 'u2'],
        taskCount: 2,
        tasks: [
          { id: 'task-plan-5', taskId: 't3', taskName: 'Integración Stripe', estimatedHours: 30, assignedUsers: ['u1', 'u2'] },
          { id: 'task-plan-6', taskId: 't4', taskName: 'Integración PayPal', estimatedHours: 25, assignedUsers: ['u1'] },
        ],
        status: 'en progreso',
      },
      {
        id: 'planmod-004',
        moduleId: 'm3',
        moduleName: 'Carrito de Compras',
        projectName: 'E-commerce Marketplace',
        areaName: 'Frontend',
        areaColor: '#10b981',
        estimatedHours: 140,
        assignedUsers: ['u3', 'u4'],
        taskCount: 2,
        tasks: [
          { id: 'task-plan-7', taskId: 't5', taskName: 'Lógica de carrito', estimatedHours: 24, assignedUsers: ['u3'] },
          { id: 'task-plan-8', taskId: 't6', taskName: 'UI del carrito', estimatedHours: 20, assignedUsers: ['u4'] },
        ],
        status: 'en progreso',
      },
    ],
    createdAt: new Date('2026-03-10'),
    status: 'en progreso',
  },

  // Planning 3: PRÓXIMO (semana que viene) - Módulos pendientes
  {
    id: 'plan-003',
    projectId: 'p1',
    projectName: 'E-commerce Marketplace',
    name: 'Sprint 5 - Testing',
    weeks: ['2026-03-30', '2026-04-06'], // Próxima semana
    description: 'Pruebas funcionales',
    modules: [
      {
        id: 'planmod-005',
        moduleId: 'm7',
        moduleName: 'Testing Funcional',
        projectName: 'E-commerce Marketplace',
        areaName: 'QA',
        areaColor: '#8b5cf6',
        estimatedHours: 100,
        assignedUsers: ['u7', 'u8'],
        taskCount: 2,
        tasks: [
          { id: 'task-plan-9', taskId: 't9', taskName: 'Pruebas de integración', estimatedHours: 24, assignedUsers: ['u7', 'u8'] },
          { id: 'task-plan-10', taskId: 't10', taskName: 'Reportes de QA', estimatedHours: 12, assignedUsers: ['u7'] },
        ],
        status: 'pendiente',
      },
    ],
    createdAt: new Date('2026-03-22'),
    status: 'planificado',
  },

  // Planning 4: FUTURO (en 3 semanas) - Dashboard y prototipado
  {
    id: 'plan-004',
    projectId: 'p1',
    projectName: 'E-commerce Marketplace',
    name: 'Sprint 6 - Dashboard',
    weeks: ['2026-04-13', '2026-04-20'], // En 3 semanas
    description: 'Dashboard y prototipado',
    modules: [
      {
        id: 'planmod-006',
        moduleId: 'm4',
        moduleName: 'Dashboard',
        projectName: 'E-commerce Marketplace',
        areaName: 'Frontend',
        areaColor: '#10b981',
        estimatedHours: 160,
        assignedUsers: ['u3', 'u4'],
        taskCount: 1,
        tasks: [],
        status: 'pendiente',
      },
      {
        id: 'planmod-007',
        moduleId: 'm6',
        moduleName: 'Prototipado',
        projectName: 'E-commerce Marketplace',
        areaName: 'Diseño UX/UI',
        areaColor: '#f59e0b',
        estimatedHours: 60,
        assignedUsers: ['u5', 'u6'],
        taskCount: 1,
        tasks: [],
        status: 'pendiente',
      },
    ],
    createdAt: new Date('2026-03-25'),
    status: 'planificado',
  },
];

// ============================================
// 7. TIME ENTRIES (para cruces de horas)
// ============================================

export const timeEntries: TimeEntry[] = [
  // Time entries de la semana actual (para planning en marcha)
  { id: 'te101', taskId: 't3', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-03-18' },
  { id: 'te102', taskId: 't3', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-03-19' },
  { id: 'te103', taskId: 't3', userId: 'u2', userName: 'Carlos Ruiz', hours: 3, date: '2026-03-20' },
  { id: 'te104', taskId: 't4', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-03-17' },
  { id: 'te105', taskId: 't5', userId: 'u3', userName: 'Javier López', hours: 5, date: '2026-03-18' },
  { id: 'te106', taskId: 't5', userId: 'u3', userName: 'Javier López', hours: 4, date: '2026-03-19' },
  { id: 'te107', taskId: 't9', userId: 'u7', userName: 'Elena Gómez', hours: 4, date: '2026-03-21' },
  { id: 'te108', taskId: 't9', userId: 'u8', userName: 'Patricia Sánchez', hours: 3, date: '2026-03-22' },
];

// ============================================
// EXPORTACIÓN UNIFICADA
// ============================================

export default {
  companies,
  areas,
  users,
  projects,
  modules,
  tasks,
  plannings,
  timeEntries,
};