import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface WorkflowApprovalProps {
    status: string;
    requiresApproval?: boolean;
    approver?: {
        id: string;
        name: string;
        email: string;
    };
    approvedAt?: string;
    approvedBy?: {
        name: string;
    };
    rejectedAt?: string;
    rejectedBy?: {
        name: string;
    };
    rejectionReason?: string;
    onApprove?: (reason?: string) => Promise<void>;
    onReject?: (reason: string) => Promise<void>;
    canApprove?: boolean;
}

export const WorkflowApproval: React.FC<WorkflowApprovalProps> = ({
    status,
    requiresApproval,
    approver,
    approvedAt,
    approvedBy,
    rejectedAt,
    rejectedBy,
    rejectionReason,
    onApprove,
    onReject,
    canApprove = false,
}) => {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = async () => {
        if (!onApprove) return;

        setIsSubmitting(true);
        try {
            await onApprove();
            setShowApproveModal(false);
        } catch (error) {
            console.error('Approval failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!onReject || !rejectReason.trim()) return;

        setIsSubmitting(true);
        try {
            await onReject(rejectReason);
            setShowRejectModal(false);
            setRejectReason('');
        } catch (error) {
            console.error('Rejection failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!requiresApproval) return null;

    return (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${status === 'PENDING_APPROVAL'
                        ? 'bg-warning-100'
                        : status === 'APPROVED'
                            ? 'bg-success-100'
                            : status === 'REJECTED'
                                ? 'bg-danger-100'
                                : 'bg-neutral-100'
                    }`}>
                    {status === 'PENDING_APPROVAL' && <Clock className="w-6 h-6 text-warning-600" />}
                    {status === 'APPROVED' && <CheckCircle2 className="w-6 h-6 text-success-600" />}
                    {status === 'REJECTED' && <XCircle className="w-6 h-6 text-danger-600" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900">
                                {status === 'PENDING_APPROVAL' && 'Approval Required'}
                                {status === 'APPROVED' && 'Approved'}
                                {status === 'REJECTED' && 'Rejected'}
                            </h3>
                            <p className="text-sm text-neutral-600 mt-1">
                                {status === 'PENDING_APPROVAL' && approver && (
                                    <>Waiting for approval from <span className="font-medium">{approver.name}</span></>
                                )}
                                {status === 'APPROVED' && approvedBy && (
                                    <>Approved by <span className="font-medium">{approvedBy.name}</span> on {new Date(approvedAt!).toLocaleDateString()}</>
                                )}
                                {status === 'REJECTED' && rejectedBy && (
                                    <>Rejected by <span className="font-medium">{rejectedBy.name}</span> on {new Date(rejectedAt!).toLocaleDateString()}</>
                                )}
                            </p>
                        </div>

                        {status === 'PENDING_APPROVAL' && canApprove && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowRejectModal(true)}
                                    leftIcon={<XCircle className="w-4 h-4" />}
                                    className="border-danger-300 text-danger-600 hover:bg-danger-50"
                                >
                                    Reject
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setShowApproveModal(true)}
                                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                                >
                                    Approve
                                </Button>
                            </div>
                        )}
                    </div>

                    {status === 'REJECTED' && rejectionReason && (
                        <div className="mt-3 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-danger-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-danger-900">Rejection Reason:</p>
                                    <p className="text-sm text-danger-700 mt-1">{rejectionReason}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'PENDING_APPROVAL' && !canApprove && (
                        <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-warning-700">
                                    This document requires approval before it can be processed further.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Approve Modal */}
            <Modal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                title="Approve Document"
                size="sm"
            >
                <div className="p-6">
                    <p className="text-neutral-700 mb-6">
                        Are you sure you want to approve this document? This action will allow it to proceed to the next stage.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowApproveModal(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        >
                            Approve
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Reject Document"
                size="sm"
            >
                <div className="p-6">
                    <p className="text-neutral-700 mb-4">
                        Please provide a reason for rejection:
                    </p>
                    <textarea
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={4}
                        placeholder="Enter reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectReason('');
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={isSubmitting || !rejectReason.trim()}
                            isLoading={isSubmitting}
                            leftIcon={<XCircle className="w-4 h-4" />}
                            className="bg-danger-600 hover:bg-danger-700"
                        >
                            Reject
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
