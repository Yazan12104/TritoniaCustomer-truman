import { registerRootComponent } from 'expo';

import './src/core/i18n/rtlSetup';
import './src/core/tasks/tokenRefreshTask'; // Ensure task is defined
import App from './App';
import { registerBackgroundRefreshTask } from './src/core/tasks/tokenRefreshTask';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Register background task
registerBackgroundRefreshTask();
