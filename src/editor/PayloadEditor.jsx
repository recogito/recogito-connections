import React, { Component } from 'react';
import Autocomplete from '@recogito/recogito-client-core/src/editor/widgets/Autocomplete';
import { TrashIcon, CheckIcon } from '@recogito/recogito-client-core/src/Icons';

import './PayloadEditor.scss';

export default class PayloadEditor extends Component {

  constructor(props) {
    super(props);

    this.element = React.createRef();

    this.state = {
      connection: null
    }
  }
  

  editConnection(connection, x, y) {
    this.setState({ connection });
  }

  onSubmit = value => {
    // TODO
  }

  render() {
    return this.state.connection ? (
      <div
        ref={this.element} 
        className="r6o-connections-editor">

        <div className="r6o-connections-editor-input-wrapper">
          <Autocomplete 
            placeholder="Tag..."
            onSubmit={this.onSubmit} 
            onCancel={this.props.onCancel}
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

