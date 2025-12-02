export default function Sessions({ 
  sessions, 
  currentSessionId, 
  showSizeSelector, 
  showSizePicker, 
  createNewSession, 
  setShowSizeSelector, 
  loadSession, 
  deleteSession, 
  calculateWinner,
  showNameInput,
  setShowNameInput,
  selectedSize,
  setSelectedSize,
  playerXName,
  setPlayerXName,
  playerOName,
  setPlayerOName,
  handleCreateWithNames
}) {
  return (
    <div className="sessions-panel">
      <h2 className="sessions-title">Game Sessions</h2>
      <button onClick={showSizePicker} className="new-session-button">
        + New Game
      </button>
      
      {showSizeSelector && (
        <div className="size-selector-modal">
          <h3>Select Board Size</h3>
          <div className="size-buttons">
            <button onClick={() => { setSelectedSize(3); setShowSizeSelector(false); setShowNameInput(true); }} className="size-button">
              3x3
            </button>
            <button onClick={() => { setSelectedSize(4); setShowSizeSelector(false); setShowNameInput(true); }} className="size-button">
              4x4
            </button>
            <button onClick={() => { setSelectedSize(5); setShowSizeSelector(false); setShowNameInput(true); }} className="size-button">
              5x5
            </button>
          </div>
          <button onClick={() => setShowSizeSelector(false)} className="cancel-button">
            Cancel
          </button>
        </div>
      )}

      {showNameInput && (
        <div className="size-selector-modal">
          <h3>Enter Player Names</h3>
          <div className="name-inputs">
            <div className="input-group">
              <label>Player X Name:</label>
              <input 
                type="text" 
                value={playerXName} 
                onChange={(e) => setPlayerXName(e.target.value)}
                placeholder="Enter Player X name"
                className="player-name-input"
              />
            </div>
            <div className="input-group">
              <label>Player O Name:</label>
              <input 
                type="text" 
                value={playerOName} 
                onChange={(e) => setPlayerOName(e.target.value)}
                placeholder="Enter Player O name"
                className="player-name-input"
              />
            </div>
          </div>
          <button onClick={handleCreateWithNames} className="size-button">
            Start Game
          </button>
          <button onClick={() => { setShowNameInput(false); setShowSizeSelector(true); }} className="cancel-button">
            Back
          </button>
        </div>
      )}
      
      <div className="sessions-list">
        {sessions.map((session) => {
          const sessionSquares = session.history[session.currentMove];
          const sessionResult = calculateWinner(sessionSquares, session.boardSize || 4);
          const sessionWinner = sessionResult?.winner;
          const sessionDraw = !sessionResult && sessionSquares.every(square => square !== null);
          
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
  );
}