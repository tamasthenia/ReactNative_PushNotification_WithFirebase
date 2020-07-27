// Initializing.js
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert

} from 'react-native'

import AsyncStorage from '@react-native-community/async-storage';

import { goToAuth, goHome } from './navigation'
//import messaging from '@react-native-firebase/messaging';

import { USER_KEY, TOKEN_KEY } from './config'

export default class Initialising extends React.Component {

  async componentDidMount() {

    try {
      const user = await AsyncStorage.getItem(USER_KEY)
      const user_token = await AsyncStorage.getItem(TOKEN_KEY)
      console.log('user: ', user)
      console.log('token: ', user_token)
      if (user && user_token) {
        goHome()
      } else {
        goToAuth()
      }
    } catch (err) {
      console.log('error: ', err)
      goToAuth()
    }
  }


  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Loading</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 28
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
