import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import Sessions from './components/sessions';
import RunGame from './components/rungame';
import './stylesheet.css';

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button 
      className={`square ${isWinning ? 'winning-square' : ''}`} 
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, boardSize, playerXName, playerOName }) {
  function handleClick(i) {
    const result = calculateWinner(squares, boardSize);
    const isDraw = squares.every(square => square !== null);
    
    if (result || isDraw || squares[i]) {
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

  const result = calculateWinner(squares, boardSize);
  const winner = result?.winner;
  const winningLine = result?.winningLine || [];
  const isDraw = !result && squares.every(square => square !== null);
  
  let status;
  if (winner) {
    const winnerName = winner === 'X' ? playerXName : playerOName;
    status = 'Winner: ' + winnerName;
  } else if (isDraw) {
    status = "It's a Draw!";
  } else {
    const currentPlayerName = xIsNext ? playerXName : playerOName;
    status = currentPlayerName + '\'s turn ' + (xIsNext ? '\"X\"' : '\"O\"');
  }

  const rows = [];
  for (let row = 0; row < boardSize; row++) {
    const rowSquares = [];
    for (let col = 0; col < boardSize; col++) {
      const index = row * boardSize + col;
      const isWinning = winningLine.includes(index);
      rowSquares.push(
        <Square 
          key={index} 
          value={squares[index]} 
          onSquareClick={() => handleClick(index)}
          isWinning={isWinning}
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
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedSize, setSelectedSize] = useState(4);
  const [playerXName, setPlayerXName] = useState('');
  const [playerOName, setPlayerOName] = useState('');
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

  function handleCreateWithNames() {
    if (!playerXName.trim() || !playerOName.trim()) {
      alert('Please enter both player names');
      return;
    }
    createNewSession(selectedSize, playerXName, playerOName);
    setShowNameInput(false);
    setPlayerXName('');
    setPlayerOName('');
  }

  function createNewSession(size, xName, oName) {
    const totalSquares = size * size;
    const newSession = {
      id: Date.now(),
      name: `Game ${sessions.length + 1} (${size}x${size})`,
      boardSize: size,
      playerXName: xName,
      playerOName: oName,
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
  });

  const result = calculateWinner(currentSquares, boardSize);
  const winner = result?.winner;
  const isDraw = !result && currentSquares.every(square => square !== null);
  const isGameOver = winner || isDraw;
  const currentSession = sessions.find(s => s.id === currentSessionId);

  
  return (
    <div className="game-container">
      <Sessions 
        sessions={sessions}
        currentSessionId={currentSessionId}
        showSizeSelector={showSizeSelector}
        showSizePicker={showSizePicker}
        createNewSession={createNewSession}
        setShowSizeSelector={setShowSizeSelector}
        loadSession={loadSession}
        deleteSession={deleteSession}
        calculateWinner={calculateWinner}
        showNameInput={showNameInput}
        setShowNameInput={setShowNameInput}
        setSelectedSize={setSelectedSize}
        playerXName={playerXName}
        setPlayerXName={setPlayerXName}
        playerOName={playerOName}
        setPlayerOName={setPlayerOName}
        handleCreateWithNames={handleCreateWithNames}
      />
      <RunGame 
        currentSessionId={currentSessionId}
        currentSession={currentSession}
        xIsNext={xIsNext}
        currentSquares={currentSquares}
        handlePlay={handlePlay}
        boardSize={boardSize}
        resetGame={resetGame}
        undo={undo}
        redo={redo}
        currentMove={currentMove}
        history={history}
        Board={Board}
        isGameOver={isGameOver}
        playerXName={currentSession?.playerXName || 'Player X'}
        playerOName={currentSession?.playerOName || 'Player O'}
      />
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
      return { winner: first, winningLine: line };
    }
  }
  return null;
}
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Game />);