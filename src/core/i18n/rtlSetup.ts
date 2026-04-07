import { I18nManager } from 'react-native';

// Force RTL layout for Arabic language support
// This ensures the entire app renders from Right-to-Left
if (!I18nManager.isRTL) {
	I18nManager.allowRTL(true);
	I18nManager.forceRTL(true);
}
