// plugins/withMediraAlarm.js — let the app show its full-screen alarm over the lock screen
// and turn the screen on when a medicine alarm fires (Notifee fullScreenAction).
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withMediraAlarm(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application && cfg.modResults.manifest.application[0];
    if (app && Array.isArray(app.activity)) {
      const main = app.activity.find((a) => a.$ && /\.MainActivity$/.test(a.$['android:name'] || ''));
      if (main && main.$) {
        main.$['android:showWhenLocked'] = 'true';
        main.$['android:turnScreenOn'] = 'true';
      }
    }
    return cfg;
  });
};
