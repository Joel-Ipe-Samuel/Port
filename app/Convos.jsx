'use client';
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs,doc,getDoc,onSnapshot } from 'firebase/firestore';
import { db, auth } from './fire/fbconfig';

// Parent component to manage state
const Convos = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversations on component mount
  useEffect(() => {
    const userId = auth.currentUser?.uid || 'anonymous';
  
    const q = query(
      collection(db, "conversations"),
      orderBy("lastMessageAt", "desc")
    );
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const conversationsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: `Conversation ${new Date(data.createdAt?.toDate()).toLocaleDateString() || 'Unknown date'}`,
          preview: `${data.messageCount || 0} messages`,
          timestamp: data.lastMessageAt?.toDate() || new Date(),
        };
      });
  
      setConversations(conversationsData);
      setLoading(false);
    });
  
    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Fetch messages when a conversation is selected
  const handleConversationSelect = async (conversationId) => {
    try {
      setLoading(true);
      setSelectedConversation(conversationId);
  
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationSnap = await getDoc(conversationRef);
  
      if (conversationSnap.exists()) {
        const data = conversationSnap.data();
        
        // Convert messages object into an array
        const messagesData = Object.keys(data.messages || {})
          .map((key) => ({
            id: key,
            content: data.messages[key].message,
            sender: data.messages[key].sender,
            timestamp: data.messages[key].timestamp?.toDate() || new Date(),
            isRead: data.messages[key].isRead,
          }))
          .sort((a, b) => a.timestamp - b.timestamp); // Ensure messages are sorted by timestamp
  
        setMessages(messagesData);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[80vh]">
      {/* Sidebar with conversation list */}
      <ConversationList 
        conversations={conversations} 
        loading={loading} 
        selectedConversation={selectedConversation}
        onSelectConversation={handleConversationSelect} 
      />
      
      {/* Main message view */}
      <MsgView
        messages={messages} 
        conversationId={selectedConversation} 
        loading={loading} 
      />
    </div>
  );
};

// Sidebar component that only handles the conversation list
const ConversationList = ({ conversations, loading, selectedConversation, onSelectConversation }) => {
  return (
    <div className="w-80 border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Past Sessions</h2>
      </div>
      
      {loading && conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No past conversations found</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div 
              key={conversation.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation === conversation.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <h3 className="font-medium">{conversation.title}</h3>
              <p className="text-sm text-gray-500">{conversation.preview}</p>
              <p className="text-xs text-gray-400 mt-1">
                {conversation.timestamp.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// New component to display messages
const MessageView = ({ messages, conversationId, loading }) => {
  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a conversation to view messages</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">Conversation</h2>
      
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages in this conversation</p>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-blue-100 self-end ml-auto' 
                  : 'bg-gray-100'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Convos;