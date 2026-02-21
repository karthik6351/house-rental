'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, MessageCircle, Handshake, Star, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/lib/services';
import { AnimatePresence, motion } from 'framer-motion';
import { Notification } from '@/types/industry';

export default function NotificationBell({ className }: { className?: string }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) fetchUnreadCount();
        const interval = setInterval(() => { if (user) fetchUnreadCount(); }, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const fetchUnreadCount = async () => {
        try {
            const res = await notificationService.getUnreadCount();
            setUnreadCount(res.data.count);
        } catch (e) { /* silent */ }
    };

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await notificationService.getNotifications({ limit: 20 });
            setNotifications(res.data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) fetchNotifications();
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { /* silent */ }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (e) { /* silent */ }
    };

    const deleteNotification = async (id: string) => {
        try {
            await notificationService.deleteNotification(id);
            const n = notifications.find(n => n._id === id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (n && !n.read) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { /* silent */ }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': case 'new_message': return <MessageCircle size={16} className="text-primary-500" />;
            case 'deal': case 'deal_confirmed': case 'deal_cancelled': return <Handshake size={16} className="text-emerald-500" />;
            case 'review': case 'new_review': return <Star size={16} className="text-amber-500" />;
            default: return <Info size={16} className="text-gray-500" />;
        }
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
        if (diff < 60) return 'now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    return (
        <div className="relative" ref={panelRef}>
            <button onClick={handleOpen} className={`relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}>
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce-gentle">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40 md:hidden bg-black/30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-x-3 bottom-20 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-96 bg-white dark:bg-[#1a1a1f] rounded-2xl shadow-float border border-gray-200 dark:border-gray-800 z-50 overflow-hidden max-h-[60vh] md:max-h-[480px] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800/50">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline underline-offset-4">
                                            Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
                                        <X size={16} className="text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="overflow-y-auto flex-1">
                                {isLoading ? (
                                    <div className="p-4 space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex gap-3">
                                                <div className="skeleton w-8 h-8 rounded-lg shrink-0" />
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="skeleton h-3.5 w-2/3" />
                                                    <div className="skeleton h-3 w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <Bell className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">All caught up!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50 dark:divide-gray-800/30">
                                        {notifications.map(notification => (
                                            <div
                                                key={notification._id}
                                                className={`flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group relative ${!notification.read ? 'bg-primary-50/50 dark:bg-primary-900/8' : ''}`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${!notification.read ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs leading-snug ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {notification.title || notification.body}
                                                    </p>
                                                    {notification.title && notification.body && notification.body !== notification.title && (
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
                                                    )}
                                                    <span className="text-[10px] text-gray-400 mt-1 block">{getTimeAgo(notification.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notification.read && (
                                                        <button onClick={() => markAsRead(notification._id)} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" title="Mark as read">
                                                            <Check size={14} className="text-gray-400" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => deleteNotification(notification._id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/15" title="Delete">
                                                        <Trash2 size={14} className="text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
