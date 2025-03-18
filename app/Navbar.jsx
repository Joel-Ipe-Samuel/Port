'use client'
import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { db } from './fire/fbconfig';
import { addDoc, collection, getDocs } from 'firebase/firestore';

const Navbar = () => {
  const collectionRef = collection(db, 'users');
  const SECRET_KEY = "My$uper$ecureK3y!@#";

  const [text, setText] = useState('');
  const [encrypt, setEncrypt] = useState('');
  const [decryptedMessages, setDecryptedMessages] = useState([]);

  // 🔹 Function to encrypt and store in Firestore
  const handleEncryptAndSave = async () => {
    try {
      if (!text.trim()) {
        console.error("Input text is empty");
        return;
      }

      const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
      setEncrypt(encrypted);

      await addDoc(collectionRef, { message: encrypted });
      console.log("Encrypted text saved!");

      // Refresh messages after saving
      fetchAndDecryptMessages();
    } catch (error) {
      console.error("Error saving encrypted text:", error);
    }
  };

  // 🔹 Function to fetch & decrypt messages from Firestore
  const fetchAndDecryptMessages = async () => {
    try {
      const querySnapshot = await getDocs(collectionRef);
      const messages = [];

      querySnapshot.forEach((doc) => {
        const encryptedMessage = doc.data().message;
        const decryptedMessage = CryptoJS.AES.decrypt(encryptedMessage, SECRET_KEY).toString(CryptoJS.enc.Utf8);
        messages.push(decryptedMessage);
      });

      setDecryptedMessages(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // 🔹 Fetch messages on component mount
  useEffect(() => {
    fetchAndDecryptMessages();
  }, []);

  return (
    <div className="p-4">
      <input
        type="text"
        className="text-black p-2 border rounded"
        placeholder="Enter text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="ml-2 p-2 bg-blue-500 text-white rounded"
        onClick={handleEncryptAndSave}
      >
        Encrypt & Save
      </button>

      <h1 className="mt-4 text-lg font-semibold">Encrypted:</h1>
      <p className="text-gray-700">{encrypt}</p>

      <h1 className="mt-4 text-lg font-semibold">Decrypted Messages:</h1>
      <ul className="list-disc ml-5">
        {decryptedMessages.map((msg, index) => (
          <li key={index} className="text-green-700">{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default Navbar;
