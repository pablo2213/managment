'use client';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Subtask } from '@/lib/data';

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
}

export function SubtaskList({ subtasks, onChange }: SubtaskListProps) {
  const [newSubtaskName, setNewSubtaskName] = useState('');

  const handleToggle = (id: string) => {
    const updated = subtasks.map(st =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    onChange(updated);
  };

  const handleAdd = () => {
    if (!newSubtaskName.trim()) return;
    
    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newSubtaskName,
      completed: false,
    };
    
    onChange([...subtasks, newSubtask]);
    setNewSubtaskName('');
  };

  const handleDelete = (id: string) => {
    onChange(subtasks.filter(st => st.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const completedCount = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 
    ? Math.round((completedCount / subtasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-3">
      {/* Barra de progreso de subtareas */}
      {subtasks.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-muted-foreground">
            {completedCount}/{subtasks.length}
          </span>
        </div>
      )}

      {/* Lista de subtareas */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {subtasks.map(subtask => (
          <div key={subtask.id} className="flex items-center gap-2 group">
            <Checkbox
              id={subtask.id}
              checked={subtask.completed}
              onCheckedChange={() => handleToggle(subtask.id)}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <label
              htmlFor={subtask.id}
              className={`flex-1 text-sm cursor-pointer ${
                subtask.completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {subtask.name}
            </label>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(subtask.id)}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}