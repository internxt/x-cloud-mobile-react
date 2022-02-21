import React, { ReactNode } from 'react';
import { View, Text, Image, StyleSheet, TouchableHighlight, ImageURISource } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

import { normalize } from '../../helpers';
import strings from '../../../assets/lang/strings';

interface IntroProps {
  onFinish: () => void;
}

interface Slide {
  key: string;
  text: string;
  image: ImageURISource;
}

const slides: Slide[] = [
  {
    key: 'intro001',
    text: strings.screens.SignUpScreen.first,
    image: require('../../../assets/images/intro/intro01.png'),
  },
  {
    key: 'intro002',
    text: strings.screens.SignUpScreen.second,
    image: require('../../../assets/images/intro/intro02.png'),
  },
  {
    key: 'intro003',
    text: strings.screens.SignUpScreen.third,
    image: require('../../../assets/images/intro/intro03.png'),
  },
];

function renderItem({ item }: { item: Slide }) {
  return (
    <View style={styles.body}>
      <Text style={styles.explanationText}>{item.text}</Text>

      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
      </View>
    </View>
  );
}

function renderNextButton(): ReactNode {
  return (
    <TouchableHighlight style={styles.buttonSkip} activeOpacity={1} underlayColor="#007aff">
      <Text style={styles.buttonSkipText}>{strings.components.buttons.next}</Text>
    </TouchableHighlight>
  );
}

function renderDoneButton() {
  return (
    <TouchableHighlight style={styles.buttonSkip} activeOpacity={1} underlayColor="#007aff">
      <Text style={styles.buttonSkipText}>{strings.components.buttons.get_started}</Text>
    </TouchableHighlight>
  );
}

function IntroScreen(props: IntroProps): JSX.Element {
  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      bottomButton
      onDone={() => {
        props.onFinish();
      }}
      activeDotStyle={styles.activeDot}
      dotStyle={styles.inactiveDot}
    />
  );
}

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: '#a4a4a4',
  },
  body: {
    backgroundColor: '#fff',
    flex: 1,
    padding: normalize(31),
  },
  buttonSkip: {
    alignItems: 'center',
    backgroundColor: '#007aff',
    borderRadius: 23,
    height: normalize(46),
    justifyContent: 'center',
    marginBottom: normalize(40),
    marginLeft: normalize(27),
    marginRight: normalize(27),
  },
  buttonSkipText: {
    color: 'white',
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: normalize(18),
    textAlign: 'center',
  },
  explanationText: {
    color: '#7e7e7e',
    fontFamily: 'NeueEinstellung-Medium',
    fontSize: normalize(22),
    lineHeight: normalize(28),
    marginTop: normalize(30),
    textAlign: 'center',
  },
  image: {
    aspectRatio: 1,
    height: undefined,
    justifyContent: 'center',
    width: '90%',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 100,
  },
  inactiveDot: {
    backgroundColor: '#e8e8e8',
  },
});

export default IntroScreen;
