import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SummaryDialogProps {
  open: boolean;
  onClose: () => void;
  summary: string;
  paperTitle: string;
}

export function SummaryDialog({ open, onClose, summary, paperTitle }: SummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Summary: {paperTitle}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {summary ? (
            <div className="prose max-w-none">
              <p>{summary}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Generating summary...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
