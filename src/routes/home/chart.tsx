import {
  useRecorderEvents,
  useRecorderRecords,
} from '../../hooks/useRecorder.ts';
import * as React from 'react';
import { LineChart } from '../../components/chart/LineChart.tsx';

export const RoastingLineChart: React.FC = () => {
  const records = useRecorderRecords();
  const events = useRecorderEvents();
  return <LineChart records={records} events={events} />;
};
