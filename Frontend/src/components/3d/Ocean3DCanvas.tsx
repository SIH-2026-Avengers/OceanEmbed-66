import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useOcean } from '../../context/OceanContext';
import { generate3DOceanTemperature } from '../../models/threeDModel';

interface Props {
  depthSlider: number;
  viewMode: 'volume' | 'vertical' | 'horizontal';
  showGrid: boolean;
  showDepthSlice: boolean;
  showContours: boolean;
}

export const Ocean3DCanvas: React.FC<Props> = ({
  depthSlider,
  viewMode,
  showGrid,
  showDepthSlice,
  showContours,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { selectedLocation, predictionData } = useOcean();

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050814);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 20, 30);
    camera.lookAt(0, -2, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // 5. Generate 3D Voxel / Thermal Data from model integration layer
    const volumeData = generate3DOceanTemperature(predictionData, selectedLocation, depthSlider);

    const group = new THREE.Group();
    scene.add(group);

    // Map temperature (4°C -> 30°C) to THREE.Color (Blue -> Cyan -> Green -> Yellow -> Red)
    const getThermalColor = (temp: number) => {
      const t = Math.max(0, Math.min(1, (temp - 4) / 26));
      return new THREE.Color().setHSL(0.66 * (1 - t), 0.9, 0.5);
    };

    if (viewMode === 'volume') {
      // Render 3D Volumetric Water Column Voxels
      const voxelGeo = new THREE.BoxGeometry(0.85, 0.5, 0.85);
      const nx = volumeData.gridResolution.nx;
      const ny = volumeData.gridResolution.ny;

      volumeData.depthLevels.forEach((depthLevel, iz) => {
        // Filter voxels based on depth slider
        if (depthLevel > depthSlider) return;

        const yPos = -iz * 1.2;

        for (let iy = 0; iy < ny; iy += 2) {
          for (let ix = 0; ix < nx; ix += 2) {
            const xPos = (ix - nx / 2) * 1.1;
            const zPos = (iy - ny / 2) * 1.1;

            const baseTemp = predictionData.find((d) => d.depth === depthLevel)?.predictedTemp || 15;
            const temp = baseTemp + Math.sin((ix / nx) * Math.PI) * 0.8;

            const mat = new THREE.MeshPhongMaterial({
              color: getThermalColor(temp),
              transparent: true,
              opacity: iz === 0 ? 0.9 : 0.6,
              shininess: 80,
            });

            const mesh = new THREE.Mesh(voxelGeo, mat);
            mesh.position.set(xPos, yPos, zPos);
            group.add(mesh);
          }
        }
      });
    } else if (viewMode === 'vertical') {
      // Render Vertical Cross-Section Slice
      const sliceMatrix = volumeData.verticalSlice;
      const nx = sliceMatrix[0].length;
      const nz = sliceMatrix.length;

      const planeGeo = new THREE.PlaneGeometry(1.0, 1.0);

      sliceMatrix.forEach((row, iz) => {
        const yPos = -iz * 1.2;
        row.forEach((temp, ix) => {
          const xPos = (ix - nx / 2) * 1.1;
          const mat = new THREE.MeshBasicMaterial({
            color: getThermalColor(temp),
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(planeGeo, mat);
          mesh.position.set(xPos, yPos, 0);
          group.add(mesh);
        });
      });
    } else {
      // Render Horizontal Depth Map Slice
      const sliceMatrix = volumeData.horizontalSlice;
      const ny = sliceMatrix.length;
      const nx = sliceMatrix[0].length;
      const planeGeo = new THREE.PlaneGeometry(1.0, 1.0);

      const izIdx = volumeData.depthLevels.findIndex((d) => d >= depthSlider);
      const yPos = -Math.max(0, izIdx) * 1.2;

      sliceMatrix.forEach((row, iy) => {
        const zPos = (iy - ny / 2) * 1.1;
        row.forEach((temp, ix) => {
          const xPos = (ix - nx / 2) * 1.1;
          const mat = new THREE.MeshBasicMaterial({
            color: getThermalColor(temp),
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(planeGeo, mat);
          mesh.rotation.x = Math.PI / 2;
          mesh.position.set(xPos, yPos, zPos);
          group.add(mesh);
        });
      });
    }

    // 6. Optional Grid Helper
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(25, 20, 0x00f0ff, 0x1e293b);
      gridHelper.position.y = 0.5;
      scene.add(gridHelper);
    }

    // 7. Animation Loop with smooth Orbit rotation
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      group.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedLocation, predictionData, depthSlider, viewMode, showGrid, showDepthSlice, showContours]);

  return <div ref={mountRef} className="w-full h-full min-h-[460px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing" />;
};
