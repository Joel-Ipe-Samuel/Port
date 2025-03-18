'use client'
import React, { useState } from 'react';
import { auth, provider } from '../fire/fbconfig';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User signed in:', result.user);
      router.push('/'); // Redirect to home or another protected page
    } catch (err) {
      console.error('Login failed:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <button 
        onClick={handleLogin} 
        disabled={loading}
        className="p-3 bg-blue-500 text-white rounded-lg"
      >
        {loading ? 'Logging in...' : 'Login with Google'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default Login;
