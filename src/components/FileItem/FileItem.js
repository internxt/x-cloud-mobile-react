import React, { Component, Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableHighlight
} from "react-native";
import { withNavigation } from "react-navigation";

import { colors } from "../../constants";
import { Svg } from "expo";
const { Defs, LinearGradient, Path, Stop } = Svg;

class FileItem extends Component {
  render() {
    const { item, navigation } = this.props;
    const { color } = item.style;
    const extendStyles = StyleSheet.create({
      text: {
        color: colors[color].code
      }
    });

    const icon = (
      <Svg style={styles.icon} viewBox="0 0 99 78">
        <Defs>
          <LinearGradient
            id="folder-gradient"
            x1="50%"
            x2="50%"
            y1="0%"
            y2="100%"
          >
            <Stop stopColor={colors[color].lighter} offset="0%" />
            <Stop stopColor={colors[color].darker} offset="100%" />
          </LinearGradient>
        </Defs>
        <Path
          fill="url(#folder-gradient)"
          fill-rule="evenodd"
          d="M838.669178,104.684932 C841.426247,104.684932 843.663493,106.91749 843.663493,109.671491 L843.663493,140.305284 L843.663493,171.355863 C843.663493,172.9616 842.359436,174.264721 840.750801,174.264721 L747.912692,174.264721 C746.306358,174.264721 745,172.962381 745,171.355863 L745,140.305284 L745,109.671491 C745,109.560796 745.003606,109.450949 745.010708,109.342062 C745.003606,109.233251 745,109.123489 745,109.012885 L745,101.985105 C745,99.2309234 747.236317,97 749.994954,97 L772.892877,97 C774.896915,97 776.623884,98.1764588 777.419754,99.8747346 C777.421541,99.8610064 778.263176,101.332648 778.633429,101.826292 C779.056431,102.390265 779.020516,102.478345 779.760343,103.182973 C780.575974,103.9598 780.776343,104.042126 781.151796,104.227487 C781.303355,104.302311 781.609433,104.474789 782.094499,104.556078 C782.570567,104.635858 783.142944,104.670599 783.473539,104.684932 L838.669178,104.684932 Z"
          transform="translate(-745 -97)"
        />
      </Svg>
    );

    return (
      <TouchableHighlight
        style={styles.container}
        onPress={() => navigation.push("Home", { parent: item.id })}
      >
        <Fragment>
          {icon}
          <Text style={[styles.fileName, extendStyles.text]}>{item.name}</Text>
        </Fragment>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    height: 80,
    backgroundColor: "#fff",
    borderBottomColor: "#e6e6e6",
    borderBottomWidth: 2
  },
  fileName: {
    fontFamily: "CircularStd-Bold",
    fontSize: 16,
    letterSpacing: -0.1,
    color: "#000000"
  },
  icon: {
    width: 44,
    height: 35,
    marginLeft: 25,
    marginRight: 25
  }
});

const mapStateToProps = state => {
  return {
    ...state
  };
};

export default (FileItemComposed = compose(
  connect(mapStateToProps),
  withNavigation
)(FileItem));