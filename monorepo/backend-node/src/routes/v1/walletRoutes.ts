/**
 * Wallet routes - under /api/v1
 */

import { Router } from 'express';
import * as walletController from '../../controllers/walletController';

const router = Router();

router.get('/wallets', walletController.listWallets);
router.post('/wallets/deposit', walletController.deposit);
router.post('/wallets/withdraw', walletController.withdraw);
router.get('/wallets/:walletId/transactions', walletController.getWalletTransactions);

export { router as walletRoutes };
