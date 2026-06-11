'use client';

import { useEffect, useRef } from 'react';
import { wsService } from '@/services/websocket';

export function useWebSocket(eventType: string, handler: (data: unknown) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = wsService.on(eventType, (data) => handlerRef.current(data));
    return unsubscribe;
  }, [eventType]);
}

export function useWebSocketConnect() {
  useEffect(() => {
    wsService.connect();
    return () => wsService.disconnect();
  }, []);
}
