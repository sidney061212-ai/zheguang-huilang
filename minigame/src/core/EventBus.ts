type EventHandler<TPayload = unknown> = (payload: TPayload) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on<TPayload>(eventName: string, handler: EventHandler<TPayload>): void {
    const handlers = this.handlers.get(eventName) ?? new Set<EventHandler>();
    handlers.add(handler as EventHandler);
    this.handlers.set(eventName, handlers);
  }

  off<TPayload>(eventName: string, handler: EventHandler<TPayload>): void {
    this.handlers.get(eventName)?.delete(handler as EventHandler);
  }

  emit<TPayload>(eventName: string, payload: TPayload): void {
    const handlers = this.handlers.get(eventName);
    if (!handlers) return;
    for (const handler of handlers) {
      handler(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
