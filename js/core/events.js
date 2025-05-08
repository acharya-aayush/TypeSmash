/**
 * events.js - Custom event system for TypeSmash
 * Provides a pub/sub pattern for components to communicate
 */

const EventBus = (function() {
    // Store event subscribers
    const subscribers = {};
    
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Function to call when event is triggered
     * @return {Function} - Unsubscribe function
     */
    function subscribe(event, callback) {
        if (!subscribers[event]) {
            subscribers[event] = [];
        }
        
        subscribers[event].push(callback);
        
        // Return function to unsubscribe
        return function unsubscribe() {
            const index = subscribers[event].indexOf(callback);
            if (index !== -1) {
                subscribers[event].splice(index, 1);
            }
            
            // Clean up empty event arrays
            if (subscribers[event].length === 0) {
                delete subscribers[event];
            }
        };
    }
    
    /**
     * Publish an event
     * @param {string} event - Event name
     * @param {*} data - Data to pass to subscribers
     */
    function publish(event, data) {
        if (!subscribers[event]) {
            return;
        }
        
        // Create a copy of subscribers to prevent issues if a subscriber unsubscribes during event handling
        const subscribersCopy = [...subscribers[event]];
        
        // Call each subscriber with the data
        subscribersCopy.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event subscriber for ${event}:`, error);
            }
        });
    }
    
    /**
     * Get count of subscribers for an event
     * @param {string} event - Event name
     * @return {number} - Number of subscribers
     */
    function getSubscriberCount(event) {
        return subscribers[event] ? subscribers[event].length : 0;
    }
    
    /**
     * Clear all subscribers for an event
     * @param {string} event - Event name
     */
    function clearEvent(event) {
        if (subscribers[event]) {
            delete subscribers[event];
        }
    }
    
    /**
     * Clear all subscribers for all events
     */
    function clearAllEvents() {
        Object.keys(subscribers).forEach(event => {
            delete subscribers[event];
        });
    }
    
    // Public API
    return {
        subscribe,
        publish,
        getSubscriberCount,
        clearEvent,
        clearAllEvents
    };
})();

// Export for use in other modules
window.EventBus = EventBus;