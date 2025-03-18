import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../fire/fbconfig';

const MsgView = ({ conversationId, loading, onBack }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        content: doc.data().message,
        sender: doc.data().sender,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        isRead: doc.data().isRead || false,
      }));

      setMessages(messagesData);

      // Mark unread messages as read
      messagesData.forEach(message => {
        if (!message.isRead && message.sender === 'bot') {
          const messageRef = doc(db, "conversations", conversationId, "messages", message.id);
          updateDoc(messageRef, { isRead: true }).catch(error => 
            console.error("Error marking message as read:", error)
          );
        }
      });
    });

    return () => unsubscribe(); // Cleanup Firestore listener
  }, [conversationId]);

  // Scroll to bottom when messages change or conversation changes
  useEffect(() => {
    // Use a small timeout to ensure DOM is updated
    const scrollTimeout = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    return () => clearTimeout(scrollTimeout);
  }, [messages, conversationId]);

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Select a conversation to view messages</p>
          <p className="text-gray-500 mt-2">Or record a new message to start a conversation</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header with back button - fixed at top */}
      <div className="flex items-center p-4 border-b border-gray-700 bg-gray-900">
        <button 
          onClick={onBack}
          className="mr-4 md:hidden p-2 rounded-full bg-gray-700 hover:bg-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-white">Conversation</h2>
      </div>
      
      {/* Messages scrollable container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 pb-6"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages in this conversation</p>
          </div>
        ) : (
          <>
            {Object.entries(messageGroups).map(([date, messagesForDate]) => (
              <div key={date} className="mb-6">
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-xs">
                    {date}
                  </span>
                </div>
                {messagesForDate.map((message) => (
                  <div 
                    key={message.id} 
                    className={`mb-4 ${
                      message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'
                    }`}
                  >
                    <div className={`p-3 rounded-lg max-w-[80%] ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      <p className="text-md break-words">{message.content}</p>
                      <p className="text-xs text-opacity-75 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} className="h-1 w-full" />
          </>
        )}
      </div>
    </div>
  );
};

export default MsgView;