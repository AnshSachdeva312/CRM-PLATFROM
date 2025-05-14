import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      fetchCampaigns(token);
    } catch (err) {
      console.error('Token decode error:', err.message);
      setError('Invalid token');
      navigate('/');
    }
  }, [navigate]);

  const fetchCampaigns = async (token) => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/campaigns/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(Array.isArray(response.data?.campaigns) ? response.data.campaigns : []);
      setError('');
    } catch (err) {
      console.error('Fetch campaigns error:', err.message, err.response?.data);
      setError(err.response?.data?.error || 'Failed to fetch campaign history');
      setCampaigns([]);
    } finally {
      setIsLoading(false);
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
      backgroundImage:
        'url(https://static.vecteezy.com/system/resources/previews/005/071/443/original/realistic-dark-purple-background-with-low-poly-shape-and-shadow-abstract-purple-banner-free-vector.jpg)',
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
    main: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto',
    },
    campaignCard: {
      backgroundColor: 'rgba(30, 30, 30, 0.7)',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '15px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
      color: '#e0e0e0',
    },
    campaignName: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '10px',
    },
    campaignDetail: {
      fontSize: '14px',
      color: '#e0e0e0',
      marginBottom: '5px',
    },
    backButton: {
      padding: '8px 15px',
      backgroundColor: '#0056b3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '20px',
      textDecoration: 'none',
      display: 'inline-block',
    },
    error: {
      color: '#ff5555',
      margin: '10px 0',
    },
    loading: {
      color: '#55ff55',
      textAlign: 'center',
      margin: '20px 0',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    title: {
      color: '#e0e0e0',
      margin: 0,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        {user && (
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.email}</div>
            <div style={styles.userRole}>{user.role === 0 ? 'User' : 'Admin'}</div>
            <Link to="/home" style={styles.backButton}>
              Back to Home
            </Link>
          </div>
        )}
      </div>
      <div style={styles.main}>
        <div style={styles.header}>
          <h2 style={styles.title}>Campaign History</h2>
        </div>
        
        {error && <p style={styles.error}>{error}</p>}
        
        {isLoading ? (
          <p style={styles.loading}>Loading campaign history...</p>
        ) : campaigns.length === 0 ? (
          <p style={styles.campaignDetail}>No campaign history available</p>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign._id} style={styles.campaignCard}>
              <div style={styles.campaignName}>{campaign.name}</div>
              <div style={styles.campaignDetail}>
                <strong>Created:</strong> {new Date(campaign.createdAt).toLocaleString()}
              </div>
              <div style={styles.campaignDetail}>
                <strong>Status:</strong> {campaign.status || 'Completed'}
              </div>
              <div style={styles.campaignDetail}>
                <strong>Message:</strong> {campaign.message}
              </div>
              <div style={styles.campaignDetail}>
                <strong>Rules:</strong>
                {campaign.rules?.map((rule, index) => (
                  <div key={index}>
                    {rule.field} {rule.operator} {rule.value}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;