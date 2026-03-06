'use client';
import { UserTaskInbox } from '@/components/user/UserTaskInbox';

export default function UserPage() {
  // Temporal: usuario fijo para desarrollo (Ana García)
  // En producción, esto vendría de tu sistema de autenticación
  const userId = 'u1'; // ID de Ana García

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Mi Bandeja de Tareas</h1>
      <UserTaskInbox userId={userId} />
    </div>
  );
}