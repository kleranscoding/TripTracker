import React, { Component } from 'react';
import { Alert, ScrollView, KeyboardAvoidingView, Text, TextInput, View, StyleSheet, Button } from 'react-native';
import { AsyncStorage, TouchableHighlight } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {serverURL, tokenName, pwdLen, regexEmail, regexWhitespace, regexUsername, errorMsg} from '../../envconst'

const styles = StyleSheet.create({
    "register": {
        backgroundColor: "white",
        padding: 20,
        marginTop: 30,
        height: '90%',
    },
    "register_btn": {
        marginTop: 25,
        borderRadius: 25,
        backgroundColor: 'rgba(36,152,219,0.5)',
    },
    "input": {
        marginTop: 15, marginBottom: 15,
        borderBottomColor: 'rgba(5,5,5,0.25)', borderBottomWidth: 1,
        fontSize: 18,
    },
    "inputErr": {
        borderColor: 'rgba(255,0,0,0.5)', borderWidth: 1, borderRadius: 5,
        marginTop: 15, marginBottom: 15,
        padding: 5,
        fontSize: 18,
    },
    errorText: {
        color: 'rgba(255,0,0,0.5)',
    }
})

const appToken = tokenName

function containWhiteSpace(text) { return regexWhitespace.test(text) }

function validateEmail(text) { return regexEmail.test(text.toLowerCase()) }

function validateUsername(text) { return regexUsername.test(text) }

export default class Register extends Component {

    state = {
        username: '', email: '', password: '', confirmPwd: '',
        msgUsername: '', msgEmail: '', msgPwd: '', msgConfirmPwd: '',
        styleUsername: styles["input"], styleEmail: styles["input"], 
        stylePwd: styles["input"], styleConfirmPwd: styles["input"], 
    }

    submitRegister = (e) => {
        e.preventDefault()
        console.log(this.state.username,this.state.email)
        console.log(this.state.password,this.state.confirmPwd)
        let errUsername= true, errEmail= true, errPwd= true, errConfirmPwd= true
        let username= this.state.username, email= this.state.email,
          pwd= this.state.password, pwdConfirm= this.state.confirmPwd
        // validate username
        if (!username || !validateUsername(username)) {
            this.setState({ msgUsername: errorMsg.emptyUsername, styleUsername: styles["inputErr"], })
        } else {
            errUsername= false
        }
        // validate email
        if (!email || !validateEmail(email)) {
            this.setState({ msgEmail: errorMsg.emptyEmail, styleEmail: styles["inputErr"], })
        } else if (containWhiteSpace(email)) {
            this.setState({ msgEmail: errorMsg.whiteSpace, styleEmail: styles["inputErr"], })
        } else {
            errEmail= false
        }
        // validate password
        if (pwd.length<pwdLen) {
            this.setState({ msgPwd: errorMsg.emptyPwd, stylePwd: styles["inputErr"], })
        } else if (containWhiteSpace(pwd)) {
            this.setState({ msgPwd: errorMsg.whiteSpace, stylePwd: styles["inputErr"],})
        } else {
            errPwd= false
        }
        // validate confirmed password
        if (pwdConfirm.length<pwdLen) {
            this.setState({ msgConfirmPwd: errorMsg.emptyPwd, styleConfirmPwd: styles["inputErr"], })
        } else if (containWhiteSpace(pwdConfirm)) {
            this.setState({ msgConfirmPwd: errorMsg.whiteSpace, styleConfirmPwd: styles["inputErr"],})
        } else if (pwd!==pwdConfirm) {
            this.setState({ msgConfirmPwd: errorMsg.pwdNotMatched, styleConfirmPwd: styles["inputErr"],})
        } else {
            errConfirmPwd= false
        }
        // final validation
        if (errUsername || errEmail || errPwd || errConfirmPwd) return
        Alert.alert("success")
        //*/
        fetch(serverURL+'/api/users/register',{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username, email, "password": pwd,
            }),
        }).then(res=>{
            if (res.status!==200) { 
                console.log(res.status)
                if (res.status===409) {
                    this.setState({ 
                        msgEmail: errorMsg.existsEmail, 
                        styleEmail: styles["inputErr"],
                    })
                }
                return console.log(res._bodyText) 
            }
            console.log("user created")
            this._loginAsync(res)
        }).catch(err=>{return console.log(err)})
    }

    _loginAsync = async(res) => {
        await AsyncStorage.setItem(appToken,res.headers.map['x-token'])
        this.props.navigation.navigate('MainContent');
    }

    handleInput = (evt,name) => {
        this.setState({
            [name]: evt.nativeEvent.text
        })
    }

    onFocus = (msgName,styleName) => {
        this.setState({ [msgName]: '', [styleName]: styles["input"], })
    }

    onBlurUsername = () => {
        let username= this.state.username
        if (username.length < 2 || !validateUsername(username)) {
            this.setState({ 
                msgUsername: errorMsg.emptyUsername, 
                styleUsername: styles["inputErr"],
            })
            return
        } 
    }

    onBlurEmail = () => {
        let email= this.state.email
        if (containWhiteSpace(email)) {
            this.setState({ 
                msgEmail: errorMsg.whiteSpace, 
                styleEmail: styles["inputErr"],
            })
            return
        } else if (!validateEmail(email)) {
            this.setState({ 
                msgEmail: errorMsg.emptyEmail, 
                styleEmail: styles["inputErr"],
            })
            return
        } 
    }

    onBlurPwd = (password,msgName,styleName) => {
        let pwd= this.state[password]
        if (containWhiteSpace(pwd)) {
            this.setState({ 
                [msgName]: errorMsg.whiteSpace, 
                [styleName]: styles["inputErr"],
            })
            return
        } else if (pwd.length<pwdLen ) {
            this.setState({ 
                [msgName]: errorMsg.emptyPwd,
                [styleName]: styles["inputErr"], 
            })
            return
        }
    }

    render() {
        return (

        <KeyboardAwareScrollView style={styles.register}>

          <Text style={{textAlign: 'center'}}>
              Register with Email
          </Text>
          <TextInput name="username" type="text" style={this.state.styleUsername} autoCapitalize = 'none'
            onBlur={this.onBlurUsername} onFocus={()=>this.onFocus("msgUsername","styleUsername")}
            onChange={(e)=>this.handleInput(e,"username")} placeholder='Username' />
          <Text style={styles.errorText}>
            {this.state.msgUsername}
          </Text>
          <TextInput name="email" type="email" style={this.state.styleEmail} autoCapitalize = 'none'
            onBlur={this.onBlurEmail} onFocus={()=>this.onFocus("msgEmail","styleEmail")}
            onChange={(e)=>this.handleInput(e,"email")} placeholder='Email' />
          <Text style={styles.errorText}>
            {this.state.msgEmail}
          </Text>
          <TextInput name="password" type="password" style={this.state.stylePwd} autoCapitalize = 'none' secureTextEntry={true}
            onBlur={()=>this.onBlurPwd("password","msgPwd","stylePwd")} onFocus={()=>this.onFocus("msgPwd","stylePwd")}
            onChange={(e)=>this.handleInput(e,"password")} placeholder='Password' />
          <Text style={styles.errorText}>
            {this.state.msgPwd}
          </Text>
          <TextInput name="confirmPwd" type="password" style={this.state.styleConfirmPwd} autoCapitalize = 'none' secureTextEntry={true}
            onBlur={()=>this.onBlurPwd("confirmPwd","msgConfirmPwd","styleConfirmPwd")} onFocus={()=>this.onFocus("msgConfirmPwd","styleConfirmPwd")}
            onChange={(e)=>this.handleInput(e,"confirmPwd")} placeholder='Confirm Password' />
          <Text style={styles.errorText}>
            {this.state.msgConfirmPwd}
          </Text>
          <View style={styles["register_btn"]}>
            <Button onPress={this.submitRegister} title="Register" color="#ffffff"/>
          </View>
        </KeyboardAwareScrollView>
        )
    }
}
