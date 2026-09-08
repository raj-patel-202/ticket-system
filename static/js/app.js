/**
 * AuraPass — Global Core Configuration
 */

// Clear any obsolete glass tuner test overrides so permanent theme tokens apply cleanly
try {
  localStorage.removeItem('aurapass_glass_settings');
} catch (_) {}
