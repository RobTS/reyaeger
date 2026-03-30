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
  YaegerPidMessage,
} from '../types/connection.ts';
import type { PidData } from '../types/pid.ts';

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
  const [pidInfo, setPidInfo] = useState<YaegerPidMessage | undefined>();
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
      websocket.send(
        JSON.stringify({
          id: DateTime.now().toMillis(),
          command: 'getPid',
        }),
      );
    };

    websocket.onmessage = (event) => {
      try {
        const message: YaegerMessage = JSON.parse(event.data).data;
        if (message) {
          if (message.type === 'status') {
            setLastMessage({ time: DateTime.now(), message });
          }
          if (message.type === 'pid') {
            console.log('Received message', message);
            setPidInfo(message);
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
      commandsToSend.current = undefined;
      ws?.send(
        JSON.stringify({
          id: DateTime.now().toMillis(),
          command: 'getData',
          ...(cmd ? cmd : {}),
        }),
      );
    }, 1000 / 0.1);

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

  const updatePidInfo = useCallback(
    (pid: PidData) => {
      ws?.send(
        JSON.stringify({
          id: DateTime.now().toMillis(),
          command: 'setPid',
          pidKp: pid.kp,
          pidKi: pid.ki,
          pidKd: pid.kd,
        }),
      );
    },
    [ws],
  );

  const providerProps = useMemo<ConnectionContextType>(() => {
    return {
      status,
      clientId,
      lastMessage,
      sendCommand,
      error,
      pidInfo,
      updatePidInfo: updatePidInfo,
    };
  }, [
    status,
    clientId,
    lastMessage,
    sendCommand,
    error,
    pidInfo,
    updatePidInfo,
  ]);

  return (
    <YaegerConnectionContext.Provider value={providerProps}>
      {children}
    </YaegerConnectionContext.Provider>
  );
};
