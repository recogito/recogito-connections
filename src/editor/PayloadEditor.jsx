import React, { Component } from 'react';

import './PayloadEditor.scss';

export default class PayloadEditor extends Component {
  
  state = {
    connection: null
  }

  editConnection(connection, x, y) {
    this.setState({ connection });
  }

  render() {
    return (
      <div className="r6o-connections-editor">
      </div>
    )
  }

}

