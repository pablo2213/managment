// ============================================
// INTERFACES
// ============================================

export interface Company {
  id: string;
  name: string;
  description: string;
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
  assignedTeam?: string;
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
  estimatedHours: number;
  actualHours: number;
  assignedTo?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  completedAt?: string;
  timeEntries?: TimeEntry[];
  subtasks?: Subtask[];
}

// ============================================
// EMPRESA ÚNICA
// ============================================

export const companies: Company[] = [
  {
    id: 'c1',
    name: 'TechCorp Solutions',
    description: 'Empresa de desarrollo de software y consultoría tecnológica',
  },
];

// ============================================
// PROYECTO ÚNICO - PLATAFORMA E-COMMERCE ENTERPRISE (2026)
// ============================================

export const projects: Project[] = [
  {
    id: 'p1',
    companyId: 'c1',
    name: 'E-commerce Platform Enterprise',
    description: 'Plataforma completa de comercio electrónico con microservicios, dashboard administrativo, app móvil y sistema de recomendaciones',
    progress: 58,
    status: 'active',
    startDate: '2026-01-15',
    endDate: '2026-12-20',
    priority: 'critical',
    category: 'development',
    estimatedHours: 3200,
  },
];

// ============================================
// MÓDULOS - 18 MÓDULOS CON CASOS REALISTAS
// ============================================

export const modules: Module[] = [
  // ============================================
  // MÓDULOS COMPLETADOS (6)
  // ============================================
  {
    id: 'm1',
    projectId: 'p1',
    name: 'Autenticación y Seguridad',
    description: 'Sistema completo de autenticación, autorización, JWT, 2FA, y gestión de sesiones',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'critical',
    estimatedHours: 180,
    actualHours: 195,
    startDate: '2026-01-15',
    endDate: '2026-03-10',
    assignedTeam: 'Backend Security',
  },
  {
    id: 'm2',
    projectId: 'p1',
    name: 'Gestión de Usuarios y Perfiles',
    description: 'Registro, perfiles, roles, preferencias, historial de actividad',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 120,
    actualHours: 135,
    startDate: '2026-02-01',
    endDate: '2026-04-05',
    assignedTeam: 'Backend',
    dependencies: ['m1'],
  },
  {
    id: 'm3',
    projectId: 'p1',
    name: 'Catálogo de Productos',
    description: 'CRUD de productos, categorías, marcas, atributos, variantes, inventario',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 200,
    actualHours: 215,
    startDate: '2026-02-15',
    endDate: '2026-05-20',
    assignedTeam: 'Backend',
    dependencies: ['m2'],
  },
  {
    id: 'm4',
    projectId: 'p1',
    name: 'Búsqueda y Filtros Avanzados',
    description: 'Elasticsearch, búsqueda por texto, filtros dinámicos, autocompletado',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 140,
    actualHours: 160,
    startDate: '2026-03-01',
    endDate: '2026-06-15',
    assignedTeam: 'Backend',
    dependencies: ['m3'],
  },
  {
    id: 'm5',
    projectId: 'p1',
    name: 'Carrito de Compras',
    description: 'Carrito persistente, múltiples items, cálculos, cupones, lista de deseos',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 130,
    actualHours: 145,
    startDate: '2026-03-15',
    endDate: '2026-07-10',
    assignedTeam: 'Frontend',
    dependencies: ['m3', 'm4'],
  },
  {
    id: 'm6',
    projectId: 'p1',
    name: 'Procesador de Pagos',
    description: 'Integración con Stripe, PayPal, MercadoPago, webhooks, facturación',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'critical',
    estimatedHours: 200,
    actualHours: 235,
    startDate: '2026-04-01',
    endDate: '2026-08-15',
    assignedTeam: 'Backend Payments',
    dependencies: ['m5'],
  },

  // ============================================
  // MÓDULOS EN PROGRESO (7) - CON DIFERENTES AVANCES
  // ============================================
  {
    id: 'm7',
    projectId: 'p1',
    name: 'Gestión de Pedidos',
    description: 'Creación de pedidos, estados, historial, notificaciones, tracking',
    progress: 75,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 160,
    actualHours: 120,
    startDate: '2026-05-01',
    endDate: '2026-09-30',
    assignedTeam: 'Backend',
    dependencies: ['m6'],
  },
  {
    id: 'm8',
    projectId: 'p1',
    name: 'Panel de Administración',
    description: 'Dashboard admin, gestión de productos, pedidos, usuarios, reportes',
    progress: 60,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 220,
    actualHours: 132,
    startDate: '2026-05-15',
    endDate: '2026-10-30',
    assignedTeam: 'Frontend',
    dependencies: ['m7'],
  },
  {
    id: 'm9',
    projectId: 'p1',
    name: 'Sistema de Envíos',
    description: 'Integración con correos, cálculo de tarifas, etiquetas, tracking',
    progress: 45,
    status: 'in-progress',
    column: 'doing',
    priority: 'medium',
    estimatedHours: 120,
    actualHours: 54,
    startDate: '2026-06-01',
    endDate: '2026-10-15',
    assignedTeam: 'Backend',
    dependencies: ['m7'],
  },
  {
    id: 'm10',
    projectId: 'p1',
    name: 'Reseñas y Valoraciones',
    description: 'Sistema de reseñas, calificaciones, moderación, fotos de clientes',
    progress: 40,
    status: 'in-progress',
    column: 'doing',
    priority: 'medium',
    estimatedHours: 90,
    actualHours: 36,
    startDate: '2026-06-15',
    endDate: '2026-10-01',
    assignedTeam: 'Fullstack',
    dependencies: ['m3'],
  },
  {
    id: 'm11',
    projectId: 'p1',
    name: 'Programa de Fidelización',
    description: 'Puntos, recompensas, niveles, beneficios para clientes frecuentes',
    progress: 30,
    status: 'in-progress',
    column: 'doing',
    priority: 'low',
    estimatedHours: 100,
    actualHours: 30,
    startDate: '2026-07-01',
    endDate: '2026-11-15',
    assignedTeam: 'Backend',
    dependencies: ['m2'],
  },
  {
    id: 'm12',
    projectId: 'p1',
    name: 'Sistema de Recomendaciones',
    description: 'Algoritmos de recomendación basados en historial y preferencias',
    progress: 25,
    status: 'in-progress',
    column: 'doing',
    priority: 'medium',
    estimatedHours: 150,
    actualHours: 38,
    startDate: '2026-07-15',
    endDate: '2026-11-30',
    assignedTeam: 'Data Science',
    dependencies: ['m4', 'm10'],
  },
  {
    id: 'm13',
    projectId: 'p1',
    name: 'App Móvil React Native',
    description: 'Aplicación móvil para iOS y Android con funcionalidades principales',
    progress: 15,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 300,
    actualHours: 45,
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    assignedTeam: 'Mobile',
    dependencies: ['m5', 'm6', 'm7'],
  },

  // ============================================
  // MÓDULOS PENDIENTES (4)
  // ============================================
  {
    id: 'm14',
    projectId: 'p1',
    name: 'API Pública para Terceros',
    description: 'API REST documentada, rate limiting, autenticación para desarrolladores',
    progress: 10,
    status: 'pending',
    column: 'todo',
    priority: 'medium',
    estimatedHours: 140,
    actualHours: 14,
    startDate: '2026-08-15',
    endDate: '2026-11-15',
    assignedTeam: 'Backend',
    dependencies: ['m1', 'm3', 'm7'],
  },
  {
    id: 'm15',
    projectId: 'p1',
    name: 'Integración con ERP',
    description: 'Conexión con sistemas ERP de clientes',
    progress: 5,
    status: 'pending',
    column: 'todo',
    priority: 'low',
    estimatedHours: 180,
    actualHours: 9,
    startDate: '2026-09-01',
    endDate: '2026-12-01',
    assignedTeam: 'Integrations',
    dependencies: ['m7', 'm8'],
  },
  {
    id: 'm16',
    projectId: 'p1',
    name: 'Marketplace Multivendedor',
    description: 'Soporte para múltiples vendedores en la plataforma',
    progress: 0,
    status: 'pending',
    column: 'todo',
    priority: 'medium',
    estimatedHours: 250,
    actualHours: 0,
    startDate: '2026-09-15',
    endDate: '2026-12-20',
    assignedTeam: 'Backend',
    dependencies: ['m3', 'm7', 'm8'],
  },

  // ============================================
  // MÓDULOS BLOQUEADOS (1)
  // ============================================
  {
    id: 'm17',
    projectId: 'p1',
    name: 'Migración a Microservicios',
    description: 'Refactorización de monolitos a microservicios, Kubernetes, escalado',
    progress: 5,
    status: 'blocked',
    column: 'blocked',
    priority: 'critical',
    estimatedHours: 200,
    actualHours: 10,
    startDate: '2026-09-01',
    endDate: '2026-12-20',
    assignedTeam: 'DevOps',
    dependencies: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
  },

  // ============================================
  // MÓDULOS EN ESPERA (1)
  // ============================================
  {
    id: 'm18',
    projectId: 'p1',
    name: 'Internacionalización',
    description: 'Soporte multi-idioma y multi-moneda',
    progress: 0,
    status: 'on-hold',
    column: 'todo',
    priority: 'low',
    estimatedHours: 150,
    actualHours: 0,
    startDate: '2026-10-01',
    endDate: '2026-12-20',
    assignedTeam: 'Frontend',
    dependencies: ['m3', 'm5', 'm8'],
  },
];

// ============================================
// TAREAS - 45 TAREAS CON DIFERENTES ESTADOS
// ============================================

export const tasks: Task[] = [
  // ============================================
  // MÓDULO 1: Autenticación (COMPLETADO) - 6 tareas
  // ============================================
  {
    id: 't1',
    moduleId: 'm1',
    name: 'Implementar JWT y refresh tokens',
    estimatedHours: 24,
    actualHours: 28,
    assignedTo: 'Ana García',
    status: 'completed',
    priority: 'critical',
    createdAt: '2026-01-15',
    completedAt: '2026-02-05',
    timeEntries: [
      { id: 'te1', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 6, date: '2026-01-18', description: 'Configuración de JWT' },
      { id: 'te2', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-01-22', description: 'Implementación de tokens' },
      { id: 'te3', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-01-25', description: 'Refresh tokens' },
      { id: 'te4', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-01-28', description: 'Blacklist de tokens' },
      { id: 'te5', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-02-01', description: 'Tests de seguridad' },
      { id: 'te6', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-02-04', description: 'Documentación' },
    ],
  },
  {
    id: 't2',
    moduleId: 'm1',
    name: 'Autenticación de dos factores (2FA)',
    estimatedHours: 16,
    actualHours: 20,
    assignedTo: 'Ana García',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-01-20',
    completedAt: '2026-02-15',
    timeEntries: [
      { id: 'te7', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-01-23', description: 'Investigación' },
      { id: 'te8', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 6, date: '2026-01-27', description: 'Implementación TOTP' },
      { id: 'te9', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-02-01', description: 'Backup codes' },
      { id: 'te10', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-02-10', description: 'UI para 2FA' },
    ],
  },
  {
    id: 't3',
    moduleId: 'm1',
    name: 'Rate limiting y protección DDoS',
    estimatedHours: 12,
    actualHours: 14,
    assignedTo: 'Carlos Ruiz',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-01-25',
    completedAt: '2026-02-18',
    timeEntries: [
      { id: 'te11', taskId: 't3', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-01-28', description: 'Configuración' },
      { id: 'te12', taskId: 't3', userId: 'u2', userName: 'Carlos Ruiz', hours: 5, date: '2026-02-01', description: 'Implementación por IP' },
      { id: 'te13', taskId: 't3', userId: 'u2', userName: 'Carlos Ruiz', hours: 3, date: '2026-02-08', description: 'Por usuario' },
      { id: 'te14', taskId: 't3', userId: 'u2', userName: 'Carlos Ruiz', hours: 2, date: '2026-02-15', description: 'Tests' },
    ],
  },
  {
    id: 't4',
    moduleId: 'm1',
    name: 'OAuth2 con Google y Facebook',
    estimatedHours: 20,
    actualHours: 22,
    assignedTo: 'Ana García',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-01',
    completedAt: '2026-02-28',
    timeEntries: [
      { id: 'te15', taskId: 't4', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-02-05', description: 'Configuración Google' },
      { id: 'te16', taskId: 't4', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-02-10', description: 'Configuración Facebook' },
      { id: 'te17', taskId: 't4', userId: 'u1', userName: 'Ana García', hours: 6, date: '2026-02-15', description: 'Flujo OAuth' },
      { id: 'te18', taskId: 't4', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-02-20', description: 'Manejo usuarios' },
      { id: 'te19', taskId: 't4', userId: 'u1', userName: 'Ana García', hours: 3, date: '2026-02-25', description: 'Tests' },
    ],
  },
  {
    id: 't5',
    moduleId: 'm1',
    name: 'Logs de seguridad y auditoría',
    estimatedHours: 10,
    actualHours: 12,
    assignedTo: 'Carlos Ruiz',
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-02-10',
    completedAt: '2026-03-05',
    timeEntries: [
      { id: 'te20', taskId: 't5', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-02-15', description: 'Diseño' },
      { id: 'te21', taskId: 't5', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-02-20', description: 'Implementación' },
      { id: 'te22', taskId: 't5', userId: 'u2', userName: 'Carlos Ruiz', hours: 2, date: '2026-02-25', description: 'Dashboard' },
      { id: 'te23', taskId: 't5', userId: 'u2', userName: 'Carlos Ruiz', hours: 2, date: '2026-03-02', description: 'Pruebas' },
    ],
  },
  {
    id: 't6',
    moduleId: 'm1',
    name: 'Políticas de contraseñas y recuperación',
    estimatedHours: 8,
    actualHours: 9,
    assignedTo: 'Ana García',
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-02-15',
    completedAt: '2026-03-08',
    timeEntries: [
      { id: 'te24', taskId: 't6', userId: 'u1', userName: 'Ana García', hours: 3, date: '2026-02-20', description: 'Políticas' },
      { id: 'te25', taskId: 't6', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-02-25', description: 'Recuperación' },
      { id: 'te26', taskId: 't6', userId: 'u1', userName: 'Ana García', hours: 2, date: '2026-03-04', description: 'Pruebas' },
    ],
  },

  // ============================================
  // MÓDULO 2: Gestión de Usuarios (COMPLETADO) - 4 tareas
  // ============================================
  {
    id: 't7',
    moduleId: 'm2',
    name: 'Modelo de usuarios y perfiles',
    estimatedHours: 14,
    actualHours: 16,
    assignedTo: 'Carlos Ruiz',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-01',
    completedAt: '2026-02-25',
    timeEntries: [
      { id: 'te27', taskId: 't7', userId: 'u2', userName: 'Carlos Ruiz', hours: 5, date: '2026-02-05', description: 'Diseño' },
      { id: 'te28', taskId: 't7', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-02-10', description: 'Tablas' },
      { id: 'te29', taskId: 't7', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-02-15', description: 'Relaciones' },
      { id: 'te30', taskId: 't7', userId: 'u2', userName: 'Carlos Ruiz', hours: 3, date: '2026-02-20', description: 'Índices' },
    ],
  },
  {
    id: 't8',
    moduleId: 'm2',
    name: 'CRUD de usuarios',
    estimatedHours: 18,
    actualHours: 20,
    assignedTo: 'Carlos Ruiz',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-10',
    completedAt: '2026-03-10',
    timeEntries: [
      { id: 'te31', taskId: 't8', userId: 'u2', userName: 'Carlos Ruiz', hours: 5, date: '2026-02-15', description: 'GET' },
      { id: 'te32', taskId: 't8', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-02-20', description: 'POST' },
      { id: 'te33', taskId: 't8', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-02-25', description: 'PUT' },
      { id: 'te34', taskId: 't8', userId: 'u2', userName: 'Carlos Ruiz', hours: 3, date: '2026-03-01', description: 'DELETE' },
      { id: 'te35', taskId: 't8', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-03-05', description: 'Validaciones' },
    ],
  },
  {
    id: 't9',
    moduleId: 'm2',
    name: 'Roles y permisos',
    estimatedHours: 16,
    actualHours: 18,
    assignedTo: 'Ana García',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-20',
    completedAt: '2026-03-18',
    timeEntries: [
      { id: 'te36', taskId: 't9', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-02-25', description: 'Modelo' },
      { id: 'te37', taskId: 't9', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-03-01', description: 'Asignación' },
      { id: 'te38', taskId: 't9', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-03-05', description: 'Middleware' },
      { id: 'te39', taskId: 't9', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-03-12', description: 'Pruebas' },
    ],
  },
  {
    id: 't10',
    moduleId: 'm2',
    name: 'Preferencias de usuario',
    estimatedHours: 10,
    actualHours: 9,
    assignedTo: 'Laura Méndez',
    status: 'completed',
    priority: 'low',
    createdAt: '2026-03-01',
    completedAt: '2026-03-22',
    timeEntries: [
      { id: 'te40', taskId: 't10', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-03-05', description: 'Modelo' },
      { id: 'te41', taskId: 't10', userId: 'u3', userName: 'Laura Méndez', hours: 3, date: '2026-03-10', description: 'API' },
      { id: 'te42', taskId: 't10', userId: 'u3', userName: 'Laura Méndez', hours: 2, date: '2026-03-18', description: 'Pruebas' },
    ],
  },

  // ============================================
  // MÓDULO 3: Catálogo de Productos (COMPLETADO) - 5 tareas
  // ============================================
  {
    id: 't11',
    moduleId: 'm3',
    name: 'Modelo de datos de productos',
    estimatedHours: 16,
    actualHours: 18,
    assignedTo: 'Carlos Ruiz',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-15',
    completedAt: '2026-03-10',
    timeEntries: [
      { id: 'te43', taskId: 't11', userId: 'u2', userName: 'Carlos Ruiz', hours: 5, date: '2026-02-18', description: 'Diseño' },
      { id: 'te44', taskId: 't11', userId: 'u2', userName: 'Carlos Ruiz', hours: 5, date: '2026-02-22', description: 'Tablas' },
      { id: 'te45', taskId: 't11', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-02-26', description: 'Relaciones' },
      { id: 'te46', taskId: 't11', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-03-03', description: 'Índices' },
    ],
  },
  {
    id: 't12',
    moduleId: 'm3',
    name: 'CRUD de productos',
    estimatedHours: 24,
    actualHours: 28,
    assignedTo: 'Carlos Ruiz',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-20',
    completedAt: '2026-03-25',
    timeEntries: [
      { id: 'te47', taskId: 't12', userId: 'u2', userName: 'Carlos Ruiz', hours: 6, date: '2026-02-23', description: 'GET' },
      { id: 'te48', taskId: 't12', userId: 'u2', userName: 'Carlos Ruiz', hours: 5, date: '2026-02-27', description: 'POST' },
      { id: 'te49', taskId: 't12', userId: 'u2', userName: 'Carlos Ruiz', hours: 5, date: '2026-03-03', description: 'PUT' },
      { id: 'te50', taskId: 't12', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-03-08', description: 'DELETE' },
      { id: 'te51', taskId: 't12', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-03-15', description: 'Validaciones' },
      { id: 'te52', taskId: 't12', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-03-20', description: 'Tests' },
    ],
  },
  {
    id: 't13',
    moduleId: 'm3',
    name: 'Categorías y atributos',
    estimatedHours: 16,
    actualHours: 14,
    assignedTo: 'Laura Méndez',
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-03-01',
    completedAt: '2026-03-30',
    timeEntries: [
      { id: 'te53', taskId: 't13', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-03-05', description: 'Categorías' },
      { id: 'te54', taskId: 't13', userId: 'u3', userName: 'Laura Méndez', hours: 5, date: '2026-03-10', description: 'Atributos' },
      { id: 'te55', taskId: 't13', userId: 'u3', userName: 'Laura Méndez', hours: 3, date: '2026-03-18', description: 'Relaciones' },
      { id: 'te56', taskId: 't13', userId: 'u3', userName: 'Laura Méndez', hours: 2, date: '2026-03-25', description: 'Pruebas' },
    ],
  },
  {
    id: 't14',
    moduleId: 'm3',
    name: 'Gestión de inventario',
    estimatedHours: 20,
    actualHours: 22,
    assignedTo: 'Carlos Ruiz',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-03-10',
    completedAt: '2026-04-20',
    timeEntries: [
      { id: 'te57', taskId: 't14', userId: 'u2', userName: 'Carlos Ruiz', hours: 5, date: '2026-03-15', description: 'Modelo stock' },
      { id: 'te58', taskId: 't14', userId: 'u2', userName: 'Carlos Ruiz', hours: 6, date: '2026-03-20', description: 'Actualización' },
      { id: 'te59', taskId: 't14', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-03-25', description: 'Alertas' },
      { id: 'te60', taskId: 't14', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-04-01', description: 'Historial' },
      { id: 'te61', taskId: 't14', userId: 'u2', userName: 'Carlos Ruiz', hours: 3, date: '2026-04-10', description: 'Tests' },
    ],
  },
  {
    id: 't15',
    moduleId: 'm3',
    name: 'Importación/exportación de productos',
    estimatedHours: 12,
    actualHours: 15,
    assignedTo: 'Laura Méndez',
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-03-20',
    completedAt: '2026-04-25',
    timeEntries: [
      { id: 'te62', taskId: 't15', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-03-25', description: 'Export CSV' },
      { id: 'te63', taskId: 't15', userId: 'u3', userName: 'Laura Méndez', hours: 5, date: '2026-03-30', description: 'Import CSV' },
      { id: 'te64', taskId: 't15', userId: 'u3', userName: 'Laura Méndez', hours: 3, date: '2026-04-05', description: 'Validaciones' },
      { id: 'te65', taskId: 't15', userId: 'u3', userName: 'Laura Méndez', hours: 3, date: '2026-04-15', description: 'Errores' },
    ],
  },

  // ============================================
  // MÓDULO 7: Gestión de Pedidos (EN PROGRESO) - 4 tareas
  // ============================================
  {
    id: 't28',
    moduleId: 'm7',
    name: 'Modelo de pedidos',
    estimatedHours: 14,
    actualHours: 12,
    assignedTo: 'Carlos Ruiz',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-05-01',
    completedAt: '2026-05-20',
    timeEntries: [
      { id: 'te118', taskId: 't28', userId: 'u2', userName: 'Carlos Ruiz', hours: 5, date: '2026-05-05', description: 'Diseño' },
      { id: 'te119', taskId: 't28', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-05-10', description: 'Tablas' },
      { id: 'te120', taskId: 't28', userId: 'u2', userName: 'Carlos Ruiz', hours: 3, date: '2026-05-15', description: 'Relaciones' },
    ],
  },
  {
    id: 't29',
    moduleId: 'm7',
    name: 'Flujo de creación de pedidos',
    estimatedHours: 20,
    actualHours: 16,
    assignedTo: 'Laura Méndez',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-05-10',
    timeEntries: [
      { id: 'te121', taskId: 't29', userId: 'u3', userName: 'Laura Méndez', hours: 5, date: '2026-05-12', description: 'Checkout' },
      { id: 'te122', taskId: 't29', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-05-15', description: 'Validación' },
      { id: 'te123', taskId: 't29', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-05-18', description: 'Confirmación' },
      { id: 'te124', taskId: 't29', userId: 'u3', userName: 'Laura Méndez', hours: 3, date: '2026-05-22', description: 'Errores' },
    ],
  },
  {
    id: 't30',
    moduleId: 'm7',
    name: 'Estados y tracking',
    estimatedHours: 16,
    actualHours: 12,
    assignedTo: 'Carlos Ruiz',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-05-15',
    timeEntries: [
      { id: 'te125', taskId: 't30', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-05-18', description: 'Estados' },
      { id: 'te126', taskId: 't30', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-05-22', description: 'Notificaciones' },
      { id: 'te127', taskId: 't30', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-05-25', description: 'Historial' },
    ],
  },
  {
    id: 't31',
    moduleId: 'm7',
    name: 'Panel de pedidos para admin',
    estimatedHours: 18,
    actualHours: 10,
    assignedTo: 'Laura Méndez',
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-05-20',
    timeEntries: [
      { id: 'te128', taskId: 't31', userId: 'u3', userName: 'Laura Méndez', hours: 5, date: '2026-05-23', description: 'Listado' },
      { id: 'te129', taskId: 't31', userId: 'u3', userName: 'Laura Méndez', hours: 5, date: '2026-05-27', description: 'Filtros' },
    ],
  },

  // ============================================
  // MÓDULO 8: Panel de Administración (EN PROGRESO) - 4 tareas
  // ============================================
  {
    id: 't32',
    moduleId: 'm8',
    name: 'Dashboard principal',
    estimatedHours: 20,
    actualHours: 15,
    assignedTo: 'Laura Méndez',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-05-15',
    timeEntries: [
      { id: 'te130', taskId: 't32', userId: 'u3', userName: 'Laura Méndez', hours: 5, date: '2026-05-18', description: 'Maquetación' },
      { id: 'te131', taskId: 't32', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-05-22', description: 'Componentes' },
      { id: 'te132', taskId: 't32', userId: 'u3', userName: 'Laura Méndez', hours: 3, date: '2026-05-25', description: 'API' },
      { id: 'te133', taskId: 't32', userId: 'u3', userName: 'Laura Méndez', hours: 3, date: '2026-05-28', description: 'Datos' },
    ],
  },
  {
    id: 't33',
    moduleId: 'm8',
    name: 'Gestión de productos en admin',
    estimatedHours: 18,
    actualHours: 14,
    assignedTo: 'Carlos Ruiz',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-05-20',
    timeEntries: [
      { id: 'te134', taskId: 't33', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-05-22', description: 'Listado' },
      { id: 'te135', taskId: 't33', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-05-25', description: 'Formulario' },
      { id: 'te136', taskId: 't33', userId: 'u2', userName: 'Carlos Ruiz', hours: 3, date: '2026-05-28', description: 'Validaciones' },
      { id: 'te137', taskId: 't33', userId: 'u2', userName: 'Carlos Ruiz', hours: 3, date: '2026-05-30', description: 'API' },
    ],
  },
  {
    id: 't34',
    moduleId: 'm8',
    name: 'Gestión de usuarios en admin',
    estimatedHours: 16,
    actualHours: 12,
    assignedTo: 'Laura Méndez',
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-06-01',
    timeEntries: [
      { id: 'te138', taskId: 't34', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-06-03', description: 'Listado' },
      { id: 'te139', taskId: 't34', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-06-06', description: 'Edición' },
      { id: 'te140', taskId: 't34', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-06-09', description: 'Roles' },
    ],
  },
  {
    id: 't35',
    moduleId: 'm8',
    name: 'Reportes y estadísticas',
    estimatedHours: 20,
    actualHours: 8,
    assignedTo: 'Elena Gómez',
    status: 'pending',
    priority: 'low',
    createdAt: '2026-06-05',
    timeEntries: [
      { id: 'te141', taskId: 't35', userId: 'u4', userName: 'Elena Gómez', hours: 4, date: '2026-06-08', description: 'Diseño' },
      { id: 'te142', taskId: 't35', userId: 'u4', userName: 'Elena Gómez', hours: 4, date: '2026-06-12', description: 'Implementación' },
    ],
  },

  // ============================================
  // MÓDULO 9: Sistema de Envíos (EN PROGRESO) - 3 tareas
  // ============================================
  {
    id: 't36',
    moduleId: 'm9',
    name: 'Integración con Correos API',
    estimatedHours: 20,
    actualHours: 12,
    assignedTo: 'Carlos Ruiz',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-06-01',
    timeEntries: [
      { id: 'te143', taskId: 't36', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-06-04', description: 'Investigación' },
      { id: 'te144', taskId: 't36', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-06-08', description: 'Configuración' },
      { id: 'te145', taskId: 't36', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-06-12', description: 'Implementación' },
    ],
  },
  {
    id: 't37',
    moduleId: 'm9',
    name: 'Cálculo de tarifas',
    estimatedHours: 16,
    actualHours: 8,
    assignedTo: 'Laura Méndez',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-06-10',
    timeEntries: [
      { id: 'te146', taskId: 't37', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-06-12', description: 'Lógica' },
      { id: 'te147', taskId: 't37', userId: 'u3', userName: 'Laura Méndez', hours: 4, date: '2026-06-15', description: 'Implementación' },
    ],
  },
  {
    id: 't38',
    moduleId: 'm9',
    name: 'Generación de etiquetas',
    estimatedHours: 12,
    actualHours: 4,
    assignedTo: 'Carlos Ruiz',
    status: 'pending',
    priority: 'low',
    createdAt: '2026-06-15',
    timeEntries: [
      { id: 'te148', taskId: 't38', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-06-18', description: 'Inicio' },
    ],
  },

  // ============================================
  // MÓDULO 13: App Móvil (EN PROGRESO) - 4 tareas
  // ============================================
  {
    id: 't39',
    moduleId: 'm13',
    name: 'Configuración del proyecto React Native',
    estimatedHours: 12,
    actualHours: 8,
    assignedTo: 'Javier López',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-08-01',
    completedAt: '2026-08-10',
    timeEntries: [
      { id: 'te149', taskId: 't39', userId: 'u6', userName: 'Javier López', hours: 4, date: '2026-08-03', description: 'Setup' },
      { id: 'te150', taskId: 't39', userId: 'u6', userName: 'Javier López', hours: 4, date: '2026-08-06', description: 'Navegación' },
    ],
  },
  {
    id: 't40',
    moduleId: 'm13',
    name: 'Pantalla de productos',
    estimatedHours: 24,
    actualHours: 18,
    assignedTo: 'Javier López',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-08-05',
    timeEntries: [
      { id: 'te151', taskId: 't40', userId: 'u6', userName: 'Javier López', hours: 5, date: '2026-08-08', description: 'Lista' },
      { id: 'te152', taskId: 't40', userId: 'u6', userName: 'Javier López', hours: 5, date: '2026-08-12', description: 'Detalle' },
      { id: 'te153', taskId: 't40', userId: 'u6', userName: 'Javier López', hours: 4, date: '2026-08-15', description: 'Filtros' },
      { id: 'te154', taskId: 't40', userId: 'u6', userName: 'Javier López', hours: 4, date: '2026-08-18', description: 'API' },
    ],
  },
  {
    id: 't41',
    moduleId: 'm13',
    name: 'Pantalla de carrito',
    estimatedHours: 18,
    actualHours: 6,
    assignedTo: 'Javier López',
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-08-15',
    timeEntries: [
      { id: 'te155', taskId: 't41', userId: 'u6', userName: 'Javier López', hours: 3, date: '2026-08-18', description: 'Diseño' },
      { id: 'te156', taskId: 't41', userId: 'u6', userName: 'Javier López', hours: 3, date: '2026-08-21', description: 'Implementación' },
    ],
  },
  {
    id: 't42',
    moduleId: 'm13',
    name: 'Autenticación en app',
    estimatedHours: 16,
    actualHours: 0,
    assignedTo: 'Javier López',
    status: 'pending',
    priority: 'high',
    createdAt: '2026-08-20',
    timeEntries: [],
  },

  // ============================================
  // MÓDULO 17: Migración a Microservicios (BLOQUEADO) - 3 tareas
  // ============================================
  {
    id: 't43',
    moduleId: 'm17',
    name: 'Análisis de arquitectura actual',
    estimatedHours: 20,
    actualHours: 10,
    assignedTo: 'Miguel Torres',
    status: 'blocked',
    priority: 'critical',
    createdAt: '2026-09-01',
    timeEntries: [
      { id: 'te157', taskId: 't43', userId: 'u5', userName: 'Miguel Torres', hours: 5, date: '2026-09-03', description: 'Revisión' },
      { id: 'te158', taskId: 't43', userId: 'u5', userName: 'Miguel Torres', hours: 5, date: '2026-09-06', description: 'Documentación' },
    ],
  },
  {
    id: 't44',
    moduleId: 'm17',
    name: 'Diseño de microservicios',
    estimatedHours: 30,
    actualHours: 0,
    assignedTo: 'Miguel Torres',
    status: 'blocked',
    priority: 'high',
    createdAt: '2026-09-10',
    timeEntries: [],
  },
  {
    id: 't45',
    moduleId: 'm17',
    name: 'Configuración de Kubernetes',
    estimatedHours: 25,
    actualHours: 0,
    assignedTo: 'Miguel Torres',
    status: 'blocked',
    priority: 'high',
    createdAt: '2026-09-15',
    timeEntries: [],
  },

  // ============================================
  // TAREAS CON SOBRECOSTO Y AHORRO
  // ============================================
  {
    id: 't46',
    moduleId: 'm10',
    name: 'Optimización de consultas (sobrecosto)',
    estimatedHours: 8,
    actualHours: 16,
    assignedTo: 'Elena Gómez',
    status: 'completed',
    priority: 'high',
    createdAt: '2026-07-01',
    completedAt: '2026-07-20',
    timeEntries: [
      { id: 'te159', taskId: 't46', userId: 'u4', userName: 'Elena Gómez', hours: 5, date: '2026-07-05', description: 'Análisis' },
      { id: 'te160', taskId: 't46', userId: 'u4', userName: 'Elena Gómez', hours: 6, date: '2026-07-10', description: 'Implementación' },
      { id: 'te161', taskId: 't46', userId: 'u4', userName: 'Elena Gómez', hours: 5, date: '2026-07-15', description: 'Pruebas' },
    ],
  },
  {
    id: 't47',
    moduleId: 'm11',
    name: 'Implementación rápida (ahorro)',
    estimatedHours: 20,
    actualHours: 12,
    assignedTo: 'Ana García',
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-07-10',
    completedAt: '2026-07-25',
    timeEntries: [
      { id: 'te162', taskId: 't47', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-07-12', description: 'Diseño' },
      { id: 'te163', taskId: 't47', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-07-15', description: 'Implementación' },
      { id: 'te164', taskId: 't47', userId: 'u1', userName: 'Ana García', hours: 3, date: '2026-07-20', description: 'Pruebas' },
    ],
  },
  {
    id: 't48',
    moduleId: 'm12',
    name: 'Tarea en revisión',
    estimatedHours: 15,
    actualHours: 14,
    assignedTo: 'Elena Gómez',
    status: 'review',
    priority: 'high',
    createdAt: '2026-08-01',
    timeEntries: [
      { id: 'te165', taskId: 't48', userId: 'u4', userName: 'Elena Gómez', hours: 5, date: '2026-08-03', description: 'Algoritmo' },
      { id: 'te166', taskId: 't48', userId: 'u4', userName: 'Elena Gómez', hours: 5, date: '2026-08-06', description: 'Implementación' },
      { id: 'te167', taskId: 't48', userId: 'u4', userName: 'Elena Gómez', hours: 4, date: '2026-08-10', description: 'Pruebas' },
    ],
  },
];