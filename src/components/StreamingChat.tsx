import React, { useState, useRef, useEffect } from 'react';
import { useStreamingChat } from '../hooks/useStreamingChat';
import './StreamingChat.css';

const StreamingChat: React.FC = () => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    isLoading, 
    currentProgress, 
    currentStatus, 
    discoveredSources,
    sendMessage,
    clearMessages 
  } = useStreamingChat();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    await sendMessage(input.trim());
    setInput('');
  };

  const formatMessage = (content: string) => {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="streaming-chat">
      {/* Header */}
      <div className="chat-header">
        <h2>Strategic AI Assistant</h2>
        <button onClick={clearMessages} className="clear-button">
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user' : 'ai'}`}
          >
            <div className="message-bubble">
              <div 
                className="message-content"
                dangerouslySetInnerHTML={{ 
                  __html: formatMessage(message.content) 
                }}
              />
              
              {/* Progress and Status */}
              {!message.isUser && !message.isComplete && (message.progress || message.status) && (
                <div className="message-progress">
                  {message.progress !== undefined && (
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${message.progress}%` }}
                        />
                      </div>
                      <span className="progress-text">{message.progress}%</span>
                    </div>
                  )}
                  {message.status && (
                    <div className="status-text">{message.status}</div>
                  )}
                </div>
              )}
              
              {/* Sources */}
              {!message.isUser && message.sources && message.sources.length > 0 && (
                <div className="sources-section">
                  <h4>📚 Sources ({message.sources.length})</h4>
                  <div className="sources-grid">
                    {message.sources.map((source, index) => (
                      <div key={index} className="source-card">
                        {source.clickable && source.url ? (
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="source-link"
                          >
                            <div className="source-icon">🔗</div>
                            <div className="source-info">
                              <div className="source-name">{source.name}</div>
                              <div className="source-type">{source.type || 'Web Source'}</div>
                            </div>
                          </a>
                        ) : (
                          <div className="source-item">
                            <div className="source-icon">📄</div>
                            <div className="source-info">
                              <div className="source-name">{source.name}</div>
                              <div className="source-type">Expert Analysis</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Metadata */}
              {!message.isUser && message.isComplete && (message.confidence || message.methodology) && (
                <div className="message-metadata">
                  {message.confidence && (
                    <span className="confidence">
                      Confidence: {message.confidence}%
                    </span>
                  )}
                  {message.methodology && (
                    <span className="methodology">
                      {message.methodology}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Live Loading Indicator */}
        {isLoading && (
          <div className="message ai">
            <div className="message-bubble loading">
              <div className="loading-content">
                <div className="loading-text">{currentStatus || 'Processing...'}</div>
                {currentProgress > 0 && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill animate" 
                        style={{ width: `${currentProgress}%` }}
                      />
                    </div>
                    <span className="progress-text">{currentProgress}%</span>
                  </div>
                )}
                
                {/* Live Sources Discovery */}
                {discoveredSources.length > 0 && (
                  <div className="live-sources">
                    <div className="sources-header">
                      📚 Discovered Sources ({discoveredSources.length})
                    </div>
                    {discoveredSources.slice(-3).map((source, index) => (
                      <div key={index} className="source-preview">
                        {source.clickable ? '🔗' : '📄'} {source.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about business strategy, market research, or just say hello..."
            disabled={isLoading}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            type="button"
            onClick={() => setInput("What market entry strategy should we use for European expansion?")}
            disabled={isLoading}
            className="quick-action"
          >
            Market Entry Strategy
          </button>
          <button 
            type="button"
            onClick={() => setInput("Analyze the competitive landscape for fintech startups")}
            disabled={isLoading}
            className="quick-action"
          >
            Competitive Analysis
          </button>
          <button 
            type="button"
            onClick={() => setInput("What are the latest trends in AI regulation?")}
            disabled={isLoading}
            className="quick-action"
          >
            Regulatory Trends
          </button>
        </div>
      </form>
    </div>
  );
};

export default StreamingChat;
