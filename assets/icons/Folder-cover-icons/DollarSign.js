import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';


class SVG extends React.Component {
    constructor(props) {
        super(props);

        const defaultColor = props.color ? props.color : 'blue';

        this.state = {
            color: defaultColor.startsWith('#') ? defaultColor : props.defaultColors[defaultColor],
            width: props.width ? props.width : 23,
            height: props.height ? props.height : 41
        }
    }

    render() {
        return <View style={[StyleSheet.absoluteFill]}>
            <Svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 23 41"
                width={this.state.width}
                height={this.state.height}>
                <Path
                    fill={this.state.color}
                    d="M1016.8784,251.522396 C1015.71459,252.77578 1013.31353,254.071364 1011.40709,254.640414 C1011.37956,255.259375 1011.38025,259.002175 1011.38025,259.002175 C1011.37987,259.553259 1010.93658,260 1010.37777,260 L1007.1856,260 C1006.63233,260 1006.18381,259.545449 1006.18381,258.994635 L1006.18381,255.259375 C1000.1221,254.960417 996.988756,251.172648 996.988756,251.172648 C996.80623,250.97662 996.80896,250.656217 996.994542,250.457344 L999.829118,247.41974 C1000.01484,247.220716 1000.36294,247.182328 1000.59618,247.323445 C1000.59618,247.323445 1004.6395,249.920833 1007.35285,249.920833 C1008.76726,249.920833 1009.87856,249.607642 1010.6868,248.98125 C1011.49503,248.354858 1011.89914,247.5007 1011.89914,246.41875 C1011.89914,245.706941 1011.75481,245.116148 1011.46616,244.646354 C1011.1775,244.17656 1010.65793,243.749481 1009.90743,243.365104 C1009.15693,242.980727 1008.07449,242.575002 1006.66009,242.147917 C1003.48489,241.151384 1001.2262,239.969798 999.88396,238.603125 C998.541717,237.236451 997.870606,235.485427 997.870606,233.35 C997.870606,231.214573 998.621096,229.427959 1000.1221,227.990104 C1001.6231,226.55225 1003.58593,224.979167 1006.18381,224.979167 L1006.25591,220.000778 C1006.26392,219.448064 1006.71339,219 1007.2722,219 L1010.46437,219 C1011.01764,219 1011.45965,219.449409 1011.45166,220.000778 L1011.37956,224.979167 C1013.97744,224.979167 1017.80419,228.456134 1017.80419,228.456134 C1018.01027,228.635115 1018.02489,228.957361 1017.85099,229.159441 L1015.34294,232.073892 C1015.1627,232.283337 1014.81842,232.33777 1014.58578,232.206183 C1014.58578,232.206183 1011.01876,230.061458 1008.73839,230.061458 C1007.52604,230.061458 1006.57349,230.30347 1005.88072,230.7875 C1005.18795,231.27153 1004.84157,231.954857 1004.84157,232.8375 C1004.84157,233.463892 1004.99312,233.976387 1005.2962,234.375 C1005.59929,234.773613 1006.14051,235.150866 1006.91987,235.506771 C1007.69924,235.862675 1008.86827,236.282636 1010.42701,236.766667 C1013.34242,237.677782 1015.50008,238.81666 1016.90005,240.183333 C1018.30002,241.550007 1019,243.457627 1019,245.90625 C1019,248.127094 1018.29281,249.999124 1016.8784,251.522396 Z"
                    transform="translate(-996 -219)"
                    fill-rule="evenodd"
                />
            </Svg>
        </View>;
    }
}

export default SVG;
