import React from 'react';
import { ShaderParameters } from '../lib/types';

export interface Props {
  onRadiusChanged?: (radius: number) => void;
  onSmoothingChanged?: (smoothing: number) => void;
  defaultParams: ShaderParameters;
}

interface State {
  radius: number;
  smoothing: number;
}

// Form that autoselects
class Sliders extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      radius: props.defaultParams.radius,
      smoothing: props.defaultParams.smoothing,
    };
    this.handleRadiusChange.bind(this);
    this.handleSmoothingChange.bind(this);
  }

  handleRadiusChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({
      radius: parseFloat(event.target.value),
      smoothing: this.state.smoothing,
    });
    this.props.onRadiusChanged?.(this.state.radius);
    event.preventDefault();
  };

  handleSmoothingChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({
      radius: this.state.radius,
      smoothing: parseFloat(event.target.value),
    });
    this.props.onSmoothingChanged?.(this.state.smoothing);
    event.preventDefault();
  };

  render = (): JSX.Element => (
    <form>
      <label>
        Radius:
        <input
          type="range"
          min={0.01}
          max={4.0}
          step={0.01}
          onChange={this.handleRadiusChange}
          value={this.state.radius}
        />
        Smoothing:
        <input
          type="range"
          min={0.01}
          max={4.0}
          step={0.01}
          onChange={this.handleSmoothingChange}
          value={this.state.smoothing}
        />
      </label>
    </form>
  );
}

export default Sliders;
