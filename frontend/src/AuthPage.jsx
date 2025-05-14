import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = isSignup ? '/api/signup' : '/api/signin';
      const response = await axios.post(`http://localhost:3000${url}`, { email, password });
      console.log('Response:', response.data);
      if (!isSignup) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          navigate('/home');
        } else {
          setError('No token received');
        }
      } else {
        setIsSignup(false);
        setError('Account created! Please sign in.');
      }
    } catch (err) {
      console.error('Signin error:', err, err.response);
      setError(err.response?.data?.error || 'Failed to connect to server');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      backgroundColor: '#1a1a1a',
      backgroundImage: 'url(https://static.vecteezy.com/system/resources/previews/005/071/443/original/realistic-dark-purple-background-with-low-poly-shape-and-shadow-abstract-purple-banner-free-vector.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Arial, sans-serif',
      position: 'fixed',
      top: 0,
      left: 0,
    },
    box: {
      backgroundColor: 'rgba(30, 30, 30, 0.7)',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
      width: '100%',
      maxWidth: '400px',
    },
    tabs: {
      display: 'flex',
      marginBottom: '20px',
    },
    tabButton: {
      flex: 1,
      padding: '10px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#333',
      color: '#e0e0e0',
      transition: 'background-color 0.2s',
    },
    tabButtonActive: {
      backgroundColor: '#0056b3',
      color: 'white',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: '#e0e0e0',
    },
    input: {
      width: '100%',
      padding: '8px',
      border: '1px solid #555',
      borderRadius: '4px',
      boxSizing: 'border-box',
      backgroundColor: '#2a2a2a',
      color: '#e0e0e0',
    },
    submitButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: isHovered ? '#003d82' : '#0056b3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    error: {
      margin: '10px 0',
      color: '#ff5555',
    },
    success: {
      margin: '10px 0',
      color: '#55ff55',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tabButton,
              ...(isSignup ? {} : styles.tabButtonActive),
            }}
            onClick={() => setIsSignup(false)}
          >
            Sign In
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(isSignup ? styles.tabButtonActive : {}),
            }}
            onClick={() => setIsSignup(true)}
          >
            Sign Up
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          {error && (
            <p style={error.includes('created') ? styles.success : styles.error}>
              {error}
            </p>
          )}
          <button
            type="submit"
            style={styles.submitButton}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isSignup ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;