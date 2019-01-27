import React, { Component } from 'react';
import { ScrollView, KeyboardAvoidingView, Text, TextInput, View, StyleSheet, Button } from 'react-native';
import { TouchableHighlight } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default class Login extends Component {

    state = {
        email: '', password: '',
    }


    login = (e) => {
        e.preventDefault()
        console.log(this.state.email,this.state.password)
    }

    handleInput = (evt,name) => {
        this.setState({
            [name]: evt.nativeEvent.text
        })
    }

    render() {
        return (

        <KeyboardAwareScrollView style={styles.login}>
          <View style={{alignItems: "flex-end"}}>
            <TouchableHighlight onPress={() => {this.props.setModalVisible(!this.props.modalVisible) }}>
                <Text style={{fontSize: 20}}>Close &times;</Text>
            </TouchableHighlight>
          </View>

            <Text style={{fontSize: 24, textAlign: 'center'}}>
                Login
            </Text>
          <TextInput name="email" type="email" style={styles.input}
            onChange={(e)=>this.handleInput(e,"email")} placeholder='Email' />
          <TextInput name="password" type="password" style={styles.input} secureTextEntry={true}
            onChange={(e)=>this.handleInput(e,"password")} placeholder='Password' />
          <Button onPress={this.login} title="Log In" />
        </KeyboardAwareScrollView>
        )
    }
}

const styles = StyleSheet.create({
    "login": {
        backgroundColor: "white",
        padding: 20,
        height: '100%',
    },
    input: {
        marginTop: 7.5,
        marginBottom: 7.5,
        borderBottomColor: 'rgba(5,5,5,0.25)',
        borderBottomWidth: 1,
    },
    "close-btn": {
        right: 0,
    },
})