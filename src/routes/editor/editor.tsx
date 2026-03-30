'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAppDispatch, useAppSelector } from '../../state/store.ts';
import { Duration } from 'luxon';
import { Actions } from '../../state/actions';
import { getPathForPoints } from '../../common/splineUtils.ts';
import { get, last } from 'lodash-es';
import { Button } from '../../components/button/button.tsx';
import {
  faDownload,
  faMinus,
  faPlus,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { convertToLegacyProfile } from '../../common/profileUtils.ts';
import Dropzone from 'react-dropzone';

const MAX_TEMP = 250;

const DownloadButton: React.FC<{ className?: string }> = ({ className }) => {
  const profileDraft = useAppSelector((s) => s.editor.profileDraft);

  const onDownload = useCallback(() => {
    if (!profileDraft.heaterPhases.length) return;

    // eslint-disable-next-line
    let jsonFile: any;
    if (import.meta.env.VITE_LEGACY_PROFILES) {
      jsonFile = convertToLegacyProfile(profileDraft);
    } else {
      jsonFile = profileDraft;
    }

    const blob = new Blob([JSON.stringify(jsonFile)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile.json';
    a.click();

    URL.revokeObjectURL(url);
  }, [profileDraft]);

  return (
    <Button iconLeft={faDownload} className={className} onClick={onDownload}>
      Download
    </Button>
  );
};

export const BezierCurveEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const heaterPhases = useAppSelector(
    (s) => s.editor.profileDraft.heaterPhases,
  );
  const fanPhases = useAppSelector((s) => s.editor.profileDraft.fanPhases);
  const [activePhase, setActivePhase] = useState<
    { type: 'heater' | 'fan'; index: number } | undefined
  >(undefined);
  const currentTime = 0;
  const currentTemperature = 0;

  const totalTimeSeconds = Math.max(
    last(heaterPhases)?.time || 0,
    last(fanPhases)?.time || 0,
    60,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingPoint, setDraggingPoint] = useState<
    | {
        type: 'heater' | 'fan';
        index: number;
      }
    | undefined
  >(undefined);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  const padding = { top: 40, right: 40, bottom: 50, left: 60 };
  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = dimensions.height - padding.top - padding.bottom;

  const heaterCurvePath = useMemo(
    () =>
      new Path2D(
        getPathForPoints(
          heaterPhases.map((h) => [h.time, h.temperature]),
          {
            scaleX: {
              domain: [0, totalTimeSeconds],
              range: [padding.left, dimensions.width - padding.right],
            },
            scaleY: {
              domain: [0, 250],
              range: [dimensions.height - padding.bottom, padding.top],
            },
          },
        ),
      ),
    [
      dimensions.height,
      dimensions.width,
      heaterPhases,
      padding.bottom,
      padding.left,
      padding.right,
      padding.top,
      totalTimeSeconds,
    ],
  );

  const fanCurvePath = useMemo(
    () =>
      new Path2D(
        getPathForPoints(
          fanPhases.map((h) => [h.time, h.fanSpeed]),
          {
            scaleX: {
              domain: [0, totalTimeSeconds],
              range: [padding.left, dimensions.width - padding.right],
            },
            scaleY: {
              domain: [0, 100],
              range: [dimensions.height - padding.bottom, padding.top],
            },
          },
        ),
      ),
    [
      dimensions.height,
      dimensions.width,
      fanPhases,
      padding.bottom,
      padding.left,
      padding.right,
      padding.top,
      totalTimeSeconds,
    ],
  );

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(400, rect.width),
          height: Math.max(300, Math.min(500, rect.width * 0.6)),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw the curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = 'hsl(240 10% 10%)';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Helper functions
    const timeToX = (time: number) =>
      padding.left + (time / totalTimeSeconds) * chartWidth;
    const tempToY = (temp: number) =>
      padding.top + chartHeight - (temp / 250) * chartHeight;
    const speedToY = (speed: number) =>
      padding.top + chartHeight - (speed / 100) * chartHeight;

    // Draw grid
    ctx.strokeStyle = 'hsl(240 10% 20%)';
    ctx.lineWidth = 1;

    // Vertical grid lines (time)
    for (let i = 0; i <= Math.floor(totalTimeSeconds / 60); i++) {
      const x = timeToX(i * 60);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // Horizontal grid lines (temperature)
    const tempStep = 25;
    for (let temp = 0; temp <= MAX_TEMP + 20; temp += tempStep) {
      const y = tempToY(temp);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw axes labels
    ctx.fillStyle = 'hsl(0 0% 60%)';
    ctx.font = '12px Geist, sans-serif';
    ctx.textAlign = 'center';

    // Time labels
    for (let i = 0; i <= totalTimeSeconds; i += 30) {
      const x = timeToX(i);
      ctx.fillText(
        Duration.fromDurationLike({ seconds: i }).toFormat('mm:ss'),
        x,
        dimensions.height - 30,
      );
    }

    // Temperature labels
    ctx.textAlign = 'right';
    for (let temp = 0; temp <= MAX_TEMP + 20; temp += tempStep) {
      const y = tempToY(temp);
      ctx.fillText(`${temp}°C`, padding.left - 10, y + 4);
    }

    // Draw Paths
    ctx.strokeStyle = 'rgba(255,255,0, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke(heaterCurvePath);

    ctx.strokeStyle = 'rgb(4 249 255 / 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke(fanCurvePath);

    heaterPhases.forEach((point, index) => {
      const p = {
        x: timeToX(point.time),
        y: tempToY(point.temperature),
      };

      // Draw Points
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle =
        activePhase?.type === 'heater' && index === activePhase.index
          ? 'rgb(255 121 36 / 0.9)'
          : 'rgba(60%, 60%, 90%, 0.9)';
      ctx.fill();
    });

    fanPhases.forEach((point, index) => {
      const p = {
        x: timeToX(point.time),
        y: speedToY(point.fanSpeed),
      };

      // Draw Points
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle =
        activePhase?.type === 'fan' && index === activePhase.index
          ? 'rgb(255 121 36 / 0.9)'
          : 'rgba(60%, 60%, 90%, 0.9)';
      ctx.fill();
    });

    // Draw current time marker
    if (currentTime > 0 && currentTime <= totalTimeSeconds) {
      const currentX = timeToX(currentTime);
      ctx.strokeStyle = 'hsl(140, 60%, 50%)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(currentX, padding.top);
      ctx.lineTo(currentX, padding.top + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw actual temperature point if available
      if (currentTemperature !== undefined) {
        const actualY = tempToY(currentTemperature);
        ctx.beginPath();
        ctx.arc(currentX, actualY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(140, 60%, 50%)';
        ctx.fill();
        ctx.strokeStyle = 'hsl(0 0% 100%)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Axis labels
    ctx.fillStyle = 'hsl(0 0% 70%)';
    ctx.font = '14px Geist, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time', dimensions.width / 2 + 10, dimensions.height - 12);

    ctx.save();
    ctx.translate(15, dimensions.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Temperature (°C)', 0, 0);
    ctx.restore();
  }, [
    dimensions,
    currentTime,
    totalTimeSeconds,
    chartWidth,
    chartHeight,
    padding.left,
    padding.top,
    heaterPhases,
    padding.right,
    padding.bottom,
    heaterCurvePath,
    fanCurvePath,
    fanPhases,
    activePhase,
  ]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const chartTimeSeconds =
        ((x - padding.left) / chartWidth) * totalTimeSeconds;
      const chartTemp = (1 - (y - padding.top) / chartHeight) * 250;
      const chartFan = (1 - (y - padding.top) / chartHeight) * 100;
      let heaterIndex = 0;
      for (const point of heaterPhases) {
        if (
          chartTimeSeconds >= point.time - 5 &&
          chartTimeSeconds <= point.time + 5 &&
          chartTemp >= point.temperature - 5 &&
          chartTemp <= point.temperature + 5
        ) {
          setDraggingPoint({ type: 'heater', index: heaterIndex });
          setActivePhase({ type: 'heater', index: heaterIndex });
          return;
        }
        heaterIndex = heaterIndex + 1;
      }
      let fanIndex = 0;
      for (const point of fanPhases) {
        if (
          chartTimeSeconds >= point.time - 5 &&
          chartTimeSeconds <= point.time + 5 &&
          chartFan >= point.fanSpeed - 5 &&
          chartFan <= point.fanSpeed + 5
        ) {
          setDraggingPoint({ type: 'fan', index: fanIndex });
          setActivePhase({ type: 'fan', index: fanIndex });
          return;
        }
        fanIndex = fanIndex + 1;
      }
    },
    [
      chartHeight,
      chartWidth,
      fanPhases,
      heaterPhases,
      padding.left,
      padding.top,
      totalTimeSeconds,
    ],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (draggingPoint === undefined) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newTime = Math.max(
        0,
        Math.min(
          totalTimeSeconds,
          ((x - padding.left) * totalTimeSeconds) / chartWidth,
        ),
      );
      if (draggingPoint.type === 'heater') {
        const newTemperature = Math.max(
          0,
          Math.min(250, (1 - (y - padding.top) / chartHeight) * 250),
        );
        dispatch(
          Actions.changeHeaterPhase({
            index: draggingPoint.index,
            temperature: newTemperature,
            time: newTime,
          }),
        );
      }

      if (draggingPoint.type === 'fan') {
        const newSpeed = Math.max(
          0,
          Math.min(250, (1 - (y - padding.top) / chartHeight) * 100),
        );
        dispatch(
          Actions.changeFanPhase({
            index: draggingPoint.index,
            fanSpeed: newSpeed,
            time: newTime,
          }),
        );
      }
    },
    [
      draggingPoint,
      totalTimeSeconds,
      padding.left,
      padding.top,
      chartWidth,
      chartHeight,
      dispatch,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setDraggingPoint(undefined);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col w-full gap-4">
      <div className={'flex flex-row justify-end gap-2'}>
        <div className={'flex flex-row'}>
          <Button
            iconRight={faPlus}
            className={'rounded-r-none border-r-0'}
            onClick={() =>
              dispatch(
                Actions.addHeaterPhase({
                  index:
                    activePhase?.type === 'heater'
                      ? activePhase.index
                      : undefined,
                }),
              )
            }
          >
            Heater
          </Button>
          <Button
            iconRight={faMinus}
            className={'rounded-l-none'}
            onClick={() =>
              dispatch(
                Actions.removeHeaterPhase({
                  index:
                    activePhase?.type === 'heater'
                      ? activePhase.index
                      : heaterPhases.length - 1,
                }),
              )
            }
          />
        </div>
        <div className={'flex flex-row'}>
          <Button
            iconRight={faPlus}
            className={'rounded-r-none border-r-0'}
            onClick={() =>
              dispatch(
                Actions.addFanPhase({
                  index:
                    activePhase?.type === 'fan' ? activePhase.index : undefined,
                }),
              )
            }
          >
            Fan
          </Button>
          <Button
            iconRight={faMinus}
            className={'rounded-l-none'}
            onClick={() =>
              dispatch(
                Actions.removeFanPhase({
                  index:
                    activePhase?.type === 'fan'
                      ? activePhase.index
                      : heaterPhases.length - 1,
                }),
              )
            }
          />
        </div>
        <Dropzone
          onDrop={(acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) {
              return;
            }
            const reader = new FileReader();

            reader.onload = (e) => {
              try {
                // eslint-disable-next-line
                const jsonData = JSON.parse(e.target?.result as string) ;
                if (
                  get(jsonData, 'heaterPhases') &&
                  get(jsonData, 'fanPhases')
                ) {
                  dispatch(Actions.prefillProfileDraft(jsonData));
                }
              } catch (error) {
                console.log('upload failed:', error);
              }
            };
            reader.readAsText(file);
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button iconLeft={faUpload} className={'text-center'}>
                Upload
              </Button>
            </div>
          )}
        </Dropzone>
        <DownloadButton />
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="rounded-lg cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <div>Select a Marker to view more information</div>

        {activePhase?.type === 'heater' ? (
          <div>
            Active Point:{' '}
            {Duration.fromDurationLike({
              seconds: heaterPhases[activePhase.index]?.time ?? 0,
            }).toFormat('mm:ss')}
            {', '}
            {heaterPhases[activePhase.index]?.temperature ?? ''} °C
          </div>
        ) : null}
        {activePhase?.type === 'fan' ? (
          <div>
            Active Point:{' '}
            {Duration.fromDurationLike({
              seconds: fanPhases[activePhase.index]?.time ?? 0,
            }).toFormat('mm:ss')}
            {', '}
            {fanPhases[activePhase.index]?.fanSpeed ?? ''} %
          </div>
        ) : null}
      </div>
    </div>
  );
};
