import { useEffect, useState } from 'react';
import type { YaegerMessage } from '../api/types.ts';
import { DateTime } from 'luxon';

export type WsStatus = 'disconnected' | 'error' | 'pending' | 'connected';

export const useWebsocket = ({
  host,
}: {
  host: string;
}): {
  status: WsStatus;
  clientId: number | undefined;
  lastMessage: { message: YaegerMessage; time: DateTime } | undefined;
  sendCommand: (command: { BurnerVal: number; FanVal: number }) => void;
  error: Error | undefined;
} => {
  const [clientId, setClientId] = useState<number | undefined>();
  const [ws, setWs] = useState<WebSocket | undefined>();
  const [status, setStatus] = useState<WsStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<
    { message: YaegerMessage; time: DateTime } | undefined
  >();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    const websocket = new WebSocket(`ws://${host}:8080/ws`);

    websocket.onopen = () => {
      console.log('WebSocket is connected');
      const id = Math.floor(Math.random() * 1000);
      setWs(websocket);
      setClientId(id);
      setStatus('connected');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const message: YaegerMessage = data.data;
        if (message != undefined) {
          setLastMessage({ time: DateTime.now(), message: message });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      setStatus('error');
      setError(error as unknown as Error);
    };

    websocket.onclose = () => {
      console.log('WebSocket is closed');
    };

    return () => {
      websocket.close();
    };
  }, [host]);

  return {
    clientId,
    status,
    lastMessage,
    sendCommand: (command: { BurnerVal: number; FanVal: number }) => {
      if (status !== 'connected')
        throw new Error('WebSocket is not  connected');
      ws?.send(JSON.stringify(command));
    },
    error,
  };
};
