import React, { useEffect, useState } from 'react';
import prettysize from 'prettysize';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { connect } from 'react-redux';
import ProgressBar from '../../components/ProgressBar';
import { deviceStorage } from '../../helpers';
import { getIcon } from '../../helpers/getIcon';
import { getHeaders } from '../../helpers/headers';
import analytics, { getLyticsUuid } from '../../helpers/lytics';
import PlanCard from './PlanCard';
import { LinearGradient } from 'expo-linear-gradient';
import { storageService } from '../../redux/services';

interface OutOfSpaceProps {
    filesState?: any
    layoutState?: any
    authenticationState?: any
    dispatch?: any,
    navigation?: any
}

function Storage(props: OutOfSpaceProps) {

    const [usagevalues, setUsageValues] = useState({ usage: 0, limit: 0 })
    const [usertoken, setUserToken] = useState(props.authenticationState.token)
    const [isloading, setIsLoading] = useState(true)
    const [products, setProducts] = useState(JSON)
    const [plans, setPlans] = useState(JSON)
    const [chosenproduct, setChosenProduct] = useState()

    const loadLimit = async () => {
        const xToken = await deviceStorage.getItem('xToken') || undefined

        return fetch(`${process.env.REACT_NATIVE_API_URL}/api/limit`, {
            method: 'get',
            headers: getHeaders(xToken)
        }).then(res => {
            if (res.status !== 200) { throw Error('Cannot load limit') }
            return res
        }).then(res => res.json()).then(res => res.maxSpaceBytes)
    }

    const loadUsage = async () => {
        const xToken = await deviceStorage.getItem('xToken') || undefined
        return fetch(`${process.env.REACT_NATIVE_API_URL}/api/usage`, {
            method: 'get',
            headers: getHeaders(xToken)
        }).then(res => {
            if (res.status !== 200) { throw Error('Cannot load usage') }
            return res
        }).then(res => res.json()).then(res => res.total)
    }

    const identifyPlanName = (bytes: number): string => {
        return bytes === 0 ? "Free 2GB" : prettysize(bytes)
    }

    const loadValues = async () => {
        const limit = await loadLimit()
        const usage = await loadUsage()

        const uuid = await getLyticsUuid()
        analytics.identify(uuid, {
            platform: 'mobile',
            storage: usage,
            plan: identifyPlanName(limit),
            userId: uuid
        }).catch(() => { })

        return { usage, limit }
    }

    const getProducts = async () => {
        const products = await storageService.loadAvailableProducts(usertoken)
        return products
    }

    const getPlans = async () => {
        const plans = await storageService.loadAvailablePlans(usertoken, chosenproduct.id)
        return plans
    }

    useEffect(() => {
        loadValues().then(values => {
            setUsageValues(values)
        })
        getProducts().then(res => {
            setProducts(res)
            setIsLoading(false)
        })
    }, [])

    useEffect(() => {
        if (chosenproduct != undefined) {
            getPlans().then(res => {
                setPlans(res)
                setIsLoading(false)
            })
        }
    }, [chosenproduct])


    return (
        <View style={styles.container}>
            <View style={styles.navigatorContainer}>
                <View style={styles.backButton}>
                    <TouchableOpacity
                        onPress={() => {
                            props.navigation.replace('FileExplorer')
                        }}
                    >
                        <Image style={styles.backIcon} source={getIcon('back')} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.backText}>Storage</Text>

                <View style={{ flex: 0.1 }}></View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.firstRow}>
                    <Text style={styles.progressTitle}>Storage Space</Text>

                    <View style={styles.usedSapceContainer}>
                        <Text style={styles.usedSpace}>Used </Text>
                        <Text style={[styles.usedSpace, styles.bold]}>{prettysize(usagevalues.usage)} </Text>
                        <Text style={styles.usedSpace}>of </Text>
                        <Text style={[styles.usedSpace, styles.bold]}>{prettysize(usagevalues.limit)}</Text>
                    </View>
                </View>

                <ProgressBar
                    styleBar={{}}
                    styleProgress={{ height: 6 }}
                    totalValue={usagevalues.limit}
                    usedValue={usagevalues.usage}
                />

                <View style={styles.secondRow}>
                    <View style={styles.legend}>
                        <LinearGradient
                            colors={['#00b1ff', '#096dff']}
                            start={[0, 0.18]}
                            end={[0.18, 1]}

                            style={styles.circle} />
                        <Text style={styles.secondRowText}>Used space</Text>
                    </View>

                    <View style={styles.legend}>
                        <View style={styles.circle}></View>
                        <Text style={styles.secondRowText}>Unused space</Text>
                    </View>
                </View>
            </View>

            {
                !isloading ?
                    <View style={styles.cardsContainer}>
                        {
                            !chosenproduct ?
                                <View>
                                    <View style={styles.titleContainer}>
                                        <Text style={styles.title}>
                                            Storage plans
                                        </Text>
                                    </View>
                                    {
                                        products && products.map((product: any) => <TouchableWithoutFeedback
                                            key={product.id}
                                            onPress={async () => {
                                                setIsLoading(true)
                                                setChosenProduct(product)
                                            }}>
                                            <PlanCard size={product.metadata.simple_name} price={product.metadata.price_eur} />
                                        </TouchableWithoutFeedback>)
                                    }
                                </View>
                                :
                                <View>
                                    {
                                        !isloading ?
                                            <View>
                                                <View style={styles.titleContainer}>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setChosenProduct(undefined)
                                                        }}
                                                    >
                                                        <Image style={styles.paymentBackIcon} source={getIcon('back')} />
                                                    </TouchableOpacity>

                                                    <Text style={styles.title}>
                                                        Payment length
                                                    </Text>

                                                    <Text style={styles.titlePlan}>{chosenproduct.name}</Text>
                                                </View>

                                                {
                                                    plans && plans.map(plan => <TouchableWithoutFeedback
                                                        key={plan.id}
                                                        onPress={() => props.navigation.replace('StorageWebView', { plan: plan }) }
                                                    >
                                                        <PlanCard chosen={true} price={plan.price.toString()} plan={plan} />
                                                    </TouchableWithoutFeedback>)
                                                }
                                            </View>
                                        :
                                            null
                                    }
                                </View>
                        }
                    </View>
                :   
                    null
            }
            <View>
                <Text style={styles.footer}>You are subscribed to the { }1GB plan</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        justifyContent: 'space-around',
        height: '100%',
        backgroundColor: 'white'
    },

    navigatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: '#f2f2f2'
    },

    backButton: {
        flex: 0.1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    backIcon: {
        height: 14,
        width: 9
    },

    backText: {
        flex: 0.8,
        textAlign: 'center',
        fontFamily: 'CerebriSans-Medium',
        fontSize: 16,
        color: 'black'
    },

    progressContainer: {
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderColor: '#f2f2f2',
        paddingBottom: 45
    },

    firstRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    progressTitle: {
        flex: 0.5,
        fontFamily: 'CerebriSans-Bold',
        fontSize: 18,
        color: 'black',
        paddingLeft: 20
    },

    usedSapceContainer: {
        flexDirection: 'row',
        flex: 0.5,
        justifyContent: 'flex-end',
        paddingRight: 20
    },

    usedSpace: {
        fontFamily: 'CerebriSans-Regular',
        color: 'black',
        fontSize: 13
    },

    bold: {
        fontFamily: 'CerebriSans-Bold'
    },

    secondRow: {
        flexDirection: 'row',
        marginLeft: 20
    },

    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 30
    },

    circle: {
        width: 16,
        height: 16,
        borderRadius: 100,
        marginRight: 6,
        backgroundColor: '#ededed'
    },

    secondRowText: {
        fontSize: 13,
        fontFamily: 'CerebriSans-Regular',
        color: '#7e848c'
    },

    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },

    title: {
        fontFamily: 'CerebriSans-Bold',
        fontSize: 18,
        height: 32,
        letterSpacing: 0,
        color: 'black',
        marginRight: 10
    },

    titlePlan: {
        fontFamily: 'CerebriSans-Medium',
        fontSize: 18,
        height: 32,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderColor: '#eaeced'
    },

    paymentBackIcon: {
        width: 8,
        height: 13,
        marginRight: 10
    },

    cardsContainer: {
        marginLeft: 20
    },

    footer: {
        fontFamily: 'CerebriSans-Regular',
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: -0.1,
        marginLeft: 20,
        marginBottom: 10,
        color: '#7e848c'
    },

    buttons_container: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },

    button: {
        height: 50,
        width: wp('42'),
        borderRadius: 4,
        borderWidth: 2,
        backgroundColor: '#fff',
        borderColor: 'rgba(151, 151, 151, 0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    blue: {
        color: '#4585f5'
    },

    button_text: {
        fontFamily: 'CerebriSans-Bold',
        fontSize: 16,
        letterSpacing: -0.2,
        color: '#5c6066'
    },

    white: {
        color: 'white'
    }
})

const mapStateToProps = (state: any) => {
    return { ...state }
};

export default connect(mapStateToProps)(Storage)