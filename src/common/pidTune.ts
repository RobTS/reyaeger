import { DateTime } from 'luxon';
import type { PidData } from '../types/pid.ts';

/**
 * Simplified conversion of Klipper's Autotune mechanism
 */
export class PidAutoTune {
  private setHeaterPercentage: (value: number) => void;
  private setPidEnabled: (value: boolean) => void;
  private setFanSpeed: (value: number) => void;
  private heaterMaxPower: number = 1;
  private calibrationTemp: number;
  private calibrationFanSpeed: number;

  // Heating control
  private heating: boolean = false;
  private peak: number = 0;
  private peakTime: DateTime = DateTime.now();
  // Peak recording
  private peaks: { time: DateTime; temp: number }[] = [];

  constructor(params: {
    setHeaterPercentage: (value: number) => void;
    setPidEnabled: (value: boolean) => void;
    calibrationTemp: number;
    calibrationFanSpeed: number;
    setFanSpeed: (value: number) => void;
  }) {
    this.setHeaterPercentage = params.setHeaterPercentage;
    this.setPidEnabled = params.setPidEnabled;
    this.calibrationTemp = params.calibrationTemp;
    this.calibrationFanSpeed = params.calibrationFanSpeed;
    this.setFanSpeed = params.setFanSpeed;
  }

  checkForCompletion(): PidData | undefined {
    if (this.peaks.length <= 20) return;
    const result = this.calcFinalPid();
    this.setHeaterPercentage(0);
    //this.setFanSpeed(0);
    return result;
  }

  public temperatureUpdate(time: DateTime, temp: number) {
    // Check if the temperature has crossed the target and
    // enable/disable the heater if so.
    this.setFanSpeed(this.calibrationFanSpeed);
    if (this.heating && temp >= this.calibrationTemp) {
      this.heating = false;
      this.checkPeaks();
      this.setHeaterPercentage(0);
    } else if (!this.heating && temp <= this.calibrationTemp) {
      this.heating = true;
      this.checkPeaks();
      this.setHeaterPercentage(100);
    }

    // Check if this temperature is a peak and record it if so
    if (this.heating) {
      this.setPidEnabled(true);
      if (temp < this.peak) {
        this.peak = temp;
        this.peakTime = time;
      }
    } else {
      this.setPidEnabled(false);
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
    const tempDiff = this.peaks[pos]!.temp - this.peaks[pos - 1]!.temp;
    const timeDiff = this.peaks[pos]!.time.diff(this.peaks[pos - 2]!.time).as(
      'seconds',
    );
    console.log(`Tempdiff: ${tempDiff}`);
    console.log(`Timediff: ${timeDiff}`);

    // Use Astrom-Hagglund method to estimate Ku and Tu
    const amplitude = 0.5 * Math.abs(tempDiff);
    const Ku = (4 * this.heaterMaxPower) / (Math.PI * amplitude);
    const Tu = timeDiff;
    console.log(`Ku: ${Ku}`);
    console.log(`Tu: ${Tu}`);

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
      const cycleTime = this.peaks[pos]!.time.diff(
        this.peaks[pos - 2]!.time,
      ).as('seconds');
      cycleTimes.push([cycleTime, pos]);
    }

    cycleTimes.sort((a, b) => a[0]! - b[0]!);
    const midpointPos = cycleTimes[Math.floor(cycleTimes.length / 2)]![1];

    return this.calcPid(midpointPos!);
  }
}
