import { Config } from './config.dto';

/**
 * Init the ConfigService
 * Check if there is a signed keypair
 * if not try to request one with the invite code
 * store the new keypair
 */
export abstract class ConfigService {
  public config!: Config;

  abstract init(values: Config): Promise<void>;

  abstract loadConfig(): Promise<void>;

  abstract saveConfig(): Promise<void>;

  /**
   * @deprecated The method should not be used, use saveConfig() instead
   */
  async saveKeys(): Promise<void> {
    return this.saveConfig();
  }
}
