'use client';
import { useState } from 'react';  // ← AÑADIDO
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';  // ← AÑADIDO
import { Clock, User, Calendar, Trash2 } from 'lucide-react';  // ← AÑADIDO Trash2
import { TimeEntry } from '@/lib/data';
import {
  AlertDialog,  // ← AÑADIDO
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TimeEntryListProps {
  entries: TimeEntry[];
  onDeleteEntry?: (entryId: string) => void;  // ← NUEVO
}

export function TimeEntryList({ entries, onDeleteEntry }: TimeEntryListProps) {
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);  // ← NUEVO
  const totalHours = entries.reduce((acc, entry) => acc + entry.hours, 0);

  // ============================================
  // FUNCIÓN PARA ELIMINAR TIME ENTRY (NUEVA)
  // ============================================
  const handleDelete = () => {
    if (deleteEntryId && onDeleteEntry) {
      onDeleteEntry(deleteEntryId);
      setDeleteEntryId(null);
    }
  };

  return (
    <>
      <Card className="p-3 bg-muted/30">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Registro de tiempos
            </h4>
            <Badge variant="outline" className="text-xs">
              Total: {totalHours}h
            </Badge>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-background rounded p-2 text-xs group relative">  {/* ← AÑADIDO group */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.hours}h</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      {entry.userName}
                    </span>
                  </div>
                  {onDeleteEntry && (  // ← NUEVO: botón de eliminar
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteEntryId(entry.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  )}
                </div>
                {entry.description && (
                  <p className="text-muted-foreground mt-1 ml-5">{entry.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Diálogo de confirmación para eliminar time entry (NUEVO) */}
      <AlertDialog open={!!deleteEntryId} onOpenChange={() => setDeleteEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro de tiempo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente este registro de horas.
              <br />
              <span className="text-red-500">Esta acción no se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}