// Home.js
import React from 'react'
import {
  View,
  Text,
  Button,
  Alert,
  FlatList,
  ScrollView,
  SafeAreaView,
  StyleSheet,


} from 'react-native'
import { goToAuth } from './navigation'
import NotifService from './NotifService';
import {Navigation} from 'react-native-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { USER_KEY, TOKEN_KEY, NOTIFICATION_STACK } from './config'

export default class Home extends React.Component {
  static get options() {
    return {
      topBar: {
        title: {
          text: 'Home',
          alignment: 'center'
        },
        rightButtons: {
          id: "sign_out",
          text: "Sign Out"
        }
      }
    };
  }

  state = {
      username: '',
      device_Token: '',
      tempText: 'You do not have any push notification yet. Send some push to show it in the list',
      isNoti: false,
      /*test_data: [{id: '1', title: 'first item'},{id: '2', title: 'second item'},{id: '3', title: 'third item'}
                 ,{id: '4', title: 'fourth item'},{id: '5', title: 'fifth item'},{id: '6', title: 'sixth item'}
                 ,{id: '7', title: 'seventh item'},{id: '8', title: 'eighth item'},{id: '9', title: 'ninth item'}
                 ,{id: '10', title: 'tenth item'},{id: '11', title: 'eleventh item'},{id: '12', title: 'twelve item'}]*/
      pushData:[]
   }

  componentDidMount(){
      this.setUserAndToken();
      this.notif = new NotifService(
                    this.onRegister.bind(this),
                    this.onNotif.bind(this)
       );
      this.navigationEventListener = Navigation.events().bindComponent(this);
  }

  setUserAndToken = async () => {
        try {
           console.log('USER_KEY...: ', await AsyncStorage.getItem(USER_KEY))
           console.log('TOKEN_KEY...: ', await AsyncStorage.getItem(TOKEN_KEY))
           this.setState({ username: await AsyncStorage.getItem(USER_KEY), device_Token: await AsyncStorage.getItem(TOKEN_KEY)})

           const nStack = await AsyncStorage.getItem(NOTIFICATION_STACK)
           if (nStack) {
               console.log('nStack, ' + JSON.parse(nStack));
               this.setState({ pushData: JSON.parse(nStack), isNoti: true })
           }

        } catch (err) {
          console.log('error setUserAndToken...: ', err)
        }
      }

  onRegister(token) {
          console.log('This is token package =', token);
   }


  onNotif(notif) {
      console.log('onNotification', notif);
      if(notif.foreground){
          console.log('FOREGROUND');
          //this.showAlert(notif.title, notif.message);
          this.addDataToList(notif.title, notif.message);
      }else{
          console.log('BACKGROUND');
          //this.showAlert(notif.title, notif.body);
          this.addDataToList(notif.title, notif.body);
      }

    }

  navigationButtonPressed({buttonId}) {
        if (buttonId === 'sign_out') {
          Alert.alert(
                       'Sign Out',
                       'Are you sure?',
                       [
                         {text: 'Cancel', onPress: () => console.log('Cancel Pressed')},
                         {text: 'Yes', onPress: () => this.deleteToken()}

                       ],
                       {cancelable: false},
                     );

        }
   }

   deleteToken = async () => {

         const url = 'http://192.168.0.115/Login_v19/api.php?name=logout&token=' + this.state.device_Token;
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
                          this.logout(this.state.jsonData);
                          //return responseJson.data;
                       })
                       .catch((error) => {
                          console.error('error = ' + error);
                          return 0;
                       });

      }

  logout = async (jsonFetch) => {

    if(jsonFetch.status_message == 'success'){
                   try {
                         await AsyncStorage.removeItem(USER_KEY)
                         await AsyncStorage.removeItem(TOKEN_KEY)
                         await AsyncStorage.removeItem(NOTIFICATION_STACK)
                         goToAuth()
                       } catch (err) {
                         console.log('error signing out...: ', err)
                         this.showAlert('error', 'Please try again');
                       }

                 }else if(jsonFetch.status_message == 'failed'){
                  this.showAlert('error', jsonFetch.data);
          }

  }

  showAlert = (title, message) => {
               Alert.alert(
                 title,
                 message,
                 [
                   {text: 'OK', onPress: () => console.log('OK Pressed')},
                 ],
                 {cancelable: false},
               );
             }

  addDataToList = async (t, m) => {

      console.log('addDataToList');

      try {
          const nStack = await AsyncStorage.getItem(NOTIFICATION_STACK)
          let myArray = this.state.pushData;
          if(nStack){
           myArray = JSON.parse(nStack);
          }

          myArray.splice(0, 0, {custom_title: t, custom_message: m})
          //myArray.push({custom_title: t, custom_message: m});
          this.setState({pushData: myArray, isNoti: true });
          console.log('pushData: ', this.state.pushData);

          await AsyncStorage.setItem(NOTIFICATION_STACK, JSON.stringify(myArray))
          console.log('NOTIFICATION_STACK: ', await AsyncStorage.getItem(NOTIFICATION_STACK));

      } catch (err) {
        console.log('error addDataToList...: ', err)
      }
    }


  render() {
    return (
          <View style={styles.container}>
                  <Text style={styles.header}>Notification</Text>
                  <View style={styles.body}>
                  {/*(this.state.pushData.length != 0) &&
                      <View style={styles.noData}>
                      <Text style={styles.header}>Kuy</Text>
                      <Text style={styles.header}>{this.state.pushData.title}</Text>
                      <Text style={styles.header}>{this.state.pushData.message}</Text>
                       </View>
                  */}
                      {/* If */}
                      {(this.state.pushData.length != 0) &&
                                <FlatList data={this.state.pushData} scrollEnabled={true}
                                showsVerticalScrollIndicator={false}

                                renderItem={({item}) => <View >
                                                            <Text style={styles.title}>{item.custom_title}</Text>
                                                            <Text style={styles.message}>{item.custom_message}</Text>
                                                        </View>
                                           }
                                keyExtractor={item => item.custom_title}
                                extraData = {this.state}/>
                      }
                       {/* Else */}
                      {(!this.state.isNoti) &&
                                      <View style={styles.noData}>
                                        <Text style={styles.noDataText}>{this.state.tempText}</Text>
                                      </View>}

                  </View>
          </View>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',

  },
  header: {
      //padding: 10,
      //backgroundColor: 'powderblue',
      padding: 10,
      fontSize: 30
      //alignItems: 'center',
      //justifyContent: 'center'
  },
  box1: {
      //justifyContent: 'center',
      padding: 10,
      backgroundColor: 'powderblue'
    },
   scrollView: {
       backgroundColor: '#F0F8FF',
       //padding: 10,
   },
  body: {
       flex: 1,
       backgroundColor: '#FFFFFF',
       paddingHorizontal: 20,
       paddingVertical: 10,
   },
  title: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingTop: 10
  },
  message: {
        fontSize: 14,
        paddingBottom: 15,
        borderBottomColor: "#ccc",
        borderBottomWidth: 1
  },
  noData: {
       paddingVertical: 50,
  },
  noDataText: {
       fontSize: 14,
       textAlign: 'center',
  }

})