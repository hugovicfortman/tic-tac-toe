import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props)
{
    return (
      <button className={`${ (props.isWinner)? "winner ": "" }square`} onClick={ props.onClick }>
        { props.value }
      </button>
    );
}

class Board extends React.Component {

    renderSquare(i) {
        const isWinningSquare = this.props.winner && this.props.winner.includes(i);
        return (
            <Square key={i}
                value={this.props.squares[i]} 
                onClick={ () => this.props.onClick(i) } 
                isWinner={ isWinningSquare }
            />
        );
    }

    renderHeader(i) {
        return (
            <span key={i} className="square-col-header square-header">{i}</span>
        );
    }

    renderBoard() {
        const rowCount = 3;

        const rows = [];
        
        for(let i = 0; i <= rowCount; i++)
        {
            rows.push((i)? this.renderBoardColumns(i) : this.renderBoardHeaderColumns(i));
        }
        return rows;
    }

    renderBoardHeaderColumns(i)
    {
        const cols = [];
        for(let j = 1; j <= 3; j++)
        {
            cols.push(this.renderHeader(j));
        }

        return (
            <div className="board-row" key={i}>
                <span className="square-col-header square-row-header square-header">{i}</span>
                { cols }
            </div>
        );
    }

    renderBoardColumns(i)
    {
        const cols = [];
        for(let j = 0; j < 3; j++)
        {
            cols.push(this.renderSquare(j + ((i-1) * 3)));
        }
        return (
            <div className="board-row" key={i}>
                <span className="square-row-header square-header">{i}</span>
                { cols }
            </div>
        );
    }

    render() {

        return (
            <div className="board-inner">
                { this.renderBoard() }
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props)
    {
        super(props);
        this.state = {
            history : [{
                squares: new Array(9).fill(null),
                play: null,
            }],
            reverseHistory: false,
            stepNumber: 0,
            xIsNext : true,
        };
    }

    handleClick(i)
    {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if( calculateWinner(squares) || squares[i])
        {
            return;
        }

        let shouldX = this.state.xIsNext;
        squares[i] = shouldX? 'X' : 'O';
        this.setState({ 
            history : this.state.history.concat([{ 
                squares : squares,
                play: {
                    player : shouldX? 'X' : 'O',
                    coord : {
                        X : (i%3) + 1,
                        Y : Math.floor(i/3) + 1,
                    },
                },
            }]),
            stepNumber: this.state.history.length,
            xIsNext : !this.state.xIsNext,
        });
    }

    jumpTo(step)
    {
        const history = this.state.history.slice(0, step + 1);
        this.setState({
            history : history,
            stepNumber: step,
            xIsNext: (step % 2) === 0, // Since 0 is true, 1 is false, every even is true...
        });
    }

    flipHistory()
    {
        this.setState({
            reverseHistory : !this.state.reverseHistory,
        });
    }


    render() {
        const history = this.state.history;
        const current = history[history.length - 1];
        const isLastMove = history.length > current.squares.length;
        const winningLine = calculateWinner(current.squares);
        const winner = (winningLine)?current.squares[winningLine[0]] : winningLine;
        let status;
        if(winner)
        {
            status = `Winner: ${ winner }`;
        }else if(!isLastMove){
            status = `Next player: ${ (this.state.xIsNext? 'X' : 'O') }`;
        }else{
            status = "It's a Draw!";
        }

        const moves = this.state.history.map((step, move) => {
            const play = step.play;
            const desc = move? 
            `Go to move #${ move }: ${ play.player } to (${ play.coord.X },${ play.coord.Y })` : 
            'Go to start';

            const btnClass = `btn-jump${ (move === this.state.history.length - 1)?' current': '' }`;

            return (
                <li key={ move }>
                    <button className={ btnClass } onClick={ () => this.jumpTo(move) } 
                        >{ desc }</button>
                </li>
            );
        });

        // Reverse the moves list if we have activated the toggle...
        let flipAction = (this.state.reverseHistory)? "Unflip" : "Flip";
        let flipClassName = `btn-oval-y${(this.state.reverseHistory)? " current" : ""}`;
        if(this.state.reverseHistory)
        {
            moves.reverse();
        }

        return (
            <div className="game">
                <div className={ `game-board${ (isLastMove && !winner)?" draw": "" }` }>
                    <Board squares={ current.squares } 
                            onClick={ (i) => this.handleClick(i) } 
                            winner={ winningLine } />
                </div>
                <div className="game-info">
                    <div className="game-status">{ status }</div>
                    <div className="moves-list">
                        <ul>{ moves }</ul>
                    </div>
                    <br/>
                    <div>
                        <button title="Flip History" className={ flipClassName } 
                            onClick={ () => this.flipHistory() }>
                            &#8645; <small>{ flipAction } the History</small>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}


function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return lines[i];
        }
    }
    return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);