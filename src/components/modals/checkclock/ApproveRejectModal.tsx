import React from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { CheckClockRecord } from '@/lib/services/check-clocks';

interface ApproveRejectModalProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  selectedRecord: CheckClockRecord | null;
  handleConfirmApprove: () => void;
  handleConfirmReject: () => void;
  mode: 'approve' | 'reject';
  error?: string;
}

const ApproveRejectModal: React.FC<ApproveRejectModalProps> = ({
  showModal,
  setShowModal,
  selectedRecord,
  handleConfirmApprove,
  handleConfirmReject,
  mode,
  error,
}) => {
  const { showToast, showLoadingSwal, Swal } = useSweetAlert();

  // Fungsi untuk handle approve
  const handleApproveAction = async () => {
    const confirmResult = await Swal.fire({
      title: 'Confirm Approval',
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 15px;">Are you sure you want to approve attendance for <strong>${selectedRecord?.employee_name}</strong>?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    });

    if (confirmResult.isConfirmed) {
      showLoadingSwal('Approving attendance...');
      
      try {
        await handleConfirmApprove();
        
        Swal.close();
        
        await Swal.fire({
          title: 'Approved!',
          text: 'Attendance has been approved successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#1E3A5F',
          timer: 2000,
          timerProgressBar: true
        });

      } catch (error) {
        Swal.close();
        showToast('error', 'Failed to approve attendance');
      }
    }
    
    setShowModal(false);
  };

  // Fungsi untuk handle reject
  const handleRejectAction = async () => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Attendance',
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <p style="margin-bottom: 15px;">Are you sure you want to reject attendance for <strong>${selectedRecord?.employee_name}</strong>?</p>
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">
            Reason for rejection (optional):
          </label>
        </div>
      `,
      input: 'textarea',
      inputPlaceholder: 'Enter reason for rejection...',
      inputAttributes: {
        'aria-label': 'Rejection reason',
        style: 'min-height: 80px; resize: vertical;'
      },
      showCancelButton: true,
      confirmButtonText: 'Yes, reject!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    });

    if (reason !== undefined) {
      showLoadingSwal('Rejecting attendance...');
      
      try {
        await handleConfirmReject();
        
        Swal.close();
        
        await Swal.fire({
          title: 'Rejected!',
          html: `
            <p>Attendance has been rejected successfully.</p>
            ${reason ? `<div style="margin-top: 10px; padding: 10px; background: #f3f4f6; border-radius: 6px; text-align: left;"><strong>Reason:</strong> ${reason}</div>` : ''}
          `,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#1E3A5F',
          timer: 3000,
          timerProgressBar: true
        });

      } catch (error) {
        Swal.close();
        showToast('error', 'Failed to reject attendance');
      }
    }
    
    setShowModal(false);
  };

  React.useEffect(() => {
    if (showModal && selectedRecord) {
      if (mode === 'approve') {
        handleApproveAction();
      } else if (mode === 'reject') {
        handleRejectAction();
      }
    }
  }, [showModal, selectedRecord, mode]);

  return null;
};

export default ApproveRejectModal;