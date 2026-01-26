import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPatch } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { Spinner } from '../ui/Common';

interface Notification {
    id: string;
    type: 'APPROVAL_REQUEST' | 'APPROVAL_GRANTED' | 'APPROVAL_REJECTED' | 'POLICY_VIOLATION' | 'INFO';
    title: string;
    message: string;
    entityId?: string;
    entityType?: 'INVOICE' | 'EXPENSE';
    isRead: boolean;
    createdAt: string;
}

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => apiGet<Notification[]>('/workflow/notifications'),
        enabled: isOpen,
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => apiPatch(`/workflow/notifications/${id}/read`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsReadMutation.mutate(notification.id);
        }

        // Navigate to relevant page
        if (notification.entityType === 'INVOICE' && notification.entityId) {
            navigate(`/invoices/${notification.entityId}/edit`);
        } else if (notification.entityType === 'EXPENSE' && notification.entityId) {
            navigate(`/expenses/${notification.entityId}/edit`);
        }

        onClose();
    };

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 z-40" 
                onClick={onClose}
            />
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-[var(--color-neutral-200)] z-50 max-h-[32rem] flex flex-col">
                <div className="p-4 border-b border-[var(--color-neutral-100)] flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-[var(--color-neutral-900)]">Notifications</h3>
                        {unreadCount > 0 && (
                            <p className="text-xs text-[var(--color-neutral-500)] mt-1">
                                {unreadCount} unread
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-[var(--color-neutral-100)] transition-colors"
                    >
                        <X className="w-4 h-4 text-[var(--color-neutral-400)]" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Spinner />
                        </div>
                    ) : notifications && notifications.length > 0 ? (
                        <div className="divide-y divide-[var(--color-neutral-100)]">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClick={() => handleNotificationClick(notification)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <Bell className="w-12 h-12 text-[var(--color-neutral-300)] mb-3" />
                            <p className="text-[var(--color-neutral-600)] font-medium">No notifications</p>
                            <p className="text-sm text-[var(--color-neutral-500)] mt-1">
                                You're all caught up!
                            </p>
                        </div>
                    )}
                </div>

                {notifications && notifications.length > 0 && (
                    <div className="p-3 border-t border-[var(--color-neutral-100)]">
                        <button
                            onClick={() => {
                                // Mark all as read
                                notifications.forEach(n => {
                                    if (!n.isRead) markAsReadMutation.mutate(n.id);
                                });
                            }}
                            className="w-full text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

interface NotificationItemProps {
    notification: Notification;
    onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'APPROVAL_REQUEST':
                return <AlertCircle className="w-5 h-5 text-[var(--color-warning-500)]" />;
            case 'APPROVAL_GRANTED':
                return <CheckCircle2 className="w-5 h-5 text-[var(--color-success-500)]" />;
            case 'APPROVAL_REJECTED':
                return <X className="w-5 h-5 text-[var(--color-danger-500)]" />;
            case 'POLICY_VIOLATION':
                return <AlertCircle className="w-5 h-5 text-[var(--color-danger-500)]" />;
            default:
                return <Info className="w-5 h-5 text-[var(--color-primary-500)]" />;
        }
    };

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 text-left hover:bg-[var(--color-neutral-50)] transition-colors ${
                !notification.isRead ? 'bg-[var(--color-primary-50)]' : ''
            }`}
        >
            <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${
                            !notification.isRead 
                                ? 'font-semibold text-[var(--color-neutral-900)]' 
                                : 'font-medium text-[var(--color-neutral-700)]'
                        }`}>
                            {notification.title}
                        </p>
                        {!notification.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-[var(--color-primary-500)] rounded-full mt-1.5"></span>
                        )}
                    </div>
                    <p className="text-sm text-[var(--color-neutral-600)] mt-1 line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-500)] mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                </div>
            </div>
        </button>
    );
};
