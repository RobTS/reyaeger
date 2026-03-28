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
import { DateTime } from 'luxon';
import { Button } from '../../components/button/button.tsx';

const DownloadButton = () => {
  const records = useRecorderRecords();
  const events = useRecorderEvents();
  const [profile] = useProfileExecutionProfile();

  return (
    <Button
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
  return (
    <div
      className={
        'flex flex-col flex-1 gap-4 items-center w-full border border-gray-300 rounded-2xl p-4'
      }
    >
      <h2>Profile</h2>

      {profile ? (
        <div className={'flex flex-col gap-2 items-center'}>
          <div className={'text-center'}>
            Duration:{' '}
            {profile.steps.reduce((acc, step) => {
              acc += step.duration;
              return acc;
            }, 0)}
          </div>
          <div className={'flex flex-row gap-2'}>
            <Button
              type={'primary'}
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
            <Button onClick={() => setProfile(undefined)}>Clear</Button>
            <DownloadButton />
          </div>
          <div className={'flex flex-row gap-2'}>
            {enabled ? (
              <button
                className={
                  'block h-10 bg-blue-200 px-4 rounded-2xl cursor-pointer'
                }
                onClick={() => {
                  stopProfile(true);
                  addEvent({ label: 'Cooldown', time: DateTime.now() });
                }}
              >
                Cooldown
              </button>
            ) : null}
          </div>
          <div>Events</div>
          <div className={'flex flex-row flex-wrap gap-2 justify-center'}>
            <Button
              onClick={() => {
                addEvent({ label: 'Charge', time: DateTime.now() });
              }}
            >
              Charge
            </Button>
            <Button
              onClick={() => {
                addEvent({ label: 'Dry End', time: DateTime.now() });
              }}
            >
              Dry End
            </Button>
            <Button
              onClick={() => {
                addEvent({ label: '1. Crack Start', time: DateTime.now() });
              }}
            >
              1. Crack Start
            </Button>
            <Button
              onClick={() => {
                addEvent({ label: '1. Crack End', time: DateTime.now() });
              }}
            >
              1. Crack End
            </Button>
            <Button
              onClick={() => {
                addEvent({ label: '2. Crack Start', time: DateTime.now() });
              }}
            >
              2. Crack Start
            </Button>
            <Button
              onClick={() => {
                addEvent({ label: '2. Crack End', time: DateTime.now() });
              }}
            >
              2. Crack End
            </Button>
            <Button
              onClick={() => {
                addEvent({ label: 'Drop', time: DateTime.now() });
              }}
            >
              Drop
            </Button>
          </div>
        </div>
      ) : null}
      {!profile ? (
        <Dropzone
          onDrop={(acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) {
              return;
            }
            const reader = new FileReader();

            reader.onload = (e) => {
              try {
                const jsonData = JSON.parse(e.target?.result as string);
                setProfile(jsonData);
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
                'flex flex-col flex-1 border-2 border-dashed border-gray-300 h-20 w-full rounded-2xl p-4 items-center justify-center'
              }
            >
              <input {...getInputProps()} />
              <div className={'text-center'}>
                Drop a profile here, or click to select a file
              </div>
            </div>
          )}
        </Dropzone>
      ) : null}
    </div>
  );
};
