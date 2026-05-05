import { useYaegerLastMessage, useYaegerStatus } from '../hooks/useYaeger.ts';
import * as React from 'react';
import classNames from 'classnames';

export const ConnectionStatus: React.FC = () => {
  const status = useYaegerStatus();

  switch (status) {
    case 'connected':
      return (
        <div
          title={'Websocket Status'}
          className={'w-4 h-4 rounded-full bg-green-500'}
        />
      );
    case 'error':
      return (
        <div
          title={'Websocket Status'}
          className={'w-4 h-4 rounded-full bg-red-500'}
        />
      );
    case 'disconnected':
      return (
        <div
          title={'Websocket Status'}
          className={'w-4 h-4 rounded-full bg-gray-300'}
        />
      );
    case 'pending':
      return (
        <div
          title={'Websocket Status'}
          className={'w-4 h-4 rounded-full bg-orange-500'}
        />
      );
  }
};

export const WifiStatus: React.FC = () => {
  const msg = useYaegerLastMessage();
  const wifiStrength = msg?.message.wifiStrength;

  let strength = 0;

  if (!wifiStrength) {
    strength = 0;
  } else if (wifiStrength >= -46) {
    strength = 4;
  } else if (wifiStrength >= -60) {
    strength = 3;
  } else if (wifiStrength >= -72) {
    strength = 2;
  } else if (wifiStrength >= -80) {
    strength = 1;
  } else if (wifiStrength >= -90) {
    strength = 0;
  }

  return (
    <div title={'Wifi Status'} className={'flex flex-col gap-0.5 items-center'}>
      <div
        className={classNames(
          strength >= 4 ? 'bg-green-400' : 'bg-gray-400',
          'h-1 w-4',
        )}
      />
      <div
        className={classNames(
          strength >= 3 ? 'bg-green-400' : 'bg-gray-400',
          'h-1 w-3',
        )}
      />
      <div
        className={classNames(
          strength >= 2 ? 'bg-green-400' : 'bg-gray-400',
          'h-1 w-2',
        )}
      />
      <div
        className={classNames(
          strength >= 1 ? 'bg-green-400' : 'bg-gray-400',
          'h-1 w-1',
        )}
      />
    </div>
  );
};
