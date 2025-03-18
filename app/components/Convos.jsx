import React, { useState, useEffect } from "react";
import ConversationList from "./ConversationList";
import MsgView from "./MsgView";
import UserProfile from './UserProfile';

const Convos = ({ initialConversationId }) => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'list', 'split', or 'messages'

  useEffect(() => {
    // When initialConversationId changes, select it
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  const handleSelectConversation = (conversationId) => {
    setLoading(true);
    setSelectedConversationId(conversationId);
    // Switch to message view on mobile when selecting a conversation
    if (window.innerWidth < 768) {
      setViewMode('messages');
    }
    setTimeout(() => setLoading(false), 500); // Short timeout for UI feedback
  };

  const toggleViewMode = () => {
    // Cycle through view modes: split -> list -> messages -> split
    if (viewMode === 'split') setViewMode('list');
    else if (viewMode === 'list') setViewMode('messages');
    else setViewMode('split');
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden">
      {/* User profile and view mode toggle - fixed height */}
      <div className="flex-none">
        <UserProfile />
        
        {/* View mode toggle button */}
        <div className="flex justify-end px-4 py-2 border-t border-gray-700">
          <button 
            onClick={toggleViewMode}
            className="text-sm bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded"
          >
            {viewMode === 'split' ? 'Show List Only' : 
             viewMode === 'list' ? 'Show Messages Only' : 'Split View'}
          </button>
        </div>
      </div>
      
      {/* Conversation area - should take remaining height and handle scrolling */}
      <div className="flex flex-1 min-h-0 border-t border-gray-700">
        {/* Conversation List - Hidden in messages-only mode */}
        {viewMode !== 'messages' && (
          <div className={`${viewMode === 'list' ? 'w-full' : 'w-1/3 md:w-80'} h-full overflow-hidden`}>
            <ConversationList
              selectedConversation={selectedConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </div>
        )}
        
        {/* Message View - Hidden in list-only mode */}
        {viewMode !== 'list' && (
          <div className={`${viewMode === 'messages' ? 'w-full' : 'w-2/3 md:flex-1'} h-full overflow-hidden`}>
            <MsgView
              conversationId={selectedConversationId}
              loading={loading}
              onBack={() => setViewMode('list')} // Allow returning to list view
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Convos;