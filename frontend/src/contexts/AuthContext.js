// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   // Set up axios defaults
//   useEffect(() => {
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     } else {
//       delete axios.defaults.headers.common['Authorization'];
//     }
//   }, [token]);

//   // Check if user is authenticated on app load
//   useEffect(() => {
//     const checkAuth = async () => {
//       if (token) {
//         try {
//           const response = await axios.get('/api/auth/me');
//           setUser(response.data.user);
//         } catch (error) {
//           console.error('Auth check failed:', error);
//           logout();
//         }
//       }
//       setLoading(false);
//     };

//     checkAuth();
//   }, [token]);

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post('/api/auth/signin', {
//         email,
//         password
//       });

//       const { token: newToken, user: userData } = response.data;
      
//       setToken(newToken);
//       setUser(userData);
//       localStorage.setItem('token', newToken);
      
//       toast.success('Welcome back!');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.error || 'Login failed';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   const signup = async (name, email, password) => {
//     try {
//       const response = await axios.post('/api/auth/signup', {
//         name,
//         email,
//         password
//       });

//       const { token: newToken, user: userData } = response.data;
      
//       setToken(newToken);
//       setUser(userData);
//       localStorage.setItem('token', newToken);
      
//       toast.success('Account created successfully!');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.error || 'Signup failed';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('token');
//     delete axios.defaults.headers.common['Authorization'];
//     toast.success('Logged out successfully');
//   };

//   const updateUser = (userData) => {
//     setUser(userData);
//   };

//   const value = {
//     user,
//     token,
//     loading,
//     login,
//     signup,
//     logout,
//     updateUser,
//     isAuthenticated: !!user
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };




// new code

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Auto-detect API base URL
const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://mindcare-by-lavnish-saini.onrender.com';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/signin', { email, password });
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);

      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/signup', { name, email, password });
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);

      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};







