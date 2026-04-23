/**
 * Safe column-level migration runner.
 *
 * Checks which columns are missing in each table and adds only those.
 * Safe to run on every startup — skips columns that already exist.
 * Never drops existing data.
 */

import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

type ColDef = Parameters<QueryInterface['addColumn']>[2];

async function columnExists(
  qi: QueryInterface,
  table: string,
  column: string
): Promise<boolean> {
  const desc = (await qi.describeTable(table)) as Record<string, unknown>;
  return Object.prototype.hasOwnProperty.call(desc, column);
}

async function addIfMissing(
  qi: QueryInterface,
  table: string,
  column: string,
  def: ColDef
): Promise<void> {
  try {
    const exists = await columnExists(qi, table, column);
    if (!exists) {
      await qi.addColumn(table, column, def);
      console.log(`[migrate] Added column ${table}.${column}`);
    }
  } catch (err) {
    // Table might not exist yet — sequelize.sync() will create it on next boot
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[migrate] Skipped ${table}.${column}: ${msg}`);
  }
}

export async function runMigrations(sequelize: Sequelize): Promise<void> {
  const qi = sequelize.getQueryInterface();

  // ── providers ─────────────────────────────────────────────────────────────
  await addIfMissing(qi, 'providers', 'registration_fee_paid_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await addIfMissing(qi, 'providers', 'provider_code', {
    type: DataTypes.STRING(40),
    allowNull: true,
    unique: true,
  });
  await addIfMissing(qi, 'providers', 'referred_users_count', {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  });
  await addIfMissing(qi, 'providers', 'registration_refund_paid_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await addIfMissing(qi, 'providers', 'service_active_since', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await addIfMissing(qi, 'providers', 'continuity_bonus_paid_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await addIfMissing(qi, 'providers', 'aadhaar_url', {
    type: DataTypes.STRING(500),
    allowNull: true,
  });
  await addIfMissing(qi, 'providers', 'passport_photo_url', {
    type: DataTypes.STRING(500),
    allowNull: true,
  });
  await addIfMissing(qi, 'providers', 'identity_hidden', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  // ── services ──────────────────────────────────────────────────────────────
  await addIfMissing(qi, 'services', 'image_url', {
    type: DataTypes.STRING(500),
    allowNull: true,
  });

  // ── account_settings ──────────────────────────────────────────────────────
  await addIfMissing(qi, 'account_settings', 'registration_fee', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 999,
  });

  // ── users ─────────────────────────────────────────────────────────────────
  await addIfMissing(qi, 'users', 'referred_by_provider_id', {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  });
  await addIfMissing(qi, 'users', 'deleted_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });

  console.log('[migrate] Column migrations complete.');

  // ── Data fix: set correct amount on manual registration payments that were saved as 0 ──
  await fixZeroRegistrationPayments(sequelize);
}

async function fixZeroRegistrationPayments(sequelize: Sequelize): Promise<void> {
  try {
    // providerRegistrationFee env is in paise; convert to rupees for the DB
    const feeRupees = parseInt(process.env.PROVIDER_REGISTRATION_FEE || '99900', 10) / 100;

    const [updated] = await sequelize.query(
      `UPDATE payments SET amount = :fee WHERE type = 'registration' AND amount = 0`,
      { replacements: { fee: feeRupees } }
    ) as [{ affectedRows?: number }, unknown];

    const rows = (updated as unknown as { affectedRows: number }).affectedRows ?? 0;
    if (rows > 0) {
      console.log(`[migrate] Fixed ${rows} registration payment(s): set amount to ₹${feeRupees}`);
    }
  } catch {
    // Non-fatal — table may not exist yet on first boot
  }
}
