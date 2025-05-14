import React, { useState } from 'react';
import axios from 'axios';

const CampaignPage = () => {
  const [name, setName] = useState('');
  const [rule, setRule] = useState({ field: 'total_spend', operator: '>', value: '' });
  const [message, setMessage] = useState('');

  const fields = ['total_spend', 'visit_count'];
  const operators = ['>', '<'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !rule.field || !rule.operator || !rule.value) {
      setMessage('All fields are required');
      return;
    }

    try {
      await axios.post(
        'http://localhost:3000/api/segments',
        { name, rules: [rule] },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('Segment created successfully!');
      setName('');
      setRule({ field: 'total_spend', operator: '>', value: '' });
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create segment');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif',
    },
    box: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px',
    },
    h1: {
      fontSize: '24px',
      marginBottom: '20px',
      textAlign: 'center',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: '#333',
    },
    input: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxSizing: 'border-box',
    },
    select: {
      marginRight: '10px',
      display: 'inline-block',
      width: 'auto',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxSizing: 'border-box',
    },
    submitButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    error: {
      margin: '10px 0',
      color: 'red',
    },
    success: {
      margin: '10px 0',
      color: 'green',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.h1}>Create Campaign Segment</h1>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Segment Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
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
              placeholder="Value (e.g., 10000)"
              style={styles.input}
            />
          </div>
          {message && (
            <p style={message.includes('success') ? styles.success : styles.error}>
              {message}
            </p>
          )}
          <button type="submit" style={styles.submitButton}>
            Create Segment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CampaignPage;