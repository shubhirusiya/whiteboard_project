// Signup.js
import React, { useState } from 'react';
import { auth } from '../firebase'; // Import the initialized Firebase auth
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase auth function
import '../style/signup.css';

const Signup = ({ onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('User registered:', user);

      // Optionally, save additional user info to Firestore or Realtime Database
      console.log('First Name:', firstName);
      console.log('Last Name:', lastName);

      onClose(); // Close the modal on successful signup
    } catch (error) {
      setError(error.message);
      console.error('Error signing up:', error);
    }
  };

  return (
    <div className="signup-modal">
      <div className="signup-container">
        <button className="close-button" onClick={onClose}>✕</button>
        <h2 className="signup-title">Register</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          {error && <p className="error-message">{error}</p>}
          <div className="name-fields">
            <div className="name-field">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="name-field">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Sign Up
          </button>
        </form>
        <div className="social-login">
          <button className="google-button">
            <img src="/google-icon.svg" alt="Google" />
            Sign up with Google
          </button>
          <button className="facebook-button">
            <img src="/facebook-icon.svg" alt="Facebook" />
            Sign up with Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
