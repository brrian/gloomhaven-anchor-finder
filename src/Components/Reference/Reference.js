import Draggable from 'react-draggable';
import React, { Component } from 'react';
import anchorF from './anchor-f.svg';
import anchorM from './anchor-m.svg';
import hex from './hex.svg';
import './Reference.css';

const svgs = {
  'anchor-f': { src: anchorF, width: 196, height: 113 },
  'anchor-m': { src: anchorM, width: 196, height: 151 },
  hex: { src: hex, width: 196, height: 226 },
};

class Reference extends Component {
  render() {
    const {
      handleReferenceSelected,
      id,
      index,
      isSelected,
      left,
      rotation,
      top,
      type,
    } = this.props;

    return (
      <div
        className={type}
        style={{
          top ,
          left,
          opacity: isSelected ? 1 : .5,
          transform: `rotate(${rotation}deg)`,
        }}
        onClick={() => handleReferenceSelected(id)}
      >
        <img {...svgs[type]} />
        <span className="index">{index}</span>
        <span className="dot" data-index={index} />
      </div>
    );
  }
}

export default Reference;
