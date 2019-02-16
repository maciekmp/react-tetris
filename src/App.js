import React, { Component } from 'react';
import styled from '@emotion/styled'

const Score = styled.div`
font-size: 20px;
text-align: center;
`;

const Game = styled.div`
width: 400px;
height: 600px;
border: solid 10px black;
margin: 140px auto;
overflow: hidden;
`;
const Cell = styled.div`
float: left;
width: 40px;
height: 40px;
background: ${({ active }) => active ? 'green' : 'red'};
outline: solid 1px white;
position: relative;
top: -120px;
`;

const figures = [
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1],
    [1],
    [1],
    [1],
  ],
  [
    [0,1,0],
    [1,1,1],
  ],
];

const ROW = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const TICK = 500;

class App extends Component {
  state = {
    area: Array.from(Array(18), () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    figurePosition: [0, 0],
    currentFigure: this.getRandomFigure(),
    points: 0,
  }
  componentDidMount() {
    setInterval(this.tick, TICK);
    window.addEventListener('keydown', this.handleKeyDown);
  }
  handleKeyDown = (e) => {
    const figurePosition = [...this.state.figurePosition];
    const { currentFigure } = this.state;
    const gameWidth = this.state.area[0].length;
    switch (e.key) {
      case 'ArrowRight':
        if (figurePosition[0] + currentFigure[0].length < gameWidth) {
          if (!this.willCollide(1)) {
            figurePosition[0]++;
          }
        }
        break;
      case 'ArrowLeft':
        if (figurePosition[0] > 0) {
          if (!this.willCollide(-1)) {
            figurePosition[0]--;
          }
        }
        break;
      case 'ArrowUp':
        this.setState({
          currentFigure: this.rotate(this.state.currentFigure),
        });
        break;
      case 'ArrowDown':
        if (!this.willCollide(0, 1)) {
          figurePosition[1]++;
        }
        break;
      default:
    }
    this.setState({
      figurePosition,
    });
  }
  getRandomFigure() {
    return figures[Math.floor(Math.random() * figures.length)];
  }
  rotate = (matrix) => {
    matrix = matrix.reverse();
    return matrix[0].map((column, index) => (
      matrix.map(row => row[index])
    ));
  }
  tick = () => {
    const { figurePosition } = this.state;
    // collision with bottom of the game
    if (figurePosition[1] + this.state.currentFigure.length < this.state.area.length) {
      const collision = this.willCollide(0, 1);
      if (collision) {
        const area = this.mergeFigureToArea();
        const points = this.checkFullRows(area);
        this.setState({
          area,
          figurePosition: [0, 0],
          currentFigure: this.getRandomFigure(),
          points,
        });
      } else {
        this.setState({
          figurePosition: [
            figurePosition[0],
            ++figurePosition[1],
          ]
        });
      }
    } else {
      // merge figure into area
      const area = this.mergeFigureToArea();
      const points = this.checkFullRows(area);
      // reset position of figure
      this.setState({
        area,
        figurePosition: [0, 0],
        currentFigure: this.getRandomFigure(),
        points,
      });
    }
  }

  checkFullRows = (area) => {
    let { points } = this.state;
    area.forEach((row, rowIndex) => {
      const fullRow = row.every(cell => cell);
      if (fullRow) {
        points += 10;
        area.splice(rowIndex, 1);
        area.unshift(ROW);
      }
    })
    return points;
  }

  willCollide = (changeX = 0, changeY = 0) => {
    const { figurePosition } = this.state;
    const newAreaTest = this.mergeFigureToArea(figurePosition[0] + changeX, figurePosition[1] + changeY);
    return newAreaTest.find(row => row.find(cell => cell === 2));
  }

  mergeFigureToArea = (positionX = this.state.figurePosition[0], positionY = this.state.figurePosition[1]) => {
    return this.state.area.map((row, rowIndex) => row.map((cell, cellIndex) => {
      const { currentFigure } = this.state;
      const figureCell = currentFigure[rowIndex - positionY] && currentFigure[rowIndex - positionY][cellIndex - positionX];
      return (figureCell || 0) + cell;
    }));
  }

  render() {
    return (
      <React.Fragment>
        <Score>
          Punkty: {this.state.points}
        </Score>
        <Game>
          {this.state.area.map((row, rowIndex) => row.map((cell, cellIndex) => {
            const { currentFigure, figurePosition } = this.state;
            const figureCell = currentFigure[rowIndex - figurePosition[1]] && currentFigure[rowIndex - figurePosition[1]][cellIndex - figurePosition[0]];
            return (
              <Cell
                key={`${rowIndex}:${cellIndex}`}
                active={figureCell || cell}
              />
            )
          }))}
        </Game>
      </React.Fragment>
    );
  }
}

export default App;
