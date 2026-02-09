'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/lib/services';
import { Notification } from '@/types/industry';
import Link from 'next/link';

interface NotificationBellProps {
    className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications({ limit: 10 });
            if (response.success) {
                setNotifications(response.data);
                setUnreadCount(response.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message': return '💬';
            case 'approval': return '✅';
            case 'rejection': return '❌';
            case 'deal_confirmed': return '🎉';
            case 'enquiry': return '📩';
            case 'status_change': return '🔄';
            default: return '🔔';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className={`notification-bell-container ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="notification-bell-button"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
                <svg className="notification-bell-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="notification-overlay" onClick={() => setIsOpen(false)} />
                    <div className="notification-dropdown">
                        <div className="notification-header">
                            <h3>Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="mark-all-read-btn"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {loading ? (
                                <div className="notification-loading">Loading...</div>
                            ) : notifications.length === 0 ? (
                                <div className="notification-empty">
                                    <span>🔔</span>
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                        onClick={() => handleMarkAsRead(notification._id)}
                                    >
                                        <span className="notification-type-icon">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="notification-content">
                                            <p className="notification-title">{notification.title}</p>
                                            {notification.body && (
                                                <p className="notification-body">{notification.body}</p>
                                            )}
                                            <span className="notification-time">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                        </div>
                                        {notification.actionUrl && (
                                            <Link
                                                href={notification.actionUrl}
                                                className="notification-action"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                →
                                            </Link>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <Link
                            href="/notifications"
                            className="notification-view-all"
                            onClick={() => setIsOpen(false)}
                        >
                            View all notifications
                        </Link>
                    </div>
                </>
            )}

            <style jsx>{`
                .notification-bell-container {
                    position: relative;
                }

                .notification-bell-button {
                    position: relative;
                    padding: 0.5rem;
                    border-radius: 50%;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .notification-bell-button:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .notification-bell-icon {
                    width: 24px;
                    height: 24px;
                    color: white;
                }

                .notification-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 4px;
                    font-size: 11px;
                    font-weight: 600;
                    line-height: 18px;
                    text-align: center;
                    color: white;
                    background: #ef4444;
                    border-radius: 9px;
                }

                .notification-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 40;
                }

                .notification-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    width: 360px;
                    max-height: 480px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    z-index: 50;
                    overflow: hidden;
                }

                .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .notification-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .mark-all-read-btn {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                    color: #6366f1;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }

                .mark-all-read-btn:hover {
                    text-decoration: underline;
                }

                .notification-list {
                    max-height: 360px;
                    overflow-y: auto;
                }

                .notification-loading,
                .notification-empty {
                    padding: 2rem;
                    text-align: center;
                    color: #6b7280;
                }

                .notification-empty span {
                    font-size: 2rem;
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .notification-item {
                    display: flex;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-bottom: 1px solid #f3f4f6;
                }

                .notification-item:hover {
                    background: #f9fafb;
                }

                .notification-item.unread {
                    background: #eff6ff;
                }

                .notification-item.unread:hover {
                    background: #dbeafe;
                }

                .notification-type-icon {
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .notification-content {
                    flex: 1;
                    min-width: 0;
                }

                .notification-title {
                    margin: 0 0 0.25rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #1f2937;
                }

                .notification-body {
                    margin: 0 0 0.25rem;
                    font-size: 0.75rem;
                    color: #6b7280;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .notification-time {
                    font-size: 0.7rem;
                    color: #9ca3af;
                }

                .notification-action {
                    display: flex;
                    align-items: center;
                    color: #6366f1;
                    font-size: 1.25rem;
                    font-weight: bold;
                    text-decoration: none;
                }

                .notification-view-all {
                    display: block;
                    padding: 0.75rem;
                    text-align: center;
                    font-size: 0.875rem;
                    color: #6366f1;
                    text-decoration: none;
                    border-top: 1px solid #e5e7eb;
                }

                .notification-view-all:hover {
                    background: #f9fafb;
                }
            `}</style>
        </div>
    );
}
