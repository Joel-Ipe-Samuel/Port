import React, { useState, useEffect } from 'react'

const Record = ({ onRecordingChange, onResponseReceived }) => {
  const [recording, setRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // API base URL - change this to match your Flask server address
  const API_BASE_URL = 'http://localhost:5000'
  
  const startRecording = async () => {
    try {
      setIsProcessing(true)
      // Call the API endpoint that triggers your Python recording function
      const response = await fetch(`${API_BASE_URL}/api/startRecording`, {
        method: 'GET',
      })
      
      const data = await response.json()
      
      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to start recording')
      }
      
      // If successful, update state
      setRecording(true)
      onRecordingChange(true)
      setIsProcessing(false)
    } catch (error) {
      console.error('Error starting recording:', error)
      setIsProcessing(false)
    }
  }
  
  const stopRecording = async () => {
    try {
      setIsProcessing(true)
      // Call the API endpoint that triggers your Python function to stop recording
      const response = await fetch(`${API_BASE_URL}/api/stopRecording`, {
        method: 'GET',
      })
      
      const data = await response.json()
      
      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to stop recording')
      }
      
      // If successful, update state
      setRecording(false)
      onRecordingChange(false)
      
      // If there's a model response, pass it to the parent
      if (data.response) {
        onResponseReceived(data.response)
      }
      
      setIsProcessing(false)
    } catch (error) {
      console.error('Error stopping recording:', error)
      setIsProcessing(false)
    }
  }
  
  const toggleRecording = () => {
    if (isProcessing) return; // Prevent multiple clicks while processing
    
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }
  
  return (
    <button 
      onClick={toggleRecording}
      disabled={isProcessing}
      className={`p-4 rounded-full ${isProcessing ? "bg-gray-500" : 
                                     recording ? "bg-red-600" : "bg-blue-600"} 
                 hover:opacity-90 transition-colors`}
    >
      {isProcessing ? "Processing..." : 
       recording ? "Stop Recording" : "Start Recording"}
    </button>
  )
}

export default Record