import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import frontGif from "../../images/front.gif";
import bgmusic from "../../images/newbg.mp3";
import buttonclick from "../../images/button_click.mp3";

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Track music state
  const history = useHistory();

  const bgMusicRef = useRef(new Audio(bgmusic));
  const buttonClickRef = useRef(new Audio(buttonclick));

  // Handle music play on user interaction
  const handlePlayMusic = () => {
    if (!isMusicPlaying) {
      const bgMusic = bgMusicRef.current;
      bgMusic.loop = true;
      bgMusic.volume = 0.5;
      bgMusic.play().catch((err) => {
        console.error("Error playing audio: ", err);
      });
      setIsMusicPlaying(true);
    }
  };

  useEffect(() => {
    // Do not start music automatically on page load, rely on user interaction
    // Optionally, you can trigger the music play in another part of your app or event
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    buttonClickRef.current.play();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post('http://localhost:2000/users', { username, email, password });
      console.log(response.data);
      alert('Account created successfully. Please log in to continue.');
      history.push('/login');
    } catch (err) {
      console.error(err);
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div style={styles.background} onClick={handlePlayMusic}> {/* Trigger music on page interaction */}
      <div style={styles.container}>
        <div style={styles.box}>
          <h2 style={styles.title}>Sign Up</h2>
          {error && <p style={styles.errorMessage}>{error}</p>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="username" style={styles.label}>Username:</label>
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>Email:</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password:</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirm Password:</label>
              <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={styles.input} />
            </div>
            <button type="submit" style={styles.button}>
              Sign Up
            </button>
          </form>
          <p style={styles.text}>
            Already have an account? <Link to='/login' style={styles.link}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
    background: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: `url(${frontGif}) no-repeat center center fixed`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      cursor: 'pointer',
    },
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      maxWidth: '450px',
      background: 'rgba(255, 255, 255, 0.8) url("https://img.freepik.com/premium-vector/open-book-forest-theme-with-animal-white-background_1308-102293.jpg") no-repeat center center', // Combined both background properties
      backgroundSize: 'cover',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    },
    box: {
      width: '100%',
      textAlign: 'center',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
      fontFamily: 'Times New Roman',
    },
    errorMessage: {
      color: 'red',
      fontSize: '14px',
      marginBottom: '10px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    inputGroup: {
      marginBottom: '15px',
      width: '100%',
    },
    label: {
      display: 'block',
      textAlign: 'left',
      fontWeight: 'bold',
      marginBottom: '5px',
      color: '#555',
      fontFamily: 'Times New Roman',
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '16px',
      outline: 'none',
      fontFamily: 'Times New Roman',
    },
    button: {
      background: 'linear-gradient(45deg, #FF5722, #FF9800)',
      color: '#fff',
      padding: '10px 15px',
      fontSize: '16px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: '0.3s ease',
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
    },
    text: {
      marginTop: '10px',
      color: '#333',
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
    },
    link: {
      color: '#007bff',
      textDecoration: 'none',
      fontWeight: 'bold',
    },
  };
  

export default SignupPage;
