import prettysize from 'prettysize';
import React from 'react'
import { Text, View, TouchableWithoutFeedback, Platform } from 'react-native'
import Modal from 'react-native-modalbox'
import { connect } from 'react-redux';
import * as Unicons from '@iconscout/react-native-unicons';

import { layoutActions } from '../../../store/actions';
import strings from '../../../../assets/lang/strings';
import { Reducers } from '../../../store/reducers/reducers';
import { IFile, IFolder } from '../../FileList';
import { getColor, tailwind } from '../../../helpers/designSystem';
import { FolderIcon, getFileTypeIcon } from '../../../helpers';
import globalStyle from '../../../styles/global.style';

interface FileDetailsProps extends Reducers {
  showItemModal: boolean
  folderContent: any
  item: IFile | IFolder
}

function FileDetailOption(props: {
  name: string | JSX.Element
  onPress: () => void
  icon: JSX.Element
  lastItem?: boolean
}): JSX.Element {
  return <TouchableWithoutFeedback
    onPress={props.onPress}>
    <View style={[tailwind('flex-row items-center px-4 h-12 border-neutral-20'), !props.lastItem && tailwind('border-b')]}>
      <View style={tailwind('flex-grow')}>
        <Text>{props.name}</Text>
      </View>
      <View>
        {props.icon}
      </View>
    </View>
  </TouchableWithoutFeedback>;
}

function FileDetailsModal(props: FileDetailsProps) {
  const { item } = props;

  if (!item) { return <></> }

  const isFolder = !item.fileId

  const FileIcon = getFileTypeIcon(item?.type)

  return <>
    {
      <Modal
        position={'bottom'}
        style={tailwind('bg-transparent')}
        coverScreen={Platform.OS === 'android'}
        isOpen={props.showItemModal}
        onClosed={async () => {
          props.dispatch(layoutActions.closeItemModal())
        }}
        backButtonClose={true}
        backdropPressToClose={true}
        animationDuration={250}
      >
        <View style={tailwind('h-full')}>
          <TouchableWithoutFeedback
            onPress={() => {
              props.dispatch(layoutActions.closeItemModal())
            }}
          >
            <View style={tailwind('flex-grow')} />
          </TouchableWithoutFeedback>

          <View>
            <View style={tailwind('flex-row bg-white px-5 py-4 rounded-t-xl items-center justify-between border-b border-neutral-20')}>
              <View style={tailwind('mr-3')}>
                {
                  isFolder
                    ?
                    <FolderIcon width={40} height={40} />
                    :
                    <FileIcon width={40} height={40} />
                }
              </View>

              <View style={tailwind('flex-shrink w-full')}>
                <Text numberOfLines={1} ellipsizeMode="middle" style={[tailwind('text-base text-neutral-500'), globalStyle.fontWeight.medium]}>{item?.name}{item?.type ? '.' + item.type : ''}</Text>
                <Text style={tailwind('text-xs text-neutral-100')}>
                  {!isFolder && <>{prettysize(item?.size)}<Text style={globalStyle.fontWeight.bold}>  ·  </Text></>}Updated {new Date(item?.updatedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}</Text>
              </View>

              <View>
                <TouchableWithoutFeedback
                  onPress={() => { props.dispatch(layoutActions.closeItemModal()) }}
                >
                  <View style={tailwind('bg-neutral-20 rounded-full h-8 w-8 justify-center items-center ml-5')}>
                    <Unicons.UilTimes color={getColor('neutral-60')} size={24} />
                  </View>
                </TouchableWithoutFeedback>
              </View>

            </View>

            <View style={tailwind('bg-neutral-20 p-4 flex-grow')}>
              <View style={tailwind('rounded-xl bg-white')}>

                {/*!isFolder && <FileDetailOption
                  name={<Text style={tailwind('text-lg text-neutral-500')}>{strings.components.file_and_folder_options.view}</Text>}
                  icon={<Unicons.UilEye size={20} color={getColor('neutral-500')} />}
                  onPress={() => {
                    // To implement
                  }}
                />*/}

                <FileDetailOption
                  name={<Text style={tailwind('text-lg text-neutral-500')}>{strings.generic.rename}</Text>}
                  icon={<Unicons.UilEditAlt size={20} color={getColor('neutral-500')} />}
                  onPress={() => {
                    props.dispatch(layoutActions.closeItemModal())
                    props.dispatch(layoutActions.openRenameModal())
                  }}
                />

                {/*
                <FileDetailOption
                  name={<Text style={tailwind('text-lg text-neutral-500')}>{strings.components.file_and_folder_options.move}</Text>}
                  icon={<Unicons.UilMinusPath size={20} color={getColor('neutral-500')} />}
                  onPress={() => {
                    props.dispatch(layoutActions.closeItemModal())
                    props.dispatch(layoutActions.openMoveFilesModal());
                  }}
                />
                */}

                {!isFolder && <FileDetailOption
                  name={<Text style={tailwind('text-lg text-neutral-500')}>{strings.components.file_and_folder_options.share}</Text>}
                  icon={<Unicons.UilLink size={20} color={getColor('neutral-500')} />}
                  onPress={() => {
                    props.dispatch(layoutActions.closeItemModal())
                    props.dispatch(layoutActions.openShareModal())
                  }}
                />}

              </View>

              <View style={tailwind('bg-white rounded-xl mt-4')}>
                <FileDetailOption
                  lastItem={true}
                  name={<Text style={tailwind('text-lg text-red-60')}>{strings.components.file_and_folder_options.delete}</Text>}
                  icon={<Unicons.UilTrashAlt size={20} color={getColor('red-60')} />}
                  onPress={() => {
                    props.dispatch(layoutActions.closeItemModal())
                    props.dispatch(layoutActions.openDeleteModal())
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    }
  </>;
}

const mapStateToProps = (state: any) => {
  return {
    folderContent: state.filesState.folderContent,
    showItemModal: state.layoutState.showItemModal,
    item: state.filesState.focusedItem
  }
}

export default connect(mapStateToProps)(FileDetailsModal)