// Sound utility for splash screen and other app sounds

export const sounds = {
  loadingComplete: '/sounds/complete.mp3', // You can add actual sound files to public/sounds/
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
};

export const playSound = (soundUrl: string, volume: number = 0.5) => {
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
