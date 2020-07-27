/**
 * @format
 */
/*import { Navigation } from "react-native-navigation";
//
import App from './App';
//import {name as appName} from './app.json';

//AppRegistry.registerComponent(appName, () => App);

Navigation.registerComponent('com.myApp.WelcomeScreen', () => App);
Navigation.events().registerAppLaunchedListener(() => {
   Navigation.setRoot({
     root: {
       stack: {
         children: [
           {
             component: {
               name: 'com.myApp.WelcomeScreen'
             }
           }
         ]
       }
     }
  });
});*/

import {Navigation} from 'react-native-navigation';
import { AppRegistry } from 'react-native';
import {registerScreens} from './src/screens';
import messaging from '@react-native-firebase/messaging';

registerScreens();

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }
 }

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      component: {
        name: 'Initializing'
      }
    },
  });
});


AppRegistry.registerComponent('app', () => HeadlessCheck);