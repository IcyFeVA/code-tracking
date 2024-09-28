module.exports = function (api) {
  api.cache(true);
  const plugins = ["nativewind/babel",
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        alias: {
          '@': './',
        },
      },
    ]];

  return {
    presets: ['babel-preset-expo'],

    plugins,
  };
};
