import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, RefreshControl, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { fileActions } from '../../redux/actions';
import EmptyFolder from '../EmptyFolder';
import FileItem from '../FileItem';

function FileList(props: any) {
    const [refreshing, setRefreshing] = useState(false)

    const { filesState } = props;
    const { loading, folderContent, selectedFile } = filesState;
    let folderList: object[] = folderContent && folderContent.children || [];
    let fileList: object[] = folderContent && folderContent.files || [];

    const searchString = props.filesState.searchString

    if (searchString) {
        fileList = fileList.filter((file: any) => file.name.toLowerCase().includes(searchString.toLowerCase()))
        folderList = folderList.filter((folder: any) => folder.name.toLowerCase().includes(searchString.toLowerCase()))
    }

    const sortFunction = props.filesState.sortFunction

    if (sortFunction) {
        folderList.sort(sortFunction);
        fileList.sort(sortFunction);
    }

    useEffect(() => {
        if (!props.filesState.folderContent) {
            const rootFolderId = props.authenticationState.user.root_folder_id
            props.dispatch(fileActions.getFolderContent(rootFolderId))
        }
    }, [])

    const isEmptyFolder = folderList.length === 0 && fileList.length === 0

    return <ScrollView
        style={styles.fileListScrollView}
        contentContainerStyle={isEmptyFolder ? styles.fileListContentsScrollView : {}}>
        {isEmptyFolder
            ? <EmptyFolder />
            : <Text style={{ display: 'none' }}></Text>}
        {folderList.map((folder: any) => <FileItem
            key={folder.id}
            isFolder={true}
            item={folder} />)}
        {fileList.map((file: any) => <FileItem
            key={file.id}
            isFolder={false}
            item={file} />)}
    </ScrollView>
}

const styles = StyleSheet.create({
    fileListScrollView: {
    },
    fileListContentsScrollView: {
        flexGrow: 1,
        justifyContent: 'center'
    }
})

const mapStateToProps = (state: any) => {
    return { ...state };
};

export default connect(mapStateToProps)(FileList)