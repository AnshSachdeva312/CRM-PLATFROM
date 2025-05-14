const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Segment = require('../models/Segment');
const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;
let model;
try {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `
      You are a marketing assistant specialized in creating personalized customer messages.
      Generate concise, engaging messages that include the [Name] placeholder.
    `
  });
} catch (err) {
  console.error('AI Initialization Error:', err.message);
}

const generateResult = async (prompt) => {
  if (!model) {
    throw new Error('AI model not initialized');
  }
  try {
    const result = await model.generateContent(prompt);
    if (!result?.response) {
      throw new Error('No response from AI model');
    }
    const responseText = result.response.text();
    return responseText.replace(/```javascript/g, '').replace(/```/g, '').trim();
  } catch (error) {
    console.error("AI Generation Error:", {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.response?.data
    });
    throw error;
  }
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    req.role = decoded.role; 
    req.email = decoded.email; 
    next();
  });
};

const checkAdmin = (req, res, next) => {
  if (req.role !== 1) {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

router.get('/segments', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const segments = await Segment.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await Segment.countDocuments();
    
    res.status(200).json({
      segments,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Segment Fetch Error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch segments',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

router.post('/segments/preview', authenticate, checkAdmin, async (req, res) => {
  const { rules } = req.body;
  if (!rules || !Array.isArray(rules)) {
    return res.status(400).json({ error: 'Rules array required' });
  }
  try {
    const audienceSize = Math.floor(Math.random() * 1000) + 100;
    res.status(200).json({ 
      audienceSize,
      estimatedReach: `${Math.floor(audienceSize * 0.7)}-${Math.floor(audienceSize * 1.3)}`
    });
  } catch (err) {
    console.error('Preview Error:', err);
    res.status(500).json({ 
      error: 'Failed to preview segment',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
router.post('/message-suggestions', authenticate, checkAdmin, async (req, res) => {
    const { objective } = req.body;
    if (!objective) {
      return res.status(400).json({ error: 'Objective required' });
    }
  
    // Convert objective to lowercase for easier matching
    const objectiveLower = objective.toLowerCase();
  
    // Define fixed message templates for different objectives
    const messageTemplates = {
      welcome: [
        "Hi [Name], welcome to our community! Enjoy 10% off your first purchase with code WELCOME10",
        "Hello [Name], we're thrilled to have you! Here's 15% off your first order as our gift",
        "Dear [Name], welcome! Start shopping with an exclusive 20% discount for new members"
      ],
      retention: [
        "Hi [Name], we miss you! Here's 15% off to welcome you back",
        "Hello [Name], your favorites are waiting! Enjoy 20% off your next purchase",
        "Dear [Name], as a valued customer, enjoy this exclusive 25% discount"
      ],
      discount: [
        "Hi [Name], enjoy 20% off everything today only! Use code SAVE20",
        "Hello [Name], flash sale! Get 30% off for the next 24 hours",
        "Dear [Name], exclusive offer: 25% off all items this week"
      ],
      anniversary: [
        "Hi [Name], happy anniversary! Enjoy a special 25% discount",
        "Hello [Name], thank you for being with us! Here's 30% off to celebrate",
        "Dear [Name], we appreciate your loyalty! Enjoy this anniversary gift of 35% off"
      ],
      default: [
        "Hi [Name], we have a special offer just for you!",
        "Hello [Name], don't miss out on our exclusive deal!",
        "Dear [Name], thank you for being a valued customer!"
      ]
    };
  
    // Determine which set of messages to use based on objective keywords
    let suggestions;
    if (objectiveLower.includes('welcome') || objectiveLower.includes('new')) {
      suggestions = messageTemplates.welcome;
    } else if (objectiveLower.includes('retention') || objectiveLower.includes('come back')) {
      suggestions = messageTemplates.retention;
    } else if (objectiveLower.includes('discount') || objectiveLower.includes('sale')) {
      suggestions = messageTemplates.discount;
    } else if (objectiveLower.includes('anniversary') || objectiveLower.includes('loyalty')) {
      suggestions = messageTemplates.anniversary;
    } else {
      suggestions = messageTemplates.default;
    }
  
    res.status(200).json({ suggestions });
  });

router.post('/segments', authenticate, checkAdmin, async (req, res) => {
  const { name, rules, message } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return res.status(400).json({ error: 'Valid name required (min 3 chars)' });
  }
  if (!Array.isArray(rules) || rules.length === 0) {
    return res.status(400).json({ error: 'At least one rule required' });
  }
  if (!message || typeof message !== 'string' || !message.includes('[Name]')) {
    return res.status(400).json({ error: 'Valid message with [Name] placeholder required' });
  }

  try {
    const segment = new Segment({ 
      name: name.trim(), 
      rules: rules.map(rule => ({
        field: rule.field || 'total_spend',
        operator: rule.operator || '>',
        value: rule.value ? String(rule.value).trim() : '0'
      })), 
      message: message.trim(), 
      userId: req.userId 
    });

    await segment.save();
    res.status(201).json(segment);
  } catch (err) {
    console.error('Segment Creation Error:', err);
    res.status(500).json({ 
      error: 'Failed to create segment',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
