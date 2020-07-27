// SignIn.js
import React, { useEffect }  from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  Image

} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import NotifService from './NotifService';
import { goHome, goToAuth } from './navigation'
import {Navigation} from 'react-native-navigation';
import { USER_KEY, TOKEN_KEY } from './config'

export default class SignIn extends React.Component {
  state = {
    username: '', password: ''
  }

  componentDidMount() {

      this.notif = new NotifService(this.onRegister.bind(this));
  }

  onRegister(token) {
        console.log('This is token package =', token);
        console.log('This is token =', token.token);
        this.saveToken(token.token);
        //this.showAlert('Your Device Token is:', token.token);
      }

  saveToken = async (token) =>{
      try {
         console.log('USER_KEY...: ', await AsyncStorage.getItem(USER_KEY))
         console.log('TOKEN_KEY...: ', await AsyncStorage.getItem(TOKEN_KEY))
         await AsyncStorage.setItem(TOKEN_KEY, token)
      } catch (err) {
         console.log('error:', err)
       }
  }

  handlePerm(perms) {
    Alert.alert('Permissions', JSON.stringify(perms));
  }

  checkUser = async (u,p) => {

      const url = 'http://192.168.0.115/Login_v19/api.php?name=login&id=' + u + '&pass=' + p + '&token=' + await AsyncStorage.getItem(TOKEN_KEY);
              console.log(url);
              fetch(url, {
                       method: 'GET',
                       headers: {

                               'Content-Type': 'application/json',
                             }
                    })
                    .then((response) => response.json())
                    .then((responseJson) => {
                       console.log(responseJson);
                       this.setState({
                          jsonData: responseJson
                       })
                       console.log('Data = ' + this.state.jsonData);
                       this.signIn(this.state.jsonData);
                       //return responseJson.data;
                    })
                    .catch((error) => {
                       console.error('error = ' + error);
                       return 0;
                    });

   }

  signIn = async (jsonFetch) => {

     if(jsonFetch.status_message == 'success'){
               try {
                           await AsyncStorage.setItem(USER_KEY, this.state.username)

                           const user = await AsyncStorage.getItem(USER_KEY)
                           const user_token = await AsyncStorage.getItem(TOKEN_KEY)

                           console.log('user :', user)
                           console.log('user_token :', user_token)
                           console.log('this.state.username :', this.state.username)

                           if (user == this.state.username && user_token != null) {
                                goHome()
                           } else {
                                 this.showAlert('error', 'Please try again');
                                 await AsyncStorage.removeItem(USER_KEY)
                                 await AsyncStorage.removeItem(TOKEN_KEY)
                                 goToAuth()
                                 console.log('No user')
                           }
               } catch (err) {
                           await AsyncStorage.removeItem(USER_KEY)
                           await AsyncStorage.removeItem(TOKEN_KEY)
                           this.showAlert('error', 'Please try again');
                           goToAuth()
                           console.log('error:', err)
               }

             }else if(jsonFetch.status_message == 'failed'){
              await AsyncStorage.removeItem(USER_KEY)
              await AsyncStorage.removeItem(TOKEN_KEY)
              goToAuth()
              this.showAlert('error', jsonFetch.data);
      }
  }

  showAlert = async (title, message) => {
             Alert.alert(
               title,
               message,
               [
                 {text: 'OK', onPress: () => this.printTest()},
               ],
               {cancelable: false},
             );
           }
  printTest = async () => {
               try {
                        console.log('printTest_USER_KEY...: ', await AsyncStorage.getItem(USER_KEY))
                        console.log('printTest_TOKEN_KEY...: ', await AsyncStorage.getItem(TOKEN_KEY))

                     } catch (err) {
                        console.log('error:', err)
                      }
             }


  render() {
    return (
      <View style={styles.container}>
        <Image
               style={{ width: '80%' }}
                resizeMode="contain"
                source={require('./unitegps_logo.png')}
              />
        <TextInput
          style={styles.input}
          placeholder='Username'
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor='white'
          value={this.state.username}
          onChangeText={username => this.setState({ username })}
        />
        <TextInput
          style={styles.input}
          placeholder='Password'
          autoCapitalize="none"
          secureTextEntry={true}
          placeholderTextColor='white'
          value={this.state.password}
          onChangeText={password => this.setState({ password })}
        />
        <Button
          title='Sign In'
          onPress={() => this.checkUser(this.state.username, this.state.password)}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  input: {
    width: 350,
    fontSize: 18,
    fontWeight: '500',
    height: 55,
    backgroundColor: '#42A5F5',
    margin: 10,
    color: 'white',
    padding: 8,
    borderRadius: 14
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
      //flex: 1,
      width: '50%',
      height: '50%',

  }
})