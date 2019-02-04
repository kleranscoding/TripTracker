import React, { Component } from 'react';
import { AsyncStorage, StyleSheet, View, Text, ScrollView, StatusBar, 
    TouchableHighlight, Modal, Alert, TouchableOpacity, Dimensions, } from 'react-native';
import { Appbar, Button, TextInput, Card, Title, Paragraph  } from  'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SwipeListView } from 'react-native-swipe-list-view';

import { serverURL, tokenName, regexWhitespaceOnly, 
    Categories, CategoryPieChart, currencyInfo } from './config/envConst';

import EditSpendModal from './EditSpendModal';
import EditLocModal from './EditLocModal';
import NewSpendModal from './NewSpendModal';


/**
 * STYLESHEETS
 */
const styles = StyleSheet.create({
    imgSmall: {
        width: '50%', height: 75,
    },
    img: {
        width: '100%', height: 200,
    },
    imgViewSmall: {
        height: 100, 
    },
    imgView: {
        height: 250, 
    },
    spendInfo: {
        marginTop: 5,
        textAlign: 'center',
        fontSize: 20, fontFamily: 'Avenir',
    },
    rowFront: {
		alignItems: 'flex-start',
		backgroundColor: 'rgb(255,255,255)',
		borderBottomColor: 'silver',
		borderBottomWidth: 1,
		justifyContent: 'center',
        height: 75,
        padding: 10,
	},
	rowBack: {
		alignItems: 'center',
		backgroundColor: 'transparent',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
    },
})

const spendStyles = StyleSheet.create({
    addNewBtn: {
        marginTop: 10, marginLeft: 5, 
        borderRadius: 20, width: '36%', 
        backgroundColor: 'rgb(49,90,158)'
    },
    editBtn: {
        marginTop: 10, marginLeft: 5, 
        borderRadius: 20, width: '25%', 
        backgroundColor: 'rgb(49,90,158)'
    },
    deleteBtn: {
        marginTop: 10, marginLeft: 5, 
        borderRadius: 20, width: '25%', 
        backgroundColor: 'rgb(255,0,0)'
    },
})

const modalStyles = StyleSheet.create({
    newLocGreeting: {
        textAlign: 'center', 
        fontSize: 24, fontFamily: 'Avenir', color: 'rgb(255,255,255)',
    },
    closeModalText: {
        marginRight: 5, 
        textAlign: 'right', fontSize: 18, color: 'rgb(255,255,255)',
    },
    modalHeader: {
        marginBottom: 20, 
        paddingBottom: 20, paddingTop: 35, backgroundColor: 'rgb(36,152,219)' 
    },
    datepicker: {
        justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center',
        borderColor: 'silver', borderWidth: 1, margin: 10,
    },
    "datepicker_err": {
        borderColor: 'rgb(255,0,0)', borderWidth: 1, borderRadius: 5,
    },
    "create_btn": {
        marginTop: 25, marginLeft:'25%', 
        borderRadius: 25,
        backgroundColor: 'rgba(36,152,219,0.75)',
        width: '50%',
    },
    "create_btn_text": {
        padding: 10, 
        textAlign: 'center', fontSize: 20, color: 'rgb(255,255,255)'
    },
})

/**
 * FUNCTIONS AND CONSTANTs 
 */
const selectText = ' (selected)'
const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const catLabels = Categories.map(cat=>{ return cat.label })
const currencyList = currencyInfo

function validateWhtieSpaceOnly(text) { return regexWhitespaceOnly.test(text) }

function padZero(num) { return (num>=0 && num<=9)? `0${num}`:`${num}`; }

function dateToString(selectedDate) {
    let date= new Date(selectedDate)
    return `${date.getFullYear()}-${padZero(date.getMonth()+1)}-${padZero(date.getDate())}`
}

_getToken = async() => { return await AsyncStorage.getItem(tokenName) }

/**
 * MAPCONTAINER
 */
class MapContainer extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            region: {
                latitude: props.geocode.lat? parseFloat(props.geocode.lat): 0,
                longitude: props.geocode.lng? parseFloat(props.geocode.lng): 0,
                latitudeDelta: 0.0922,longitudeDelta: 0.0421,
            },
        }
    }

    onRegionChange = (region) => { this.setState({ region }) }
    
    render() {
        console.log(this.props.geocode)
        console.log(this.state.region)
        return(
            <MapView style={{marginLeft: 15, marginRight: 15, height: 150, }} 
                initialRegion={this.state.region} >
                <Marker
                    coordinate={this.state.region}
                    title={this.props.location} />
            </MapView>
        )
    }
}

/**
 * SPENDING CONTAINER
 */
class SpendingContainer extends Component {
    
    render() {
        let numSpends = this.props.spendings.length>0 ? 
            this.props.spendings.length > 1 ?
                <Text style={styles.spendInfo}>{`${this.props.spendings.length} spendings`}</Text> :
                <Text style={styles.spendInfo}>{`${this.props.spendings.length} spending`}</Text> :
            <Text style={styles.spendInfo}>You don't have any expense at this location yet</Text>
        
        return(
        <React.Fragment>
            {numSpends}
        </React.Fragment>
        )
    }
}

/**
 * LOCATIONDETAIL
 */
export default class LocationDetail extends Component {

    constructor(props) {
        super(props)
        /*
        this.focusListener = this.props.navigation.addListener('didFocus',payload => {
            //console.debug('didFocus');
            this._getLocDetails()
        })
        //*/
        this.state = { 
            typeFlatList: true, 
            selectOnDelete: {}, selectOnEdit: {},
            locDetails: props.navigation.getParam("locDetails"),
            resize: false, showChart: false,
            modalVisible: false, modalDelete: false, modalEdit: false,
            modalEditLoc: false,
            imgView: styles.imgView, imgSize: styles.imgSmall,
        }
    }

    static navigationOptions =({navigation})=> {
        return {
            title: navigation.getParam('locDetails').location,
            headerTintColor: '#fafafa',
            headerTitleStyle: {
                fontSize: 24, fontFamily: 'Avenir',
            },
            headerStyle: {
                backgroundColor: 'rgba(36,152,219,0.5)'
            }
        }
    }

    componentDidMount = () => { this._getLocDetails() }

    //componentWillUnmount = () => { this.focusListener.remove() }

    _getLocDetails = () => {
        _getToken().then(token=>{
            const locId = this.props.navigation.getParam('locId', null)
            if (!locId) {
                this.props.navigation.goBack()
            }
            console.log("loc details= ")
            fetch(serverURL+'/api/locations/'+locId,{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                if (res.status===200) {
                  res.json().then(data=>{
                    this.setState({ locDetails: data })
                    console.log("done getting loc details")
                  })
                }
            }).catch(err=>{ console.log(err) })
        }).catch(error=>{
            console.log("get token error:",error)
        })
    }

    setModalVisible = (visible) => { this.setState({modalVisible: visible}) }


    setModal = (visible,modalType,selectOnType) => {
        this.setState({
            [modalType]: visible, [selectOnType]: {},
        })
    }

    setModalDelete = (visible) => { 
        this.setState({
            modalDelete: visible, selectOnDelete: {},
        }) 
    }

    setModalEdit = (visible) => { 
        this.setState({
            modalEdit: visible, selectOnEdit: {},
        }) 
    }

    resizeImg = () => {
        if (this.state.resize) {
            this.setState({
                imgView: styles.imgViewSmall,
                imgSize: styles.imgSmall,
                resize: false,
            })
        } else {
            this.setState({
                imgView: styles.imgView,
                imgSize: styles.img,
                resize: true,
            })
        }
    }

    addSpends = (spend) => {
        let spendings = this.state.locDetails.spendings
        spendings.push(spend)
        this.setState(prevState=>({ 
            ...prevState.locDetails, spendings 
        }))
    }

    _onDeleteSpending = (index) => {
        this.setState({
            selectOnDelete: this.state.locDetails.spendings[index], 
            modalDelete: true,
        })
    }

    _onEditSpending = (index) => {
        this.setState({
            selectOnEdit: this.state.locDetails.spendings[index], 
            modalEdit: true,
        })
    }

    _removeSpending = (data) => {
        let filteredSpendings = this.state.locDetails.spendings.filter(spend=>{
            return (spend.id!==data.id)
        })
        this.setState(prevState=>({
            locDetails: { ...prevState.locDetails, spendings: filteredSpendings, },
            modalDelete: false,
        }))
    }

    _editSpending = (data) => {
        let filteredSpendings = []
        this.state.locDetails.spendings.map(spend=>{
            let origSpend= spend
            if (spend.id===data.id) {
                origSpend.name= data.name 
                origSpend.date= data.date
                origSpend.amount= data.amount
                origSpend.currency= data.currency
                origSpend.category= data.category
                origSpend.note= data.note
            }
            return filteredSpendings.push(origSpend)
        })
        this.setState(prevState=>({
            locDetails: { ...prevState.locDetails, spendings: filteredSpendings, },
            modalEdit: false,
        }))
    }

    _onEditLoc = () => {
        this.setState({
            selectOnEdit: this.state.locDetails, 
            modalEditLoc: true,
        })
    }

    _editLoc = (data) => {
        let locDetails = this.state.locDetails
        locDetails.location= data.location
        locDetails.geocode= data.geocode
        locDetails.formatAddress= data.formatAddress
        locDetails.startDate= data.startDate
        locDetails.endDate= data.endDate
        //console.log(locDetails)
        this.setState({
            locDetails,
            modalEditLoc: false, 
        })
        //console.log(this.props.navigation)
        this.props.navigation.setParams({ locDetails })
    }

    toggleView = () => { this.setState({typeFlatList: !this.state.typeFlatList}) }


    render() {
        let spendingCat= {}
        catLabels.map(cat=>{ spendingCat[cat]= [] })
        // convert spendings as FlatList
        let allSpendings = [] 
        if (this.state.locDetails.spendings) {
            this.state.locDetails.spendings.map((spend,index)=>{
                spendingCat[spend.category].push({
                    'key': spendingCat[spend.category].length+1,'data':spend
                })
                allSpendings.push({key: index.toString(), spend: spend})
            })
        }
        console.log(spendingCat)
        // convert object to SectionList
        let sectionSpendings= []
        for (let key in spendingCat) {
            sectionSpendings.push({'title': key, 'data': spendingCat[key]})
        }
        //console.log(sectionSpendings)
        return(
    <React.Fragment>
        <View >
            <Text>{this.state.locDetails.location}</Text>
            {allSpendings.length>0 && <Button onPress={()=>{this.setState({showChart: !this.state.showChart})}}>
                show Graph
            </Button>}
            {/* <MapContainer location={this.state.locDetails.location} 
                geocode={this.state.locDetails.geocode} /> */}
                {this.state.showChart &&  <PieChart2 spendingCat={spendingCat}/> }
            
        </View>
        
        <View style={{margin: 10, flexDirection: 'row', justifyContent: ''}}>
            <TouchableOpacity style={spendStyles.deleteBtn} onPress={this.toggleView}>
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                    Change to {!this.state.typeFlatList ? 'Normal View' : 'Category View'}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={spendStyles.editBtn} onPress={()=>this._onEditLoc()}>
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                    Edit
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={spendStyles.addNewBtn} onPress={()=>this.setModalVisible(true)}>
                <Text style={{textAlign: 'center', padding: 10, color: 'rgb(255,255,255)', fontSize: 14 }}>
                    + Expenses
                </Text>
            </TouchableOpacity>
        </View>

        <View style={{margin: 5}}>
        {this.state.locDetails.spendings!==undefined?
            <SpendingContainer spendings={this.state.locDetails.spendings} />:null}
        </View>

        

        {!this.state.typeFlatList && 
        <SwipeListView
            useSectionList sections={sectionSpendings}
            friction={5} tension={10}
            renderItem={ (data, rowMap) => {
                let spend = data.item.data
                return(
                <View style={styles.rowFront}>
                    
                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <View style={{flex: 1, flexDirection: 'column'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {spend.name}
                      </Text>
                      <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                        <Text>on {spend.date.split('-').join('/')}</Text>
                      </View>
                    </View>
                    <View style={{alignSelf: 'flex-end', flexDirection: 'column'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {spend.currency+' '+spend.amount}
                      </Text>
                    </View>
                  </View>
                    
                </View >)
            }}
            renderHiddenItem={ (data, rowMap) => {
                //console.log(data)
                let index = parseInt(data.index)
                console.log(index)
                return(
                <View style={styles.rowBack}>
                    <Button style={{borderRadius: 5 }} 
                        onPress={()=>this._onEditSpending(index)}>
                        <Text>Edit</Text>
                    </Button>
                    <Button style={{borderRadius: 5,  }} 
                        onPress={()=>this._onDeleteSpending(index)}>
                        <Text style={{color: 'rgb(255,0,0)'}}>Delete</Text>
                    </Button>
                </View>)
            }}
            renderSectionHeader={({section}) => <Text>{section.title}</Text>}
            leftOpenValue={80}
            rightOpenValue={-80}
        />}

        {this.state.typeFlatList &&
        <SwipeListView
            useFlatList data={allSpendings}
            friction={5} tension={10}
            renderItem={ (data, rowMap) => {
                let spend = data.item.spend
                return(
                <View style={styles.rowFront}>
                    
                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <View style={{flex: 1, flexDirection: 'column'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {spend.name}
                      </Text>
                      <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                        <Text>on {spend.date.split('-').join('/')}</Text>
                        <Text>{spend.category}</Text>
                      </View>
                    </View>
                    <View style={{alignSelf: 'flex-end', flexDirection: 'column'}}>
                      <Text style={{fontSize: 20, marginBottom: 5, fontFamily: 'Avenir'}}>
                        {spend.currency+' '+spend.amount}
                      </Text>
                    </View>
                  </View>
                    
                </View >)
            }}
            renderHiddenItem={ (data, rowMap) => {
                let index = parseInt(data.item.key)
                return(
                <View style={styles.rowBack}>
                    <Button style={{borderRadius: 5 }} 
                        onPress={()=>this._onEditSpending(index)}>
                        <Text>Edit</Text>
                    </Button>
                    <Button style={{borderRadius: 5,  }} 
                        onPress={()=>this._onDeleteSpending(index)}>
                        <Text style={{color: 'rgb(255,0,0)'}}>Delete</Text>
                    </Button>
                </View>
            )}}
            leftOpenValue={80}
            rightOpenValue={-80}
        />}

        <Modal animationType="slide" transparent={false} visible={this.state.modalVisible}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalVisible(false)
            }}>
            <NewSpendModal setModalVisible={this.setModalVisible} addSpends={this.addSpends} locId={this.state.locDetails.id} />
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalDelete}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModalDelete(false)
            }}>
            <DeleteSpendModal selectOnDelete={this.state.selectOnDelete} 
                setModalDelete={this.setModalDelete}
                removeSpending={this._removeSpending} />
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalEdit}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModal(false,"modalEdit","selectOnEdit")
            }}>
            <EditSpendModal selectOnEdit={this.state.selectOnEdit} 
                setModalEdit={this.setModal}
                editSpending={this._editSpending} />
        </Modal>

        <Modal animationType="slide" transparent={false} visible={this.state.modalEditLoc}
          onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              this.setModal(false,"modalEditLoc","")
            }}>
            <EditLocModal selectOnEdit={this.state.selectOnEdit} 
                setModalEdit={this.setModal}
                editLoc={this._editLoc} />
        </Modal>

    </React.Fragment>
        )
    }
}

/**
 * DELETESPEND MODAL
 */
class DeleteSpendModal extends Component {

    _cancelDelete = () => {
        this.props.setModalDelete(false);
    }

    _deleteSpending = () => {
        _getToken().then(token=>{
            fetch(serverURL+'/api/spendings/delete/'+this.props.selectOnDelete.id,{
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, },
            }).then(res=>{
                res.json().then(data=>{
                    this.props.removeSpending(data)
                })
            })
        }) 
    }

    render() {
        return (
            <React.Fragment>
                <View style={modalStyles.modalHeader}>
                    <TouchableHighlight onPress={()=>this.props.setModalDelete(false)}>
                    <Text style={modalStyles.closeModalText}>
                        Close &times;
                    </Text>
                    </TouchableHighlight>
                    <Text style={modalStyles.newLocGreeting}>
                        {'Warning: Deleting\n'+this.props.selectOnDelete.name}
                    </Text>
                </View>
                <View >
                    <Text >
                        {'Are you sure you want to delete\n'+this.props.selectOnDelete.name}?
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Button onPress={this._cancelDelete} >
                            <Text>Cancel</Text>
                        </Button>
                        <Button onPress={this._deleteSpending} 
                            style={{backgroundColor: 'red', borderRadius: 10, }}>
                            <Text style={{color: 'white'}}>Delete</Text>
                        </Button>
                    </View>
                </View>

            </React.Fragment>
        )
    }
}

import PureChart from 'react-native-pure-chart';

class PieChart2 extends Component {
    render() {
        let sampleData = [], sampleData2= []
        CategoryPieChart.map(catOpt=>{
            let catArr = this.props.spendingCat[catOpt.label]
            let val = 0.0
            catArr.map(spend=>{ 
                console.log(spend.data)
                val+= spend.data.amount 
            })

            sampleData.push({
                'value': val, 'label': catOpt.label, 'color': catOpt.color
            })
            sampleData2.push({
                'y': val, 'x': catOpt.label, 
            })
            
        })
        
        console.log(sampleData)
        
        return (
            <View>
                <PureChart data={sampleData} type='pie' />
            
            </View>
            
        )
        //return <Text>Bang!</Text>
    }
}