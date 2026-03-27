import { useYaegerStatus } from '../hooks/useYaeger.ts';
import * as React from 'react';

export const ConnectionStatus: React.FC = () => {
  const status = useYaegerStatus();

  switch (status) {
    case 'connected':
      return <div className={'w-4 h-4 rounded-full bg-green-500'} />;
    case 'error':
      return <div className={'w-4 h-4 rounded-full bg-red-500'} />;
    case 'disconnected':
      return <div className={'w-4 h-4 rounded-full bg-gray-300'} />;
    case 'pending':
      return <div className={'w-4 h-4 rounded-full bg-orange-500'} />;
  }
};
