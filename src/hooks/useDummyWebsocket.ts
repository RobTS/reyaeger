import { useEffect, useState } from 'react';
import type { YaegerMessage } from '../api/types.ts';
import { DateTime } from 'luxon';

export type WsStatus = 'disconnected' | 'error' | 'pending' | 'connected';

export const useDummyWebsocket = ({
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
  const [ws, setWs] = useState<WebSocket | undefined>();
  const [lastMessage, setLastMessage] = useState<
    { message: YaegerMessage; time: DateTime } | undefined
  >();
  const [error] = useState<Error | undefined>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWs({
      send: () => {},
    } as unknown as WebSocket);

    let etVal = 20;
    let btVal = 20;

    const interval = setInterval(() => {
      btVal = Math.max(btVal + (Math.random() - 0.4) * 0.5, 0);
      etVal = Math.max(etVal + (Math.random() - 0.4) * 0.5, 0);

      setLastMessage({
        time: DateTime.now(),
        message: {
          ET: etVal,
          BT: btVal,
          FanVal: 50,
          BurnerVal: 50,
          id: 1,
          Amb: 0,
        },
      });
    }, 1000 / 60);

    return () => {
      clearInterval(interval);
    };
  }, [host]);

  return {
    clientId: 1,
    status: 'connected',
    lastMessage,
    sendCommand: (command: { BurnerVal: number; FanVal: number }) => {
      ws?.send(JSON.stringify(command));
    },
    error,
  };
};
