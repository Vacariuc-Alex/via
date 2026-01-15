type Handler = (...args: any[]) => void;

export function createEventEmitter() {
    const listeners = new Map<string, Set<Handler>>();

    function on(event: string, handler: Handler) {
        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }
        listeners.get(event)!.add(handler);
    }

    function off(event: string, handler: Handler) {
        listeners.get(event)?.delete(handler);
    }

    function emit(event: string, ...args: any[]) {
        listeners.get(event)?.forEach(fn => fn(...args));
    }

    return { on, off, emit };
}
