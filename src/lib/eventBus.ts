import { AppEvent } from '@/types';

type EventCallback = (event: AppEvent) => void;

class EventBus {
  private subscribers: Map<string, EventCallback[]> = new Map();

  subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        this.subscribers.set(
          eventType,
          callbacks.filter((cb) => cb !== callback)
        );
      }
    };
  }

  publish(event: AppEvent): void {
    const callbacks = this.subscribers.get(event.type) || [];
    callbacks.forEach((cb) => cb(event));

    // Also trigger wildcard subscribers
    const wildcardCallbacks = this.subscribers.get('*') || [];
    wildcardCallbacks.forEach((cb) => cb(event));
  }
}

export const eventBus = new EventBus();
