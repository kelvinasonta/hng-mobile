import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_KEY = '@aether_has_seen_welcome_v1';

// In-memory fallback if AsyncStorage is unavailable during cold initialization
let memoryFallbackFlag = false;

/**
 * Checks whether the customer has already completed or skipped the welcome onboarding.
 */
export async function hasSeenWelcome(): Promise<boolean> {
  if (memoryFallbackFlag) {
    return true;
  }

  try {
    const val = await AsyncStorage.getItem(WELCOME_KEY);
    if (val === 'true') {
      memoryFallbackFlag = true;
      return true;
    }
  } catch {
    // If storage read errors, fall back to in-memory flag
    return memoryFallbackFlag;
  }

  return false;
}

/**
 * Persistently marks that the customer has completed or dismissed the welcome onboarding,
 * ensuring it will never show again on subsequent launches.
 */
export async function setHasSeenWelcome(): Promise<void> {
  memoryFallbackFlag = true;
  try {
    await AsyncStorage.setItem(WELCOME_KEY, 'true');
  } catch {
    // Ignore async storage write errors
  }
}

/**
 * Utility to reset onboarding if needed during testing
 */
export async function resetWelcome(): Promise<void> {
  memoryFallbackFlag = false;
  try {
    await AsyncStorage.removeItem(WELCOME_KEY);
  } catch {
    // Ignore error
  }
}
