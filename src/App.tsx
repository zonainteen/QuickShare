import React, { useState } from 'react';
import { 
  ScreenName, 
  CapturedMedia, 
  AdMobConfig 
} from './types';
import { DEFAULT_ADMOB_CONFIG, SAMPLE_PRESET_SCENES, FILTERS } from './data/presets';
import { DeviceFrame } from './components/DeviceFrame';
import { SplashScreen } from './components/screens/SplashScreen';
import { CameraScreen } from './components/screens/CameraScreen';
import { FilterCaptionScreen } from './components/screens/FilterCaptionScreen';
import { AutoStatusScreen } from './components/screens/AutoStatusScreen';
import { ShareBlastScreen } from './components/screens/ShareBlastScreen';
import { QuickClipScreen } from './components/screens/QuickClipScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  const admobConfig: AdMobConfig = DEFAULT_ADMOB_CONFIG;
  
  // Default captured media state
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia>({
    type: 'photo',
    url: SAMPLE_PRESET_SCENES[0].url,
    filterId: 'coffee_glow',
    caption: FILTERS[0].defaultCaption,
    timestamp: new Date(),
    category: 'Coffee',
  });

  // Screen Flow Transitions
  const handleSplashFinish = () => {
    setCurrentScreen('camera');
  };

  const handleCapturePhoto = (media: CapturedMedia) => {
    setCapturedMedia(media);
    setCurrentScreen('filter_caption');
  };

  const handleDirectAutoStatus = (media: CapturedMedia) => {
    setCapturedMedia(media);
    setCurrentScreen('auto_status');
  };

  const handleFilterNext = (updatedMedia: CapturedMedia) => {
    setCapturedMedia(updatedMedia);
    setCurrentScreen('auto_status');
  };

  const handleQuickClipNext = (videoMedia: CapturedMedia) => {
    setCapturedMedia(videoMedia);
    setCurrentScreen('share_blast');
  };

  const handleLoadDraft = (draftMedia: CapturedMedia) => {
    setCapturedMedia(draftMedia);
    setCurrentScreen('auto_status');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-2 sm:p-4 font-sans">
      <DeviceFrame
        platformStyle="material"
      >
        {currentScreen === 'splash' && (
          <SplashScreen
            platformStyle="material"
            onFinish={handleSplashFinish}
          />
        )}

        {currentScreen === 'camera' && (
          <CameraScreen
            platformStyle="material"
            admobConfig={admobConfig}
            onCapture={handleCapturePhoto}
            onDirectAutoStatus={handleDirectAutoStatus}
            onGoToQuickClip={() => setCurrentScreen('quickclip')}
            onLoadDraft={handleLoadDraft}
          />
        )}

        {currentScreen === 'filter_caption' && (
          <FilterCaptionScreen
            media={capturedMedia}
            platformStyle="material"
            admobConfig={admobConfig}
            onBack={() => setCurrentScreen('camera')}
            onNext={handleFilterNext}
            onLoadDraft={handleLoadDraft}
          />
        )}

        {currentScreen === 'auto_status' && (
          <AutoStatusScreen
            media={capturedMedia}
            platformStyle="material"
            admobConfig={admobConfig}
            onBackToEdit={() => setCurrentScreen('filter_caption')}
            onGoToBlast={() => setCurrentScreen('share_blast')}
            onLoadDraft={handleLoadDraft}
          />
        )}

        {currentScreen === 'share_blast' && (
          <ShareBlastScreen
            media={capturedMedia}
            platformStyle="material"
            admobConfig={admobConfig}
            onBack={() => setCurrentScreen('auto_status')}
          />
        )}

        {currentScreen === 'quickclip' && (
          <QuickClipScreen
            platformStyle="material"
            admobConfig={admobConfig}
            onBack={() => setCurrentScreen('camera')}
            onNextToBlast={handleQuickClipNext}
          />
        )}
      </DeviceFrame>
    </div>
  );
}
