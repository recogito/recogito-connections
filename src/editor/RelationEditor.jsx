import React, { Component } from 'react';
import Autocomplete from '@recogito/recogito-client-core/src/editor/widgets/Autocomplete';
import { TrashIcon, CheckIcon } from '@recogito/recogito-client-core/src/Icons';

import './RelationEditor.scss';

/**
 * A simple editor for adding a single relation tag body
 * to a connection.
 */
export default class PayloadEditor extends Component {

  constructor(props) {
    super(props);

    this.el = React.createRef();

    this.state = {
      connection: null,
      top: 0,
      left: 0,
      isNew: false,
      inputValue: ''
    }
  }

  componentDidUpdate() {
    if (this.el.current)
      this.el.current.querySelector('input').focus();
  }

  close = optCallback =>
    this.setState({
      connection: null,
      isNew: false,
      inputValue: ''
    }, () => optCallback && optCallback());

  editConnection(connection, pos, isNew) {
    const top = pos.y + window.scrollY;
    const left = pos.x + window.scrollX;

    const inputValue = 
      connection.bodies.find(b => b.purpose === 'tagging')?.value || '';

    const setState = () =>
      this.setState({ connection, top, left, isNew, inputValue });
  
    if (this.state.connection)
      this.close(setState); // Close first, so that the Autocomplete re-renders initial value
    else
      setState();
  }

  onChange = inputValue => {
    this.setState({ inputValue });
  }

  onSubmit = inputValue => {
    this.setState({ inputValue });

    const updated = this.state.connection.clone({ body: {
      type: 'TextualBody',
      value: inputValue,
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
        ref={this.el}
        style={{ top: this.state.top, left: this.state.left }} 
        className="r6o-connections-editor">

        <div className="r6o-connections-editor-input-wrapper">
          <Autocomplete 
            placeholder="Tag..."
            initialValue={this.state.inputValue}
            onSubmit={this.onSubmit} 
            onChange={this.onChange}
            onCancel={this.close}
            vocabulary={this.props.config.vocabulary || []} />
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

