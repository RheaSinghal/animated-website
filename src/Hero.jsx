import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ExplosionShader';

gsap.registerPlugin(ScrollTrigger);

const VideoScene = ({ videoRef, progressRef }) => {
  const materialRef = useRef();
  const { viewport } = useThree();
  const [videoTexture, setVideoTexture] = useState(null);

  useEffect(() => {
    if (videoRef.current) {
      const tex = new THREE.VideoTexture(videoRef.current);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      setVideoTexture(tex);
    }
  }, [videoRef]);

  useFrame(() => {
    if (materialRef.current) {
      const p = progressRef.current;
      // Let's say video scrubs for the first 80% of the pin
      // and shader animates for the last 20%
      const videoScrubEnd = 0.8;
      
      let videoProgress = Math.min(p / videoScrubEnd, 1.0);
      let shaderProgress = Math.max(0, (p - videoScrubEnd) / (1.0 - videoScrubEnd));
      
      if (videoRef.current && videoRef.current.readyState >= 2) {
        // We use requestAnimationFrame in useFrame to smoothly update time
        videoRef.current.currentTime = videoProgress * videoRef.current.duration;
      }

      materialRef.current.uProgress = shaderProgress;
    }
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      {videoTexture ? (
        <explosionMaterial
          ref={materialRef}
          uTexture={videoTexture}
          uResolution={new THREE.Vector2(window.innerWidth, window.innerHeight)}
        />
      ) : (
        <meshBasicMaterial color="black" />
      )}
    </mesh>
  );
};

export default function Hero() {
  const containerRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const finalImageRef = useRef(null);
  const contentRef = useRef(null);
  const videoRef = useRef(null);
  
  // We use a ref for progress to avoid React re-renders on every scroll tick
  const progressRef = useRef(0);

  useEffect(() => {
    // Setup video element
    const video = document.createElement('video');
    video.src = '/hero-video.mp4';
    video.crossOrigin = 'Anonymous';
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.pause(); // we scrub manually
    videoRef.current = video;

    // Wait for metadata to know duration
    video.addEventListener('loadedmetadata', () => {
      // Setup ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=4000', // 4000px of scrolling for the hero section
          scrub: 1, // Smooth scrubbing
          pin: true,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        },
      });

      // At progress 1.0, the shader is fully white. 
      // We can fade in the text content right at the end.
      tl.to(canvasWrapperRef.current, { opacity: 0, duration: 0.1 }, 0.95);
      tl.to(contentRef.current, { opacity: 1, duration: 0.05, ease: 'power2.out' }, 0.95);
    });

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={containerRef} style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      
      {/* Background Image that fades in at the end */}
      {createPortal(
        <div 
          ref={finalImageRef}
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: '#050505',
            backgroundImage: 'url(/hero-final.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 1,
            zIndex: -1,
            pointerEvents: 'none'
          }}
        />,
        document.body
      )}

      {/* R3F Canvas */}
      <div 
        ref={canvasWrapperRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <VideoScene videoRef={videoRef} progressRef={progressRef} />
        </Canvas>
      </div>

      {/* Glassmorphism Text Panel */}
      <div ref={contentRef} className="hero-content glass-panel" style={{ zIndex: 3 }}>
        <h1>Lorem Ipsum Dolor</h1>
        <p>
          Consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </div>

    </section>
  );
}
