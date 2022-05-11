import { DriveServiceModel } from '../../types/drive';
import { constants } from '../app';
import DriveEventEmitter from './DriveEventEmitter';
import DriveLocalDatabaseService from './DriveLocalDatabaseService';
import DriveLogService from './DriveLogService';

class DriveService {
  public static instance: DriveService;
  public readonly model: DriveServiceModel;
  public readonly logService: DriveLogService;
  public readonly eventEmitter: DriveEventEmitter;
  public readonly localDatabaseService: DriveLocalDatabaseService;

  private constructor() {
    this.model = {
      debug: constants.REACT_NATIVE_DEBUG,
    };
    this.logService = new DriveLogService(this.model);
    this.eventEmitter = new DriveEventEmitter(this.logService);
    this.localDatabaseService = new DriveLocalDatabaseService(this.model, this.logService);
  }

  public static async initialize() {
    DriveService.instance = new DriveService();
    await DriveService.instance.localDatabaseService.initialize();
  }
}

export default DriveService;
