import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const ExplosionMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTexture: new THREE.Texture(),
    uResolution: new THREE.Vector2(1920, 1080),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uProgress;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Simple pseudo-random function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // Sobel filter for edge detection
    float sobel(sampler2D tex, vec2 uv, vec2 res) {
        vec2 offset[9];
        float w = 1.0 / res.x;
        float h = 1.0 / res.y;

        offset[0] = vec2(-w, -h); offset[1] = vec2(0.0, -h); offset[2] = vec2(w, -h);
        offset[3] = vec2(-w, 0.0); offset[4] = vec2(0.0, 0.0); offset[5] = vec2(w, 0.0);
        offset[6] = vec2(-w, h);  offset[7] = vec2(0.0, h);  offset[8] = vec2(w, h);

        float kernelX[9];
        kernelX[0] = -1.0; kernelX[1] = 0.0; kernelX[2] = 1.0;
        kernelX[3] = -2.0; kernelX[4] = 0.0; kernelX[5] = 2.0;
        kernelX[6] = -1.0; kernelX[7] = 0.0; kernelX[8] = 1.0;

        float kernelY[9];
        kernelY[0] = -1.0; kernelY[1] = -2.0; kernelY[2] = -1.0;
        kernelY[3] = 0.0;  kernelY[4] = 0.0;  kernelY[5] = 0.0;
        kernelY[6] = 1.0;  kernelY[7] = 2.0;  kernelY[8] = 1.0;

        vec3 texColor;
        float valueX = 0.0;
        float valueY = 0.0;

        for (int i = 0; i < 9; i++) {
            texColor = texture2D(tex, uv + offset[i]).rgb;
            float luma = dot(texColor, vec3(0.299, 0.587, 0.114));
            valueX += luma * kernelX[i];
            valueY += luma * kernelY[i];
        }
        
        return sqrt((valueX * valueX) + (valueY * valueY));
    }

    void main() {
        // 1. Pixelation
        // Grid size reduces as uProgress increases
        float minGridSize = 20.0; 
        float currentGridSize = mix(uResolution.x, minGridSize, smoothstep(0.0, 0.8, uProgress));
        currentGridSize = max(currentGridSize, 1.0); 
        
        vec2 pixelatedUV = floor(vUv * currentGridSize) / currentGridSize;
        vec2 uv = mix(vUv, pixelatedUV, smoothstep(0.0, 0.1, uProgress));

        // Base video color
        vec4 baseColor = texture2D(uTexture, uv);

        // 2. Sobel Edge Detection
        float edge = sobel(uTexture, uv, uResolution);
        vec3 edgeColor = vec3(edge) * mix(0.0, 1.5, uProgress); 

        // 3. Radial Burst/Glow
        vec2 center = vec2(0.5);
        float dist = distance(vUv, center);
        
        // Burst radius expands based on progress
        float burstRadius = smoothstep(0.0, 0.9, uProgress) * 1.5; 
        float glow = 1.0 - smoothstep(burstRadius - 0.3, burstRadius + 0.1, dist);
        
        vec3 burstColor = vec3(1.0, 0.9, 0.8) * glow * uProgress * 2.0;

        // 4. Sparkle/Dither Noise
        float noise = random(pixelatedUV + uProgress * 10.0);
        float sparkle = step(0.9, noise) * (edge + glow * 0.5) * uProgress;
        vec3 sparkleColor = vec3(1.0) * sparkle * 2.0;

        // 5. Blending
        vec3 finalColor = baseColor.rgb;
        finalColor += edgeColor;
        finalColor += burstColor;
        finalColor += sparkleColor;
        
        // Whiten screen towards the end
        finalColor = mix(finalColor, vec3(1.0), smoothstep(0.85, 1.0, uProgress));

        gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Register it so it can be used as <explosionMaterial /> in R3F
extend({ ExplosionMaterial });

export { ExplosionMaterial };
