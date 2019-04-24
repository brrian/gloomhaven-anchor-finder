/* global window, document */
import { throttle } from 'lodash';
import local from 'simple-local';
import React, { Component } from 'react';
import uuid from 'uuid/v1';
import Reference from './Components/Reference/Reference';
import tileData from './tiles.json';

const hotkeys = {
  i: ['createReference', 'anchor-m'],
  o: ['createReference', 'anchor-f'],
  h: ['createReference', 'hex'],
  r: ['updateReference', 'rotation', 30],
  R: ['updateReference', 'rotation', -30],
  ArrowUp: ['updateReference', 'top', -1],
  ArrowDown: ['updateReference', 'top', 1],
  ArrowLeft: ['updateReference', 'left', -1],
  ArrowRight: ['updateReference', 'left', 1],
  Enter: ['saveTile'],
};

class App extends Component {
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleReferenceSelected = this.handleReferenceSelected.bind(this);
    this.handleMouseMove = throttle(this.handleMouseMove.bind(this), 100);

    this.state = {
      referenceIndex: 0,
      references: {},
      currentReference: false,
      mouseX: 0,
      mouseY: 0,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('mousemove', this.handleMouseMove);

    this.getTile();
  }

  handleMouseMove({ clientX, clientY }) {
    this.setState({ mouseX: clientX + window.scrollX, mouseY: clientY + window.scrollY });
  }

  handleKeyDown(event) {
    const { key } = event;

    if (Object.keys(hotkeys).includes(key)) {
      event.preventDefault();

      const [method, ...args] = hotkeys[key];

      this[method](event, ...args);
    }

    return false;
  }

  handleReferenceSelected(id) {
    this.setState({ currentReference: id });
  }

  getTile() {
    if (window.localStorage.getItem('tiles') === null) {
      window.localStorage.setItem('tiles', JSON.stringify(tileData));
    }

    const tiles = local.get('tiles');
    const tile = tiles.find(({ width }) => !width);

    this.setState({ tile });
  }

  saveTile() {
    const tile = { ...this.state.tile };

    if (!document.querySelector('.hex .dot')) {
      return;
    }

    const { width, height } = document.querySelector('.tile').getBoundingClientRect();
    tile.width = width;
    tile.height = height;

    tile.startHex = this.getCoords(document.querySelector('.hex .dot'));

    tile.anchors = Array.from(document.querySelectorAll('.anchor-f .dot, .anchor-m .dot'))
      .sort((a, b) => a.dataset.index - b.dataset.index)
      .map(anchor => this.getCoords(anchor));

    const tiles = local.get('tiles');
    const index = tiles.findIndex(({ name }) => name === tile.name);

    tiles[index] = tile;

    local.set('tiles', tiles);

    this.reset();
  }

  getCoords(element) {
    if (!element) return;

    const { top, left } = element.getBoundingClientRect();
    const { scrollX, scrollY } = window;

    const x = Number((left + scrollX).toFixed(3));
    const y = Number((top + scrollY).toFixed(3));

    return [ x, y ];
  }

  reset() {
    this.setState({
      referenceIndex: 0,
      references: {},
      currentReference: false,
    });

    this.getTile();
  }

  updateReference({ metaKey, altKey }, key, value) {
    const { currentReference } = this.state;

    let newValue = value;
    if (metaKey && altKey) {
      newValue /= 4;
    } else if (metaKey) {
      newValue /= 2;
    } else if (altKey) {
      newValue *= 10;
    }

    this.setState(({ references }) => ({
      references: {
        ...references,
        [currentReference]: {
          ...references[currentReference],
          [key]: references[currentReference][key] + newValue,
        },
      },
    }));
  }

  createReference(event, type) {
    const { mouseX, mouseY, referenceIndex } = this.state;

    const reference = {
      id: uuid(),
      index: referenceIndex,
      left: mouseX,
      rotation: 0,
      top: mouseY,
      type,
    };

    this.setState(({ references }) => ({
      referenceIndex: referenceIndex + 1,
      references: {
        ...references,
        [reference.id]: reference,
      },
      currentReference: reference.id,
    }));
  }

  render() {
    const { currentReference, references, tile } = this.state;

    return (
      <div>
        {tile && (
          <img src={`tiles/${tile.name}.png`} className="tile" alt=""/>
        )}
        {Object.values(references).map(reference => (
          <Reference
            key={reference.id}
            handleReferenceSelected={this.handleReferenceSelected}
            isSelected={currentReference === reference.id}
            {...reference}
          />
        ))}
      </div>
    );
  }
}

export default App;
