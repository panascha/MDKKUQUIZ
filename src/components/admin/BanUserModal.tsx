import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '../ui/Dialog';
import { BackendRoutes } from '../../config/apiRoutes';
import toast from 'react-hot-toast';

interface BanUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  session: any;
  refetch: () => void;
  onCancel: () => void;
}

const BanUserModal: React.FC<BanUserModalProps> = ({
  open,
  onOpenChange,
  user,
  session,
  refetch,
  onCancel,
}) => {
  const [banDays, setBanDays] = useState('');
  const [banUntilAdmin, setBanUntilAdmin] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banError, setBanError] = useState<string | null>(null);
  const [banLoading, setBanLoading] = useState(false);

  React.useEffect(() => {
    if (open) {
      setBanDays('');
      setBanUntilAdmin(false);
      setBanReason('');
      setBanError(null);
      setBanLoading(false);
    }
  }, [open, user]);

  const handleBanConfirm = async () => {
    setBanLoading(true);
    setBanError(null);
    let banUntil = null;
    if (!banUntilAdmin && banDays) {
      const days = parseInt(banDays, 10);
      if (!isNaN(days) && days > 0) {
        banUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    }
    try {
      await fetch(`${BackendRoutes.BAN_USER}/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user.token}`,
        },
        body: JSON.stringify({
          reason: banReason,
          banUntil: banUntil ? banUntil.toISOString() : null,
        }),
      });
      onCancel();
      refetch();
      toast.success('User banned successfully!');
    } catch (err: any) {
      setBanError(err?.message || 'Failed to ban user');
    } finally {
      setBanLoading(false);
    }
  };

  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Ban User: {user.name}</DialogTitle>
        <DialogDescription>
          Please fill out the ban details below.
        </DialogDescription>
        <div className="mb-2">
          <label className="block font-medium mb-1">Ban Duration (days)</label>
          <input
            type="number"
            min={1}
            value={banDays}
            onChange={e => { setBanDays(e.target.value); setBanUntilAdmin(false); }}
            className="border rounded px-2 py-1 w-full"
            disabled={banUntilAdmin}
            placeholder="Enter number of days"
          />
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              checked={banUntilAdmin}
              onChange={e => { setBanUntilAdmin(e.target.checked); if (e.target.checked) setBanDays(''); }}
              id="banUntilAdmin"
            />
            <label htmlFor="banUntilAdmin" className="ml-2">Until admin unban</label>
          </div>
        </div>
        <div className="mb-2">
          <label className="block font-medium mb-1">Reason</label>
          <textarea
            value={banReason}
            onChange={e => setBanReason(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            rows={3}
            placeholder="Enter reason for ban"
          />
        </div>
        {banError && <div className="text-red-500 text-sm mb-2">{banError}</div>}
        <div className="flex gap-2 justify-end mt-4">
          <DialogClose asChild>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              disabled={banLoading}
              onClick={onCancel}
            >
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleBanConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={banLoading || (!banUntilAdmin && !banDays) || !banReason}
          >
            {banLoading ? 'Banning...' : 'Confirm Ban'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BanUserModal; 