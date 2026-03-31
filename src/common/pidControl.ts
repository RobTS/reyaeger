type TuningMethod =
  | 'ZieglerNichols'
  | 'CohenCoon'
  | 'IMC'
  | 'TyreusLuyben'
  | 'LambdaTuning'
  | 'Manual';

type OperationalMode =
  | 'Normal'
  | 'Reverse'
  | 'Manual'
  | 'Override'
  | 'Track'
  | 'Hold'
  | 'Preserve'
  | 'Tune'
  | 'Auto';

type OscillationMode = 'Normal' | 'Half' | 'Mild';

/**
 * This is a JS conversion of this library: https://github.com/lily-osp/AutoTunePID
 */
export class PidAutoTune2 {
  // Configuration
  private readonly _minOutput: number;
  private readonly _maxOutput: number;
  private _method: TuningMethod;
  private _operationalMode: OperationalMode;
  private _oscillationMode: OscillationMode;
  private _oscillationSteps: number;
  private _setpoint: number;
  private _lambda: number;

  // Manual, Override, and Track mode parameters
  private _manualOutput: number;
  private _overrideOutput: number;
  private _trackReference: number;

  // PID parameters
  private _kp: number;
  private _ki: number;
  private _kd: number;
  private _error: number;
  private _previousError: number;
  private _integral: number;
  private _derivative: number;
  private _output: number;
  private _input: number;

  // Anti-windup
  private _antiWindupEnabled: boolean;
  private _integralWindupThreshold: number;

  // Autotuning parameters
  private _lastUpdate: number;
  private _ultimateGain: number;
  private _oscillationPeriod: number;

  // Additional parameters for advanced tuning
  private _processTimeConstant: number;
  private _deadTime: number;
  private _integralTime: number;
  private _derivativeTime: number;

  // Filtering
  private _inputFilterEnabled: boolean;
  private _outputFilterEnabled: boolean;
  private _inputFilteredValue: number;
  private _outputFilteredValue: number;
  private _inputFilterAlpha: number;
  private _outputFilterAlpha: number;

  // Constructor
  constructor(
    minOutput: number,
    maxOutput: number,
    method: TuningMethod = 'ZieglerNichols',
  ) {
    this._minOutput = minOutput;
    this._maxOutput = maxOutput;
    this._method = method;
    this._operationalMode = 'Normal';
    this._oscillationMode = 'Normal';
    this._oscillationSteps = 10;
    this._setpoint = 0;
    this._lambda = 0.5; // Default lambda value
    this._manualOutput = 0; // Default manual output to 0%
    this._overrideOutput = 0; // Default override output to 0
    this._trackReference = 0; // Default track reference to 0
    this._kp = 0;
    this._ki = 0;
    this._kd = 0;
    this._error = 0;
    this._previousError = 0;
    this._integral = 0;
    this._derivative = 0;
    this._output = 0;
    this._input = 0;
    this._lastUpdate = 0;
    this._ultimateGain = 0;
    this._oscillationPeriod = 0;
    this._processTimeConstant = 0; // Initialize process time constant (T)
    this._deadTime = 0; // Initialize dead time (L)
    this._integralTime = 0; // Initialize integral time (Ti)
    this._derivativeTime = 0; // Initialize derivative time (Td)
    this._inputFilterEnabled = false;
    this._outputFilterEnabled = false;
    this._inputFilteredValue = 0;
    this._outputFilteredValue = 0;
    this._inputFilterAlpha = 0.1;
    this._outputFilterAlpha = 0.1;
    this._antiWindupEnabled = true;
    this._integralWindupThreshold = 0.8 * (maxOutput - minOutput);
  }

  // Configuration methods
  setSetpoint(setpoint: number): void {
    this._setpoint = setpoint;
  }

  setTuningMethod(method: TuningMethod): void {
    this._method = method;
  }

  setManualGains(kp: number, ki: number, kd: number): void {
    this._kp = kp;
    this._ki = ki;
    this._kd = kd;
  }

  enableInputFilter(alpha: number): void {
    this._inputFilterEnabled = true;
    this._inputFilterAlpha = this.constrain(alpha, 0.01, 1.0);
  }

  enableOutputFilter(alpha: number): void {
    this._outputFilterEnabled = true;
    this._outputFilterAlpha = this.constrain(alpha, 0.01, 1.0);
  }

  enableAntiWindup(enable: boolean, threshold: number = 0.8): void {
    this._antiWindupEnabled = enable;
    this._integralWindupThreshold =
      threshold * (this._maxOutput - this._minOutput);
  }

  setOperationalMode(mode: OperationalMode): void {
    this._operationalMode = mode;
    if (mode === 'Hold') {
      this._integral = 0;
      this._previousError = 0;
      this._output = 0;
    }
  }

  setManualOutput(output: number): void {
    this._manualOutput = this.constrain(output, 0, 100); // Constrain to 0-100%
  }

  setOverrideOutput(output: number): void {
    this._overrideOutput = this.constrain(
      output,
      this._minOutput,
      this._maxOutput,
    );
  }

  setTrackReference(reference: number): void {
    this._trackReference = reference;
  }

  setOscillationMode(mode: OscillationMode): void {
    this._oscillationMode = mode;
    // Set default oscillation steps based on the oscillation mode
    switch (mode) {
      case 'Normal':
        this._oscillationSteps = 10;
        break;
      case 'Half':
        this._oscillationSteps = 20;
        break;
      case 'Mild':
        this._oscillationSteps = 40;
        break;
    }
  }

  setOscillationSteps(steps: number): void {
    if (steps > 0) {
      this._oscillationSteps = steps;
    }
  }

  setLambda(lambda: number): void {
    this._lambda = lambda;
  }

  // Runtime methods
  update(currentInput: number): void {
    const now = Date.now();
    if (now - this._lastUpdate < 100) {
      return; // Maintain consistent sample time
    }

    // Calculate actual time step in seconds for proper numerical integration
    const dt = (now - this._lastUpdate) / 1000.0;
    this._lastUpdate = now;

    // Update input (with filter if enabled)
    if (this._inputFilterEnabled && this._operationalMode !== 'Tune') {
      currentInput = this.computeFilteredValue(
        currentInput,
        this._inputFilteredValue,
        this._inputFilterAlpha,
      );
    }
    this._input = currentInput; // Store the current input value

    if (this._operationalMode === 'Tune') {
      this.performAutoTune(currentInput);
    } else if (this._operationalMode === 'Manual') {
      // Manual mode: direct output control, bypass PID calculations
      this._output = this.map(
        this._manualOutput,
        0,
        100,
        this._minOutput,
        this._maxOutput,
      );
      return;
    } else if (this._operationalMode === 'Override') {
      // Override mode: emergency override with fixed output value
      this._output = this._overrideOutput;
      return;
    } else if (this._operationalMode === 'Track') {
      // Track mode: output follows a reference signal
      this._output = this.constrain(
        this._trackReference,
        this._minOutput,
        this._maxOutput,
      );
      return;
    } else if (this._operationalMode === 'Hold') {
      // Hold mode: maintain current output, skip all calculations
      // Keep the last computed output value
      return;
    } else if (this._operationalMode === 'Preserve') {
      // Preserve mode: minimal calculations, keep system responsive
      // Only update error for monitoring, skip PID calculations
      this._error = this._setpoint - this._input;
      // Keep previous output, don't update PID terms
      return;
    } else {
      // Normal or Reverse mode
      // Calculate error based on operational mode
      if (this._operationalMode === 'Reverse') {
        this._error = this._input - this._setpoint; // Reverse error calculation for cooling systems
      } else {
        this._error = this._setpoint - this._input; // Normal error calculation
      }

      this._integral += this._error * dt; // Proper numerical integration using actual time step

      this._derivative = (this._error - this._previousError) / dt; // Proper derivative calculation
      this.computePID();
      this.applyAntiWindup();
      this._previousError = this._error;
    }

    // Update output (with filter if enabled)
    if (this._outputFilterEnabled && this._operationalMode !== 'Tune') {
      this._output = this.computeFilteredValue(
        this._output,
        this._outputFilteredValue,
        this._outputFilterAlpha,
      );
    }
  }

  // Private methods
  private performAutoTune(currentInput: number): void {
    // Using static-like behavior with object properties
    if (!this._autoTuneState) {
      this._autoTuneState = {
        lastToggleTime: 0,
        outputState: true,
        oscillationCount: 0,
        oscillationStartTime: 0,
      };
    }

    const state = this._autoTuneState;
    const currentTime = Date.now();

    // Determine the output range based on the oscillation mode
    let highOutput: number;
    let lowOutput: number;

    switch (this._oscillationMode) {
      case 'Normal':
        highOutput = this._maxOutput;
        lowOutput = this._minOutput;
        break;
      case 'Half':
        highOutput =
          (this._maxOutput + this._minOutput) / 2.0 +
          (this._maxOutput - this._minOutput) / 4.0; // 3/4 of the range
        lowOutput =
          (this._maxOutput + this._minOutput) / 2.0 -
          (this._maxOutput - this._minOutput) / 4.0; // 1/4 of the range
        break;
      case 'Mild':
        highOutput =
          (this._maxOutput + this._minOutput) / 2.0 +
          (this._maxOutput - this._minOutput) / 8.0; // 5/8 of the range
        lowOutput =
          (this._maxOutput + this._minOutput) / 2.0 -
          (this._maxOutput - this._minOutput) / 8.0; // 3/8 of the range
        break;
    }

    // Toggle output every second to induce oscillations
    if (currentTime - state.lastToggleTime >= 1000) {
      state.outputState = !state.outputState;
      this._output = state.outputState ? highOutput : lowOutput;
      state.lastToggleTime = currentTime;

      if (state.oscillationCount === 0) {
        state.oscillationStartTime = currentTime;
      }
      state.oscillationCount++;

      // After the specified number of oscillations, calculate Ku and Tu
      if (state.oscillationCount >= this._oscillationSteps) {
        this._oscillationPeriod =
          (currentTime - state.oscillationStartTime) /
          (this._oscillationSteps * 1000); // Period in seconds

        // Correct ultimate gain calculation for relay oscillation
        // Ku = 4d/(πa) where d is relay amplitude and a is oscillation amplitude
        const relayAmplitude = (highOutput - lowOutput) / 2.0; // Half the output range
        const oscillationAmplitude = relayAmplitude; // For relay method, oscillation amplitude ≈ relay amplitude
        this._ultimateGain =
          (4.0 * relayAmplitude) / (Math.PI * oscillationAmplitude);

        // Estimate T and L from the system response using improved approximations
        // Based on Ziegler-Nichols ultimate period method
        this._processTimeConstant = 0.67 * this._oscillationPeriod; // Better approximation for process time constant
        this._deadTime = 0.17 * this._oscillationPeriod; // Better approximation for dead time

        // Calculate Ti and Td based on T and L
        this._integralTime = 2.0 * this._deadTime;
        this._derivativeTime = this._deadTime / 2.0;

        // Calculate PID gains based on the selected tuning method
        switch (this._method) {
          case 'ZieglerNichols':
            this.calculateZieglerNicholsGains();
            break;
          case 'CohenCoon':
            this.calculateCohenCoonGains();
            break;
          case 'IMC':
            this.calculateIMCGains();
            break;
          case 'TyreusLuyben':
            this.calculateTyreusLuybenGains();
            break;
          case 'LambdaTuning':
            this.calculateLambdaTuningGains();
            break;
          default:
            break;
        }

        // Reset oscillation count and return to normal operation
        state.oscillationCount = 0;
        this._operationalMode = 'Normal'; // Switch back to Normal mode after tuning
      }
    }
  }

  private calculateZieglerNicholsGains(): void {
    this._kp = 0.6 * this._ultimateGain;
    this._ki = this._kp / this._integralTime;
    this._kd = this._kp * this._derivativeTime;
  }

  private calculateCohenCoonGains(): void {
    // Cohen-Coon tuning rules (simplified but more accurate than original)
    // These provide better transient response than Ziegler-Nichols
    this._kp = 0.8 * this._ultimateGain;
    this._ki = this._kp / (0.8 * this._oscillationPeriod);
    this._kd = 0.194 * this._kp * this._oscillationPeriod;
  }

  private calculateIMCGains(): void {
    // Internal Model Control (IMC) tuning with configurable lambda parameter
    // Lambda controls the trade-off between robustness and performance
    // Smaller lambda = faster response, larger lambda = more robust
    let lambda = this._lambda;
    if (lambda <= 0) {
      lambda = 0.5 * this._processTimeConstant; // Default lambda if not set
    }

    this._kp = this._processTimeConstant / (lambda + this._deadTime);
    this._ki = this._kp / this._processTimeConstant; // Ti = Tc (process time constant)
    this._kd = (this._kp * this._deadTime) / 2.0; // Td = θ/2 (dead time / 2)
  }

  private calculateTyreusLuybenGains(): void {
    this._kp = 0.45 * this._ultimateGain;
    this._ki = this._kp / this._integralTime;
    this._kd = 0.0;
  }

  private calculateLambdaTuningGains(): void {
    // Ensure lambda is set and valid
    if (this._lambda <= 0) {
      this._lambda = 0.5 * this._processTimeConstant; // Default value for lambda
    }

    // Calculate Kp, Ki, and Kd using the Lambda Tuning (CLD) formula
    this._kp =
      this._processTimeConstant /
      (this._ultimateGain * (this._lambda + this._deadTime));
    this._ki = this._kp / this._processTimeConstant;
    this._kd = this._kp * 0.5 * this._deadTime;
  }

  private computePID(): void {
    // Calculate error
    this._error = this._setpoint - this._input;

    // If error is very small, treat it as zero
    if (Math.abs(this._error) < 0.001) {
      this._error = 0;
    }

    // Calculate PID terms
    const P = this._kp * this._error;
    const I = this._ki * this._integral;
    const D = this._kd * this._derivative;

    // Calculate output
    this._output = P + I + D;
    this._output = this.constrain(
      this._output,
      this._minOutput,
      this._maxOutput,
    );
  }

  private applyAntiWindup(): void {
    if (
      this._antiWindupEnabled &&
      Math.abs(this._integral) > this._integralWindupThreshold
    ) {
      this._integral = this.constrain(
        this._integral,
        -this._integralWindupThreshold,
        this._integralWindupThreshold,
      );
    }
  }

  private computeFilteredValue(
    input: number,
    filteredValue: number,
    alpha: number,
  ): number {
    filteredValue = alpha * input + (1.0 - alpha) * filteredValue;
    return filteredValue;
  }

  // Utility methods
  private constrain(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private map(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  // Getter methods
  getOutput(): number {
    return this._output;
  }

  getKp(): number {
    return this._kp;
  }

  getKi(): number {
    return this._ki;
  }

  getKd(): number {
    return this._kd;
  }

  getKu(): number {
    return this._ultimateGain;
  }

  getTu(): number {
    return this._oscillationPeriod;
  }

  getSetpoint(): number {
    return this._setpoint;
  }

  getOperationalMode(): OperationalMode {
    return this._operationalMode;
  }

  getLambda(): number {
    return this._lambda;
  }

  // Auto-tune state management
  private _autoTuneState?: {
    lastToggleTime: number;
    outputState: boolean;
    oscillationCount: number;
    oscillationStartTime: number;
  };
}
