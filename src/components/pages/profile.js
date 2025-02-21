import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';  // Import withRouter
import frontGif from "../../images/front.gif";
import bgmusic from "../../images/newbg.mp3"; // Add background music
import buttonclick from "../../images/button_click.mp3";

const ProfilePage = ({ history }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const storedUsername = localStorage.getItem('username'); // Retrieve username from local storage

      if (!storedUsername) {
        setError('No user is logged in.');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:2000/getusers?username=${storedUsername}`);

        if (response.data.length > 0) {
          setUser(response.data[0]); // Assuming the first user is the correct one
        } else {
          setError('User details not found.');
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to fetch user details.');
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');  // Remove username from local storage
    history.push('/login');  // Redirect to login page
  };

  const handleBackToHome = () => {
    history.push('/home');  // Redirect to home page
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div style={styles.container}>
      <audio autoPlay loop>
        <source src={bgmusic} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      <div style={styles.overlay}>
        <h2 style={styles.title}>Profile Page</h2>
        {error ? (
          <p style={styles.errorMessage}>{error}</p>
        ) : user ? (
          <div style={styles.profileDetails}>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <div style={styles.passwordContainer}>
              <strong>Password:</strong>
              <input 
                type={passwordVisible ? "text" : "password"} 
                value={user.password} 
                readOnly
                style={styles.passwordInput}
              />
              <span 
                onClick={togglePasswordVisibility} 
                style={styles.eyeIcon}>
                👁️
              </span>
            </div>
            <p><strong>Levels Completed:</strong> {user.levelsCompleted || 'No levels completed yet'}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        <div style={styles.buttons}>
          <button onClick={handleBackToHome} style={styles.button}>Back to Home</button>
          <button onClick={handleLogout} style={styles.button}>Log Out</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: `url(${frontGif}) no-repeat center center fixed`,
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    color: 'white',
    fontFamily: "'Times New Roman', serif",
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  errorMessage: {
    color: 'red',
    marginBottom: '20px',
  },
  profileDetails: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  passwordContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    marginLeft: '10px',
    padding: '5px',
    fontSize: '16px',
    fontFamily: "'Times New Roman', serif",
  },
  eyeIcon: {
    marginLeft: '10px',
    cursor: 'pointer',
    fontSize: '20px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  },
  button: {
    width: '40%', // Reduced button width
    padding: '8px 15px', // Reduced padding
    background: 'linear-gradient(45deg, #FF9800, #FF5722)',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px', // Reduced font size
    fontWeight: 'bold',
    fontFamily: "'Times New Roman', serif",
    color: 'white',
    cursor: 'pointer',
    transition: '0.3s',
  },
};

export default withRouter(ProfilePage);
