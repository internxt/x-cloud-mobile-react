import React from 'react'
import { View } from 'react-native'
import { tailwind } from '../../tailwind'
import { TouchableOpacity } from 'react-native-gesture-handler'
import HomeBlue from '../../../assets/icons/photos/home-blue.svg'
import Albums from '../../../assets/icons/photos/albums-blue.svg'
import TwoDotsBlue from '../../../assets/icons/photos/two-dots-blue.svg'
import { layoutActions } from '../../redux/actions'
import { getAlbumsRepository } from '../../database/DBUtils.ts/utils'

interface FooterProps {
  dispatch: any
  setHeaderTitle: React.Dispatch<React.SetStateAction<string>>
  setSelectedFilter: React.Dispatch<React.SetStateAction<string>>
  setIsAlbumSelected: React.Dispatch<React.SetStateAction<boolean>>
}

const ICON_SIZE = 25

const Footer = ({ dispatch, setHeaderTitle, setSelectedFilter, setIsAlbumSelected }: FooterProps): JSX.Element => {
  const handleOnPressAlbums = async () => {
    const albums = await getAlbumsRepository()
  }

  const FooterButton = ({ children, onPress }: { children: JSX.Element, onPress: () => void }): JSX.Element => (
    <TouchableOpacity onPress={() => onPress()} style={tailwind('w-20 h-11 items-center justify-center')}>
      {children}
    </TouchableOpacity>
  )

  return (
    <View style={tailwind('flex-row h-12 justify-around items-center my-1 pl-2')}>
      <FooterButton onPress={() => {
        setSelectedFilter('none')
        setHeaderTitle('INTERNXT PHOTOS')
        setIsAlbumSelected(false)
      }}>
        <HomeBlue width={ICON_SIZE} height={ICON_SIZE} />
      </FooterButton>

      <FooterButton onPress={() => {
        handleOnPressAlbums()
        setHeaderTitle('Albums')
      }}>
        <Albums width={ICON_SIZE} height={ICON_SIZE} />
      </FooterButton>

      <FooterButton onPress={() => dispatch(layoutActions.openSettings())}>
        <TwoDotsBlue width={ICON_SIZE} height={ICON_SIZE} />
      </FooterButton>
    </View>
  )
}

export default React.memo(Footer)