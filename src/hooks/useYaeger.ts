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

export const useYaegerCommands = () => {
  const context = useContext(YaegerConnectionContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return {
    sendCommand: context.sendCommand,
    setPreferences: context.setPreferences,
  };
};

export const useYaegerError = () => {
  const context = useContext(YaegerConnectionContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return context.error;
};

export const useYaegerPreferences = () => {
  const context = useContext(YaegerConnectionContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return context.preferences;
};
