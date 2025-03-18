import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db, auth } from "../fire/fbconfig";
import ConvoItem from "./ConvoItem";

const ConversationList = ({ selectedConversation, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
      collection(db, "conversations"),
      where("participantId", "==", userId),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const conversationsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || `Conversation ${new Date(data.createdAt?.toDate()).toLocaleDateString()}`,
          preview: `${data.messageCount || 0} messages`,
          timestamp: data.lastMessageAt?.toDate() || new Date(),
        };
      });

      setConversations(conversationsData);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-800 border-r border-gray-700">
      {/* Header - fixed height */}
      <div className="p-4 border-b border-gray-700 flex-none">
        <h2 className="text-xl font-semibold text-white mb-2">Past Sessions</h2>
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Conversations list - scrollable */}
      <div className="flex-1 overflow-y-auto" 
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937'
        }}
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 h-full">
            {searchTerm ? (
              <p className="text-gray-400">No matching conversations found</p>
            ) : (
              <>
                <p className="text-gray-400">No past conversations found</p>
                <p className="text-gray-500 text-sm mt-2">Record a message to start a new conversation</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700 text-gray-400 text-sm z-10">
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
            </div>
            {filteredConversations.map((conversation) => (
              <ConvoItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation === conversation.id}
                onSelect={onSelectConversation}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;