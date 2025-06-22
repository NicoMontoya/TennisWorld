import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('userToken');
      
      if (token) {
        try {
          // Set up headers with token
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          
          // Fetch user profile
          const response = await axios.get('http://localhost:5001/api/users/profile', config);
          
          if (response.data && response.data.data && response.data.data.user) {
            setUser(response.data.data.user);
            setIsLoggedIn(true);
          } else {
            // Invalid response, clear token
            localStorage.removeItem('userToken');
            setUser(null);
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Token might be invalid or expired, clear it
          localStorage.removeItem('userToken');
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      
      setLoading(false);
    };
    
    checkLoginStatus();
    
    // Set up an event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'userToken') {
        if (e.newValue) {
          // Token was added, fetch user profile
          checkLoginStatus();
        } else {
          // Token was removed, log out
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5001/api/users/login', {
        email,
        password
      });
      
      if (response.data && response.data.status === 'success') {
        // Store token in localStorage
        localStorage.setItem('userToken', response.data.data.token);
        
        // Set user and login state
        setUser(response.data.data.user);
        setIsLoggedIn(true);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: 'Invalid response from server' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to login. Please try again.' 
      };
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    setIsLoggedIn(false);
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5001/api/users', userData);
      
      if (response.data && response.data.status === 'success') {
        // Store token in localStorage
        localStorage.setItem('userToken', response.data.data.token);
        
        // Set user and login state
        setUser(response.data.data.user);
        setIsLoggedIn(true);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: 'Invalid response from server' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to register. Please try again.' 
      };
    }
  };
  
  // Context value
  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    register
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
