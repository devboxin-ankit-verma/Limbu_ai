/**
 * Seed script: creates default admin user and optionally a market/symbol.
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sharemarket.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Admin',
        role: 'admin'
      }
    });
    console.log('Created admin user:', adminEmail);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }

  // Ensure all 6 market types exist (NSE, MCX, OPT, BSE, CRYPTO, FOREX)
  const marketDefinitions = [
    { name: 'National Stock Exchange', code: 'NSE', isActive: true },
    { name: 'Multi Commodity Exchange', code: 'MCX', isActive: true },
    { name: 'Options', code: 'OPT', isActive: true },
    { name: 'Bombay Stock Exchange', code: 'BSE', isActive: true },
    { name: 'Crypto', code: 'CRYPTO', isActive: true },
    { name: 'Forex', code: 'FOREX', isActive: true },
  ];
  for (const m of marketDefinitions) {
    await prisma.market.upsert({
      where: { code: m.code },
      create: m,
      update: { name: m.name, isActive: m.isActive },
    });
  }
  console.log('Markets ensured:', marketDefinitions.map((m) => m.code).join(', '));

  // Seed dummy symbols + quotes for Market Watch (all markets)
  const markets = await prisma.market.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } });
  const marketWatchSymbols: Record<string, { code: string; name: string }[]> = {
    NSE: [
      { code: 'AXISBANK_30Mar2026', name: 'AXISBANK_30Mar2026' },
      { code: 'INFY_30Mar2026', name: 'INFY_30Mar2026' },
      { code: 'KOTAKBANK_30Mar2026', name: 'KOTAKBANK_30Mar2026' },
      { code: 'RELIANCE_30Mar2026', name: 'RELIANCE_30Mar2026' },
      { code: 'TCS_30Mar2026', name: 'TCS_30Mar2026' },
      { code: 'HDFCBANK_30Mar2026', name: 'HDFCBANK_30Mar2026' },
      { code: 'ICICIBANK_30Mar2026', name: 'ICICIBANK_30Mar2026' },
      { code: 'SBIN_30Mar2026', name: 'SBIN_30Mar2026' },
    ],
    MCX: [
      { code: 'GOLD_APR26', name: 'Gold April 2026' },
      { code: 'SILVER_APR26', name: 'Silver April 2026' },
      { code: 'CRUDEOIL_APR26', name: 'Crude Oil April 2026' },
      { code: 'NATURALGAS_APR26', name: 'Natural Gas April 2026' },
      { code: 'COPPER_APR26', name: 'Copper April 2026' },
    ],
    OPT: [
      { code: 'NIFTY_CE_22000_28Mar2026', name: 'NIFTY CE 22000 28Mar2026' },
      { code: 'NIFTY_PE_21800_28Mar2026', name: 'NIFTY PE 21800 28Mar2026' },
      { code: 'BANKNIFTY_CE_48000_27Mar2026', name: 'BANKNIFTY CE 48000 27Mar2026' },
      { code: 'BANKNIFTY_PE_47000_27Mar2026', name: 'BANKNIFTY PE 47000 27Mar2026' },
    ],
    BSE: [
      { code: 'RELIANCE_BSE', name: 'Reliance BSE' },
      { code: 'TCS_BSE', name: 'TCS BSE' },
      { code: 'HDFC_BSE', name: 'HDFC BSE' },
      { code: 'INFY_BSE', name: 'Infosys BSE' },
    ],
    CRYPTO: [
      { code: 'BTCINR', name: 'Bitcoin INR' },
      { code: 'ETHINR', name: 'Ethereum INR' },
      { code: 'BNBINR', name: 'BNB INR' },
      { code: 'SOLINR', name: 'Solana INR' },
    ],
    FOREX: [
      { code: 'USDINR', name: 'USD/INR' },
      { code: 'EURINR', name: 'EUR/INR' },
      { code: 'GBPINR', name: 'GBP/INR' },
      { code: 'JPYINR', name: 'JPY/INR' },
    ],
  };

  for (const market of markets) {
    const list = marketWatchSymbols[market.code as keyof typeof marketWatchSymbols];
    if (!list) continue;
    for (const item of list) {
      const existing = await prisma.symbol.findUnique({ where: { code: item.code } });
      if (existing) {
        await upsertQuote(prisma, existing.id, item.code);
        continue;
      }
      const sym = await prisma.symbol.create({
        data: {
          code: item.code,
          name: item.name,
          marketId: market.id,
          lotSize: 1,
          tickSize: 0.01,
        },
      });
      await upsertQuote(prisma, sym.id, item.code);
    }
  }
  console.log('Market Watch dummy symbols and quotes seeded.');
}

function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

async function upsertQuote(
  prisma: PrismaClient,
  symbolId: number,
  code: string
): Promise<void> {
  const base = code.includes('GOLD') ? 62000 : code.includes('SILVER') ? 78000 : code.includes('CRUDE') ? 6500 : code.includes('BTC') ? 9500000 : code.includes('ETH') ? 350000 : code.includes('USD') ? 83.5 : code.includes('NIFTY') ? 21800 : 1300;
  const spread = base * 0.02;
  const ask = randomBetween(base, base + spread);
  const bid = randomBetween(ask - spread * 0.5, ask);
  const ltp = randomBetween(bid, ask);
  const change = randomBetween(-spread, spread);
  const high = randomBetween(ltp, ask + spread * 0.5);
  const low = randomBetween(bid - spread * 0.5, ltp);

  await prisma.marketQuote.upsert({
    where: { symbolId },
    create: { symbolId, ask, bid, ltp, change, high, low },
    update: { ask, bid, ltp, change, high, low },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
