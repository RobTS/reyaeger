import * as React from 'react';
import Dropzone from 'react-dropzone';
import {
  useProfileExecutionCommands,
  useProfileExecutionEnabled,
  useProfileExecutionProfile,
} from '../../hooks/useProfileExecution.ts';
import {
  useRecorderCommands,
  useRecorderEvents,
  useRecorderRecords,
} from '../../hooks/useRecorder.ts';
import { DateTime, Duration } from 'luxon';
import { Button } from '../../components/button/button.tsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faPlay,
  faSnowflake,
  faStop,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { get } from 'lodash-es';
import { convertToLegacyProfile } from '../../common/profileUtils.ts';

const DownloadButton: React.FC<{ className?: string }> = ({ className }) => {
  const records = useRecorderRecords();
  const events = useRecorderEvents();
  const [profile] = useProfileExecutionProfile();

  return (
    <Button
      iconLeft={faDownload}
      className={className}
      onClick={() => {
        console.log('download');
        const blob = new Blob(
          [
            JSON.stringify({
              startDate: records[0]?.time.toJSDate(),
              measurements: records.map((r) => ({
                ...r,
                time: r.time.toISOTime(),
              })),
              events: events.map((e) => ({ ...e, time: e.time.toISOTime() })),
              profile,
            }),
          ],
          {
            type: 'application/json',
          },
        );
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'roast.json';
        a.click();

        URL.revokeObjectURL(url);
      }}
    >
      Download
    </Button>
  );
};

export const ProfileControls: React.FC = () => {
  const [profile, setProfile] = useProfileExecutionProfile();
  const enabled = useProfileExecutionEnabled();
  const { start: startProfile, stop: stopProfile } =
    useProfileExecutionCommands();

  const { start: startRecorder, addEvent } = useRecorderCommands();

  if (!profile) {
    return (
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
              if (get(jsonData, 'steps')) setProfile(jsonData);
              if (get(jsonData, 'heaterPhases') && get(jsonData, 'fanPhases')) {
                setProfile(convertToLegacyProfile(jsonData));
              }
            } catch (error) {
              console.log('upload failed:', error);
            }
          };
          reader.readAsText(file);
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className={
              'flex flex-col flex-1 border-2 border-dashed border-gray-300 w-full rounded-2xl p-4 items-center justify-center'
            }
          >
            <input {...getInputProps()} />
            <div className={'text-center'}>
              Drop a profile here, or click to select a file
            </div>
          </div>
        )}
      </Dropzone>
    );
  }
  return (
    <div
      className={
        'flex flex-col flex-1 gap-4 items-center w-full border border-gray-300 rounded-2xl p-4 relative'
      }
    >
      {profile ? (
        <div
          className={'absolute top-2 right-2 cursor-pointer'}
          onClick={() => setProfile(undefined)}
        >
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </div>
      ) : null}

      {profile ? (
        <div className={'flex flex-col gap-2 items-center'}>
          <div className={'text-center'}>
            Profile Duration:{' '}
            {Duration.fromDurationLike({
              seconds: profile.steps.reduce((acc, step) => {
                acc += step.duration;
                return acc;
              }, 0),
            }).toFormat('mm:ss')}
          </div>
          <div className={'flex flex-row flex-wrap gap-2'}>
            <Button
              iconLeft={enabled ? faStop : faPlay}
              type={'primary'}
              className={'w-35'}
              onClick={() => {
                if (enabled) {
                  stopProfile();
                } else {
                  startProfile();
                  startRecorder();
                }
              }}
            >
              {enabled ? 'Stop' : 'Start'}
            </Button>
            {enabled ? (
              <Button
                iconLeft={faSnowflake}
                className={'bg-blue-200! w-35'}
                onClick={() => {
                  stopProfile(true);
                  addEvent({ label: 'Cooldown', time: DateTime.now() });
                }}
              >
                Cooldown
              </Button>
            ) : null}
            <DownloadButton className={'w-35'} />
          </div>
          <div>Events</div>
          <div className={'flex flex-row flex-wrap gap-2 justify-center'}>
            <Button
              className={'w-30 h-16'}
              onClick={() => {
                addEvent({ label: 'Charge', time: DateTime.now() });
              }}
            >
              Charge
            </Button>
            <Button
              className={'w-30 h-16'}
              onClick={() => {
                addEvent({ label: 'Dry End', time: DateTime.now() });
              }}
            >
              Dry End
            </Button>
            <Button
              className={'w-30 h-16'}
              onClick={() => {
                addEvent({ label: '1. Crack Start', time: DateTime.now() });
              }}
            >
              1. Crack Start
            </Button>
            <Button
              className={'w-30 h-16'}
              onClick={() => {
                addEvent({ label: '1. Crack End', time: DateTime.now() });
              }}
            >
              1. Crack End
            </Button>
            <Button
              className={'w-30 h-16'}
              onClick={() => {
                addEvent({ label: '2. Crack Start', time: DateTime.now() });
              }}
            >
              2. Crack Start
            </Button>
            <Button
              className={'w-30 h-16'}
              onClick={() => {
                addEvent({ label: '2. Crack End', time: DateTime.now() });
              }}
            >
              2. Crack End
            </Button>
            <Button
              className={'w-30 h-16'}
              onClick={() => {
                addEvent({ label: 'Drop', time: DateTime.now() });
              }}
            >
              Drop
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
