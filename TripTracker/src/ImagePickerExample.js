import React from 'react';
import { Text, View, Image, TouchableOpacity, CameraRoll } from 'react-native';
import { Button } from 'react-native-paper';
import { Camera, Permissions, ImagePicker, } from 'expo';

export default class CameraExample extends React.Component {
  state = {
    cameraPermission: null,
    cameraRollPermission: null,
    type: Camera.Constants.Type.back, image: null,
  };

  _pickImage = async () => {
    const { status: cameraRollPermission } = await Permissions.askAsync(Permissions["CAMERA_ROLL"])     
    if (cameraRollPermission === 'granted') {
        let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        });

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
        allowEditing: !false,
        exif: true
      });
    
      if (!result.cancelled) {
        this.setState({ image: result.uri });
      }
      CameraRoll.saveToCameraRoll(this.state.image);
    }
  }

  render() {
    return (
    <React.Fragment>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button onPress={()=>this.props.setModalCamera(false,"modalCamera","")}
                  style={{ fontSize: 18, marginBottom: 10, color: 'white', alignSelf: 'flex-end' }}>
                  {' '}&times; Close{' '}
            </Button>
          <Button onPress={this._pickImage}>Pick an image from camera roll</Button>
          <Button onPress={this._snapPhoto}>Take a picture with camera</Button>
          {this.state.image &&
           <Image source={{ uri: this.state.image }} style={{ width: 200, height: 200 }} />}
        </View>
       
    </React.Fragment>
      )
    
    }
}
