'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModuleForm } from '@/components/board/ModuleForm';

interface CreateModuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateModule: (moduleData: any) => void;
  columnTitle: string;
}

export function CreateModuleModal({ open, onOpenChange, onCreateModule, columnTitle }: CreateModuleModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nuevo módulo</DialogTitle>
        </DialogHeader>

        <ModuleForm
          columnTitle={columnTitle}
          onSubmit={(data) => {
            onCreateModule(data);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}