'use client';
import React, { useState } from 'react';
import { auth } from '../fire/fbconfig'; // Assuming this is your Firebase auth setup

const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchAndDownloadUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the current user
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      // Get user information
      const userId = currentUser.uid;
      const displayName = currentUser.displayName || 'Unknown User';
      const email = currentUser.email || 'no-email';
      
      // Fetch the user profile data with the current user's information
      const response = await fetch(`http://localhost:8000/user-profile?userId=${userId}&userName=${encodeURIComponent(displayName)}&email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
      }
      
      const profileData = await response.json();
      
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element for download
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `user_profile_${displayName.replace(/\s+/g, '_')}.json`;
      
      // Trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching or downloading user profile:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4">
      <h4 
        className="text-xl border-b border-white cursor-pointer hover:text-blue-500 transition-colors flex items-center" 
        onClick={fetchAndDownloadUserProfile}
      >
        User Profile
        {loading && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
      </h4>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          Error: {error}
        </div>
      )}
      
      <div className="mt-2 text-sm text-gray-400">
        Click to download your profile data
      </div>
    </div>
  );
};

export default UserProfile;