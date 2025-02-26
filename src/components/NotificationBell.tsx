import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';

// Define a notification type for better type safety and organization
interface Notification {
  id: string;
  title: string;
  description: string;
  time: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export function NotificationBell() {
  // Sample notifications data with different types and states
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New reservation',
      description: 'John Doe has made a new reservation',
      time: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Checkout reminder',
      description: 'Room 204 checkout is in 30 minutes',
      time: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'Payment confirmed',
      description: 'Payment of $350 has been processed',
      time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      type: 'success'
    }
  ]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Track unread notification count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle notification panel toggling with animation
  const toggleNotifications = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    setIsOpen(!isOpen);
    
    // Mark as read when opening the panel
    if (!isOpen && unreadCount > 0) {
      // We don't mark all as read immediately to allow the user to see what's new
      setTimeout(() => {
        // Add a subtle visual indicator that items are being marked as read
        toast.info('Marking notifications as read...', { autoClose: 1500 });
      }, 2000);
    }
  };

  // Handle marking a single notification as read
  const markAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    toast.success('Notification marked as read');
  };

  // Handle dismissing a single notification
  const dismissNotification = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification dismissed');
  };

  // Handle clearing all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setIsOpen(false);
    toast.success('All notifications cleared!');
  };

  // Simulate receiving a new notification (for demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance of getting a new notification every 30 seconds
      if (Math.random() < 0.1) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: 'New guest arrived',
          description: 'A new guest has checked in to room ' + Math.floor(Math.random() * 500),
          time: new Date(),
          read: false,
          type: 'info'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        toast.info('New notification received');
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper function to format time (e.g., "5m ago", "2h ago")
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Helper function to get color based on notification type
  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={toggleNotifications}
        className="relative p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label={`${unreadCount} unread notifications`}
      >
        <Bell 
          className={`w-6 h-6 text-gray-300 transition-all duration-300 ${
            isAnimating ? 'animate-shake' : ''
          } ${unreadCount > 0 ? 'text-blue-400' : 'text-gray-300'}`} 
        />
        
        {/* Notification Badge with Count */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {/* Notification Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-gray-100">Notifications</h3>
              <button 
                onClick={clearAllNotifications}
                className="text-sm text-gray-400 hover:text-white transition-colors"
                disabled={notifications.length === 0}
              >
                Clear all
              </button>
            </div>
            
            {/* Notification List */}
            {notifications.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 border-b border-gray-800 hover:bg-gray-800 transition-colors ${!notification.read ? 'bg-gray-800/40' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Notification Type Indicator */}
                      <div className={`w-2 h-2 mt-2 rounded-full ${getTypeColor(notification.type)}`} />
                      
                      {/* Notification Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-200">{notification.title}</h4>
                          <span className="text-xs text-gray-500">{formatTime(notification.time)}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{notification.description}</p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => markAsRead(notification.id, e)}
                            className="p-1 rounded-full text-gray-500 hover:text-blue-400 hover:bg-gray-700"
                            aria-label="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => dismissNotification(notification.id, e)}
                          className="p-1 rounded-full text-gray-500 hover:text-red-400 hover:bg-gray-700"
                          aria-label="Dismiss notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            )}
            
            {/* Panel Footer */}
            <div className="p-3 border-t border-gray-800 text-center">
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}