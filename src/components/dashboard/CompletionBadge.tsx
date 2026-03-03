import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Sparkles, Award } from 'lucide-react';
import { CompletionType } from '@/lib/utils';

interface CompletionBadgeProps {
  type: CompletionType;
  days?: number;
}

export function CompletionBadge({ type, days }: CompletionBadgeProps) {
  const config = {
    'early': {
      icon: Sparkles,
      text: days ? `${days} días antes` : 'Antes de tiempo',
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600',
    },
    'on-time': {
      icon: CheckCircle2,
      text: 'En fecha exacta',
      variant: 'secondary' as const,
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    'late': {
      icon: Clock,
      text: days ? `${days} días tarde` : 'Con retraso',
      variant: 'destructive' as const,
      className: '',
    },
    'in-progress': {
      icon: Award,
      text: 'En progreso',
      variant: 'outline' as const,
      className: '',
    },
  };

  const { icon: Icon, text, variant, className } = config[type];

  return (
    <Badge variant={variant} className={`flex items-center gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  );
}