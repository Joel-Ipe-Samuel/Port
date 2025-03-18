'use client'
import React, { useEffect, useState } from 'react'
import Record from './Record'
import Convos from './components/Convos'

const page = () => {
  const [botState, setBotState] = useState('Hey there! I got you—here to listen to you.😊💙')
  const [isRecording, setIsRecording] = useState(false)
  const [botResponse, setBotResponse] = useState('')

  useEffect(() => {
    if (isRecording) {
      setBotState("I'm listening to you now... 🎙️ Press again to stop.")
    } else if (botResponse) {
      // When recording stops and there's a response, show it
      setBotState(botResponse)
    } else {
      setBotState('Hey there! I got you—here to listen to you.😊💙')
    }
  }, [isRecording, botResponse])

  const handleSignOut = () => {
    auth.signOut()
    router.push('/login')
  }

  const handleResponseReceived = (response) => {
    setBotResponse(response)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header nav */}
      <div className="flex justify-end space-x-6 mb-8 pr-4">
        <button 
          className="text-xl text-gray-300 hover:text-white"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
        <button className="text-xl text-gray-300 hover:text-white">Contact Us</button>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Conversation sidebar */}
        <div className="w-full md:w-1/2 bg-gray-800 rounded-lg p-4 h-[80vh] overflow-y-auto">
          <Convos />
        </div>

        {/* Chat interface */}
        <div className="w-full md:w-2/3 flex flex-col justify-between h-[80vh] md:mr-8">
          <h4 className="text-3xl text-gray-200 mb-6">Talk to the bot</h4>
          
          <div className="flex-grow flex items-center justify-center">
            <h4 className="text-3xl text-gray-300">{botState}</h4>
          </div>
          
          <Record 
            onRecordingChange={setIsRecording} 
            onResponseReceived={handleResponseReceived}
          />
        </div>
      </div>
    </div>
  )
}

export default page