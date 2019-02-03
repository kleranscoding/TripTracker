import React from 'react';
import { AsyncStorage, View, Image, Alert, CameraRoll } from 'react-native';
import { Button } from 'react-native-paper';
import { Camera, Permissions, ImagePicker, } from 'expo';

import { serverURL, tokenName, } from './config/envConst';


const cameraRollOption = {
    allowsEditing: true,
    aspect: [4, 3],
}

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }

export default class EditAvatarModal extends React.Component {
  state = {
    image: null,
    uploading: false,
    cameraPermission: null,
    cameraRollPermission: null,
    type: Camera.Constants.Type.back, 
  }

  _pickImage = async () => {
    const { status: cameraRollPermission } = await Permissions.askAsync(Permissions["CAMERA_ROLL"])     
    if (cameraRollPermission === 'granted') {
        let result = await ImagePicker.launchImageLibraryAsync(cameraRollOption);
        console.log(result);
        if (!result.cancelled) {
        this.setState({ image: result.uri });
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
        this.setState({ image: result.uri });
      }
      CameraRoll.saveToCameraRoll(this.state.image);
    }
  }

  submitImage = async() => {
      if (!this.state.image) {
        Alert.alert("Hang On!\n- Please select a photo")
        return
      }
      this._uploadImage(this.state.image)
  }

  _uploadImage = async (uri) => {
      _getToken().then(token=>{
          let uriParts = uri.split('.')
          let slashParts= uriParts[0].split('/')
          let filename = slashParts[slashParts.length-1]
          let fileType = uriParts[uriParts.length - 1]
          let formData = new FormData()
          formData.append('photo', {
              uri, name: `${filename}.${fileType}`, type: `image/${fileType}`,
          })
          console.log(uriParts)
          
          fetch(serverURL+'/api/users/avatar', {
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
                this.props.updateAvatar(data)
                console.log("done editing avatar...")
              })
            }
          }).catch(err=>{ console.log(err) })
      }).catch(error=>{
          console.log("get token error:",error)
      })
      
  }

  render() {
    return (
    <React.Fragment>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button onPress={()=>this.props.setModalAvatar(false,"modalAvatar","")}
                style={{ fontSize: 18, marginBottom: 10, color: 'white', alignSelf: 'flex-end' }}>
                {' '}&times; Close{' '}
          </Button>
          <Button onPress={this.submitImage}>Upload image</Button>
          <Button onPress={this._pickImage}>Pick an image from camera roll</Button>
          <Button onPress={this._snapPhoto}>Take a picture with camera</Button>
          {this.state.image &&
           <Image source={{ uri: this.state.image }} style={{ width: 200, height: 200 }} />}
        </View>
       
    </React.Fragment>
      )
    
    }
}
