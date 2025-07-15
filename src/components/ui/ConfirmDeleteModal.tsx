import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from './Dialog';

interface ConfirmDeleteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isDeleting: boolean;
  onDelete: () => void;
  title?: string;
  description?: string;
  entityName?: string;
}

export const ConfirmDeleteModal = ({
  open,
  setOpen,
  isDeleting,
  onDelete,
  title = 'Confirm Delete',
  description = 'To confirm deletion, type DELETE below. This action cannot be undone.',
  entityName = ''
}: ConfirmDeleteModalProps) => {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === 'DELETE';

  useEffect(() => {
    if (!open) setConfirmText('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}{' '}
            {entityName && <span className="font-bold">{entityName}</span>}
            {description && !description.endsWith('.') && '.'}
          </DialogDescription>
        </DialogHeader>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="w-full border rounded px-3 py-2 mt-4 focus:outline-none focus:ring-2 focus:ring-red-400"
          autoFocus
        />
        <DialogFooter>
          <DialogClose asChild>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              type="button"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:bg-red-200"
            disabled={!canDelete || isDeleting}
            onClick={() => {
              onDelete();
              setOpen(false);
              setConfirmText('');
            }}
            type="button"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 