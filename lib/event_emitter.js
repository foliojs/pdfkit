class EventEmitter {
  constructor() {
    this._listeners = Object.create(null);
  }

  on(event, listener) {
    (this._listeners[event] || (this._listeners[event] = [])).push(listener);
    return this;
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }

  off(event, listener) {
    const listeners = this._listeners[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) listeners.splice(index, 1);
    }
    return this;
  }

  emit(event, ...args) {
    const listeners = this._listeners[event];
    if (!listeners) return false;
    for (const listener of listeners.slice()) listener(...args);
    return listeners.length > 0;
  }
}

export default EventEmitter;
