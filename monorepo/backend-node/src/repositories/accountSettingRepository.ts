/**
 * Account setting repository — singleton payment settings storage.
 */

import { AccountSettingAttributes, AccountSettingModel } from '../models/AccountSettingModel';

export class AccountSettingRepository {
  async getOrCreateSingleton(): Promise<AccountSettingModel> {
    const existing = await AccountSettingModel.findOne({ order: [['id', 'ASC']] });
    if (existing) return existing;
    return AccountSettingModel.create({});
  }

  async update(
    data: Partial<AccountSettingAttributes>
  ): Promise<AccountSettingModel> {
    const row = await this.getOrCreateSingleton();
    await row.update(data);
    return row;
  }
}
