export default function RunGame({ 
  currentSessionId, 
  currentSession, 
  xIsNext, 
  currentSquares, 
  handlePlay, 
  boardSize, 
  resetGame, 
  undo, 
  redo, 
  currentMove, 
  history, 
  Board,
  isGameOver
}) {
  const moves = history.slice(1).map((squares, move) => {
    const actualMove = move + 1;
    });

  return (
    <div className="game">
      {currentSessionId ? (
        <>
          <div className="game-board">
            <h2 className="current-game-title">{currentSession?.name}</h2>
            <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} boardSize={boardSize} />
            <div className="game-controls">
              <button 
                onClick={undo}
                disabled={currentMove === 0 || isGameOver}
                className="undo-button"
              >
                ⟲
              </button>
              <button 
                onClick={redo}
                disabled={currentMove === history.length - 1 || isGameOver}
                className="redo-button"
              >
                ⟳
              </button>
            </div>
            <button 
              onClick={resetGame}
              disabled={currentMove === 0 && history.length === 1 || isGameOver}
              className="reset-button"
            >
              Reset
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
  )
}