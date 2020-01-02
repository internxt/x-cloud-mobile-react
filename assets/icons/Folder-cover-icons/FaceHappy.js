import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';


class SVG extends React.Component {
    constructor(props) {
        super(props);

        const defaultColor = props.color ? props.color : 'blue';

        this.state = {
            color: defaultColor.startsWith('#') ? defaultColor : props.defaultColors[defaultColor],
            width: props.width ? props.width : 38,
            height: props.height ? props.height : 38
        }
    }

    render() {
        return <View style={[StyleSheet.absoluteFill]}>
            <Svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 38 38"
                width={this.state.width}
                height={this.state.height}>
                <Path
                    fill={this.state.color}
                    d="M1207.42489,17.0613333 C1207.42489,14.8657778 1208.60711,13.0868148 1210.068,13.0868148 C1211.52889,13.0868148 1212.71111,14.8657778 1212.71111,17.0613333 C1212.71111,19.2597037 1211.52889,21.0386667 1210.068,21.0386667 C1208.60711,21.0386667 1207.42489,19.2597037 1207.42489,17.0613333 Z M1195.70681,13.0868148 C1197.1677,13.0868148 1198.34993,14.8657778 1198.34993,17.0613333 C1198.34993,19.2597037 1197.1677,21.0386667 1195.70681,21.0386667 C1194.24593,21.0386667 1193.0637,19.2597037 1193.0637,17.0613333 C1193.0637,14.8657778 1194.24593,13.0868148 1195.70681,13.0868148 Z M1184,20 C1184,30.4936296 1192.50637,39 1203,39 C1213.49363,39 1222,30.4936296 1222,20 C1222,9.50637037 1213.49363,1 1203,1 C1192.50637,1 1184,9.50637037 1184,20 Z M1203,31.6923077 C1208.84615,31.6923077 1212.48928,27.9641135 1212.48928,27.9641135 C1212.89879,27.6015821 1212.83046,27.4994835 1212.3199,27.7327328 C1212.3199,27.7327328 1207.38462,30.2307692 1203,30.2307692 C1198.61538,30.2307692 1193.66616,27.726498 1193.66616,27.726498 C1193.1708,27.495198 1193.09462,27.6090647 1193.52229,27.973621 C1193.52229,27.973621 1197.15385,31.6923077 1203,31.6923077 Z"
                    transform="translate(-1184 -1)"
                    fill-rule="evenodd"
                />
            </Svg>
        </View>;
    }
}

export default SVG;
