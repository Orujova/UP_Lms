"use client"

import React from 'react';
import Lottie from 'react-lottie-player';
import soonAnimation from '../../../animations/soon.json'; // Path to JSON file

export default function Page() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
      }}
    >
      {/* <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Dashboard</div> */}
      <Lottie
        loop
        animationData={soonAnimation}
        play
        style={{ width: 300, height: 300 }} // Adjust the size as needed
      />
    </main>
  );
}
