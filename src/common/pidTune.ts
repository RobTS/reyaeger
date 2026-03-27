import { DateTime } from 'luxon';
import type { PidData } from '../types/pid.ts';

const TUNE_PID_DELTA = 5.0;

export class PidAutoTune {
  private setHeaterSetpoint: (value: number) => void;
  private setPidEnabled: (value: boolean) => void;
  private heaterMaxPower: number = 1;
  private calibrationTemp: number;

  // Heating control
  private heating: boolean = false;
  private peak: number = 0;
  private peakTime: DateTime = DateTime.now();
  // Peak recording
  private peaks: { time: DateTime; temp: number }[] = [];
  // Sample recording
  lastPwm: number = 0;
  pwmSamples: { time: DateTime; value: number }[] = [];
  tempSamples: { time: DateTime; temp: number }[] = [];

  constructor(params: {
    setHeaterSetpoint: (value: number) => void;
    setPidEnabled: (value: boolean) => void;
    calibrationTemp: number;
  }) {
    this.setHeaterSetpoint = params.setHeaterSetpoint;
    this.setPidEnabled = params.setPidEnabled;
    this.calibrationTemp = params.calibrationTemp;
  }

  public setPwm(time: DateTime, value: boolean) {
    const pwmValue = value ? 100 : 0;
    if (pwmValue !== this.lastPwm) {
      this.pwmSamples.push({ time, value: pwmValue });
    }
    this.lastPwm = value ? 100 : 0;
    console.log(this.lastPwm);
    this.setPidEnabled(value);
  }

  checkForCompletion(): PidData | undefined {
    if (this.peaks.length <= 20) return;
    return this.calcFinalPid();
  }

  public temperatureUpdate(time: DateTime, temp: number, targetTemp: number) {
    this.tempSamples.push({ time, temp });

    // Check if the temperature has crossed the target and
    // enable/disable the heater if so.
    if (this.heating && temp >= targetTemp) {
      this.heating = false;
      this.checkPeaks();
      this.setHeaterSetpoint(this.calibrationTemp - TUNE_PID_DELTA);
    } else if (!this.heating && temp <= targetTemp) {
      this.heating = true;
      this.checkPeaks();
      this.setHeaterSetpoint(this.calibrationTemp);
    }

    // Check if this temperature is a peak and record it if so
    if (this.heating) {
      this.setPwm(time, true);
      if (temp < this.peak) {
        this.peak = temp;
        this.peakTime = time;
      }
    } else {
      this.setPwm(time, false);
      if (temp > this.peak) {
        this.peak = temp;
        this.peakTime = time;
      }
    }
  }

  // Analysis
  private checkPeaks() {
    this.peaks.push({ temp: this.peak, time: this.peakTime });
    if (this.heating) {
      this.peak = 9999999;
    } else {
      this.peak = -9999999;
    }
    if (this.peaks.length < 4) {
      return;
    }
    this.calcPid(this.peaks.length - 1);
  }

  private calcPid(pos: number): PidData {
    const tempDiff = this.peaks[pos].temp - this.peaks[pos - 1].temp;
    const timeDiff = this.peaks[pos].time
      .diff(this.peaks[pos - 2].time)
      .as('milliseconds');
    console.log(timeDiff);

    // Use Astrom-Hagglund method to estimate Ku and Tu
    const amplitude = 0.5 * Math.abs(tempDiff);
    const Ku = (4 * this.heaterMaxPower) / (Math.PI * amplitude);
    const Tu = timeDiff;

    // Use Ziegler-Nichols method to generate PID parameters
    const Ti = 0.5 * Tu;
    const Td = 0.125 * Tu;
    const Kp = 0.6 * Ku * 100;
    const Ki = Kp / Ti;
    const Kd = Kp * Td;

    console.log(
      `Autotune: raw=${tempDiff}/${this.heaterMaxPower} Ku=${Ku} Tu=${Tu}  Kp=${Kp} Ki=${Ki} Kd=${Kd}`,
    );

    return {
      ki: Ki,
      kp: Kp,
      kd: Kd,
    };
  }

  private calcFinalPid(): PidData {
    const cycleTimes = [];
    for (let pos = 4; pos < this.peaks.length; pos++) {
      const cycleTime = this.peaks[pos].time
        .diff(this.peaks[pos - 2].time)
        .as('milliseconds');
      cycleTimes.push([cycleTime, pos]);
    }

    cycleTimes.sort((a, b) => a[0] - b[0]);
    const midpointPos = cycleTimes[Math.floor(cycleTimes.length / 2)][1];

    return this.calcPid(midpointPos);
  }
}
