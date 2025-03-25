import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import './ChatBox.css';

const ChatBox = () => {
  const { socket, playerId } = useGame();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for chat messages
    socket.on('chatMessage', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Increment unread count if chat is closed
      if (!isChatOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });
    
    // Listen for chat history on connection
    socket.on('chatHistory', (history) => {
      setMessages(history);
    });
    
    return () => {
      socket.off('chatMessage');
      socket.off('chatHistory');
    };
  }, [socket, isChatOpen]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    
    socket.emit('sendChatMessage', {
      text: newMessage,
      timestamp: new Date().toISOString()
    });
    
    setNewMessage('');
    
    // Focus input after sending
    inputRef.current?.focus();
  };
  
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
    if (!isChatOpen) {
      // Reset unread count when opening
      setUnreadCount(0);
      
      // Focus input when opening
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };
  
  // Handle Escape key to close chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      } else if (e.key === 'Enter' && !isChatOpen) {
        setIsChatOpen(true);
        setUnreadCount(0);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen]);
  
  return (
    <>
      <button 
        className="chat-toggle"
        onClick={toggleChat}
      >
        {isChatOpen ? '✕' : (
          <>
            💬 {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </>
        )}
      </button>
      
      <div 
        ref={chatRef}
        className={`chat-box ${isChatOpen ? 'visible' : 'hidden'}`}
      >
        <div className="chat-header">
          <h3>Game Chat</h3>
          <div className="chat-controls">
            <span className="chat-hint">ESC to close</span>
          </div>
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 ? (
            <p className="no-messages">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={msg.id || index} 
                className={`message ${msg.playerId === playerId ? 'own-message' : ''}`}
              >
                <div className="message-sender" style={{ color: msg.color }}>
                  {msg.sender}
                </div>
                <div className="message-text">{msg.text}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={200}
          />
          <button type="submit" disabled={!newMessage.trim()}>Send</button>
        </form>
      </div>
    </>
  );
};

export default ChatBox; 