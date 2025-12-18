import React, { useState, useCallback, useEffect, useRef } from 'react';
import Experience from './components/Experience';
import OverlayUI from './components/OverlayUI';
import GestureController from './components/GestureController';
import { audioService } from './services/audioService';
import { AppMode, GestureState, PhotoData } from './types';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [mode, setMode] = useState<AppMode>('TREE');
  const [focusedPhotoId, setFocusedPhotoId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Track which photo slot to overwrite next
  const lastUploadIndex = useRef(0);
  
  // Photo State
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  // Initialize Default Photos
  useEffect(() => {
    const defaults = [1,2,3,4,5,6].map((id, index) => {
        const height = 10;
        const radiusBase = 3.5;
        const y = (index / 6) * (height * 0.6) - 2; 
        const angle = (index / 6) * Math.PI * 2;
        const radius = ((height / 2) - y) / height * radiusBase + 0.6; 
        
        return {
            id,
            url: `https://picsum.photos/id/${15 + id}/400/400`,
            position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
            rotation: [0, -angle + Math.PI/2, 0] as [number, number, number]
        };
     });
     setPhotos(defaults);
  }, []);
  
  const [gestureState, setGestureState] = useState<GestureState>({
    isFist: false,
    isOpenHand: false,
    isSpread: false,
    isPinching: false,
    isDoublePinch: false,
    handX: 0,
    handY: 0,
    cursorX: 0,
    cursorY: 0
  });

  const handleStart = (enableGestures: boolean) => {
    setStarted(true);
    setGestureEnabled(enableGestures);
    audioService.play();
  };

  const toggleMute = () => {
    const playing = audioService.toggle();
    setIsMuted(!playing);
  };

  const handleUpload = (fileList: FileList) => {
    if (!fileList || fileList.length === 0) return;
    
    const newFiles = Array.from(fileList);
    setPhotos(prevPhotos => {
      const updatedPhotos = [...prevPhotos];
      newFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        // Overwrite cyclically
        const index = lastUploadIndex.current % updatedPhotos.length;
        updatedPhotos[index] = { ...updatedPhotos[index], url };
        lastUploadIndex.current++;
      });
      return updatedPhotos;
    });
  };

  const handlePhotoClick = useCallback((id: number | null) => {
    setFocusedPhotoId(prev => (prev === id ? null : id));
  }, []);

  const handleModeToggle = () => {
    setMode(prev => {
      if (prev === 'TREE') return 'EXPLODE';
      if (prev === 'EXPLODE') return 'CHAOS';
      return 'TREE';
    });
  };

  useEffect(() => {
    if (!gestureEnabled) return;

    if (gestureState.isSpread) {
        setMode('CHAOS');
    } else if (gestureState.isFist) {
        setMode('TREE');
    } else if (gestureState.isOpenHand) {
        setMode('EXPLODE');
    }

    if (gestureState.isDoublePinch) {
        setFocusedPhotoId(prev => prev ? null : photos[0]?.id || null);
    }

  }, [gestureState, gestureEnabled, photos]);

  return (
    <div 
      className="relative w-full h-screen bg-[#050103] overflow-hidden" 
      onClick={(!gestureEnabled && started) ? handleModeToggle : undefined}
      style={{ cursor: (!gestureEnabled && started) ? 'pointer' : 'default' }}
    >
      <Experience 
        mode={mode} 
        focusedPhotoId={focusedPhotoId}
        onPhotoClick={handlePhotoClick}
        gestureRotation={gestureState.handX}
        zoomLevel={gestureState.handY}
        photos={photos}
      />

      <OverlayUI 
        started={started} 
        onStart={handleStart} 
        isMuted={isMuted} 
        toggleMute={toggleMute}
        gestureState={gestureState}
        gestureEnabled={gestureEnabled}
        onUpload={handleUpload}
      />

      <GestureController 
        enabled={gestureEnabled} 
        onGestureUpdate={setGestureState} 
      />
    </div>
  );
};

export default App;