import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';


class SVG extends React.Component {
    constructor(props) {
        super(props);

        const defaultColor = props.color ? props.color : 'blue';

        this.state = {
            color: defaultColor.startsWith('#') ? defaultColor : props.defaultColors[defaultColor],
            width: props.width ? props.width : 52,
            height: props.height ? props.height : 32
        }
    }

    render() {
        return <View style={[StyleSheet.absoluteFill]}>
            <Svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 32"
                width={this.state.width}
                height={this.state.height}>
                <Path
                    fill={this.state.color}
                    d="M614.086697,3 C606.86194,3 600.790078,8.53461423 600.263426,15.600391 L600.197989,16.478682 L599.323774,16.6764877 C595.011822,17.6514274 592,21.3700051 592,25.7183488 C592,30.8365004 596.241348,35 601.45478,35 L640.017529,35 C642.297778,34.3316309 644,32.0205167 644,29.5592167 C644,27.4366095 642.728284,25.4915203 640.76087,24.6044943 L640.047665,24.2827079 L640.052831,23.5120547 C640.053118,23.4875403 640.053692,23.4633077 640.05484,23.4390751 C640.05484,17.8613493 635.432637,13.3233714 629.751388,13.3233714 C629.383162,13.3233714 629.001159,13.3442227 628.615425,13.3856436 L627.620382,13.4929997 L627.322471,12.5544089 C625.508605,6.83945899 620.189268,3 614.086697,3 L614.086697,3 Z"
                    transform="translate(-592 -3)"
                    fill-rule="evenodd"
                />
            </Svg>
        </View>;
    }
}

export default SVG;