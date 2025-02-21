import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import frontGif from "../../images/front.gif";
import bgmusic from "../../images/bg_music.mp3";
import buttonclick from "../../images/button_click.mp3";

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [audioPlayed, setAudioPlayed] = useState(false);  // Track if the audio has been played
  const history = useHistory();
  const bgMusicRef = useRef(new Audio(bgmusic));
  const buttonClickRef = useRef(new Audio(buttonclick));

  // Play background music after user interacts with the page
  const handleAudioPlay = () => {
    setAudioPlayed(true);  // Mark audio as played
    const bgMusic = bgMusicRef.current;
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.play();
  };

  useEffect(() => {
    if (audioPlayed) {
      // If the user has interacted, start the background music
      const bgMusic = bgMusicRef.current;
      bgMusic.play();
    }
    return () => {
      const bgMusic = bgMusicRef.current;
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, [audioPlayed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    buttonClickRef.current.play();

    try {
      const response = await axios.post('http://localhost:2000/login', { username, password });
      console.log('Server response:', response.data);
      
      if (response.data.message === 'Login successful') {
        localStorage.setItem('username', username);
        alert(`Welcome ${username}`);
        history.push('/home');
      } else {
        setError('Invalid username or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again later.');
    }
  };

  return (
    <div style={{ 
      backgroundImage: `url(${frontGif})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        backgroundImage: "url('https://img.freepik.com/premium-vector/open-book-forest-theme-with-animal-white-background_1308-102293.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        maxWidth: '400px',
        width: '90%',
        border: '3px solid #654321'
      }}>
        <img
          src="https://img.freepik.com/premium-vector/tree-pen-vector-logo-design-template-writer-nature-logo-concept_825834-58.jpg"
          alt="Logo"
          style={{ width: "80px", height: "80px", borderRadius: "50%", marginBottom: "15px" }}
        />
        <h2 style={{ fontFamily: "'Times New Roman', serif", fontWeight: 'bold', color: '#2C3E50' }}>Login</h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold', fontFamily: "'Times New Roman', serif" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label 
              htmlFor="username" 
              style={{ fontFamily: "'Times New Roman', serif", fontWeight: 'bold', color: '#FFD700' }}> 
              Username:
            </label>
            <input
              type="text"
              id="username"
              placeholder='Enter your username'
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginTop: '5px', 
                border: '2px solid #654321', 
                borderRadius: '5px',
                fontFamily: "'Times New Roman', serif",
                fontSize: '16px',
                transition: '0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #FF8C00'} 
              onBlur={(e) => e.target.style.border = '2px solid #654321'}
            />
          </div>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label 
              htmlFor="password" 
              style={{ fontFamily: "'Times New Roman', serif", fontWeight: 'bold', color: '#FFD700' }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              placeholder='Enter your password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginTop: '5px', 
                border: '2px solid #654321', 
                borderRadius: '5px',
                fontFamily: "'Times New Roman', serif",
                fontSize: '16px',
                transition: '0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #FF8C00'} 
              onBlur={(e) => e.target.style.border = '2px solid #654321'}
            />
          </div>
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '10px', 
              background: 'linear-gradient(45deg, #FF9800, #FF5722)', 
              border: 'none', 
              borderRadius: '5px', 
              fontSize: '18px',
              fontWeight: 'bold',
              fontFamily: "'Times New Roman', serif",
              color: 'white',
              cursor: 'pointer',
              transition: '0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = 'linear-gradient(45deg, #FF5722, #FF9800)'}
            onMouseOut={(e) => e.target.style.background = 'linear-gradient(45deg, #FF9800, #FF5722)'}
          >
            Login
          </button>
        </form>
        <p style={{ fontFamily: "'Times New Roman', serif", fontWeight: 'bold', marginTop: '15px' }}>
          Don't have an account? <Link to='/' style={{ color: '#FF5722', textDecoration: 'none' }}>Create Account</Link>
        </p>
        <button onClick={handleAudioPlay} style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px', background: 'green', color: 'white', border: 'none', borderRadius: '5px' }}>Play Music</button> {/* Button to start music */}
      </div>
    </div>
  );
};

export default LoginPage;
