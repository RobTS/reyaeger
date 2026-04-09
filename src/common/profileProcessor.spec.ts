import type { NxProfile } from '../types/profile.ts';
import { ProfileProcessor } from './profileProcessor.ts';
import { times } from 'lodash-es';

describe('The ProfileProcessor', () => {
  it('can convert an NxProfile into a matching legacy representation', () => {
    const input: NxProfile = {
      name: 'Test Profile',
      createdAt: undefined,
      fanPhases: [
        { time: 0, fanSpeed: 50 },
        { time: 60, fanSpeed: 80 },
        { time: 120, fanSpeed: 100 },
        { time: 121, fanSpeed: 65 },
      ],
      heaterPhases: [
        { time: 0, temperature: 10 },
        { time: 60, temperature: 30 },
        { time: 120, temperature: 100 },
        { time: 121, temperature: 0 },
      ],
    };
    const processor = new ProfileProcessor(input);
    const result = times(123).map((t) => processor.getConfigAtTime(t * 1000));
    expect(result[0]).toMatchInlineSnapshot(`
      {
        "fanValue": 50.490486655924315,
        "setpoint": 10.087593252639065,
      }
    `);
    expect(result[result.length - 1]).toMatchInlineSnapshot(`
      {
        "fanValue": 65,
        "setpoint": 0,
      }
    `);
  });
});
