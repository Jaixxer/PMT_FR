import React, { useRef, useEffect } from 'react';

function ParticleCanvas({ className = '' }) { // Accept className from props
  const canvasContainerRef = useRef(null);

  useEffect(() => {
    // Create a script element for the ParticleNetwork library
    const script = document.createElement('script');
    script.src = 'https://rawgit.com/JulianLaval/canvas-particle-network/master/particle-network.min.js';
    script.async = true;

    script.onload = () => {
      // Once the script is loaded, initialize ParticleNetwork
      if (window.ParticleNetwork && canvasContainerRef.current) {
        const options = {
          particleColor: '#888',
          background: '#FFFFFF', // or use your own image URL
          interactive: true,
          speed: 'medium',
          density: 'high',
        };
        // Initialize ParticleNetwork in the referenced div
        new window.ParticleNetwork(canvasContainerRef.current, options);
      }
    };

    document.body.appendChild(script);

    // Cleanup: remove the script on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={canvasContainerRef}
      className={`relative w-full h-screen overflow-hidden ${className}`} // Include passed in classes
    />
  );
}

export default ParticleCanvas;