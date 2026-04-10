/**
 * Payment repository — database access only.
 */

import { PaymentModel, PaymentCreationAttributes, PaymentAttributes } from '../models/PaymentModel';
import { WalletTxnModel, WalletTxnCreationAttributes } from '../models/WalletTxnModel';

export class PaymentRepository {
  async findById(id: number): Promise<PaymentModel | null> {
    return PaymentModel.findByPk(id);
  }

  async findByRazorpayOrderId(orderId: string): Promise<PaymentModel | null> {
    return PaymentModel.findOne({ where: { razorpayOrderId: orderId } });
  }

  async findAll(offset: number = 0, limit: number = 50): Promise<PaymentModel[]> {
    return PaymentModel.findAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async create(data: PaymentCreationAttributes): Promise<PaymentModel> {
    return PaymentModel.create(data);
  }

  async update(id: number, data: Partial<PaymentAttributes>): Promise<PaymentModel | null> {
    const payment = await PaymentModel.findByPk(id);
    if (!payment) return null;
    return payment.update(data);
  }

  async createWalletTxn(data: WalletTxnCreationAttributes): Promise<WalletTxnModel> {
    return WalletTxnModel.create(data);
  }

  async findWalletTxnsByProvider(
    providerId: number,
    offset: number = 0,
    limit: number = 20
  ): Promise<WalletTxnModel[]> {
    return WalletTxnModel.findAll({
      where: { providerId },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async totalRevenue(): Promise<number> {
    const result = await PaymentModel.sum('amount', { where: { status: 'paid' } });
    return result || 0;
  }

  async monthlyRevenueLastMonths(
    months: number
  ): Promise<Array<{ month: string; amount: number }>> {
    const [rows] = await PaymentModel.sequelize!.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS amount
       FROM payments
       WHERE status = 'paid'
         AND created_at >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      { replacements: { months } }
    );

    return (rows as Array<{ month: string; amount: number }>).map((row) => ({
      month: row.month,
      amount: Number(row.amount || 0),
    }));
  }
}
