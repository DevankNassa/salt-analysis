import path from 'node:path';
import { Config } from '@remotion/cli/config';
import webpack from 'webpack';

// The ad imports the game's real components from ../src. Two things make that work:
// 1. Every `react` import (including the game's) resolves to this folder's copy, so there is one React.
// 2. The game reads Vite env vars (analytics, feedback form). They don't exist here, so they're stubbed
//    as undefined, which also means the ad never loads analytics or sends anything.
const here = process.cwd();

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias as Record<string, string>),
      react: path.join(here, 'node_modules/react'),
      'react-dom': path.join(here, 'node_modules/react-dom'),
    },
  },
  plugins: [
    ...(config.plugins ?? []),
    new webpack.DefinePlugin({
      'import.meta.env.VITE_GOATCOUNTER_CODE': 'undefined',
      'import.meta.env.VITE_WEB3FORMS_KEY': 'undefined',
    }),
  ],
}));
