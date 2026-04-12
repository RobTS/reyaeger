'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAppDispatch, useAppSelector } from '../../state/store.ts';
import { DateTime, Duration } from 'luxon';
import { Actions } from '../../state/actions';
import {
  calculateRoR,
  getPathForPoints,
  movingAverage,
} from '../../common/splineUtils.ts';
import { get, last } from 'lodash-es';
import { Button } from '../../components/button/button.tsx';
import {
  faDownload,
  faFan,
  faFire,
  faMinus,
  faPlus,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import Dropzone from 'react-dropzone';
import { convertLegacyToNxProfile } from '../../common/profileUtils.ts';
import {
  useRecorderEvents,
  useRecorderRecords,
  useRecorderStartDate,
} from '../../hooks/useRecorder.ts';
import { useYaegerLastMessage } from '../../hooks/useYaeger.ts';
import {
  percentToY,
  tempToY,
  timeToX,
  xToTime,
  yToPercent,
  yToTemp,
} from '../../common/canvasUtils.ts';

const MAX_TEMP = 250;
const MAX_PERCENT = 100;

const DownloadButton: React.FC<{ className?: string }> = ({ className }) => {
  const profileDraft = useAppSelector((s) => s.editor.editorDraft);

  const onDownload = useCallback(() => {
    if (!profileDraft.heaterPhases.length) return;

    // eslint-disable-next-line
    let jsonFile = {
      name: profileDraft.name,
      heaterPhases: profileDraft.heaterPhases,
      fanPhases: profileDraft.fanPhases,
      createdAt: profileDraft.createdAt,
    };

    const blob = new Blob([JSON.stringify(jsonFile)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `profile_${profileDraft.name.replace(/[^0-9a-zA-Z _-]/gi, '').toLowerCase()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }, [profileDraft]);

  return (
    <Button iconLeft={faDownload} className={className} onClick={onDownload}>
      Download
    </Button>
  );
};

type Props = { showRecording?: boolean; draftType: 'editor' | 'roast' };

export const BezierCurveEditor: React.FC<Props> = ({
  showRecording,
  draftType,
}) => {
  const dispatch = useAppDispatch();
  const {
    heaterPhases,
    fanPhases,
    referenceFanPhases,
    referenceHeaterPhases,
    name,
  } = useAppSelector((s) =>
    draftType === 'editor' ? s.editor.editorDraft : s.editor.roastDraft,
  );
  const [activePhase, setActivePhase] = useState<
    { type: 'heater' | 'fan'; index: number } | undefined
  >(undefined);
  const lastMessage = useYaegerLastMessage();
  const records = useRecorderRecords();
  const events = useRecorderEvents();
  const start = useRecorderStartDate();
  const currentTime = 0;
  const currentTemperature = 0;

  const totalTimeSeconds = Math.max(
    last(heaterPhases)?.time || 0,
    last(fanPhases)?.time || 0,
    10 * 60,
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
  const [cursorPosition, setCursorPosition] = useState<
    | {
        x: number;
        y: number;
      }
    | undefined
  >(undefined);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  const padding = useMemo(
    () => ({ top: 40, right: 60, bottom: 80, left: 60 }),
    [],
  );
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
              domain: [0, MAX_TEMP],
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
    [dimensions, fanPhases, padding, totalTimeSeconds],
  );

  const dataPaths = useMemo(():
    | {
        etPath?: Path2D;
        btPath?: Path2D;
        fanPath?: Path2D;
        heaterPath?: Path2D;
        btRorPath?: Path2D;
        etRorPath?: Path2D;
      }
    | undefined => {
    if (!showRecording) return;
    if (!start) return;
    const etValues: [number, number][] = [];
    const btValues: [number, number][] = [];
    const fanValues: [number, number][] = [];
    const heaterValues: [number, number][] = [];

    records.forEach((record) => {
      const time = record.time.diff(start).as('seconds');
      etValues.push([time, record.message.ET]);
      btValues.push([time, record.message.BT]);
      fanValues.push([time, record.message.FanVal]);
      heaterValues.push([time, record.message.BurnerVal]);
    });

    const etPath = new Path2D(
      getPathForPoints(etValues, {
        scaleX: {
          domain: [0, totalTimeSeconds],
          range: [padding.left, dimensions.width - padding.right],
        },
        scaleY: {
          domain: [0, MAX_TEMP],
          range: [dimensions.height - padding.bottom, padding.top],
        },
        curve: 'catmullRom',
      }),
    );
    const btPath = new Path2D(
      getPathForPoints(btValues, {
        scaleX: {
          domain: [0, totalTimeSeconds],
          range: [padding.left, dimensions.width - padding.right],
        },
        scaleY: {
          domain: [0, MAX_TEMP],
          range: [dimensions.height - padding.bottom, padding.top],
        },
        curve: 'catmullRom',
      }),
    );
    const etRorPath = new Path2D(
      getPathForPoints(movingAverage(calculateRoR(etValues), 5), {
        scaleX: {
          domain: [0, totalTimeSeconds],
          range: [padding.left, dimensions.width - padding.right],
        },
        scaleY: {
          domain: [0, 5],
          range: [dimensions.height - padding.bottom, padding.top],
        },
        curve: 'basis',
      }),
    );
    const btRorPath = new Path2D(
      getPathForPoints(movingAverage(calculateRoR(btValues), 5), {
        scaleX: {
          domain: [0, totalTimeSeconds],
          range: [padding.left, dimensions.width - padding.right],
        },
        scaleY: {
          domain: [0, 5],
          range: [dimensions.height - padding.bottom, padding.top],
        },
        curve: 'basis',
      }),
    );
    const fanPath = new Path2D(
      getPathForPoints(fanValues, {
        scaleX: {
          domain: [0, totalTimeSeconds],
          range: [padding.left, dimensions.width - padding.right],
        },
        scaleY: {
          domain: [0, 100],
          range: [dimensions.height - padding.bottom, padding.top],
        },
        curve: 'catmullRom',
      }),
    );
    const heaterPath = new Path2D(
      getPathForPoints(movingAverage(heaterValues, 5), {
        scaleX: {
          domain: [0, totalTimeSeconds],
          range: [padding.left, dimensions.width - padding.right],
        },
        scaleY: {
          domain: [0, 100],
          range: [dimensions.height - padding.bottom, padding.top],
        },
        curve: 'basis',
      }),
    );
    return { etPath, btPath, fanPath, heaterPath, btRorPath, etRorPath };
  }, [dimensions, padding, records, showRecording, start, totalTimeSeconds]);

  const referenceHeaterCurvePath = useMemo(
    () =>
      referenceHeaterPhases
        ? new Path2D(
            getPathForPoints(
              referenceHeaterPhases.map((h) => [h.time, h.temperature]),
              {
                scaleX: {
                  domain: [0, totalTimeSeconds],
                  range: [padding.left, dimensions.width - padding.right],
                },
                scaleY: {
                  domain: [0, MAX_TEMP],
                  range: [dimensions.height - padding.bottom, padding.top],
                },
              },
            ),
          )
        : undefined,
    [dimensions, padding, referenceHeaterPhases, totalTimeSeconds],
  );

  const referenceFanCurvePath = useMemo(
    () =>
      referenceFanPhases
        ? new Path2D(
            getPathForPoints(
              referenceFanPhases.map((h) => [h.time, h.fanSpeed]),
              {
                scaleX: {
                  domain: [0, totalTimeSeconds],
                  range: [padding.left, dimensions.width - padding.right],
                },
                scaleY: {
                  domain: [0, MAX_PERCENT],
                  range: [dimensions.height - padding.bottom, padding.top],
                },
              },
            ),
          )
        : undefined,
    [
      dimensions.height,
      dimensions.width,
      padding.bottom,
      padding.left,
      padding.right,
      padding.top,
      referenceFanPhases,
      totalTimeSeconds,
    ],
  );

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.width * 0.4,
        });
      }
    };

    setTimeout(() => {
      updateDimensions();
    }, 0);

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

    // Draw grid
    ctx.strokeStyle = 'hsl(240 10% 20%)';
    ctx.lineWidth = 1;

    // Vertical grid lines (time)
    for (let i = 0; i <= Math.floor(totalTimeSeconds / 60); i++) {
      const x = timeToX(i * 60, totalTimeSeconds, dimensions, padding);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // Horizontal grid lines (temperature)
    const tempStep = 25;
    for (let temp = 0; temp <= MAX_TEMP; temp += tempStep) {
      const y = tempToY(temp, MAX_TEMP, dimensions, padding);
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
      const x = timeToX(i, totalTimeSeconds, dimensions, padding);
      ctx.fillText(
        Duration.fromDurationLike({ seconds: i }).toFormat('mm:ss'),
        x,
        dimensions.height - padding.bottom + 20,
      );
    }

    // Temperature labels
    ctx.textAlign = 'right';
    for (let temp = 0; temp <= MAX_TEMP + 20; temp += tempStep) {
      const y = tempToY(temp, MAX_TEMP, dimensions, padding);
      ctx.fillText(`${temp}°C`, padding.left - 10, y + 4);
    }

    // Percentage labels
    const percentStep = 10;
    ctx.textAlign = 'left';
    for (let percent = 0; percent <= 100; percent += percentStep) {
      const y = percentToY(percent, MAX_PERCENT, dimensions, padding);
      ctx.fillText(`${percent}%`, dimensions.width - padding.right + 10, y + 4);
    }

    // LEGEND
    const legendItems: { color: string; name: string }[] = [
      {
        color: 'rgba(255,255,0, 0.5)',
        name: 'Profile Temp',
      },
      {
        color: 'rgb(0 197 202)',
        name: 'Profile Fan',
      },
      {
        color: 'rgb(255 121 36 / 0.9)',
        name: 'Heater Power',
      },
      {
        color: 'rgb(207 213 255 / 0.84)',
        name: 'Fan Power',
      },
      {
        color: 'rgb(255 4 92 / 0.84)',
        name: 'Exhaust Temp',
      },
      {
        color: 'rgb(255 218 80 / 0.84)',
        name: 'Bean Temp',
      },
      {
        color: 'rgb(35 255 52 / 0.4)',
        name: 'ET RoR',
      },
      {
        color: 'rgb(166 31 255 / 0.6)',
        name: 'BT RoR',
      },
    ];

    legendItems.forEach(({ name, color }, i) => {
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(
        `■ ${name}`,
        dimensions.width / 2 + (i - (legendItems.length - 1) / 2) * 100,
        dimensions.height - padding.bottom + 60,
      );
    });

    // Draw Paths
    if (dataPaths?.etRorPath) {
      ctx.strokeStyle = 'rgb(35 255 52 / 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke(dataPaths.etRorPath);
    }

    if (dataPaths?.btRorPath) {
      ctx.strokeStyle = 'rgb(166 31 255 / 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke(dataPaths.btRorPath);
    }

    if (referenceHeaterCurvePath) {
      ctx.strokeStyle = 'rgba(255,255,0, 0.2)';
      ctx.lineWidth = 3;
      ctx.stroke(referenceHeaterCurvePath);
    }

    ctx.strokeStyle = 'rgba(255,255,0, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke(heaterCurvePath);

    if (referenceFanCurvePath) {
      ctx.strokeStyle = 'rgb(4 249 255 / 0.2)';
      ctx.lineWidth = 3;
      ctx.stroke(referenceFanCurvePath);
    }

    if (dataPaths?.fanPath) {
      ctx.strokeStyle = 'rgb(207 213 255 / 0.84)';
      ctx.lineWidth = 3;
      ctx.stroke(dataPaths.fanPath);
    }

    if (dataPaths?.heaterPath) {
      ctx.strokeStyle = 'rgb(253 163 107 / 0.9)';
      ctx.lineWidth = 3;
      ctx.stroke(dataPaths.heaterPath);
    }

    if (dataPaths?.btPath) {
      ctx.strokeStyle = 'rgb(255 218 80 / 0.84)';
      ctx.lineWidth = 3;
      ctx.stroke(dataPaths.btPath);
    }
    if (dataPaths?.etPath) {
      ctx.strokeStyle = 'rgb(255 4 92 / 0.84)';
      ctx.lineWidth = 3;
      ctx.stroke(dataPaths.etPath);
    }

    ctx.strokeStyle = 'rgb(4 249 255 / 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke(fanCurvePath);

    events.forEach((event) => {
      if (!start) return;
      ctx.strokeStyle = 'rgb(255 21 21 / 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(
        timeToX(
          event.time.diff(start).as('seconds'),
          totalTimeSeconds,
          dimensions,
          padding,
        ),
        percentToY(100, MAX_PERCENT, dimensions, padding),
      );
      ctx.lineTo(
        timeToX(
          event.time.diff(start).as('seconds'),
          totalTimeSeconds,
          dimensions,
          padding,
        ),
        percentToY(0, MAX_PERCENT, dimensions, padding),
      );
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgb(255 21 21)';
      ctx.fillText(
        event.label,
        timeToX(
          event.time.diff(start!).as('seconds'),
          totalTimeSeconds,
          dimensions,
          padding,
        ) + 4,
        percentToY(0, MAX_PERCENT, dimensions, padding),
      );
    });

    if (start) {
      const seconds = DateTime.now().diff(start).as('seconds');
      ctx.strokeStyle = 'rgb(255 255 255 / 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        timeToX(seconds, totalTimeSeconds, dimensions, padding),
        percentToY(100, MAX_PERCENT, dimensions, padding),
      );
      ctx.lineTo(
        timeToX(seconds, totalTimeSeconds, dimensions, padding),
        percentToY(0, MAX_PERCENT, dimensions, padding),
      );
      ctx.stroke();
    }

    heaterPhases.forEach((point, index) => {
      const p = {
        x: timeToX(point.time, totalTimeSeconds, dimensions, padding),
        y: tempToY(point.temperature, MAX_TEMP, dimensions, padding),
      };

      // Draw Points
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle =
        activePhase?.type === 'heater' && index === activePhase.index
          ? 'rgb(255 121 36 / 0.9)'
          : 'rgba(60%, 60%, 90%, 0.9)';
      ctx.fill();

      if (activePhase?.type === 'heater' && index === activePhase.index) {
        ctx.textAlign = 'center';
        const text = `${Duration.fromDurationLike({
          seconds: point?.time ?? 0,
        }).toFormat('mm:ss')}, ${point?.temperature} °C`;
        ctx.fillText(text, p.x, p.y - 12);
      }
    });

    fanPhases.forEach((point, index) => {
      const p = {
        x: timeToX(point.time, totalTimeSeconds, dimensions, padding),
        y: percentToY(point.fanSpeed, MAX_PERCENT, dimensions, padding),
      };

      // Draw Points
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle =
        activePhase?.type === 'fan' && index === activePhase.index
          ? 'rgb(255 121 36 / 0.9)'
          : 'rgba(60%, 60%, 90%, 0.9)';
      ctx.fill();

      if (activePhase?.type === 'fan' && index === activePhase.index) {
        ctx.textAlign = 'center';
        const text = `${Duration.fromDurationLike({
          seconds: point?.time ?? 0,
        }).toFormat('mm:ss')}, ${point?.fanSpeed} %`;
        ctx.fillText(text, p.x, p.y - 12);
      }
    });

    // Draw current time marker
    if (currentTime > 0 && currentTime <= totalTimeSeconds) {
      const currentX = timeToX(
        currentTime,
        totalTimeSeconds,
        dimensions,
        padding,
      );
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
        const actualY = tempToY(
          currentTemperature,
          MAX_TEMP,
          dimensions,
          padding,
        );
        ctx.beginPath();
        ctx.arc(currentX, actualY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(140, 60%, 50%)';
        ctx.fill();
        ctx.strokeStyle = 'hsl(0 0% 100%)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    if (cursorPosition) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgb(255 255 255 / 0.9)';
      for (let percent = 0; percent <= 100; percent += percentStep) {
        ctx.fillText(
          [
            `Time: ${Duration.fromDurationLike({ seconds: xToTime(cursorPosition.x, totalTimeSeconds, dimensions, padding) }).toFormat('mm:ss')}`,
            `${yToTemp(cursorPosition.y, MAX_TEMP, dimensions, padding).toFixed(1)}°C`,
            `${yToPercent(cursorPosition.y, MAX_PERCENT, dimensions, padding).toFixed(1)}%`,
          ].join(', '),
          cursorPosition.x,
          padding.top - 5,
        );
      }
    }

    // Axis labels
    ctx.fillStyle = 'hsl(0 0% 70%)';
    ctx.font = '14px Geist, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Time',
      dimensions.width / 2,
      dimensions.height - padding.bottom + 38,
    );

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
    padding,
    heaterPhases,
    heaterCurvePath,
    fanCurvePath,
    fanPhases,
    activePhase,
    referenceHeaterCurvePath,
    referenceFanCurvePath,
    dataPaths,
    events,
    start,
    lastMessage,
    cursorPosition,
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
      const chartTemp = (1 - (y - padding.top) / chartHeight) * MAX_TEMP;
      const chartFan = (1 - (y - padding.top) / chartHeight) * MAX_PERCENT;
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
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && y >= 0)
        setCursorPosition(
          draggingPoint
            ? undefined
            : {
                x: Math.min(
                  Math.max(padding.left, x),
                  dimensions.width - padding.right,
                ),
                y: Math.min(
                  Math.max(padding.top, y),
                  dimensions.height - padding.bottom,
                ),
              },
        );
      if (draggingPoint === undefined) return;

      const newTime = Math.max(
        0,
        Math.min(
          totalTimeSeconds,
          xToTime(x, totalTimeSeconds, dimensions, padding),
        ),
      );
      if (draggingPoint.type === 'heater') {
        const newTemperature = Math.max(
          0,
          Math.min(MAX_TEMP, yToTemp(y, MAX_TEMP, dimensions, padding)),
        );
        dispatch(
          Actions.changeHeaterPhase({
            target: draftType,
            index: draggingPoint.index,
            temperature: newTemperature,
            time: newTime,
          }),
        );
      }

      if (draggingPoint.type === 'fan') {
        const newSpeed = Math.max(
          0,
          Math.min(250, yToPercent(y, MAX_PERCENT, dimensions, padding)),
        );
        dispatch(
          Actions.changeFanPhase({
            target: draftType,
            index: draggingPoint.index,
            fanSpeed: newSpeed,
            time: newTime,
          }),
        );
      }
    },
    [draggingPoint, padding, dimensions, totalTimeSeconds, dispatch, draftType],
  );

  const handleMouseUp = useCallback(() => {
    setDraggingPoint(undefined);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col w-full gap-4">
      {draftType === 'editor' ? (
        <div className="flex flex-row justify-between flex-wrap gap-4">
          <input
            type={'text'}
            onChange={(e) =>
              dispatch(
                Actions.setProfileName({
                  target: draftType,
                  name: e.target.value,
                }),
              )
            }
            value={name}
            className={
              'max-md:w-full lg:w-50 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-gray-300 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow'
            }
          />
          <div className={'flex flex-row gap-2 gap-y-4 flex-wrap'}>
            <Button
              iconLeft={faTrash}
              onClick={() =>
                dispatch(
                  Actions.resetProfileDraft({
                    target: draftType,
                  }),
                )
              }
            >
              Reset
            </Button>
            <div className={'flex flex-row'}>
              <Button
                iconLeft={faFire}
                iconRight={faPlus}
                className={'rounded-r-none border-r-0'}
                onClick={() =>
                  dispatch(
                    Actions.addHeaterPhase({
                      target: draftType,
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
                      target: draftType,
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
                iconLeft={faFan}
                iconRight={faPlus}
                className={'rounded-r-none border-r-0'}
                onClick={() =>
                  dispatch(
                    Actions.addFanPhase({
                      target: draftType,
                      index:
                        activePhase?.type === 'fan'
                          ? activePhase.index
                          : undefined,
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
                      target: draftType,
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
                      dispatch(
                        Actions.prefillProfileDraft({
                          target: draftType,
                          profile: jsonData,
                        }),
                      );
                    }
                    if (get(jsonData, 'steps')) {
                      dispatch(
                        Actions.prefillProfileDraft({
                          target: draftType,
                          profile: convertLegacyToNxProfile(jsonData, {
                            name: (file.name || '').split('.')[0],
                          }),
                        }),
                      );
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
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        className="w-full min-h-75 rounded-lg cursor-crosshair bg-black"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};
