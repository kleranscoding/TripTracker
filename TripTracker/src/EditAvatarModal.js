import React from 'react';
import { AsyncStorage, Text, View, Image, Alert, CameraRoll, StyleSheet } from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import { Camera, Permissions, ImagePicker, } from 'expo';

import { serverURL, tokenName, } from './config/envConst';
import { ScrollView } from 'react-native-gesture-handler';


/**
 * STYLESHEETS
 */
const styles = StyleSheet.create({
  appbarHeader:{
      backgroundColor: 'rgb(36,152,219)',
  },
  contentTitle: {
      fontSize: 24, fontFamily: 'Avenir',
  },
  modalBtnCancel: {
    backgroundColor: 'rgb(255,255,255)',
    borderRadius: 25,
    margin: 20,
  },
  modalBtnConfirm: {
      backgroundColor: 'rgb(49,90,158)',
      borderRadius: 25,
      margin: 20,
  },
})

/**
 * CONSTANTS AND FUNCTIONS
 */
const cameraRollOption = {
    allowsEditing: true,
    aspect: [4, 3],
}


_getToken = async() => { return await AsyncStorage.getItem(tokenName) }

export default class EditAvatarModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      image: null,
      uploading: false,
      cameraPermission: null,
      cameraRollPermission: null,
      type: Camera.Constants.Type.back, 
      useDefault: false,
    }
  }

  _pickImage = async () => {
    const { status: cameraRollPermission } = await Permissions.askAsync(Permissions["CAMERA_ROLL"])     
    if (cameraRollPermission === 'granted') {
        let result = await ImagePicker.launchImageLibraryAsync(cameraRollOption);
        if (!result.cancelled) {
          this.setState({ image: result.uri, useDefault: false, });
        }
    }
  }

  _snapPhoto = async()=> {  
    const { status: cameraPermission } = await Permissions.askAsync(Permissions.CAMERA)
    const { status: cameraRollPermission } = await Permissions.askAsync(Permissions["CAMERA_ROLL"])     
    if (cameraPermission === 'granted' && cameraRollPermission === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        allowEditing: true,
        exif: true
      });
    
      if (!result.cancelled) {
        this.setState({ image: result.uri, useDefault: false, });
        CameraRoll.saveToCameraRoll(result.uri);
      }
      
    }
  }

  _sendRequest = async(formData) => {
    _getToken().then(token=>{
      fetch(serverURL+'/api/'+this.props.setting.route, {
          method: 'POST',
          body: formData,
          headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`,
          }
      }).then(res=>{
        if (res.status===200) {
          res.json().then(data=>{
            this.props.updateImage(data,this.props.setting.target)
          })
        }
      }).catch(err=>{ console.log(err) })
    }).catch(error=>{
      console.log("get token error:",error)
    }) 
  }

  _useDefault = () => {
    //console.log("default")
    this.setState({
      image: this.props.setting.image, useDefault: true,
    })
  }

  _resetImage = () => {
    this.setState({
      image: this.props.currentImage, useDefault: true,
    })
  }

  _uploadImage = async (uri) => {
    let formData = new FormData()
    if (!this.state.useDefault) {
      let uriParts = uri.split('.')
      //console.log(uriParts)
      let slashParts= uriParts[0].split('/')
      let filename = slashParts[slashParts.length-1]
      let fileType = uriParts[uriParts.length - 1]
      formData.append('photo', { uri, name: `${filename}.${fileType}`, type: `image/${fileType}`, })
    } else {
      formData.append('defaultImage',this.state.image)
    }
    this._sendRequest(formData)
  }


  submitImage = async() => {
    if (!this.state.image && !this.state.useDefault) {
      Alert.alert("Hang On!\n- no photo selected")
      return
    }
    if (this.state.image===this.props.currentImage) {
      this.props.setModal(false,this.props.setting.target,"")
      return
    }
    this._uploadImage(this.state.image)
  }


  render() {
    return (
    <React.Fragment>

      <Appbar.Header statusBarHeight={20} style={styles.appbarHeader}>
        <Appbar.Content title="Edit Image" titleStyle={styles.contentTitle} />
        <Button onPress={()=>this.props.setModal(false,this.props.setting.target,"")}
            style={{alignItems: 'center', alignContent: 'flex-end'}}>
            <Text style={{color: "rgb(255,255,255)"}}>Close</Text>
        </Button> 
      </Appbar.Header>
        
        <View style={{alignSelf: 'center'}}>
          {this.state.image ?
            <Image style={{ width: 250, height: 250 }}
              source={{ uri: this.state.useDefault? serverURL+'/'+this.state.image: this.state.image }} />:
            <Image style={{ width: 250, height: 250 }}
              source={{ uri: serverURL+'/'+this.props.currentImage }} />
          }
        </View>

        <View style={{flexDirection: 'row', justifyContent:'center'}}>
          <Button onPress={this._useDefault} 
            style={{
              alignSelf: 'flex-start', margin: 15, 
              borderColor: 'silver', borderWidth: 1, borderRadius: 15
            }}
          >
            <Text>Use default</Text>
          </Button>
          <Button onPress={this._resetImage} 
            style={{
              alignSelf: 'flex-end', margin: 15, 
              borderColor: 'silver', borderWidth: 1, borderRadius: 15
            }}
          >
            <Text>Reset</Text>
          </Button>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'center', }}>
          <Button icon="photo" onPress={this._pickImage} 
            style={{
              margin: 5, padding: 5, alignSelf: 'center', 
              backgroundColor: 'rgb(214, 245, 245)', borderRadius: 15
            }}
            >
            <Text style={{color: 'rgb(36,152,219)', fontSize: 14 }}>
              FROM PHOTOS
            </Text>
          </Button>
          <Button icon="camera" onPress={this._snapPhoto} 
            style={{
              margin: 5, padding: 5, alignSelf: 'center', 
              backgroundColor: 'rgb(214, 245, 245)', borderRadius: 15
            }}
            >
            <Text style={{color: 'rgb(36,152,219)', fontSize: 14 }}>
              WITH CAMERA
            </Text>
          </Button>
        </View>
      
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgb(36,152,219)' }}>  
        
          <View style={{flexDirection: 'row', }}>
            <Button style={styles.modalBtnCancel}
              onPress={()=>this.props.setModal(false,this.props.setting.target,"")}>
              <Text style={{color: 'rgb(36,152,219)', fontSize: 18}}>Cancel</Text>
            </Button>
            <Button style={styles.modalBtnConfirm} onPress={this.submitImage}>
              <Text style={{color: 'white', fontSize: 18}}>Upload Image</Text>
            </Button>
          </View>
        </View>

    </React.Fragment>
      )
    
    }
}
