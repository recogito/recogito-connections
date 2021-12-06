import React, { Component } from 'react';
import Autocomplete from '@recogito/recogito-client-core/src/editor/widgets/Autocomplete';
import { TrashIcon, CheckIcon } from '@recogito/recogito-client-core/src/Icons';

import './PayloadEditor.scss';

export default class PayloadEditor extends Component {

  constructor(props) {
    super(props);

    this.state = {
      connection: null,
      top: 0,
      left: 0,
      isNew: false,
      inputValue: ''
    }
  }

  close = () =>
    this.setState({
      connection: null,
      isNew: false,
      inputValue: ''
    });

  editConnection(connection, pos, isNew) {
    const top = pos.y;
    const left = pos.x;

    console.log('editing', connection.bodies);

    const inputValue = 
      connection.bodies.find(b => b.purpose === 'tagging')?.value || '';

    this.setState({ connection, top, left, isNew, inputValue });
  }

  onChange = inputValue =>
    this.setState({ inputValue });

  onSubmit = () => {
    const updated = this.state.connection.clone({ body: {
      type: 'TextualBody',
      value: this.state.inputValue,
      purpose: 'tagging' 
    }});

    if (this.state.isNew)
      this.props.onConnectionCreated(updated);
    else
      this.props.onConnectionUpdated(updated, this.state.connection);

    this.close();
  }

  onDelete = () => {
    this.props.onConnectionDeleted(this.state.connection);
    this.close();
  }

  render() {
    return this.state.connection ? (
      <div
        ref={this.element}
        style={{ top: this.state.top, left: this.state.left }} 
        className="r6o-connections-editor">

        <div className="r6o-connections-editor-input-wrapper">
          <Autocomplete 
            placeholder="Tag..."
            initialValue={this.state.inputValue}
            onSubmit={this.onSubmit} 
            onChange={this.onChange}
            onCancel={this.close}
            vocabulary={this.props.vocabulary || []} />
        </div>

        <div className="r6o-connections-editor-buttons">
          <span 
            className="r6o-icon delete"
            onClick={this.onDelete}>
            <TrashIcon width={14} />
          </span>

          <span
            className="r6o-icon ok"
            onClick={this.onSubmit}>
            <CheckIcon width={14} />
          </span>
        </div>
      </div>
    ) : null;
  }

}

