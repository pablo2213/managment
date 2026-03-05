'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, ChevronDown, X, UserPlus, Building2 } from 'lucide-react';
import { users, User, areas } from '@/lib/data';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserSelectorProps {
  selectedUsers: string[];
  onChange: (userIds: string[]) => void;
  placeholder?: string;
  maxDisplay?: number;
  filterByArea?: string; // ← NUEVO: filtrar por área
  showAreaFilter?: boolean; // ← NUEVO: mostrar pestañas de áreas
}

export function UserSelector({ 
  selectedUsers, 
  onChange, 
  placeholder = "Asignar a...",
  maxDisplay = 3,
  filterByArea,
  showAreaFilter = false
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | 'all'>('all');

  // Filtrar usuarios
  let filteredUsers = users;

  // Filtrar por búsqueda
  if (searchQuery) {
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filtrar por área (si se especifica)
  if (filterByArea) {
    filteredUsers = filteredUsers.filter(user => user.areaId === filterByArea);
  }

  // Filtrar por área seleccionada en pestañas
  if (showAreaFilter && selectedArea !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.areaId === selectedArea);
  }

  // Excluir usuarios ya seleccionados de la lista disponible
  const availableUsers = filteredUsers.filter(user => !selectedUsers.includes(user.id));

  const selectedUsersData = users.filter(user => selectedUsers.includes(user.id));

  const handleSelect = (userId: string) => {
    onChange([...selectedUsers, userId]);
    setOpen(false);
    setSearchQuery('');
  };

  const handleRemove = (userId: string) => {
    onChange(selectedUsers.filter(id => id !== userId));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Agrupar usuarios seleccionados por área
  const usersByArea = selectedUsersData.reduce((acc, user) => {
    const area = areas.find(a => a.id === user.areaId);
    if (!area) return acc;
    if (!acc[area.id]) {
      acc[area.id] = { area, users: [] };
    }
    acc[area.id].users.push(user);
    return acc;
  }, {} as Record<string, { area: typeof areas[0], users: User[] }>);

  return (
    <div className="space-y-2">
      {/* Lista de usuarios seleccionados agrupados por área */}
      {selectedUsersData.length > 0 && (
        <div className="space-y-2 mb-2">
          {Object.values(usersByArea).map(({ area, users }) => (
            <div key={area.id} className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: area.color }} />
                <span>{area.name}</span>
              </div>
              <div className="flex flex-wrap gap-1 pl-3">
                {users.map(user => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                    style={{ borderLeftColor: area.color, borderLeftWidth: '2px' }}
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-[8px]">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{user.name.split(' ')[0]}</span>
                    <button
                      onClick={() => handleRemove(user.id)}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          {selectedUsersData.length > maxDisplay && (
            <Badge variant="outline" className="text-xs">
              +{selectedUsersData.length - maxDisplay} más
            </Badge>
          )}
        </div>
      )}

      {/* Selector de usuarios */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {selectedUsers.length === 0 ? placeholder : 'Agregar más...'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0">
          <Command>
            <CommandInput 
              placeholder="Buscar usuario..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />

            {/* Filtro por áreas (opcional) */}
            {showAreaFilter && (
              <div className="px-2 py-2 border-b">
                <div className="flex flex-wrap gap-1">
                  <Badge 
                    variant={selectedArea === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedArea('all')}
                  >
                    Todos
                  </Badge>
                  {areas.map(area => (
                    <Badge
                      key={area.id}
                      variant={selectedArea === area.id ? 'default' : 'outline'}
                      className="cursor-pointer"
                      style={{ 
                        backgroundColor: selectedArea === area.id ? area.color : 'transparent',
                        borderColor: area.color,
                        color: selectedArea === area.id ? 'white' : area.color
                      }}
                      onClick={() => setSelectedArea(area.id)}
                    >
                      {area.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <CommandList className="max-h-[300px]">
              <CommandEmpty>No se encontraron usuarios</CommandEmpty>
              
              {/* Agrupar por área */}
              {!filterByArea && !showAreaFilter && areas.map(area => {
                const areaUsers = availableUsers.filter(u => u.areaId === area.id);
                if (areaUsers.length === 0) return null;

                return (
                  <CommandGroup key={area.id} heading={
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: area.color }} />
                      <span>{area.name}</span>
                    </div>
                  }>
                    {areaUsers.map(user => (
                      <CommandItem
                        key={user.id}
                        value={user.id}
                        onSelect={() => handleSelect(user.id)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.role}</div>
                        </div>
                        {selectedUsers.includes(user.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}

              {/* Si hay filtro por área, mostrar sin agrupar */}
              {(filterByArea || showAreaFilter) && availableUsers.map(user => {
                const area = areas.find(a => a.id === user.areaId);
                return (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => handleSelect(user.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: area?.color }} />
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.role}</div>
                    </div>
                    {selectedUsers.includes(user.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}