import * as React from 'react';
import Dropzone from 'react-dropzone';
import {
  useProfileExecutionCommands,
  useProfileExecutionEnabled,
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
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { get, last } from 'lodash-es';
import { useAppDispatch, useAppSelector } from '../../state/store.ts';
import { Actions } from '../../state/actions';
import { useMemo } from 'react';

const DownloadButton: React.FC<{ className?: string }> = ({ className }) => {
  const records = useRecorderRecords();
  const events = useRecorderEvents();
  const profile = useAppSelector((s) => s.profile.selectedProfile.profile);
  return (
    <Button
      iconLeft={faDownload}
      className={className}
      onClick={() => {
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
        a.download = `roast_${profile?.name || 'no_profile'}_${DateTime.now().toFormat('yyyy-MM-DD_hh-mm-ss')}.json`;
        a.click();

        URL.revokeObjectURL(url);
      }}
    >
      Download
    </Button>
  );
};

export const ProfileControls: React.FC = () => {
  const profile = useAppSelector((s) => s.profile.selectedProfile.profile);
  const profiles = useAppSelector((s) => s.profile.storedProfiles);
  const hasProfiles = useMemo(() => !!Object.keys(profiles).length, [profiles]);

  const dispatch = useAppDispatch();
  const profileExecutionEnabled = useProfileExecutionEnabled();
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
              if (get(jsonData, 'heaterPhases') && get(jsonData, 'fanPhases')) {
                dispatch(Actions.setProfile(jsonData));
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
            <div className={'flex flex-col gap-4'}>
              <div className={'text-center'}>
                {hasProfiles
                  ? 'Drop a profile here, click to select a file'
                  : 'Drop a profile here or click to select a file'}
              </div>
              <div className={'flex flex-col gap-2'}>
                <div className={'text-center'}>
                  or choose from recent Profiles
                </div>
                {Object.keys(profiles).map((key) => {
                  const profile = profiles[key];
                  if (!profile) return null;
                  return (
                    <div className={'flex flex-row'} key={profile.name}>
                      <Button
                        className={'flex-1 rounded-r-none'}
                        onClick={(e) => {
                          dispatch(Actions.setProfile(profile));
                          e.stopPropagation();
                        }}
                      >
                        {profile.name}
                      </Button>
                      <Button
                        className={'rounded-l-none border-l-0'}
                        iconLeft={faTrash}
                        onClick={(e) => {
                          dispatch(
                            Actions.removeStoredProfile({ name: profile.name }),
                          );
                          e.stopPropagation();
                        }}
                      />
                    </div>
                  );
                })}
              </div>
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
      {profile && !profileExecutionEnabled ? (
        <div
          className={'absolute top-2 right-2 cursor-pointer'}
          onClick={() => dispatch(Actions.setProfile())}
        >
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </div>
      ) : null}

      {profile ? (
        <div className={'flex flex-col gap-2 items-center'}>
          <div className={'text-center'}>
            Profile Duration:{' '}
            {Duration.fromDurationLike({
              seconds: Math.max(
                last(profile.fanPhases)?.time || 0,
                last(profile.heaterPhases)?.time || 0,
              ),
            }).toFormat('mm:ss')}
          </div>
          <div className={'flex flex-row flex-wrap gap-2'}>
            <Button
              iconLeft={profileExecutionEnabled ? faStop : faPlay}
              type={'primary'}
              className={'w-35'}
              onClick={() => {
                if (profileExecutionEnabled) {
                  stopProfile();
                } else {
                  startProfile();
                  startRecorder();
                }
              }}
            >
              {profileExecutionEnabled ? 'Stop' : 'Start'}
            </Button>
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
