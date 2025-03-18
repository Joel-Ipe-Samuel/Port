import React from "react";

const ConvoItem = ({ conversation, isSelected, onSelect }) => {
  // Format the timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // If it's today, show time
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // If it's yesterday, show "Yesterday"
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    // Otherwise show date
    else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div 
      className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
        isSelected ? 'bg-gray-600' : ''
      }`}
      onClick={() => onSelect(conversation.id)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-white truncate">{conversation.title}</h3>
        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
          {formatDate(conversation.timestamp)}
        </span>
      </div>
      <p className="text-sm text-gray-400 mt-1 truncate">{conversation.preview}</p>
      <div className="flex items-center mt-2">
        <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
        <p className="text-xs text-gray-500">
          {new Date(conversation.timestamp).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default ConvoItem;