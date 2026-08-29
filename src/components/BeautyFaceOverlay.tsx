import React, { useRef, useEffect } from 'react';
import { BeautyFilterConfig } from '../types';

interface BeautyFaceOverlayProps {
  config: BeautyFilterConfig;
  isActive: boolean;
  videoElement: HTMLVideoElement | null;
  presetImageUrl?: string;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  rotation: number;
}

export const BeautyFaceOverlay: React.FC<BeautyFaceOverlayProps> = ({
  config,
  isActive,
  videoElement,
  presetImageUrl,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize sparkle particles
  useEffect(() => {
    const pts: Particle[] = [];
    for (let i = 0; i < 18; i++) {
      pts.push({
        x: 0.3 + Math.random() * 0.4,
        y: 0.2 + Math.random() * 0.5,
        size: 3 + Math.random() * 4,
        alpha: Math.random(),
        speed: 0.015 + Math.random() * 0.02,
        rotation: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = pts;
  }, []);

  useEffect(() => {
    if (!isActive || !config.enabled) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.04;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Estimated Face Center & Geometry (normalized coordinates for portrait orientation)
      const faceCenterX = w * 0.5;
      const faceCenterY = h * 0.42;
      const faceRadiusX = w * 0.28;
      const faceRadiusY = h * 0.26;
      const cheekOffsetX = faceRadiusX * 0.52;
      const cheekOffsetY = faceRadiusY * 0.22;
      const lipY = faceCenterY + faceRadiusY * 0.52;
      const eyeY = faceCenterY - faceRadiusY * 0.22;

      // 1. Skin-Smoothing Glow Pass
      if (config.smoothing > 0) {
        const smoothStrength = config.smoothing / 100;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        // Soft peach/ivory radiance gradient on facial contour
        const skinGrad = ctx.createRadialGradient(
          faceCenterX,
          faceCenterY,
          faceRadiusX * 0.1,
          faceCenterX,
          faceCenterY,
          faceRadiusX * 1.3
        );

        const softAlpha = (0.18 * smoothStrength).toFixed(3);
        const edgeAlpha = (0.02 * smoothStrength).toFixed(3);

        if (config.style === 'rosy') {
          skinGrad.addColorStop(0, `rgba(255, 230, 235, ${softAlpha})`);
          skinGrad.addColorStop(0.6, `rgba(255, 215, 225, ${softAlpha})`);
          skinGrad.addColorStop(1, `rgba(255, 200, 215, ${edgeAlpha})`);
        } else if (config.style === 'golden') {
          skinGrad.addColorStop(0, `rgba(255, 245, 220, ${softAlpha})`);
          skinGrad.addColorStop(0.6, `rgba(255, 230, 190, ${softAlpha})`);
          skinGrad.addColorStop(1, `rgba(255, 210, 160, ${edgeAlpha})`);
        } else {
          // Natural / Glam Soft
          skinGrad.addColorStop(0, `rgba(255, 250, 240, ${softAlpha})`);
          skinGrad.addColorStop(0.7, `rgba(255, 240, 230, ${softAlpha})`);
          skinGrad.addColorStop(1, `rgba(255, 230, 220, ${edgeAlpha})`);
        }

        ctx.fillStyle = skinGrad;
        ctx.beginPath();
        ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX * 1.1, faceRadiusY * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Digital Blush (Left & Right Cheek)
      if (config.blush > 0) {
        const blushAlpha = (config.blush / 100) * 0.28;
        const blushRadius = faceRadiusX * 0.42;

        const drawBlush = (cx: number, cy: number) => {
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          const blushGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, blushRadius);
          
          if (config.style === 'rosy' || config.style === 'glam') {
            blushGrad.addColorStop(0, `rgba(255, 105, 140, ${blushAlpha.toFixed(3)})`);
            blushGrad.addColorStop(0.5, `rgba(255, 140, 165, ${(blushAlpha * 0.6).toFixed(3)})`);
            blushGrad.addColorStop(1, 'rgba(255, 140, 165, 0)');
          } else if (config.style === 'golden') {
            blushGrad.addColorStop(0, `rgba(245, 130, 95, ${blushAlpha.toFixed(3)})`);
            blushGrad.addColorStop(0.5, `rgba(255, 160, 130, ${(blushAlpha * 0.6).toFixed(3)})`);
            blushGrad.addColorStop(1, 'rgba(255, 160, 130, 0)');
          } else {
            blushGrad.addColorStop(0, `rgba(255, 135, 135, ${blushAlpha.toFixed(3)})`);
            blushGrad.addColorStop(0.5, `rgba(255, 165, 165, ${(blushAlpha * 0.5).toFixed(3)})`);
            blushGrad.addColorStop(1, 'rgba(255, 165, 165, 0)');
          }

          ctx.fillStyle = blushGrad;
          ctx.beginPath();
          ctx.ellipse(cx, cy, blushRadius, blushRadius * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        drawBlush(faceCenterX - cheekOffsetX, faceCenterY + cheekOffsetY);
        drawBlush(faceCenterX + cheekOffsetX, faceCenterY + cheekOffsetY);
      }

      // 3. Digital Lip Tint & Gloss Highlight
      if (config.lipGloss > 0) {
        const lipAlpha = (config.lipGloss / 100) * 0.32;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';

        const lipGrad = ctx.createRadialGradient(
          faceCenterX,
          lipY,
          2,
          faceCenterX,
          lipY,
          faceRadiusX * 0.35
        );

        if (config.style === 'rosy' || config.style === 'glam') {
          lipGrad.addColorStop(0, `rgba(235, 60, 105, ${lipAlpha.toFixed(3)})`);
          lipGrad.addColorStop(0.7, `rgba(240, 90, 130, ${(lipAlpha * 0.5).toFixed(3)})`);
          lipGrad.addColorStop(1, 'rgba(240, 90, 130, 0)');
        } else {
          lipGrad.addColorStop(0, `rgba(225, 75, 75, ${lipAlpha.toFixed(3)})`);
          lipGrad.addColorStop(0.7, `rgba(235, 110, 110, ${(lipAlpha * 0.5).toFixed(3)})`);
          lipGrad.addColorStop(1, 'rgba(235, 110, 110, 0)');
        }

        ctx.fillStyle = lipGrad;
        ctx.beginPath();
        ctx.ellipse(faceCenterX, lipY, faceRadiusX * 0.3, faceRadiusY * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lip specular highlight point
        ctx.fillStyle = `rgba(255, 255, 255, ${(lipAlpha * 0.85).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(faceCenterX, lipY - 2, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. AR Sparkle & Glitter Particles around Face
      if (config.sparkles) {
        ctx.save();
        particlesRef.current.forEach((p, idx) => {
          p.alpha = Math.sin(time * 2 + idx) * 0.5 + 0.5;
          const px = p.x * w;
          const py = (p.y + Math.sin(time + idx * 0.5) * 0.02) * h;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(time * 0.5 + p.rotation);
          ctx.fillStyle = `rgba(255, 245, 190, ${(p.alpha * 0.85).toFixed(3)})`;
          ctx.shadowColor = '#FBBF24';
          ctx.shadowBlur = 6;

          // Draw 4-point star sparkle
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.25, -s * 0.25);
          ctx.lineTo(s, 0);
          ctx.lineTo(s * 0.25, s * 0.25);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.25, s * 0.25);
          ctx.lineTo(-s, 0);
          ctx.lineTo(-s * 0.25, -s * 0.25);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    // Set canvas dimensions
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 360;
        canvas.height = canvas.parentElement.clientHeight || 560;
      }
    };
    resizeCanvas();
    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive, config, videoElement, presetImageUrl]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-15 ${className}`}
    />
  );
};
