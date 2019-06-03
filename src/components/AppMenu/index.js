import React, { Component, Fragment } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Image, 
  Alert
} from "react-native";
import { compose } from "redux";
import { connect } from "react-redux";
import { DocumentPicker, ImagePicker, Permissions } from 'expo';

import MenuItem from "./MenuItem";
import { getIcon } from "../../helpers";
import { layoutActions, fileActions } from "../../actions";
const arrowBack = getIcon("back");

class AppMenu extends Component {
  constructor(props) {
    super(props);

    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleFolderCreate = this.handleFolderCreate.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.downloadFile = this.props.downloadFile;
  }

  componentWillReceiveProps(newProps) {
    if (newProps.filesState.startDownloadSelectedFile) {
      this.props.dispatch(fileActions.downloadSelectedFileStop());
      this.downloadFile();
    }
  }

  handleMenuClick() {
    Alert.alert('Action', 'Menu item clicked');
  }

  handleFolderCreate(parentFolderId) {
    this.props.navigation.push("CreateFolder", { parentFolderId });
  }

  handleUpload = () => {
    Alert.alert('Select type of file', '', [
      { text: 'Upload a document', onPress: async () => {
          const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: false });
          if (result.type !== 'cancel') this.uploadFile(result);
        }
      }, {
        text: 'Upload a picture', onPress: async () => {
          const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
          if (status === 'granted') {
            const result = await ImagePicker.launchImageLibraryAsync()
            if (!result.cancelled) this.uploadFile(result);
          }
        }
      }, {
        text: 'Take a photo', onPress: async () => {
          const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
          if (status === 'granted') {
            const result = await ImagePicker.launchCameraAsync();
            if (!result.cancelled) this.uploadFile(result);
          }
        }
      }
    ]);
  }

  uploadFile = async (result) => {
    try {
      const self = this;
      // Set name for pics/photos
      if (!result.name) result.name = result.uri.split('/').pop()

      this.props.dispatch(fileActions.uploadFileStart(result.name));

      const body = new FormData();
      body.append('xfile', {
        uri: result.uri,
        type: 'application/octet-stream',
        name: result.name
      });

      const token = this.props.authenticationState.token;
      const mnemonic = this.props.authenticationState.user.mnemonic;

      const headers = {
        "Authorization": `Bearer ${token}`,
        "internxt-mnemonic": mnemonic,
        "Content-type": "multipart/form-data"
      };

      fetch(`${process.env.REACT_APP_API_URL}/api/storage/folder/${this.props.filesState.folderContent.currentFolder}/upload`, {
        method: 'POST',
        headers,
        body
      }).then(async resultFetch => {
        var data = await resultFetch.json();
        return { res: resultFetch, data };
      }).then(resultFetch => {
        if (resultFetch.res.status == 402) {
          this.props.dispatch(layoutActions.openRunOutStorageModal());
        } else if (resultFetch.res.status == 201) {
          self.props.dispatch(fileActions.getFolderContent(self.props.filesState.folderContent.currentFolder));
        } else {
          Alert.alert('Error', resultFetch.data.error ? resultFetch.data.error : 'Cannot upload file');
        }
        this.props.dispatch(fileActions.uploadFileFinished());
      }).catch(errFetch => {
        console.log("Error fetching", errFetch);
        this.props.dispatch(fileActions.uploadFileFinished());
        Alert.alert('Error', 'Cannot upload file');
      });
    } catch(error) {
      console.log('Error:', error);
      this.props.dispatch(fileActions.uploadFileFinished());
    }
  }

  render() {
    const {
      filesState: { folderContent }
    } = this.props;

    let content = (
      <Fragment>
        <View style={{ flexDirection: 'row-reverse', flex: 1, alignItems: 'flex-end' }}>
          <MenuItem name="settings"
            onClickHandler={() => { this.props.dispatch(layoutActions.openSettings()); }}/>

          <MenuItem name="create"
            onClickHandler={() => this.handleFolderCreate(folderContent.id)}/>

          <MenuItem name="upload" 
            onClickHandler={this.handleUpload} />

          <MenuItem name="list" 
            onClickHandler={() => { this.props.dispatch(layoutActions.openSortModal()); }} />
        </View>
      </Fragment>
    );

    if (this.props.breadcrumbs) {
      const { name } = this.props.breadcrumbs;

      content = (
        <TouchableHighlight
          style={styles.button}
          underlayColor="#FFF"
          onPress={() => this.props.navigation.goBack()}
        >
          <View style={styles.breadcrumbs}>
            <Image style={styles.icon} source={arrowBack} />
            <Text style={styles.breadcrumbsLabel}>{name}</Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#f2f2f2' }}></View>
          </View>
        </TouchableHighlight>
      );
    }

    return <View style={styles.container}>{content}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    marginTop: 25,
    paddingTop: 3
  },
  button: {
    flex: 1
  },
  breadcrumbs: {
    position: "relative",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  breadcrumbsLabel: {
    fontFamily: "CircularStd-Bold",
    fontSize: 21,
    letterSpacing: -0.2,
    color: "#000000"
  },
  icon: {
    position: "absolute",
    left: 0,
    top: 17,
    width: 10,
    height: 17,
    resizeMode: "contain"
  }
});

const mapStateToProps = state => {
  return {
    ...state
  };
};

export default (AppMenuComposed = compose(connect(mapStateToProps))(AppMenu));
