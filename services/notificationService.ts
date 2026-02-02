
export const notificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  sendNotification: async (title: string, body: string, icon?: string) => {
    const defaultIcon = 'https://cdn-icons-png.flaticon.com/512/628/628283.png';
    
    // Try to use Service Worker for background reliability
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        // Cast the options to any to allow properties like 'vibrate' and 'badge' which might not be in the default NotificationOptions type
        (registration as any).showNotification(title, {
          body,
          icon: icon || defaultIcon,
          badge: defaultIcon,
          vibrate: [200, 100, 200],
          tag: 'floralife-alert' // Prevents notification stacking
        });
        return;
      }
    }

    // Fallback to standard notification if SW not ready
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || defaultIcon,
      });
    }
  }
};
