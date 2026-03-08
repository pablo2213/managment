// ============================================
// FUNCIONES DE UTILIDAD PARA FECHAS
// ============================================

/**
 * Obtiene el inicio de semana (lunes) para una fecha dada
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para que la semana empiece el lunes
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtiene el fin de semana (domingo) para una fecha dada
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const d = getWeekStart(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Formatea una semana para mostrar (ej: "18/3 - 24/3")
 */
export function formatWeek(date: Date): string {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
}

/**
 * Formatea una fecha para mostrar (ej: "18/3/2026")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

/**
 * Comprueba si una fecha está dentro de una semana específica
 */
export function isDateInWeek(date: Date, weekStart: Date): boolean {
  const start = getWeekStart(weekStart);
  const end = getWeekEnd(weekStart);
  return date >= start && date <= end;
}

/**
 * Obtiene el número de semana del año (ISO)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Compara dos semanas (devuelve true si son la misma semana)
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const start1 = getWeekStart(date1);
  const start2 = getWeekStart(date2);
  return start1.getTime() === start2.getTime();
}

/**
 * Obtiene el rango de fechas de una semana en formato legible
 */
export function getWeekRange(date: Date): string {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
}