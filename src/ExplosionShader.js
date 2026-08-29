import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const ExplosionMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTexture: new THREE.Texture(),
    uResolution: new THREE.Vector2(1920, 1080),
    uImageResolution: new THREE.Vector2(1920, 1080),
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
    uniform vec2 uImageResolution;
    varying vec2 vUv;

    // Simple pseudo-random function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // 2D Noise based on Morgan McGuire @morgan3d
    float noise(in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(a, b, u.x) +
                (c - a)* u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
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

        float valueX = 0.0;
        float valueY = 0.0;

        for (int i = 0; i < 9; i++) {
            vec3 texColor = texture2D(tex, uv + offset[i]).rgb;
            float luma = dot(texColor, vec3(0.299, 0.587, 0.114));
            valueX += luma * kernelX[i];
            valueY += luma * kernelY[i];
        }
        return sqrt((valueX * valueX) + (valueY * valueY));
    }

    // Zoom blur / Radial blur
    vec3 radialBlur(sampler2D tex, vec2 uv, vec2 center, float strength) {
        vec2 dir = center - uv;
        vec3 color = vec3(0.0);
        float total = 0.0;
        // Keep iteration count relatively low for performance
        for (float i = 0.0; i < 8.0; i++) {
            float f = i / 8.0;
            float weight = 1.0 - f;
            color += texture2D(tex, uv + dir * f * strength).rgb * weight;
            total += weight;
        }
        return color / total;
    }

    void main() {
        // Calculate object-fit: cover UVs
        vec2 rs = uResolution;
        vec2 is = uImageResolution;
        float maxRatio = max(rs.x / is.x, rs.y / is.y);
        vec2 newSize = is * maxRatio;
        vec2 offset = (rs - newSize) / 2.0;
        vec2 uv = (vUv * rs - offset) / newSize;

        vec2 center = vec2(0.5, 0.5);
        float distToCenter = distance(uv, center);

        // 1. Distort UVs (Shockwave ripple)
        float shockwave = sin(distToCenter * 15.0 - uProgress * 20.0) * smoothstep(0.8, 0.0, abs(distToCenter - (uProgress * 1.5)));
        vec2 distortedUV = uv + normalize(uv - center) * shockwave * uProgress * 0.1;
        
        // 2. Pixelation that ramps up
        float minGridSize = 30.0; 
        float currentGridSize = mix(uResolution.x, minGridSize, smoothstep(0.1, 0.8, uProgress));
        currentGridSize = max(currentGridSize, 1.0); 
        vec2 pixelatedUV = floor(distortedUV * currentGridSize) / currentGridSize;
        
        // Blend normal and pixelated UV
        vec2 finalUV = mix(distortedUV, pixelatedUV, smoothstep(0.0, 0.3, uProgress));

        // 3. Chromatic Aberration & Radial Blur
        float aberrationAmount = uProgress * 0.05 * distToCenter;
        float blurStrength = uProgress * 0.15;
        
        vec3 baseColor;
        baseColor.r = radialBlur(uTexture, finalUV + normalize(finalUV - center) * aberrationAmount, center, blurStrength).r;
        baseColor.g = radialBlur(uTexture, finalUV, center, blurStrength).g;
        baseColor.b = radialBlur(uTexture, finalUV - normalize(finalUV - center) * aberrationAmount, center, blurStrength).b;

        // 4. Enhanced Sobel Edges (Glowing fiery outlines)
        float edge = sobel(uTexture, finalUV, uResolution);
        vec3 fireGradient = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.8, 0.2), edge);
        vec3 edgeColor = fireGradient * edge * smoothstep(0.0, 0.6, uProgress) * 3.0;

        // 5. High Energy Core (Radial Burst)
        float coreRadius = smoothstep(0.2, 1.0, uProgress) * 1.2;
        float coreGlow = 1.0 - smoothstep(coreRadius - 0.4, coreRadius + 0.2, distToCenter);
        float halo = smoothstep(coreRadius + 0.1, coreRadius, distToCenter) * smoothstep(coreRadius - 0.1, coreRadius, distToCenter);
        
        vec3 coreColor = vec3(1.0, 0.9, 0.8) * pow(coreGlow, 2.0) * uProgress * 4.0;
        vec3 haloColor = vec3(1.0, 0.3, 0.0) * halo * uProgress * 3.0;

        // 6. Dynamic Embers / Sparkles
        vec2 noiseUV = pixelatedUV * 5.0 - normalize(finalUV - center) * (uProgress * 2.0);
        float n = noise(noiseUV * 10.0);
        float sparks = pow(smoothstep(0.7, 1.0, n), 3.0) * (edge + coreGlow);
        vec3 sparkColor = vec3(1.0, 0.7, 0.3) * sparks * smoothstep(0.2, 0.9, uProgress) * 5.0;

        // 7. Blend everything
        vec3 finalOutput = baseColor;
        finalOutput += edgeColor;      
        finalOutput += coreColor;      
        finalOutput += haloColor;      
        finalOutput += sparkColor;     
        
        // Burn out to pure white right at the end
        finalOutput = mix(finalOutput, vec3(1.0), smoothstep(0.9, 1.0, uProgress));

        gl_FragColor = vec4(finalOutput, 1.0);
    }
  `
);

// Register it so it can be used as <explosionMaterial /> in R3F
extend({ ExplosionMaterial });

export { ExplosionMaterial };
