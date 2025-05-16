import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Default styles for the preview box
const defaultStyles = {
  container: {
    cursor: 'pointer',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
    maxWidth: '400px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  description: {
    fontSize: '14px',
    color: '#555',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
  },
};

// Debounce function to prevent multiple fetches
const useDebounce = (callback, delay) => {
  const debounceCallback = useCallback(callback, [delay]);
  useEffect(() => {
    const handler = setTimeout(() => {
      debounceCallback();
    }, delay);

    return () => clearTimeout(handler);
  }, [debounceCallback, delay]);
};

function LinkPreview({ url, styles = defaultStyles, proxyUrl = 'http://localhost:3001/proxy/', fallbackImage = '/fallback.png' }) {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreviewData = async () => {
    setLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const response = await fetch(`${proxyUrl}?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json(); // Updated to parse JSON directly

      setPreviewData(data);
    } catch (error) {
      console.error('Failed to fetch URL preview:', error);
      setError('Failed to fetch link preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Debounce fetching to prevent rapid calls
  useDebounce(() => {
    if (url) {
      fetchPreviewData();
    }
  }, 500);

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center' }}>
        <p>Loading preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.container, textAlign: 'center' }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!previewData) {
    return null;
  }

  return (
    <div onClick={handleClick} style={styles.container}>
      <h3 style={styles.title}>{previewData.title}</h3>
      <p style={styles.description}>{previewData.description}</p>
      {previewData.image && <img src={previewData.image} alt="Link Preview" style={styles.image} />}
    </div>
  );
}

LinkPreview.propTypes = {
  url: PropTypes.string.isRequired,
  styles: PropTypes.object,
  proxyUrl: PropTypes.string,
  fallbackImage: PropTypes.string,
};

export default LinkPreview;