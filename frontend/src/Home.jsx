import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [segments, setSegments] = useState([]);
  const [error, setError] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [rule, setRule] = useState({ field: 'total_spend', operator: '>', value: '' });
  const [messageObjective, setMessageObjective] = useState('');
  const [messageSuggestions, setMessageSuggestions] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [audienceSize, setAudienceSize] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fields = ['total_spend', 'visit_count', 'last_purchase'];
  const operators = ['>', '<', '='];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.id,
        role: Number(decoded.role || 0),
        email: decoded.email || 'User',
      });
      fetchSegments(token);
    } catch (err) {
      console.error('Token decode error:', err.message);
      setError('Invalid token');
      navigate('/');
    }
  }, [navigate]);

  const fetchSegments = async (token) => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/segments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSegments(Array.isArray(response.data?.segments) ? response.data.segments : []);
      setError('');
    } catch (err) {
      console.error('Fetch segments error:', err.message, err.response?.data);
      setError(err.response?.data?.error || 'Failed to fetch segments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessageSuggestions = async () => {
    if (!messageObjective.trim()) {
      setMessageSuggestions([]);
      setError('');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/message-suggestions',
        { objective: messageObjective.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const suggestions = Array.isArray(response.data?.suggestions) 
        ? response.data.suggestions.filter(msg => typeof msg === 'string')
        : [];
      setMessageSuggestions(suggestions.length > 0 ? suggestions : ['No suggestions available']);
      setError('');
    } catch (err) {
      console.error('Message suggestions error:', err);
      setMessageSuggestions([
        "Hi [Name], we have a special offer just for you!",
        "Hello [Name], don't miss out on our exclusive deal!",
        "Dear [Name], thank you for being a valued customer!"
      ]);
      setError('Using default messages - could not generate suggestions');
    }
  };

  const fetchPreview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/segments/preview',
        { rules: [rule] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAudienceSize(response.data?.audienceSize || 0);
      setError('');
    } catch (err) {
      console.error('Preview error:', err);
      setError('Failed to fetch audience preview');
      setAudienceSize(null);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (rule.field === 'total_spend' && isNaN(Number(rule.value))) {
      setError('Value must be a number for total_spend');
      return;
    }
    if (!campaignName.trim() || !rule.field || !rule.operator || 
        !rule.value.trim() || !selectedMessage) {
      setError('All fields are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/segments',
        { 
          name: campaignName.trim(), 
          rules: [{ ...rule, value: rule.value.trim() }], 
          message: selectedMessage 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCampaignName('');
      setRule({ field: 'total_spend', operator: '>', value: '' });
      setMessageObjective('');
      setMessageSuggestions([]);
      setSelectedMessage('');
      setAudienceSize(null);
      fetchSegments(token);
    } catch (err) {
      console.error('Create segment error:', err);
      setError(err.response?.data?.error || 'Failed to create segment');
    }
  };

  const styles = {
    container: {
      display: 'flex',
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
    sidebar: {
      width: '250px',
      backgroundColor: 'rgba(30, 30, 30, 0.9)',
      padding: '20px',
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.3)',
      color: '#e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    userInfo: {
      marginBottom: '20px',
    },
    userName: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#ffffff',
    },
    userRole: {
      fontSize: '14px',
      color: '#55ff55',
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
    select: {
      width: 'auto',
      padding: '8px',
      border: '1px solid #555',
      borderRadius: '4px',
      backgroundColor: '#2a2a2a',
      color: '#e0e0e0',
      marginRight: '10px',
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
    previewButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: isHovered ? '#555' : '#777',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '10px',
    },
    main: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto',
    },
    segmentCard: {
      backgroundColor: 'rgba(30, 30, 30, 0.7)',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '15px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
      color: '#e0e0e0',
    },
    segmentName: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#ffffff',
    },
    segmentRule: {
      fontSize: '14px',
      color: '#e0e0e0',
    },
    campaignDetails: {
      fontSize: '14px',
      color: '#e0e0e0',
      marginTop: '10px',
    },
    error: {
      color: '#ff5555',
      margin: '10px 0',
    },
    loading: {
      color: '#55ff55',
      textAlign: 'center',
      margin: '20px 0',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        {user && (
          <>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.email}</div>
              <div style={styles.userRole}>{user.role === 0 ? 'User' : 'Admin'}</div>
            </div>
            {user.role === 1 && (
              <form onSubmit={handleCreateCampaign}>
                <h3 style={{ color: '#e0e0e0', marginBottom: '15px' }}>Create Campaign</h3>
                {error && <p style={styles.error}>{error}</p>}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Segment Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    style={styles.input}
                    placeholder="e.g., High Spenders"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Rule</label>
                  <select
                    value={rule.field}
                    onChange={(e) => setRule({ ...rule, field: e.target.value })}
                    style={styles.select}
                  >
                    {fields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rule.operator}
                    onChange={(e) => setRule({ ...rule, operator: e.target.value })}
                    style={styles.select}
                  >
                    {operators.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => setRule({ ...rule, value: e.target.value })}
                    placeholder="Value (e.g., 1000)"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Message Objective</label>
                  <input
                    type="text"
                    value={messageObjective}
                    onChange={(e) => setMessageObjective(e.target.value)}
                    onBlur={fetchMessageSuggestions}
                    placeholder="e.g., Bring back inactive users"
                    style={styles.input}
                  />
                </div>
                {messageSuggestions.length > 0 && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Select Message</label>
                    {messageSuggestions.map((msg, index) => (
                      <div key={index} style={{ marginBottom: '10px' }}>
                        <input
                          type="radio"
                          name="message"
                          value={msg}
                          checked={selectedMessage === msg}
                          onChange={(e) => setSelectedMessage(e.target.value)}
                          style={{ marginRight: '10px' }}
                        />
                        <span>{msg}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={styles.formGroup}>
                  <button
                    type="button"
                    onClick={fetchPreview}
                    style={styles.previewButton}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Preview Audience
                  </button>
                  {audienceSize !== null && (
                    <p style={styles.campaignDetails}>Audience Size: {audienceSize}</p>
                  )}
                </div>
                <button
                  type="submit"
                  style={styles.submitButton}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Create
                </button>
              </form>
            )}
          </>
        )}
      </div>
      <div style={styles.main}>
        <h2 style={{ color: '#e0e0e0', marginBottom: '20px' }}>All Segments</h2>
        {isLoading ? (
          <p style={styles.loading}>Loading segments...</p>
        ) : segments.length === 0 ? (
          <p style={styles.campaignDetails}>No segments available</p>
        ) : (
          segments.map((segment) => (
            <div key={segment._id} style={styles.segmentCard}>
              <div style={styles.segmentName}>{segment.name}</div>
              {segment.rules?.map((rule, index) => (
                <div key={index} style={styles.segmentRule}>
                  Rule {index + 1}: {rule.field} {rule.operator} {rule.value}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;