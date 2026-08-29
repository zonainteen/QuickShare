/**
 * Haptics and Vibration feedback utility for tactile mobile experience.
 * Uses Web Vibration API (navigator.vibrate) with safe fallbacks.
 */

export type HapticFeedbackType = 
  | 'light'
  | 'medium'
  | 'heavy'
  | 'shutter'
  | 'recordStart'
  | 'recordStop'
  | 'success'
  | 'warning'
  | 'selection';

export const HAPTIC_PATTERNS: Record<HapticFeedbackType, number | number[]> = {
  // Ultra-light button press / tab click
  light: 12,
  // Standard button press / toggle switch
  medium: 24,
  // Heavy action or modal toggle
  heavy: 45,
  // Camera shutter tactile feedback (quick double pulse)
  shutter: [18, 35, 30],
  // QuickClip video recording started (rising pulse)
  recordStart: [25, 40, 45],
  // QuickClip video recording stopped (falling pulse)
  recordStop: [45, 30, 20],
  // Success action (Share Blast fired, permission granted)
  success: [20, 30, 35, 40, 60],
  // Warning / error feedback
  warning: [50, 40, 50],
  // Picker / dropdown item selection
  selection: 10,
};

/**
 * Triggers a vibration pattern if supported by the browser and device.
 * @param type The type of haptic pattern to play, or a custom pattern array/number
 */
export function triggerHaptic(type: HapticFeedbackType | number | number[] = 'light'): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      let pattern: number | number[];
      if (typeof type === 'string') {
        pattern = HAPTIC_PATTERNS[type] ?? 15;
      } else {
        pattern = type;
      }
      return navigator.vibrate(pattern);
    }
  } catch (error) {
    // Non-critical; silently handle vibration constraints
    console.debug('Haptics vibration not active in current context:', error);
  }

  return false;
}

/**
 * React Hook for executing tactile haptic feedback in components
 */
export function useHaptics() {
  const trigger = (type: HapticFeedbackType | number | number[] = 'light') => {
    return triggerHaptic(type);
  };

  const triggerShutter = () => triggerHaptic('shutter');
  const triggerRecordStart = () => triggerHaptic('recordStart');
  const triggerRecordStop = () => triggerHaptic('recordStop');
  const triggerSuccess = () => triggerHaptic('success');
  const triggerSelection = () => triggerHaptic('selection');
  const triggerLight = () => triggerHaptic('light');
  const triggerMedium = () => triggerHaptic('medium');

  return {
    trigger,
    triggerShutter,
    triggerRecordStart,
    triggerRecordStop,
    triggerSuccess,
    triggerSelection,
    triggerLight,
    triggerMedium,
  };
}
