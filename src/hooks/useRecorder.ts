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
  };
};

export const useRecorderRecords = () => {
  const context = useContext(RecorderContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerRecorderProvider');
  }
  return context.records;
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
