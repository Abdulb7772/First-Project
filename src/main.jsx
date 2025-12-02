import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import './stylesheet.css';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, boardSize }) {
  function handleClick(i) {
    const winner = calculateWinner(squares, boardSize);
    const isDraw = squares.every(square => square !== null);
    
    if (winner || isDraw || squares[i]) {
      return;
    }
    
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares, boardSize);
  const isDraw = !winner && squares.every(square => square !== null);
  
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (isDraw) {
    status = "It's a Draw!";
  } else {
    status = 'Player ' + (xIsNext ? 'X' : 'O') + '\'s turn';
  }

  const rows = [];
  for (let row = 0; row < boardSize; row++) {
    const rowSquares = [];
    for (let col = 0; col < boardSize; col++) {
      const index = row * boardSize + col;
      rowSquares.push(
        <Square 
          key={index} 
          value={squares[index]} 
          onSquareClick={() => handleClick(index)} 
        />
      );
    }
    rows.push(
      <div key={row} className="board-row">
        {rowSquares}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {rows}
    </>
  );
}

export default function Game() {
  const loadSessions = () => {
    const saved = localStorage.getItem('gameSessions');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  };

  const [sessions, setSessions] = useState(loadSessions);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [boardSize, setBoardSize] = useState(4);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [history, setHistory] = useState([Array(16).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  useEffect(() => {
    localStorage.setItem('gameSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId !== null) {
      const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
      if (sessionIndex !== -1) {
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          history,
          currentMove,
          boardSize,
          lastPlayed: new Date().toISOString()
        };
        setSessions(updatedSessions);
      }
    }
  }, [history, currentMove]);

  function showSizePicker() {
    setShowSizeSelector(true);
  }

  function createNewSession(size) {
    const totalSquares = size * size;
    const newSession = {
      id: Date.now(),
      name: `Game ${sessions.length + 1} (${size}x${size})`,
      boardSize: size,
      history: [Array(totalSquares).fill(null)],
      currentMove: 0,
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString()
    };
    setSessions([...sessions, newSession]);
    setCurrentSessionId(newSession.id);
    setBoardSize(size);
    setHistory(newSession.history);
    setCurrentMove(newSession.currentMove);
    setShowSizeSelector(false);
  }

  function loadSession(sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setBoardSize(session.boardSize || 4);
      setHistory(session.history);
      setCurrentMove(session.currentMove);
    }
  }

  function deleteSession(sessionId) {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setBoardSize(4);
      setHistory([Array(16).fill(null)]);
      setCurrentMove(0);
    }
  }

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function undo() {
    if (currentMove > 0) {
      setCurrentMove(currentMove - 1);
    }
  }

  function redo() {
    if (currentMove < history.length - 1) {
      setCurrentMove(currentMove + 1);
    }
  }

  function resetGame() {
    const totalSquares = boardSize * boardSize;
    setHistory([Array(totalSquares).fill(null)]);
    setCurrentMove(0);
  }

  const moves = history.slice(1).map((squares, move) => {
    const actualMove = move + 1;
    return (
      <li key={actualMove}>
        <button onClick={() => jumpTo(actualMove)}>Go to move #{actualMove}</button>
      </li>
    );
  });

  const winner = calculateWinner(currentSquares);
  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="game-container">
      <div className="sessions-panel">
        <h2 className="sessions-title">Game Sessions</h2>
        <button onClick={showSizePicker} className="new-session-button">
          + New Game
        </button>
        
        {showSizeSelector && (
          <div className="size-selector-modal">
            <h3>Select Board Size</h3>
            <div className="size-buttons">
              <button onClick={() => createNewSession(4)} className="size-button">
                4x4
              </button>
              <button onClick={() => createNewSession(5)} className="size-button">
                5x5
              </button>
            </div>
            <button onClick={() => setShowSizeSelector(false)} className="cancel-button">
              Cancel
            </button>
          </div>
        )}
        
        <div className="sessions-list">
          {sessions.map((session) => {
            const sessionSquares = session.history[session.currentMove];
            const sessionWinner = calculateWinner(sessionSquares, session.boardSize || 4);
            const sessionDraw = !sessionWinner && sessionSquares.every(square => square !== null);
            
            return (
              <div 
                key={session.id} 
                className={`session-card ${currentSessionId === session.id ? 'active' : ''}`}
              >
                <div className="session-header">
                  <h3>{session.name}</h3>
                  {sessionWinner && <span className="winner-badge">Winner: {sessionWinner}</span>}
                  {sessionDraw && <span className="draw-badge">Draw</span>}
                </div>
                <p className="session-info">
                  Moves: {session.currentMove} | Last played: {new Date(session.lastPlayed).toLocaleString()}
                </p>
                <div className="session-actions">
                  <button 
                    onClick={() => loadSession(session.id)}
                    className="load-button"
                  >
                    Load
                  </button>
                  <button 
                    onClick={() => deleteSession(session.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {sessions.length === 0 && (
            <p className="empty-message">No saved games. Create a new game to start!</p>
          )}
        </div>
      </div>

      <div className="game">
        {currentSessionId ? (
          <>
            <div className="game-board">
              <h2 className="current-game-title">{currentSession?.name}</h2>
              <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} boardSize={boardSize} />
              <div className="game-controls">
                <button 
                  onClick={undo}
                  disabled={currentMove === 0}
                  className="undo-button"
                >
                  ⟲ Undo
                </button>
                <button 
                  onClick={redo}
                  disabled={currentMove === history.length - 1}
                  className="redo-button"
                >
                  ⟳ Redo
                </button>
              </div>
              <button 
                onClick={resetGame}
                className="reset-button"
              >
                Reset Game
              </button>
            </div>
            <div className="game-info">
              <ol>{moves}</ol>
            </div>
          </>
        ) : (
          <div className="no-session">
            <h2>No game selected</h2>
            <p>Create a new game or load an existing one from the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}

function calculateWinner(squares, boardSize = 4) {
  const lines = [];
  
  // Rows
  for (let row = 0; row < boardSize; row++) {
    const line = [];
    for (let col = 0; col < boardSize; col++) {
      line.push(row * boardSize + col);
    }
    lines.push(line);
  }
  
  // Columns
  for (let col = 0; col < boardSize; col++) {
    const line = [];
    for (let row = 0; row < boardSize; row++) {
      line.push(row * boardSize + col);
    }
    lines.push(line);
  }
  
  // Diagonal (top-left to bottom-right)
  const diag1 = [];
  for (let i = 0; i < boardSize; i++) {
    diag1.push(i * boardSize + i);
  }
  lines.push(diag1);
  
  // Diagonal (top-right to bottom-left)
  const diag2 = [];
  for (let i = 0; i < boardSize; i++) {
    diag2.push(i * boardSize + (boardSize - 1 - i));
  }
  lines.push(diag2);
  
  // Check all lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const first = squares[line[0]];
    if (first && line.every(index => squares[index] === first)) {
      return first;
    }
  }
  return null;
}
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Game />);