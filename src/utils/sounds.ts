// Sound utility for splash screen and other app sounds

export const sounds = {
  loadingComplete: '/sounds/complete.mp3', // You can add actual sound files to public/sounds/
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
};

let hasUserInteracted = false;

// Track user interaction to enable audio playback
const enableAudio = () => {
  hasUserInteracted = true;
  document.removeEventListener('click', enableAudio);
  document.removeEventListener('keydown', enableAudio);
  document.removeEventListener('touchstart', enableAudio);
};

// Add listeners for user interaction
if (typeof document !== 'undefined') {
  document.addEventListener('click', enableAudio, { once: true });
  document.addEventListener('keydown', enableAudio, { once: true });
  document.addEventListener('touchstart', enableAudio, { once: true });
}

export const playSound = (soundUrl: string, volume: number = 0.5) => {
  // Temporarily disable audio to prevent mixed content and autoplay errors
  console.info('Audio playback disabled - soundUrl:', soundUrl);
  return;
  
  // Only play audio if user has interacted with the page
  if (!hasUserInteracted) {
    console.info('Audio playback skipped - waiting for user interaction');
    return;
  }

  try {
    const audio = new Audio(soundUrl);
    audio.volume = volume;
    audio.play().catch((error) => {
      // Silently fail if audio can't be played (e.g., autoplay restrictions)
      console.warn('Audio playback prevented:', error);
    });
  } catch (error) {
    console.warn('Failed to create audio:', error);
  }
};
