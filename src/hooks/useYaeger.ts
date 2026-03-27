import { useContext } from 'react';
import { YaegerConnectionContext } from '../context/YaegerConnectionContext.ts';

export const useYaegerContext = () => {
  const context = useContext(YaegerConnectionContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return context;
};

export const useYaegerStatus = () => {
  const context = useContext(YaegerConnectionContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return context.status;
};

export const useYaegerLastMessage = () => {
  const context = useContext(YaegerConnectionContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return context.lastMessage;
};

export const useYaegerSendCommand = () => {
  const context = useContext(YaegerConnectionContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return context.sendCommand;
};

export const useYaegerError = () => {
  const context = useContext(YaegerConnectionContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return context.error;
};
