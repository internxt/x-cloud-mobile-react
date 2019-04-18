import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight
} from "react-native";
import { LinearGradient } from "expo";

import { userActions, fileActions } from "../../actions";

class SignIn extends Component {
  constructor() {
    super();

    this.state = {
      loggedIn: false,
      user: {}
    };

    this.onSignInClick = this.onSignInClick.bind(this);
  }

  onSignInClick() {
    this.props.dispatch(userActions.signin());
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.authenticationState.loggedIn !== this.state.loggedIn) {
      this.setState({
        loggedIn: nextProps.authenticationState.loggedIn,
        user: nextProps.authenticationState.user
      });

      // Redirect user if signed in & getFolderContent for user root_folder_id
      if (nextProps.authenticationState.loggedIn) {
        this.props.dispatch(
          fileActions.getFolderContent(
            nextProps.authenticationState.user.root_folder_id
          )
        );
        this.props.navigation.push("Home", {
          folderId: nextProps.authenticationState.user.root_folder_id
        });
      }
    }
  }

  render() {
    return (
      <LinearGradient
        style={styles.container}
        colors={["#2c5fb8", "#1686cc", "#3fafeb"]}
      >
        <Image
          style={styles.logo}
          source={require("../../../assets/images/logo.png")}
        />

        <View>
          <Text style={styles.title}>X Cloud</Text>
          <Text style={styles.subtitle}>Secure cloud storage.</Text>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableHighlight
            style={styles.button}
            underlayColor="#00aaff"
            onPress={() => this.onSignInClick()}
          >
            <Text style={styles.buttonLabel}>Sign in</Text>
          </TouchableHighlight>

         
        </View>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#2c5fb8",
    padding: 20
  },
  logo: {
    height: 52.4,
    width: 99,
    marginTop: 60
  },
  title: {
    fontFamily: "CerebriSans-Bold",
    fontSize: 54.6,
    letterSpacing: -1.7,
    color: "#fff"
  },
  subtitle: {
    fontFamily: "CerebriSans-Medium",
    fontSize: 29,
    color: "#fff",
    opacity: 0.76
  },
  buttonWrapper: {
    display: "flex",
    alignItems: "center",
    marginBottom: 30
  },
  button: {
    alignSelf: "stretch",
    height: 49.5,
    borderRadius: 24.5,
    backgroundColor: "#00aaff",
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10
  },
  buttonLabel: {
    fontFamily: "CircularStd-Medium",
    fontSize: 18,
    lineHeight: 49.5,
    letterSpacing: 0.2,
    textAlign: "center",
    color: "#fff"
  },
  redirectMessage: {
    fontFamily: "CircularStd-Book",
    fontSize: 14,
    letterSpacing: 0.3,
    color: "#fff",
    opacity: 0.6
  }
});

const mapStateToProps = state => {
  return {
    ...state
  };
};

export default (SignInComposed = compose(connect(mapStateToProps))(SignIn));
