const fs = require('fs')
const path = require('path')

/**
 * EpisoNext Notification Manager
 * Handles sending notifications to users about new episodes and events
 */
class NotificationManager {
    constructor() {
        // Configuration for notifications
        this.config = {
            maxNotifications: 50, // Maximum number of stored notifications
            notificationLifetime: 7 * 24 * 60 * 60 * 1000, // 7 days
            notificationsFilePath: path.join(__dirname, 'notifications.json')
        }

        // Initialize notifications storage
        this.notifications = this.loadNotifications()
    }

    // Load existing notifications from file
    loadNotifications() {
        try {
            if (fs.existsSync(this.config.notificationsFilePath)) {
                const rawData = fs.readFileSync(this.config.notificationsFilePath, 'utf8')
                return JSON.parse(rawData)
            }
            return []
        } catch (error) {
            console.error('Error loading notifications:', error)
            return []
        }
    }

    // Save notifications to file
    saveNotifications() {
        try {
            // Remove expired notifications
            this.cleanupNotifications()

            // Write to file
            fs.writeFileSync(
                this.config.notificationsFilePath, 
                JSON.stringify(this.notifications, null, 2), 
                'utf8'
            )
        } catch (error) {
            console.error('Error saving notifications:', error)
        }
    }

    // Send a new notification
    sendNotification(notificationData) {
        // Create notification object
        const notification = {
            id: this.generateUniqueId(),
            ...notificationData,
            timestamp: Date.now(),
            read: false
        }

        // Add to notifications array
        this.notifications.unshift(notification)

        // Ensure we don't exceed max notifications
        if (this.notifications.length > this.config.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.config.maxNotifications)
        }

        // Save to file
        this.saveNotifications()

        // Optional: Trigger system notification
        this.triggerSystemNotification(notification)

        return notification
    }

    // Generate a unique notification ID
    generateUniqueId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Get all notifications
    getAllNotifications() {
        return this.notifications
    }

    // Get unread notifications
    getUnreadNotifications() {
        return this.notifications.filter(n => !n.read)
    }

    // Mark a notification as read
    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
            notification.read = true
            this.saveNotifications()
        }
    }

    // Remove expired notifications
    cleanupNotifications() {
        const now = Date.now()
        this.notifications = this.notifications.filter(
            notification => now - notification.timestamp < this.config.notificationLifetime
        )
    }

    // Optional: Trigger system notification (platform-specific)
    triggerSystemNotification(notification) {
        // This is a placeholder. Actual implementation would depend on the platform
        // For web: could use Web Notifications API
        // For desktop: could use electron's native notifications
        // For mobile: would use platform-specific notification systems
        console.log('EpisoNext Notification:', notification)
    }

    // Search notifications
    searchNotifications(query) {
        return this.notifications.filter(notification => 
            notification.title.toLowerCase().includes(query.toLowerCase()) ||
            notification.body.toLowerCase().includes(query.toLowerCase())
        )
    }
}

module.exports = NotificationManager 