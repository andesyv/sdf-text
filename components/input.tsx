import React from "react";
import { Props as RenderProps } from './renderer'

interface Props {
  onInputChanged?: (renderData: RenderProps) => void
}

interface State {
  value: string;
}

const ExtractLineData = (text: string): RenderProps => {
  return {};
}

// Form that autoselects
class Input extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { value: '' };
    this.handleSubmit.bind(this)
    this.handleChange.bind(this);
  }

  inputRef = React.createRef<HTMLInputElement>();

  componentDidMount = () => {
    this.inputRef.current?.focus();
    this.inputRef.current?.select();
  }

  handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
    this.props.onInputChanged?.(ExtractLineData(this.state.value));
    ev.preventDefault();
  }

  handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ value: event.target.value });
    event.preventDefault();
  }

  render = () => (
    <form onSubmit={this.handleSubmit}>
      <label>
        Name:
        <input ref={this.inputRef} type="text" name="name" onChange={this.handleChange} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
};

export default Input;