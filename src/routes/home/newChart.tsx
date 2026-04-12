import * as React from 'react';
import { BezierCurveEditor } from '../editor/editor.tsx';

export const NewRoastingLineChart: React.FC = () => {
  return <BezierCurveEditor draftType={'roast'} showRecording={true} />;
};
