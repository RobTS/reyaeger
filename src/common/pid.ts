import type { PidData } from '../types/pid.ts';

export class PidController {
  private previousError: number = 0;
  private integral: number = 0;
  private values: PidData;

  constructor(values: PidData) {
    this.values = values;
  }

  // Method to compute PID output based on error
  public compute(setpoint: number, currentValue: number): number {
    // Calculate the error
    const error = setpoint - currentValue;

    // Proportional term
    const pTerm = this.values.kp * error;

    // Integral term (accumulated error)
    this.integral += error;
    const iTerm = this.values.ki * this.integral;

    // Derivative term (rate of change of error)
    const dTerm = this.values.kd * (error - this.previousError);

    // Save the current error for the next calculation
    this.previousError = error;

    // Sum of all terms
    const output = pTerm + iTerm + dTerm;

    return output;
  }

  // Optionally, reset the controller state
  public reset() {
    this.previousError = 0;
    this.integral = 0;
  }
}
