export default function Sessions({ 
  sessions, 
  currentSessionId, 
  showSizeSelector, 
  showSizePicker, 
  createNewSession, 
  setShowSizeSelector, 
  loadSession, 
  deleteSession, 
  calculateWinner 
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
            <button onClick={() => createNewSession(3)} className="size-button">
              3x3
            </button>
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