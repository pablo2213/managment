'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface Participant {
  userId: string;
  userName: string;
  userRole: string;
  avatar?: string;
  totalHours: number;
  modules: string[];
}

interface PlanningParticipantsListProps {
  participants: Participant[];
}

export function PlanningParticipantsList({ participants }: PlanningParticipantsListProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No hay participantes en este planning</p>
        <p className="text-sm">Agrega módulos para ver los participantes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {participants.map(p => (
        <div key={p.userId} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={p.avatar} />
            <AvatarFallback>{p.userName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{p.userName}</div>
            <div className="text-xs text-muted-foreground">{p.userRole}</div>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm font-medium">{p.totalHours}h asignadas</span>
              <Badge variant="outline">
                {p.modules.length} módulo{p.modules.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}