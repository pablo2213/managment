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
  role: 'admin' | 'manager' | 'developer' | 'designer' | 'qa' | 'devops';
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
// ÁREAS DE LA EMPRESA
// ============================================

export const areas: Area[] = [
  {
    id: 'area1',
    name: 'Desarrollo Backend',
    description: 'APIs, bases de datos, lógica de negocio',
    color: '#3b82f6', // azul
  },
  {
    id: 'area2',
    name: 'Desarrollo Frontend',
    description: 'Interfaces de usuario, experiencia',
    color: '#10b981', // verde
  },
  {
    id: 'area3',
    name: 'Diseño UX/UI',
    description: 'Diseño de interfaces y experiencia',
    color: '#f59e0b', // amarillo
  },
  {
    id: 'area4',
    name: 'Calidad (QA)',
    description: 'Pruebas y aseguramiento de calidad',
    color: '#8b5cf6', // púrpura
  },
  {
    id: 'area5',
    name: 'DevOps',
    description: 'Infraestructura, despliegue, CI/CD',
    color: '#ef4444', // rojo
  },
  {
    id: 'area6',
    name: 'Producto',
    description: 'Gestión de producto y requisitos',
    color: '#6b7280', // gris
  },
  {
    id: 'area7',
    name: 'Seguridad',
    description: 'Seguridad informática y cumplimiento',
    color: '#14b8a6', // teal
  },
  {
    id: 'area8',
    name: 'Soporte',
    description: 'Atención a clientes y soporte técnico',
    color: '#f97316', // naranja
  },
];

// ============================================
// USUARIOS (con áreas)
// ============================================

export const users: User[] = [
  {
    id: 'u1',
    name: 'Ana García',
    email: 'ana.garcia@techcorp.com',
    role: 'developer',
    areaId: 'area1', // Backend
    avatar: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=3b82f6&color=fff',
  },
  {
    id: 'u2',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@techcorp.com',
    role: 'developer',
    areaId: 'area1', // Backend
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Ruiz&background=3b82f6&color=fff',
  },
  {
    id: 'u3',
    name: 'Laura Méndez',
    email: 'laura.mendez@techcorp.com',
    role: 'designer',
    areaId: 'area3', // Diseño
    avatar: 'https://ui-avatars.com/api/?name=Laura+Mendez&background=f59e0b&color=fff',
  },
  {
    id: 'u4',
    name: 'Elena Gómez',
    email: 'elena.gomez@techcorp.com',
    role: 'qa',
    areaId: 'area4', // QA
    avatar: 'https://ui-avatars.com/api/?name=Elena+Gomez&background=8b5cf6&color=fff',
  },
  {
    id: 'u5',
    name: 'Miguel Torres',
    email: 'miguel.torres@techcorp.com',
    role: 'devops',
    areaId: 'area5', // DevOps
    avatar: 'https://ui-avatars.com/api/?name=Miguel+Torres&background=ef4444&color=fff',
  },
  {
    id: 'u6',
    name: 'Javier López',
    email: 'javier.lopez@techcorp.com',
    role: 'developer',
    areaId: 'area2', // Frontend
    avatar: 'https://ui-avatars.com/api/?name=Javier+Lopez&background=10b981&color=fff',
  },
  {
    id: 'u7',
    name: 'Sofía Martínez',
    email: 'sofia.martinez@techcorp.com',
    role: 'manager',
    areaId: 'area6', // Producto
    avatar: 'https://ui-avatars.com/api/?name=Sofia+Martinez&background=6b7280&color=fff',
  },
  {
    id: 'u8',
    name: 'David Rodríguez',
    email: 'david.rodriguez@techcorp.com',
    role: 'developer',
    areaId: 'area2', // Frontend
    avatar: 'https://ui-avatars.com/api/?name=David+Rodriguez&background=10b981&color=fff',
  },
  {
    id: 'u9',
    name: 'Patricia Sánchez',
    email: 'patricia.sanchez@techcorp.com',
    role: 'qa',
    areaId: 'area4', // QA
    avatar: 'https://ui-avatars.com/api/?name=Patricia+Sanchez&background=8b5cf6&color=fff',
  },
  {
    id: 'u10',
    name: 'Jorge Fernández',
    email: 'jorge.fernandez@techcorp.com',
    role: 'devops',
    areaId: 'area5', // DevOps
    avatar: 'https://ui-avatars.com/api/?name=Jorge+Fernandez&background=ef4444&color=fff',
  },
  {
    id: 'u11',
    name: 'Carmen López',
    email: 'carmen.lopez@techcorp.com',
    role: 'designer',
    areaId: 'area3', // Diseño
    avatar: 'https://ui-avatars.com/api/?name=Carmen+Lopez&background=f59e0b&color=fff',
  },
  {
    id: 'u12',
    name: 'Antonio Gil',
    email: 'antonio.gil@techcorp.com',
    role: 'security',
    areaId: 'area7', // Seguridad
    avatar: 'https://ui-avatars.com/api/?name=Antonio+Gil&background=14b8a6&color=fff',
  },
];

// ============================================
// PROYECTO ÚNICO
// ============================================

export const projects: Project[] = [
  {
    id: 'p1',
    companyId: 'c1',
    name: 'Plataforma E-commerce Enterprise',
    description: 'Plataforma completa de comercio electrónico con microservicios, dashboard administrativo, app móvil y sistema de recomendaciones',
    progress: 58,
    status: 'active',
    startDate: '2026-01-15',
    endDate: '2026-12-20',
    priority: 'critical',
    category: 'development',
    estimatedHours: 3200,
  },
  {
    id: 'p2',
    companyId: 'c1',
    name: 'App de Gestión Interna',
    description: 'Sistema de gestión de recursos humanos y tareas',
    progress: 35,
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-11-30',
    priority: 'high',
    category: 'development',
    estimatedHours: 1800,
  },
  {
    id: 'p3',
    companyId: 'c1',
    name: 'Rediseño de Marca',
    description: 'Rebranding completo y nueva identidad visual',
    progress: 80,
    status: 'active',
    startDate: '2026-02-15',
    endDate: '2026-08-30',
    priority: 'medium',
    category: 'design',
    estimatedHours: 600,
  },
  {
    id: 'p4',
    companyId: 'c1',
    name: 'Migración Cloud',
    description: 'Migración de infraestructura a AWS',
    progress: 25,
    status: 'active',
    startDate: '2026-04-01',
    endDate: '2026-12-15',
    priority: 'critical',
    category: 'maintenance',
    estimatedHours: 1200,
  },
  {
    id: 'p5',
    companyId: 'c1',
    name: 'Dashboard Financiero',
    description: 'Panel de control para finanzas',
    progress: 90,
    status: 'active',
    startDate: '2026-01-10',
    endDate: '2026-06-30',
    priority: 'high',
    category: 'development',
    estimatedHours: 800,
  },
];

// ============================================
// MÓDULOS - 30 MÓDULOS CON DIFERENTES CASOS
// ============================================

export const modules: Module[] = [
  // ============================================
  // PROYECTO 1: E-commerce (18 módulos)
  // ============================================

  // Completados (6)
  {
    id: 'm1',
    projectId: 'p1',
    name: 'Autenticación y Seguridad',
    description: 'Sistema completo de autenticación, JWT, 2FA',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'critical',
    estimatedHours: 180,
    actualHours: 195,
    startDate: '2026-01-15',
    endDate: '2026-03-10',
    areaId: 'area1',
    leadId: 'u1',
  },
  {
    id: 'm2',
    projectId: 'p1',
    name: 'Gestión de Usuarios',
    description: 'Registro, perfiles, roles',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 120,
    actualHours: 135,
    startDate: '2026-02-01',
    endDate: '2026-04-05',
    areaId: 'area1',
    leadId: 'u2',
    dependencies: ['m1'],
  },
  {
    id: 'm3',
    projectId: 'p1',
    name: 'Catálogo de Productos',
    description: 'CRUD de productos, categorías',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 200,
    actualHours: 215,
    startDate: '2026-02-15',
    endDate: '2026-05-20',
    areaId: 'area1',
    leadId: 'u1',
    dependencies: ['m2'],
  },
  {
    id: 'm4',
    projectId: 'p1',
    name: 'Búsqueda Avanzada',
    description: 'Elasticsearch, filtros dinámicos',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 140,
    actualHours: 160,
    startDate: '2026-03-01',
    endDate: '2026-06-15',
    areaId: 'area1',
    leadId: 'u2',
    dependencies: ['m3'],
  },
  {
    id: 'm5',
    projectId: 'p1',
    name: 'Carrito de Compras',
    description: 'Carrito persistente, cálculos',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 130,
    actualHours: 145,
    startDate: '2026-03-15',
    endDate: '2026-07-10',
    areaId: 'area2',
    leadId: 'u6',
    dependencies: ['m3', 'm4'],
  },
  {
    id: 'm6',
    projectId: 'p1',
    name: 'Procesador de Pagos',
    description: 'Stripe, PayPal, webhooks',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'critical',
    estimatedHours: 200,
    actualHours: 235,
    startDate: '2026-04-01',
    endDate: '2026-08-15',
    areaId: 'area1',
    leadId: 'u1',
    dependencies: ['m5'],
  },

  // En progreso (7)
  {
    id: 'm7',
    projectId: 'p1',
    name: 'Gestión de Pedidos',
    description: 'Creación de pedidos, estados',
    progress: 75,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 160,
    actualHours: 120,
    startDate: '2026-05-01',
    endDate: '2026-09-30',
    areaId: 'area1',
    leadId: 'u2',
    dependencies: ['m6'],
  },
  {
    id: 'm8',
    projectId: 'p1',
    name: 'Panel de Administración',
    description: 'Dashboard admin',
    progress: 60,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 220,
    actualHours: 132,
    startDate: '2026-05-15',
    endDate: '2026-10-30',
    areaId: 'area2',
    leadId: 'u6',
    dependencies: ['m7'],
  },
  {
    id: 'm9',
    projectId: 'p1',
    name: 'Sistema de Envíos',
    description: 'Integración con correos',
    progress: 45,
    status: 'in-progress',
    column: 'doing',
    priority: 'medium',
    estimatedHours: 120,
    actualHours: 54,
    startDate: '2026-06-01',
    endDate: '2026-10-15',
    areaId: 'area1',
    leadId: 'u2',
    dependencies: ['m7'],
  },
  {
    id: 'm10',
    projectId: 'p1',
    name: 'Reseñas y Valoraciones',
    description: 'Sistema de reseñas',
    progress: 40,
    status: 'in-progress',
    column: 'doing',
    priority: 'medium',
    estimatedHours: 90,
    actualHours: 36,
    startDate: '2026-06-15',
    endDate: '2026-10-01',
    areaId: 'area2',
    leadId: 'u8',
    dependencies: ['m3'],
  },
  {
    id: 'm11',
    projectId: 'p1',
    name: 'Programa de Fidelización',
    description: 'Puntos y recompensas',
    progress: 30,
    status: 'in-progress',
    column: 'doing',
    priority: 'low',
    estimatedHours: 100,
    actualHours: 30,
    startDate: '2026-07-01',
    endDate: '2026-11-15',
    areaId: 'area6',
    leadId: 'u7',
    dependencies: ['m2'],
  },
  {
    id: 'm12',
    projectId: 'p1',
    name: 'Sistema de Recomendaciones',
    description: 'Algoritmos ML',
    progress: 25,
    status: 'in-progress',
    column: 'doing',
    priority: 'medium',
    estimatedHours: 150,
    actualHours: 38,
    startDate: '2026-07-15',
    endDate: '2026-11-30',
    areaId: 'area1',
    leadId: 'u1',
    dependencies: ['m4', 'm10'],
  },
  {
    id: 'm13',
    projectId: 'p1',
    name: 'App Móvil React Native',
    description: 'App para iOS y Android',
    progress: 15,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 300,
    actualHours: 45,
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    areaId: 'area2',
    leadId: 'u6',
    dependencies: ['m5', 'm6', 'm7'],
  },

  // Pendientes (3)
  {
    id: 'm14',
    projectId: 'p1',
    name: 'API Pública',
    description: 'API para terceros',
    progress: 10,
    status: 'pending',
    column: 'todo',
    priority: 'medium',
    estimatedHours: 140,
    actualHours: 14,
    startDate: '2026-08-15',
    endDate: '2026-11-15',
    areaId: 'area1',
    leadId: 'u2',
    dependencies: ['m1', 'm3', 'm7'],
  },
  {
    id: 'm15',
    projectId: 'p1',
    name: 'Marketplace Multivendedor',
    description: 'Soporte para múltiples vendedores',
    progress: 0,
    status: 'pending',
    column: 'todo',
    priority: 'medium',
    estimatedHours: 250,
    actualHours: 0,
    startDate: '2026-09-01',
    endDate: '2026-12-20',
    areaId: 'area6',
    leadId: 'u7',
    dependencies: ['m3', 'm7', 'm8'],
  },
  {
    id: 'm16',
    projectId: 'p1',
    name: 'Integración con ERP',
    description: 'Conexión con SAP',
    progress: 5,
    status: 'pending',
    column: 'todo',
    priority: 'low',
    estimatedHours: 180,
    actualHours: 9,
    startDate: '2026-09-15',
    endDate: '2026-12-01',
    areaId: 'area1',
    leadId: 'u1',
    dependencies: ['m7', 'm8'],
  },

  // Bloqueados (1)
  {
    id: 'm17',
    projectId: 'p1',
    name: 'Migración a Microservicios',
    description: 'Refactorización completa',
    progress: 5,
    status: 'blocked',
    column: 'blocked',
    priority: 'critical',
    estimatedHours: 200,
    actualHours: 10,
    startDate: '2026-09-01',
    endDate: '2026-12-20',
    areaId: 'area5',
    leadId: 'u5',
    dependencies: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
  },

  // En espera (1)
  {
    id: 'm18',
    projectId: 'p1',
    name: 'Internacionalización',
    description: 'Multi-idioma y multi-moneda',
    progress: 0,
    status: 'on-hold',
    column: 'todo',
    priority: 'low',
    estimatedHours: 150,
    actualHours: 0,
    startDate: '2026-10-01',
    endDate: '2026-12-20',
    areaId: 'area2',
    leadId: 'u8',
    dependencies: ['m3', 'm5', 'm8'],
  },

  // ============================================
  // PROYECTO 2: App Gestión (5 módulos)
  // ============================================

  {
    id: 'm19',
    projectId: 'p2',
    name: 'Gestión de Empleados',
    description: 'CRUD de empleados',
    progress: 90,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 120,
    actualHours: 108,
    startDate: '2026-03-01',
    endDate: '2026-06-30',
    areaId: 'area1',
    leadId: 'u2',
  },
  {
    id: 'm20',
    projectId: 'p2',
    name: 'Control de Asistencia',
    description: 'Registro de horas',
    progress: 60,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 80,
    actualHours: 48,
    startDate: '2026-04-01',
    endDate: '2026-07-31',
    areaId: 'area2',
    leadId: 'u6',
    dependencies: ['m19'],
  },
  {
    id: 'm21',
    projectId: 'p2',
    name: 'Gestión de Vacaciones',
    description: 'Solicitudes y aprobaciones',
    progress: 30,
    status: 'in-progress',
    column: 'doing',
    priority: 'medium',
    estimatedHours: 60,
    actualHours: 18,
    startDate: '2026-05-01',
    endDate: '2026-08-15',
    areaId: 'area2',
    leadId: 'u8',
    dependencies: ['m19'],
  },
  {
    id: 'm22',
    projectId: 'p2',
    name: 'Reportes RRHH',
    description: 'Dashboard de recursos humanos',
    progress: 15,
    status: 'pending',
    column: 'todo',
    priority: 'medium',
    estimatedHours: 100,
    actualHours: 15,
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    areaId: 'area4',
    leadId: 'u4',
    dependencies: ['m20', 'm21'],
  },
  {
    id: 'm23',
    projectId: 'p2',
    name: 'Integración con Nómina',
    description: 'Conexión con sistema de nómina',
    progress: 0,
    status: 'pending',
    column: 'todo',
    priority: 'low',
    estimatedHours: 150,
    actualHours: 0,
    startDate: '2026-07-01',
    endDate: '2026-10-31',
    areaId: 'area1',
    leadId: 'u1',
    dependencies: ['m22'],
  },

  // ============================================
  // PROYECTO 3: Rediseño de Marca (3 módulos)
  // ============================================

  {
    id: 'm24',
    projectId: 'p3',
    name: 'Investigación y Concepto',
    description: 'Estudio de marca y conceptos',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 80,
    actualHours: 95,
    startDate: '2026-02-15',
    endDate: '2026-03-30',
    areaId: 'area3',
    leadId: 'u3',
  },
  {
    id: 'm25',
    projectId: 'p3',
    name: 'Diseño de Identidad',
    description: 'Logotipo, colores, tipografía',
    progress: 90,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 120,
    actualHours: 108,
    startDate: '2026-03-15',
    endDate: '2026-05-30',
    areaId: 'area3',
    leadId: 'u11',
    dependencies: ['m24'],
  },
  {
    id: 'm26',
    projectId: 'p3',
    name: 'Aplicaciones de Marca',
    description: 'Papelería, presentaciones',
    progress: 40,
    status: 'in-progress',
    column: 'doing',
    priority: 'medium',
    estimatedHours: 100,
    actualHours: 40,
    startDate: '2026-05-01',
    endDate: '2026-07-15',
    areaId: 'area3',
    leadId: 'u3',
    dependencies: ['m25'],
  },

  // ============================================
  // PROYECTO 4: Migración Cloud (2 módulos)
  // ============================================

  {
    id: 'm27',
    projectId: 'p4',
    name: 'Análisis de Infraestructura',
    description: 'Inventario y evaluación',
    progress: 80,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 100,
    actualHours: 80,
    startDate: '2026-04-01',
    endDate: '2026-06-15',
    areaId: 'area5',
    leadId: 'u5',
  },
  {
    id: 'm28',
    projectId: 'p4',
    name: 'Migración de Datos',
    description: 'Movimiento de datos a la nube',
    progress: 15,
    status: 'blocked',
    column: 'blocked',
    priority: 'critical',
    estimatedHours: 300,
    actualHours: 45,
    startDate: '2026-05-15',
    endDate: '2026-09-30',
    areaId: 'area5',
    leadId: 'u10',
    dependencies: ['m27'],
  },

  // ============================================
  // PROYECTO 5: Dashboard Financiero (2 módulos)
  // ============================================

  {
    id: 'm29',
    projectId: 'p5',
    name: 'Backend Financiero',
    description: 'API de datos financieros',
    progress: 100,
    status: 'completed',
    column: 'done',
    priority: 'high',
    estimatedHours: 120,
    actualHours: 130,
    startDate: '2026-01-10',
    endDate: '2026-03-20',
    areaId: 'area1',
    leadId: 'u1',
  },
  {
    id: 'm30',
    projectId: 'p5',
    name: 'Frontend Dashboard',
    description: 'Visualización de datos',
    progress: 85,
    status: 'in-progress',
    column: 'doing',
    priority: 'high',
    estimatedHours: 150,
    actualHours: 127,
    startDate: '2026-02-15',
    endDate: '2026-05-15',
    areaId: 'area2',
    leadId: 'u6',
    dependencies: ['m29'],
  },
];

// ============================================
// TAREAS - 50 TAREAS CON DIFERENTES ESTADOS
// ============================================

export const tasks: Task[] = [
  // ============================================
  // TAREAS PARA MÓDULO 1 (Autenticación) - COMPLETADAS
  // ============================================
  {
    id: 't1',
    moduleId: 'm1',
    name: 'Implementar JWT',
    description: 'Configurar JWT y refresh tokens',
    estimatedHours: 24,
    actualHours: 28,
    assignedTo: ['u1', 'u2'],
    assignedToNames: ['Ana García', 'Carlos Ruiz'],
    status: 'completed',
    priority: 'critical',
    createdAt: '2026-01-15',
    completedAt: '2026-02-05',
    timeEntries: [
      { id: 'te1', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 6, date: '2026-01-18', description: 'Configuración' },
      { id: 'te2', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-01-22', description: 'Implementación' },
      { id: 'te3', taskId: 't1', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-01-25', description: 'Refresh tokens' },
      { id: 'te4', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-01-28', description: 'Blacklist' },
      { id: 'te5', taskId: 't1', userId: 'u2', userName: 'Carlos Ruiz', hours: 4, date: '2026-02-01', description: 'Tests' },
      { id: 'te6', taskId: 't1', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-02-04', description: 'Documentación' },
    ],
  },
  {
    id: 't2',
    moduleId: 'm1',
    name: 'Autenticación 2FA',
    description: 'Implementar doble factor',
    estimatedHours: 16,
    actualHours: 20,
    assignedTo: ['u1'],
    assignedToNames: ['Ana García'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-01-20',
    completedAt: '2026-02-15',
    timeEntries: [
      { id: 'te7', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-01-23', description: 'Investigación' },
      { id: 'te8', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 6, date: '2026-01-27', description: 'TOTP' },
      { id: 'te9', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 4, date: '2026-02-01', description: 'Backup codes' },
      { id: 'te10', taskId: 't2', userId: 'u1', userName: 'Ana García', hours: 5, date: '2026-02-10', description: 'UI' },
    ],
  },

  // ============================================
  // TAREAS PARA MÓDULO 3 (Catálogo) - COMPLETADAS
  // ============================================
  {
    id: 't3',
    moduleId: 'm3',
    name: 'Modelo de productos',
    description: 'Diseñar esquema de base de datos',
    estimatedHours: 16,
    actualHours: 18,
    assignedTo: ['u2'],
    assignedToNames: ['Carlos Ruiz'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-15',
    completedAt: '2026-03-10',
  },
  {
    id: 't4',
    moduleId: 'm3',
    name: 'CRUD de productos',
    description: 'Implementar endpoints',
    estimatedHours: 24,
    actualHours: 28,
    assignedTo: ['u2', 'u1'],
    assignedToNames: ['Carlos Ruiz', 'Ana García'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-20',
    completedAt: '2026-03-25',
  },

  // ============================================
  // TAREAS PARA MÓDULO 7 (Pedidos) - EN PROGRESO
  // ============================================
  {
    id: 't5',
    moduleId: 'm7',
    name: 'Modelo de pedidos',
    description: 'Diseñar esquema',
    estimatedHours: 14,
    actualHours: 12,
    assignedTo: ['u2'],
    assignedToNames: ['Carlos Ruiz'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-05-01',
    completedAt: '2026-05-20',
  },
  {
    id: 't6',
    moduleId: 'm7',
    name: 'Flujo de creación',
    description: 'Implementar checkout',
    estimatedHours: 20,
    actualHours: 16,
    assignedTo: ['u6', 'u8'],
    assignedToNames: ['Javier López', 'David Rodríguez'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-05-10',
  },
  {
    id: 't7',
    moduleId: 'm7',
    name: 'Estados y tracking',
    description: 'Máquina de estados',
    estimatedHours: 16,
    actualHours: 12,
    assignedTo: ['u2'],
    assignedToNames: ['Carlos Ruiz'],
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-05-15',
  },
  {
    id: 't8',
    moduleId: 'm7',
    name: 'Panel de pedidos',
    description: 'Vista para admin',
    estimatedHours: 18,
    actualHours: 10,
    assignedTo: ['u6'],
    assignedToNames: ['Javier López'],
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-05-20',
  },

  // ============================================
  // TAREAS PARA MÓDULO 8 (Admin) - EN PROGRESO
  // ============================================
  {
    id: 't9',
    moduleId: 'm8',
    name: 'Dashboard principal',
    description: 'Vista general',
    estimatedHours: 20,
    actualHours: 15,
    assignedTo: ['u6', 'u8'],
    assignedToNames: ['Javier López', 'David Rodríguez'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-05-15',
  },
  {
    id: 't10',
    moduleId: 'm8',
    name: 'Gestión de productos',
    description: 'Admin de productos',
    estimatedHours: 18,
    actualHours: 14,
    assignedTo: ['u2'],
    assignedToNames: ['Carlos Ruiz'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-05-20',
  },
  {
    id: 't11',
    moduleId: 'm8',
    name: 'Gestión de usuarios',
    description: 'Admin de usuarios',
    estimatedHours: 16,
    actualHours: 12,
    assignedTo: ['u6'],
    assignedToNames: ['Javier López'],
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-06-01',
  },
  {
    id: 't12',
    moduleId: 'm8',
    name: 'Reportes',
    description: 'Estadísticas',
    estimatedHours: 20,
    actualHours: 8,
    assignedTo: ['u4', 'u9'],
    assignedToNames: ['Elena Gómez', 'Patricia Sánchez'],
    status: 'pending',
    priority: 'low',
    createdAt: '2026-06-05',
  },

  // ============================================
  // TAREAS PARA MÓDULO 13 (App Móvil) - MIXTAS
  // ============================================
  {
    id: 't13',
    moduleId: 'm13',
    name: 'Configuración del proyecto',
    description: 'Setup React Native',
    estimatedHours: 12,
    actualHours: 8,
    assignedTo: ['u6', 'u8'],
    assignedToNames: ['Javier López', 'David Rodríguez'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-08-01',
    completedAt: '2026-08-10',
  },
  {
    id: 't14',
    moduleId: 'm13',
    name: 'Pantalla de productos',
    description: 'Lista y detalle',
    estimatedHours: 24,
    actualHours: 18,
    assignedTo: ['u6'],
    assignedToNames: ['Javier López'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-08-05',
  },
  {
    id: 't15',
    moduleId: 'm13',
    name: 'Pantalla de carrito',
    description: 'Vista del carrito',
    estimatedHours: 18,
    actualHours: 6,
    assignedTo: ['u8'],
    assignedToNames: ['David Rodríguez'],
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-08-15',
  },
  {
    id: 't16',
    moduleId: 'm13',
    name: 'Autenticación en app',
    description: 'Login desde móvil',
    estimatedHours: 16,
    actualHours: 0,
    assignedTo: ['u6'],
    assignedToNames: ['Javier López'],
    status: 'pending',
    priority: 'high',
    createdAt: '2026-08-20',
  },

  // ============================================
  // TAREAS PARA MÓDULO 17 (Migración) - BLOQUEADAS
  // ============================================
  {
    id: 't17',
    moduleId: 'm17',
    name: 'Análisis de arquitectura',
    description: 'Revisión de código actual',
    estimatedHours: 20,
    actualHours: 10,
    assignedTo: ['u5', 'u10'],
    assignedToNames: ['Miguel Torres', 'Jorge Fernández'],
    status: 'blocked',
    priority: 'critical',
    createdAt: '2026-09-01',
  },
  {
    id: 't18',
    moduleId: 'm17',
    name: 'Diseño de microservicios',
    description: 'Arquitectura nueva',
    estimatedHours: 30,
    actualHours: 0,
    assignedTo: ['u5'],
    assignedToNames: ['Miguel Torres'],
    status: 'blocked',
    priority: 'high',
    createdAt: '2026-09-10',
  },
  {
    id: 't19',
    moduleId: 'm17',
    name: 'Configuración Kubernetes',
    description: 'Orquestación',
    estimatedHours: 25,
    actualHours: 0,
    assignedTo: ['u10'],
    assignedToNames: ['Jorge Fernández'],
    status: 'blocked',
    priority: 'high',
    createdAt: '2026-09-15',
  },

  // ============================================
  // TAREAS PARA MÓDULO 19 (Gestión Empleados)
  // ============================================
  {
    id: 't20',
    moduleId: 'm19',
    name: 'Modelo de empleados',
    description: 'Diseño de BD',
    estimatedHours: 15,
    actualHours: 18,
    assignedTo: ['u2'],
    assignedToNames: ['Carlos Ruiz'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-03-01',
    completedAt: '2026-03-20',
  },
  {
    id: 't21',
    moduleId: 'm19',
    name: 'API de empleados',
    description: 'CRUD endpoints',
    estimatedHours: 25,
    actualHours: 22,
    assignedTo: ['u2', 'u1'],
    assignedToNames: ['Carlos Ruiz', 'Ana García'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-03-10',
    completedAt: '2026-04-15',
  },
  {
    id: 't22',
    moduleId: 'm19',
    name: 'Frontend empleados',
    description: 'Interfaz de gestión',
    estimatedHours: 30,
    actualHours: 28,
    assignedTo: ['u6', 'u8'],
    assignedToNames: ['Javier López', 'David Rodríguez'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-04-01',
  },
  {
    id: 't23',
    moduleId: 'm19',
    name: 'Filtros y búsqueda',
    description: 'Búsqueda avanzada',
    estimatedHours: 20,
    actualHours: 15,
    assignedTo: ['u8'],
    assignedToNames: ['David Rodríguez'],
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-04-15',
  },

  // ============================================
  // TAREAS PARA MÓDULO 20 (Control Asistencia)
  // ============================================
  {
    id: 't24',
    moduleId: 'm20',
    name: 'Modelo de asistencia',
    description: 'Registro de horas',
    estimatedHours: 12,
    actualHours: 10,
    assignedTo: ['u2'],
    assignedToNames: ['Carlos Ruiz'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-04-01',
    completedAt: '2026-04-20',
  },
  {
    id: 't25',
    moduleId: 'm20',
    name: 'API de asistencia',
    description: 'Endpoints',
    estimatedHours: 18,
    actualHours: 15,
    assignedTo: ['u2'],
    assignedToNames: ['Carlos Ruiz'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-04-10',
    completedAt: '2026-05-05',
  },
  {
    id: 't26',
    moduleId: 'm20',
    name: 'Frontend asistencia',
    description: 'Interfaz de registro',
    estimatedHours: 22,
    actualHours: 18,
    assignedTo: ['u6'],
    assignedToNames: ['Javier López'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-04-15',
  },
  {
    id: 't27',
    moduleId: 'm20',
    name: 'Reportes de asistencia',
    description: 'Estadísticas',
    estimatedHours: 15,
    actualHours: 5,
    assignedTo: ['u4', 'u9'],
    assignedToNames: ['Elena Gómez', 'Patricia Sánchez'],
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-05-01',
  },

  // ============================================
  // TAREAS PARA MÓDULO 24 (Investigación Marca)
  // ============================================
  {
    id: 't28',
    moduleId: 'm24',
    name: 'Estudio de mercado',
    description: 'Análisis de competencia',
    estimatedHours: 20,
    actualHours: 25,
    assignedTo: ['u3', 'u11'],
    assignedToNames: ['Laura Méndez', 'Carmen López'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-15',
    completedAt: '2026-03-10',
  },
  {
    id: 't29',
    moduleId: 'm24',
    name: 'Definición de conceptos',
    description: 'Brainstorming',
    estimatedHours: 15,
    actualHours: 18,
    assignedTo: ['u3'],
    assignedToNames: ['Laura Méndez'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-20',
    completedAt: '2026-03-05',
  },
  {
    id: 't30',
    moduleId: 'm24',
    name: 'Presentación de conceptos',
    description: 'Deck para cliente',
    estimatedHours: 12,
    actualHours: 15,
    assignedTo: ['u11'],
    assignedToNames: ['Carmen López'],
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-02-25',
    completedAt: '2026-03-15',
  },

  // ============================================
  // TAREAS PARA MÓDULO 25 (Diseño Identidad)
  // ============================================
  {
    id: 't31',
    moduleId: 'm25',
    name: 'Diseño de logotipo',
    description: 'Propuestas',
    estimatedHours: 30,
    actualHours: 35,
    assignedTo: ['u3', 'u11'],
    assignedToNames: ['Laura Méndez', 'Carmen López'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-03-15',
    completedAt: '2026-04-20',
  },
  {
    id: 't32',
    moduleId: 'm25',
    name: 'Paleta de colores',
    description: 'Definición cromática',
    estimatedHours: 10,
    actualHours: 12,
    assignedTo: ['u11'],
    assignedToNames: ['Carmen López'],
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-03-20',
    completedAt: '2026-04-05',
  },
  {
    id: 't33',
    moduleId: 'm25',
    name: 'Tipografía',
    description: 'Selección de fuentes',
    estimatedHours: 8,
    actualHours: 10,
    assignedTo: ['u3'],
    assignedToNames: ['Laura Méndez'],
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-03-25',
    completedAt: '2026-04-10',
  },
  {
    id: 't34',
    moduleId: 'm25',
    name: 'Manual de marca',
    description: 'Documentación',
    estimatedHours: 25,
    actualHours: 18,
    assignedTo: ['u3', 'u11'],
    assignedToNames: ['Laura Méndez', 'Carmen López'],
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-04-15',
  },

  // ============================================
  // TAREAS PARA MÓDULO 27 (Análisis Infraestructura)
  // ============================================
  {
    id: 't35',
    moduleId: 'm27',
    name: 'Inventario de servidores',
    description: 'Listado de recursos',
    estimatedHours: 20,
    actualHours: 22,
    assignedTo: ['u5'],
    assignedToNames: ['Miguel Torres'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-04-01',
    completedAt: '2026-04-20',
  },
  {
    id: 't36',
    moduleId: 'm27',
    name: 'Análisis de costos',
    description: 'Estimación cloud',
    estimatedHours: 15,
    actualHours: 18,
    assignedTo: ['u5', 'u10'],
    assignedToNames: ['Miguel Torres', 'Jorge Fernández'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-04-10',
    completedAt: '2026-04-30',
  },
  {
    id: 't37',
    moduleId: 'm27',
    name: 'Plan de migración',
    description: 'Estrategia',
    estimatedHours: 25,
    actualHours: 20,
    assignedTo: ['u10'],
    assignedToNames: ['Jorge Fernández'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-04-15',
  },

  // ============================================
  // TAREAS PARA MÓDULO 29 (Backend Financiero)
  // ============================================
  {
    id: 't38',
    moduleId: 'm29',
    name: 'Modelo financiero',
    description: 'Diseño de BD',
    estimatedHours: 15,
    actualHours: 18,
    assignedTo: ['u1'],
    assignedToNames: ['Ana García'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-01-10',
    completedAt: '2026-01-30',
  },
  {
    id: 't39',
    moduleId: 'm29',
    name: 'API de datos',
    description: 'Endpoints',
    estimatedHours: 30,
    actualHours: 35,
    assignedTo: ['u1', 'u2'],
    assignedToNames: ['Ana García', 'Carlos Ruiz'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-01-15',
    completedAt: '2026-02-20',
  },
  {
    id: 't40',
    moduleId: 'm29',
    name: 'Cálculos financieros',
    description: 'Lógica de negocio',
    estimatedHours: 25,
    actualHours: 28,
    assignedTo: ['u2'],
    assignedToNames: ['Carlos Ruiz'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-01-20',
    completedAt: '2026-02-25',
  },

  // ============================================
  // TAREAS PARA MÓDULO 30 (Frontend Dashboard)
  // ============================================
  {
    id: 't41',
    moduleId: 'm30',
    name: 'Maquetación dashboard',
    description: 'Estructura base',
    estimatedHours: 20,
    actualHours: 18,
    assignedTo: ['u6'],
    assignedToNames: ['Javier López'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-02-15',
    completedAt: '2026-03-10',
  },
  {
    id: 't42',
    moduleId: 'm30',
    name: 'Gráficos financieros',
    description: 'Visualizaciones',
    estimatedHours: 30,
    actualHours: 28,
    assignedTo: ['u6', 'u8'],
    assignedToNames: ['Javier López', 'David Rodríguez'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-02-20',
  },
  {
    id: 't43',
    moduleId: 'm30',
    name: 'Filtros interactivos',
    description: 'Filtros dinámicos',
    estimatedHours: 20,
    actualHours: 15,
    assignedTo: ['u8'],
    assignedToNames: ['David Rodríguez'],
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-03-01',
  },
  {
    id: 't44',
    moduleId: 'm30',
    name: 'Exportación de datos',
    description: 'PDF y Excel',
    estimatedHours: 15,
    actualHours: 8,
    assignedTo: ['u6'],
    assignedToNames: ['Javier López'],
    status: 'pending',
    priority: 'low',
    createdAt: '2026-03-15',
  },

  // ============================================
  // TAREAS ADICIONALES CON SOBRECOSTO Y AHORRO
  // ============================================
  {
    id: 't45',
    moduleId: 'm4',
    name: 'Optimización de búsqueda (sobrecosto)',
    description: 'Mejora de rendimiento',
    estimatedHours: 8,
    actualHours: 16,
    assignedTo: ['u2'],
    assignedToNames: ['Carlos Ruiz'],
    status: 'completed',
    priority: 'high',
    createdAt: '2026-04-01',
    completedAt: '2026-04-20',
  },
  {
    id: 't46',
    moduleId: 'm11',
    name: 'Implementación rápida (ahorro)',
    description: 'Desarrollo eficiente',
    estimatedHours: 20,
    actualHours: 12,
    assignedTo: ['u1'],
    assignedToNames: ['Ana García'],
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-07-10',
    completedAt: '2026-07-25',
  },
  {
    id: 't47',
    moduleId: 'm12',
    name: 'Algoritmo en revisión',
    description: 'Pendiente de aprobación',
    estimatedHours: 15,
    actualHours: 14,
    assignedTo: ['u1'],
    assignedToNames: ['Ana García'],
    status: 'review',
    priority: 'high',
    createdAt: '2026-08-01',
  },
  {
    id: 't48',
    moduleId: 'm10',
    name: 'Moderación de reseñas',
    description: 'Aprobación de contenido',
    estimatedHours: 12,
    actualHours: 8,
    assignedTo: ['u4', 'u9'],
    assignedToNames: ['Elena Gómez', 'Patricia Sánchez'],
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-07-01',
  },
  {
    id: 't49',
    moduleId: 'm21',
    name: 'Gestión de vacaciones',
    description: 'Solicitudes',
    estimatedHours: 10,
    actualHours: 5,
    assignedTo: ['u8'],
    assignedToNames: ['David Rodríguez'],
    status: 'in-progress',
    priority: 'low',
    createdAt: '2026-05-15',
  },
  {
    id: 't50',
    moduleId: 'm23',
    name: 'Integración con nómina',
    description: 'Conexión API',
    estimatedHours: 25,
    actualHours: 0,
    assignedTo: ['u2'],
    assignedToNames: ['Carlos Ruiz'],
    status: 'pending',
    priority: 'low',
    createdAt: '2026-07-01',
  },
];