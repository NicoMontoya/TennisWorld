import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findOne({ user_id: decoded.id }).select('-password');

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({
        status: 'error',
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      status: 'error',
      message: 'Not authorized, no token'
    });
  }
};

// Middleware to check if user is an admin
export const admin = (req, res, next) => {
  if (req.user && req.user.account_type === 'Admin') {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'Not authorized as an admin'
    });
  }
};

// Middleware to check if user is a premium user
export const premium = (req, res, next) => {
  if (req.user && (req.user.account_type === 'Premium' || req.user.account_type === 'Admin')) {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'This feature requires a premium account'
    });
  }
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
