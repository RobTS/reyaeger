import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type ConnectionContextType,
  type WsStatus,
  YaegerConnectionContext,
} from './YaegerConnectionContext.ts';
import { DateTime } from 'luxon';
import type {
  YaegerMessage,
  YaegerMessageWrapper,
} from '../types/connection.ts';

type Props = {
  host: string;
  children: React.ReactNode;
};

export const YaegerConnectionProvider: React.FC<Props> = ({
  host,
  children,
}) => {
  const [clientId, setClientId] = useState<number | undefined>();
  const [ws, setWs] = useState<WebSocket | undefined>();
  const [status, setStatus] = useState<WsStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<
    YaegerMessageWrapper | undefined
  >();
  const [error, setError] = useState<Error | undefined>();
  const commandsToSend = useRef<
    { BurnerVal?: number; FanVal?: number } | undefined
  >(undefined);

  useEffect(() => {
    const websocket = new WebSocket(`ws://${host}/ws`);

    websocket.onopen = () => {
      console.log('WebSocket is connected');
      const id = Math.floor(Math.random() * 1000);
      setWs(websocket);
      setClientId(id);
      setStatus('connected');
    };

    websocket.onmessage = (event) => {
      try {
        const message: YaegerMessage = JSON.parse(event.data).data;
        if (message != undefined) {
          //console.log('Received message', message);
          setLastMessage({ time: DateTime.now(), message });
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

  useEffect(() => {
    if (status !== 'connected') return;
    const interval = setInterval(() => {
      const cmd = commandsToSend.current;
      commandsToSend.current = undefined;
      ws?.send(
        JSON.stringify({
          id: DateTime.now().toMillis(),
          command: 'getData',
          ...(cmd ? cmd : {}),
        }),
      );
    }, 1000 / 10);

    return () => {
      clearInterval(interval);
    };
  }, [host, status, ws]);

  const sendCommand = useCallback(
    (command: { BurnerVal?: number; FanVal?: number }) => {
      commandsToSend.current = {
        ...(commandsToSend.current || {}),
        ...command,
      };
    },
    [],
  );

  const providerProps = useMemo<ConnectionContextType>(() => {
    return {
      status,
      clientId,
      lastMessage,
      sendCommand,
      error,
    };
  }, [status, clientId, lastMessage, sendCommand, error]);

  return (
    <YaegerConnectionContext.Provider value={providerProps}>
      {children}
    </YaegerConnectionContext.Provider>
  );
};
