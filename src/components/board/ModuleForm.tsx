'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Save, X, Building2, Star, Link2, XCircle } from 'lucide-react';
import { AreaSelector } from '@/components/board/AreaSelector';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { users, areas, Module } from '@/lib/data';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleFormProps {
  initialData?: Partial<Module>;
  columnTitle?: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  availableModules?: Module[];
  currentModuleId?: string;
}

export function ModuleForm({ 
  initialData, 
  columnTitle, 
  onSubmit, 
  onCancel,
  isSubmitting = false,
  availableModules = [],
  currentModuleId
}: ModuleFormProps) {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTeam: initialData?.assignedTeam || '',
    areaId: initialData?.areaId,
    leadId: initialData?.leadId,
    dependencies: initialData?.dependencies || [],
  });

  const [dependenciesOpen, setDependenciesOpen] = useState(false);
  const [dependencySearch, setDependencySearch] = useState('');

  // Cuando cambia el área, resetear el líder si no pertenece al área
  useEffect(() => {
    if (formData.leadId) {
      const leadUser = users.find(u => u.id === formData.leadId);
      if (leadUser && leadUser.areaId !== formData.areaId) {
        setFormData(prev => ({ ...prev, leadId: undefined }));
      }
    }
  }, [formData.areaId]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const area = formData.areaId ? areas.find(a => a.id === formData.areaId) : null;
  const leadUser = formData.leadId ? users.find(u => u.id === formData.leadId) : null;

  // Filtrar módulos disponibles para dependencias
  const getAvailableDependencyModules = () => {
    let modules = availableModules;
    
    // Excluir el módulo actual (para evitar autodependencia)
    if (currentModuleId) {
      modules = modules.filter(m => m.id !== currentModuleId);
    }
    
    // Excluir módulos ya seleccionados
    modules = modules.filter(m => !formData.dependencies.includes(m.id));
    
    // Filtrar por búsqueda
    if (dependencySearch) {
      modules = modules.filter(m => 
        m.name.toLowerCase().includes(dependencySearch.toLowerCase())
      );
    }
    
    return modules;
  };

  const handleAddDependency = (moduleId: string) => {
    if (!formData.dependencies.includes(moduleId)) {
      setFormData({
        ...formData,
        dependencies: [...formData.dependencies, moduleId]
      });
    }
    setDependenciesOpen(false);
  };

  const handleRemoveDependency = (moduleId: string) => {
    setFormData({
      ...formData,
      dependencies: formData.dependencies.filter(id => id !== moduleId)
    });
  };

  const dependencyModules = availableModules.filter(m => 
    formData.dependencies.includes(m.id)
  );

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
      {/* Título dinámico */}
      {!isEditing && columnTitle && (
        <div className="mb-2 text-sm text-muted-foreground">
          Creando nuevo módulo en <span className="font-medium text-foreground">{columnTitle}</span>
        </div>
      )}

      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Nombre del módulo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Autenticación, Pagos, etc."
          className="w-full"
          autoFocus={!isEditing}
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe el objetivo del módulo..."
          rows={3}
        />
      </div>

      {/* Prioridad */}
      <div className="space-y-2">
        <Label htmlFor="priority" className="text-sm font-medium">Prioridad</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => setFormData({ ...formData, priority: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DEPENDENCIAS - Solo visibles en edición y si hay módulos */}
      {isEditing && availableModules.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="dependencies" className="text-sm font-medium flex items-center gap-1">
            <Link2 className="h-4 w-4" />
            Dependencias
          </Label>
          
          {/* Lista de dependencias seleccionadas */}
          {dependencyModules.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {dependencyModules.map(module => (
                <Badge
                  key={module.id}
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-1"
                >
                  <span className="text-xs">{module.name}</span>
                  <button
                    onClick={() => handleRemoveDependency(module.id)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Selector de dependencias */}
          <Popover open={dependenciesOpen} onOpenChange={setDependenciesOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={dependenciesOpen}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  {formData.dependencies.length === 0 
                    ? 'Seleccionar dependencias...' 
                    : `${formData.dependencies.length} dependencia(s) seleccionada(s)`}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput 
                  placeholder="Buscar módulos..." 
                  value={dependencySearch}
                  onValueChange={setDependencySearch}
                />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>No hay módulos disponibles</CommandEmpty>
                  <CommandGroup heading="Módulos disponibles">
                    {getAvailableDependencyModules().map(module => (
                      <CommandItem
                        key={module.id}
                        value={module.id}
                        onSelect={() => handleAddDependency(module.id)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">{module.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {module.status} · {module.progress}%
                          </div>
                        </div>
                        {formData.dependencies.includes(module.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Selecciona los módulos de los que depende este módulo
          </p>
        </div>
      )}

      {/* Área responsable */}
      <div className="space-y-2">
        <Label htmlFor="area" className="text-sm font-medium flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          Área responsable
        </Label>
        <AreaSelector
          selectedAreaId={formData.areaId}
          onChange={(areaId) => setFormData({ ...formData, areaId })}
        />
        {area && (
          <div className="mt-2 text-xs flex items-center gap-2 p-2 bg-muted/30 rounded">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: area.color }} />
            <span className="font-medium">{area.name}</span>
            <span className="text-muted-foreground">· {area.description}</span>
          </div>
        )}
      </div>

      {/* Líder/Encargado principal (solo si hay área seleccionada) */}
      {formData.areaId && (
        <div className="space-y-2">
          <Label htmlFor="lead" className="text-sm font-medium flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            Líder / Encargado principal
          </Label>
          <Select
            value={formData.leadId || 'none'}
            onValueChange={(value) => setFormData({ 
              ...formData, 
              leadId: value === 'none' ? undefined : value 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar líder..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin líder asignado</SelectItem>
              {users
                .filter(u => u.areaId === formData.areaId)
                .map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      <Badge variant="outline" className="text-[8px] ml-2">
                        {user.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {leadUser && (
            <div className="mt-2 flex items-center gap-2 text-xs p-2 bg-muted/30 rounded">
              <Avatar className="h-5 w-5">
                <AvatarImage src={leadUser.avatar} />
                <AvatarFallback>{getInitials(leadUser.name)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{leadUser.name}</span>
              <Badge variant="outline" className="text-[10px]">
                {leadUser.role}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium">Fecha de inicio</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-medium">Fecha de fin</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Equipo asignado (texto libre, legacy) - OPCIONAL */}
      <div className="space-y-2">
        <Label htmlFor="team" className="text-sm font-medium">Equipo asignado (opcional)</Label>
        <Input
          id="team"
          value={formData.assignedTeam}
          onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
          placeholder="Ej: Backend, Frontend, QA, etc."
        />
      </div>

      {/* Nota informativa */}
      <div className="bg-muted/30 p-3 rounded-lg text-xs text-muted-foreground">
        <span className="font-medium">Nota:</span> Las horas estimadas del módulo se calcularán automáticamente como la suma de las horas estimadas de sus tareas.
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!formData.name.trim() || isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Guardar cambios' : 'Crear módulo'}
        </Button>
      </div>
    </div>
  );
}