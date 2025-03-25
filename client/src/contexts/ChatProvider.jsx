import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState({});
  const [currentChat, setCurrentChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Connect to chat service when user logs in
  useEffect(() => {
    if (user && !connected) {
      const newSocket = io(`${import.meta.env.VITE_APP_SERVER_URL}/chat`, {
        transports: ['websocket'],
        auth: {
          token: localStorage.getItem('token')
        }
      });
      
      newSocket.on('connect', () => {
        setConnected(true);
        setSocket(newSocket);
        
        // Fetch contacts
        fetchContacts();
      });
      
      newSocket.on('message', (data) => {
        const { sender, recipient, content, timestamp } = data;
        
        // Decrypt message if encrypted
        const decryptedContent = decryptMessage(content);
        
        // Get chat ID (combination of both user IDs)
        const chatId = getChatId(sender, recipient);
        
        // Add message to state
        setMessages(prev => ({
          ...prev,
          [chatId]: [
            ...(prev[chatId] || []),
            {
              sender,
              content: decryptedContent,
              timestamp
            }
          ]
        }));
      });
      
      return () => {
        if (newSocket) {
          newSocket.disconnect();
          setConnected(false);
        }
      };
    }
  }, [user, connected]);
  
  // Fetch user's contacts (mutual subscribers)
  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/users/mutuals`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Send message to contact
  const sendMessage = (recipientId, content) => {
    if (!socket || !connected) return;
    
    // Encrypt message
    const encryptedContent = encryptMessage(content);
    
    const messageData = {
      recipient: recipientId,
      content: encryptedContent
    };
    
    socket.emit('sendMessage', messageData);
    
    // Add to local state
    const chatId = getChatId(user.id, recipientId);
    setMessages(prev => ({
      ...prev,
      [chatId]: [
        ...(prev[chatId] || []),
        {
          sender: user.id,
          content,
          timestamp: new Date().toISOString()
        }
      ]
    }));
  };
  
  // Helper function to generate chat ID
  const getChatId = (id1, id2) => {
    return [id1, id2].sort().join('-');
  };
  
  // Encrypt message with AES
  const encryptMessage = (message) => {
    try {
      return CryptoJS.AES.encrypt(message, 'shared-secret-key').toString();
    } catch (err) {
      console.error('Encryption error:', err);
      return message;
    }
  };
  
  // Decrypt message
  const decryptMessage = (encryptedMessage) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, 'shared-secret-key');
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      console.error('Decryption error:', err);
      return encryptedMessage;
    }
  };
  
  const value = {
    contacts,
    messages,
    currentChat,
    setCurrentChat,
    connected,
    loading,
    error,
    sendMessage,
    fetchContacts
  };
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 