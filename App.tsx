/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Provider as PaperProvider } from 'react-native-paper';
import { BackButton, NativeRouter, Route } from 'react-router-native';
import { HomeView } from './src/modules/home/HomeView';
import { DeviceView } from './src/modules/device/DeviceView';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <NativeRouter>
      <BackButton>
        <PaperProvider>
          <SafeAreaView style={backgroundStyle}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              style={backgroundStyle}>
              <Route exact path="/" component={HomeView} />
              <Route path="/device/:id" component={DeviceView} />
            </ScrollView>
          </SafeAreaView>
        </PaperProvider>
      </BackButton>
    </NativeRouter>
  );
};

export default App;
