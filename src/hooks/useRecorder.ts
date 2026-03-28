import { useContext } from 'react';
import { RecorderContext } from '../context/RecorderContext.ts';

export const useRecorderCommands = () => {
  const context = useContext(RecorderContext);
  if (context === undefined) {
    throw new Error('useRecorder must be used within a YaegerRecorderProvider');
  }
  return {
    stop: context.stop,
    start: context.start,
    clear: context.clear,
    addEvent: context.addEvent,
  };
};

export const useRecorderRecords = () => {
  const context = useContext(RecorderContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerRecorderProvider');
  }
  return context.records;
};

export const useRecorderEvents = () => {
  const context = useContext(RecorderContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerRecorderProvider');
  }
  return context.events;
};

export const useRecorderStatus = () => {
  const context = useContext(RecorderContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerRecorderProvider');
  }
  return context.recording;
};

export const useRecorderStartDate = () => {
  const context = useContext(RecorderContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerRecorderProvider');
  }
  return context.startDate;
};
