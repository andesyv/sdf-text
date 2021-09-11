import React from 'react';
import Router from 'next/router';
import { Line } from './webglcanvas';
import TextToSVG, { GenerationOptions } from 'text-to-svg';

export interface Props {
  text: string;
  font: string;
}

interface State {
  value: string;
}

// Form that autoselects
class Input extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: '',
    };
    this.handleSubmit.bind(this);
    this.handleChange.bind(this);
  }

  inputRef = React.createRef<HTMLInputElement>();

  componentDidMount = (): void => {
    this.inputRef.current?.focus();
    this.inputRef.current?.select();
  };

  handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
    void Router.push(`/${this.state.value}`);
    ev.preventDefault();
  };

  handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ value: event.target.value });
    event.preventDefault();
  };

  render = (): JSX.Element => (
    <form onSubmit={this.handleSubmit}>
      <label>
        Name:
        <input ref={this.inputRef} type="text" name="name" onChange={this.handleChange} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}

export default Input;
