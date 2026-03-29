import { getCurveForPoints } from './splineUtils.ts';

describe('The spline utility', () => {
  it('can chart a spline through a number of points', () => {
    const data: [number, number][] = [
      [0, 0],
      [1, 3],
      [5, 1],
      [6, 15],
      [7, 5],
      [8, 19],
    ];

    const points = getCurveForPoints(data, 10);
    expect(points).toMatchInlineSnapshot(`
      [
        [
          0,
          0,
        ],
        [
          2.6931171976401362,
          2.228328341015911,
        ],
        [
          5.265081518005328,
          3.431212101604161,
        ],
        [
          5.52482421872046,
          8.520621014382995,
        ],
        [
          5.806334766592827,
          13.62686558486603,
        ],
        [
          6.410392050626498,
          11.32909964062583,
        ],
        [
          6.7801398445516385,
          6.238589610365608,
        ],
        [
          7.462025533549094,
          8.79270867835771,
        ],
        [
          7.751264344446,
          13.88242541930293,
        ],
        [
          8,
          18.999999999999993,
        ],
      ]
    `);
  });
});
