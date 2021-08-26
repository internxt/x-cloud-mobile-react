import React from 'react'
import { StyleSheet, Text, View, Image } from 'react-native';
import { Reducers } from '../../redux/reducers/reducers';
import { normalize } from '../../helpers';

interface EmptyContent extends Reducers {
  type: 'emptyFolder' | 'emptyRecent' | 'emptyShare' | 'emptySearch',
  isRootFolder?: boolean
}

function EmptyContent(props: EmptyContent): JSX.Element {
  let title: string, subtitle: string, icon: string;

  switch (props.type){
  case 'emptyRecent':
  case 'emptyFolder':
    title = 'Start syncing your files from your device';
    subtitle = 'Use blue circular button to upload files, photos and many more securely';
    icon = props.isRootFolder? require('../../../assets/images/emptyContentImg/NoItems.png') : require('../../../assets/images/emptyContentImg/NoFolder.png');
    break;
  case 'emptyShare':
    icon = require('../../../assets/images/emptyContentImg/NoItems.png');
    title = 'Start share your files from your device'
    subtitle = 'Use share button to share files, photos and many more securely'
    break;
  case 'emptySearch':
    icon = require('../../../assets/images/emptyContentImg/NoResults.png');
    title = 'There are no results for this search'
  }
  return <View style={styles.container}>
    {icon ? <Image source={icon} style={{ width: normalize(200), height: normalize(200) }}></Image> : <></>}
    <Text style={styles.heading}>{title}</Text>
    <Text style={styles.subheading}>{subtitle}</Text>
  </View>

}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flexDirection: 'column',
    padding: 40
  },
  heading: {
    color: '#42526E',
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: 24,
    letterSpacing: -0.8,
    marginBottom: 10,
    textAlign: 'center'
  },
  subheading: {
    color: '#42526E',
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: 16,
    letterSpacing: -0.1,
    opacity: 0.84,
    textAlign: 'center'
  }
});

export default EmptyContent