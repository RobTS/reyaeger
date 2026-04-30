import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type ConnectionContextType,
  type WsStatus,
  type YaegerCommand,
  YaegerConnectionContext,
} from './YaegerConnectionContext.ts';
import { DateTime } from 'luxon';
import type {
  YaegerMessage,
  YaegerMessageWrapper,
  YaegerPreferences,
  YaegerPreferencesMessage,
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
  const wsRef = useRef<WebSocket | undefined>(undefined);
  const [status, setStatus] = useState<WsStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<
    YaegerMessageWrapper | undefined
  >();
  const [preferences, setPreferences] = useState<
    YaegerPreferencesMessage | undefined
  >();
  const [error, setError] = useState<Error | undefined>();
  const commandsToSend = useRef<YaegerCommand | undefined>(undefined);

  useEffect(() => {
    const websocket = new WebSocket(`ws://${host}/ws`);

    websocket.onopen = () => {
      console.log('WebSocket is connected');
      const id = Math.floor(Math.random() * 1000);
      wsRef.current = websocket;
      setClientId(id);
      setStatus('connected');
      websocket.send(
        JSON.stringify({
          id: DateTime.now().toMillis(),
          command: 'getPreferences',
        }),
      );
    };

    websocket.onmessage = (event) => {
      try {
        const message: YaegerMessage = JSON.parse(event.data).data;
        if (message) {
          if (message.type === 'status') {
            //console.log('Received message', message);
            setLastMessage({ time: DateTime.now(), message });
          }
          if (message.type === 'preferences') {
            console.log('Received message', message);
            setPreferences(message);
          }
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
      if (!cmd) return;
      commandsToSend.current = undefined;
      const message = {
        id: DateTime.now().toMillis(),
        command: 'getData',
        ...(cmd ? cmd : {}),
      };
      //console.log('Sending message', message);
      wsRef.current?.send(JSON.stringify(message));
    }, 1000 / 10);

    return () => {
      clearInterval(interval);
    };
  }, [host, status]);

  const sendCommand = useCallback((command: YaegerCommand) => {
    commandsToSend.current = {
      ...(commandsToSend.current || {}),
      ...command,
    };
  }, []);

  const savePreferences = useCallback(
    (preferences: Partial<YaegerPreferences>) => {
      wsRef.current?.send(
        JSON.stringify({
          id: DateTime.now().toMillis(),
          command: 'setPreferences',
          ...preferences,
        }),
      );
    },
    [],
  );

  const startAutotune = useCallback(() => {
    wsRef.current?.send(
      JSON.stringify({
        id: DateTime.now().toMillis(),
        command: 'autotune',
      }),
    );
  }, [wsRef]);

  const providerProps = useMemo<ConnectionContextType>(() => {
    return {
      status,
      clientId,
      lastMessage,
      sendCommand,
      error,
      preferences,
      setPreferences: savePreferences,
      startAutotune,
    };
  }, [
    status,
    clientId,
    lastMessage,
    sendCommand,
    error,
    preferences,
    savePreferences,
    startAutotune,
  ]);

  return (
    <YaegerConnectionContext.Provider value={providerProps}>
      {children}
    </YaegerConnectionContext.Provider>
  );
};
