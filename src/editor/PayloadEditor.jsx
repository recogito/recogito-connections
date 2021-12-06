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
      isNew: false
    }
  }
  
  editConnection(connection, pos, isNew) {
    const top = pos.y;
    const left = pos.x;
    this.setState({ connection, top, left, isNew });
  }

  onSubmit = value => {
    // TODO Update bodies!
    const updated = connection;

    if (this.state.isNew)
      this.props.onConnectionCreated(updated);
    else
      this.props.onConnectionUpdated(updated, this.state.connection);
  }

  onCancel = () =>
    this.setState({ connection: null });

  render() {
    return this.state.connection ? (
      <div
        ref={this.element}
        style={{ top: this.state.top, left: this.state.left }} 
        className="r6o-connections-editor">

        <div className="r6o-connections-editor-input-wrapper">
          <Autocomplete 
            placeholder="Tag..."
            onSubmit={this.onSubmit} 
            onCancel={this.onCancel}
            vocabulary={this.props.vocabulary || []} />
        </div>

        <div className="r6o-connections-editor-buttons">
          <span 
            className="r6o-icon delete"
            onClick={() => this.props.onConnectionDeleted(this.state.connection)}>
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

