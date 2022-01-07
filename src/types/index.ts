import { photos } from '@internxt/sdk';
import { PhotoStatus, User } from '@internxt/sdk/dist/photos';

export enum AppScreen {
  SignUp = 'sign-up',
  SignIn = 'sign-in',
  Intro = 'intro',
  TabExplorer = 'tab-explorer',
  Home = 'home',
  Menu = 'menu',
  Drive = 'drive',
  Recents = 'recents',
  Shared = 'shared',
  CreateFolder = 'create-folder',
  ForgotPassword = 'forgot-password',
  ChangePassword = 'change-password',
  RecoverPassword = 'recover-password',
  OutOfSpace = 'out-of-space',
  Storage = 'storage',
  Billing = 'billing',
  Photos = 'photos',
}

export enum PhotosScreen {
  Permissions = 'photos-permissions',
  Gallery = 'photos-gallery',
  Preview = 'photos-preview',
}

export enum DevicePlatform {
  Mobile = 'mobile',
}

export enum SortType {
  NameAsc = 'Name_Asc',
  DateAdded = 'Date_Added',
  SizeAsc = 'Size_Asc',
  FileTypeAsc = 'File_Type_Asc',
}

export interface DriveFolderData {
  id: number;
  bucket: string | null;
  color: string | null;
  createdAt: string;
  encrypt_version: string | null;
  icon: string | null;
  iconId: number | null;
  icon_id: number | null;
  isFolder: boolean;
  name: string;
  parentId: number;
  parent_id: number | null;
  updatedAt: string;
  userId: number;
  user_id: number;
}
export interface DriveFolderMetadataPayload {
  itemName: string;
}

export interface DriveFileData {
  bucket: string;
  createdAt: string;
  created_at: string;
  deleted: false;
  deletedAt: null;
  encrypt_version: string;
  fileId: string;
  folderId: number;
  folder_id: number;
  id: number;
  name: string;
  size: number;
  type: string;
  updatedAt: string;
}
export interface DriveFileMetadataPayload {
  itemName: string;
}

export enum GalleryViewMode {
  Years = 'years',
  Months = 'months',
  Days = 'days',
  All = 'all',
}
export enum GalleryItemType {
  Image = 'image',
}

export default class AppError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);

    this.status = status;
  }
}

export type Mnemonic = string;
export type NetworkUser = string;
export type NetworkPass = string;
export interface NetworkCredentials {
  encryptionKey: Mnemonic;
  user: NetworkUser;
  password: NetworkPass;
}

export const PHOTOS_DB_NAME = 'photos.db';

export interface PhotosServiceModel {
  accessToken: string;
  networkCredentials: NetworkCredentials;
  networkUrl: string;
  user?: User;
}

export interface SqlitePhotoRow {
  id: string;
  status: PhotoStatus;
  name: string;
  width: number;
  height: number;
  size: number;
  type: string;
  user_id: string;
  device_id: string;
  file_id: string;
  preview_id: string;
  last_status_change_at: Date;
  creation_date: Date;
  created_at: Date;
  updated_at: Date;
  preview: string;
}
