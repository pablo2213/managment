'use client';
import { Card } from '@/components/ui/card';
import { ModuleForm } from '@/components/board/ModuleForm';
import { Module } from '@/lib/data';

interface ModuleInfoFormProps {
  module: Module;
  onSave: (updatedModule: Partial<Module>) => void;
  onCancel: () => void;
  availableModules?: Module[]; // Para dependencias
}

export function ModuleInfoForm({ module, onSave, onCancel, availableModules = [] }: ModuleInfoFormProps) {
  return (
    <Card className="p-4 border-2 border-primary/20 mt-4">
      <h3 className="text-sm font-medium mb-4">Editar información del módulo</h3>
      <ModuleForm
        initialData={module}
        onSubmit={onSave}
        onCancel={onCancel}
        availableModules={availableModules}
        currentModuleId={module.id} // Para evitar autodependencia
      />
    </Card>
  );
}