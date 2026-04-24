/**
 * Safe column-level migration runner.
 *
 * Uses INFORMATION_SCHEMA for reliable column detection and raw ALTER TABLE
 * for addition — works on MySQL 5.7 and 8.x without relying on QueryInterface
 * describeTable quirks.
 *
 * Safe to run on every startup — skips columns that already exist.
 * Never drops existing data.
 */

import { Sequelize } from 'sequelize';

/** Check whether a column exists using INFORMATION_SCHEMA (reliable on all MySQL versions). */
async function columnExists(seq: Sequelize, table: string, column: string): Promise<boolean> {
  try {
    const [rows] = await seq.query(
      `SELECT COUNT(*) AS cnt
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = :table
         AND COLUMN_NAME  = :column`,
      { replacements: { table, column } }
    ) as [Array<{ cnt: number | string }>, unknown];
    return Number(rows[0]?.cnt ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Adds a column with raw ALTER TABLE if it doesn't exist yet.
 * @param definition  Raw SQL type string, e.g. "VARCHAR(40) NULL"
 */
async function addIfMissing(
  seq: Sequelize,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  try {
    const exists = await columnExists(seq, table, column);
    if (exists) return;
    await seq.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`[migrate] ✓ Added ${table}.${column}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[migrate] ✗ Failed to add ${table}.${column}: ${msg}`);
    // Non-fatal — server continues; fix DB permissions if this keeps happening.
  }
}

export async function runMigrations(seq: Sequelize): Promise<void> {
  console.log('[migrate] Running column migrations...');

  // ── providers ─────────────────────────────────────────────────────────────
  await addIfMissing(seq, 'providers', 'registration_fee_paid_at', 'DATETIME NULL');
  await addIfMissing(seq, 'providers', 'provider_code',            'VARCHAR(40) NULL');
  await addIfMissing(seq, 'providers', 'referred_users_count',     'INT UNSIGNED NOT NULL DEFAULT 0');
  await addIfMissing(seq, 'providers', 'registration_refund_paid_at', 'DATETIME NULL');
  await addIfMissing(seq, 'providers', 'service_active_since',     'DATETIME NULL');
  await addIfMissing(seq, 'providers', 'continuity_bonus_paid_at', 'DATETIME NULL');
  await addIfMissing(seq, 'providers', 'aadhaar_url',              'VARCHAR(500) NULL');
  await addIfMissing(seq, 'providers', 'passport_photo_url',       'VARCHAR(500) NULL');
  await addIfMissing(seq, 'providers', 'identity_hidden',          'TINYINT(1) NOT NULL DEFAULT 0');

  // ── services ──────────────────────────────────────────────────────────────
  await addIfMissing(seq, 'services', 'image_url', 'VARCHAR(500) NULL');

  // ── account_settings ──────────────────────────────────────────────────────
  await addIfMissing(seq, 'account_settings', 'registration_fee', 'DECIMAL(10,2) NOT NULL DEFAULT 999');

  // ── users (all columns that may be missing on older deployments) ──────────
  await addIfMissing(seq, 'users', 'age',                    'INT UNSIGNED NULL');
  await addIfMissing(seq, 'users', 'gender',                 "ENUM('male','female','other') NULL");
  await addIfMissing(seq, 'users', 'referred_by_provider_id', 'BIGINT UNSIGNED NULL');
  await addIfMissing(seq, 'users', 'deleted_at',              'DATETIME NULL');

  // ── ensure role ENUM includes 'admin' (safe to run even if already correct) ─
  try {
    await seq.query(
      `ALTER TABLE \`users\` MODIFY COLUMN \`role\` ENUM('provider','customer','admin') NOT NULL`
    );
    console.log('[migrate] ✓ role ENUM confirmed (provider/customer/admin)');
  } catch (err) {
    console.warn('[migrate] role ENUM modify skipped:', (err as Error).message);
  }

  console.log('[migrate] Column migrations complete.');

  // ── Data fix: set correct amount on manual registration payments saved as ₹0 ──
  await fixZeroRegistrationPayments(seq);
}

async function fixZeroRegistrationPayments(seq: Sequelize): Promise<void> {
  try {
    const feeRupees = parseInt(process.env.PROVIDER_REGISTRATION_FEE || '99900', 10) / 100;
    const [result] = await seq.query(
      `UPDATE payments SET amount = :fee WHERE type = 'registration' AND amount = 0`,
      { replacements: { fee: feeRupees } }
    ) as [{ affectedRows?: number }, unknown];
    const rows = (result as unknown as { affectedRows: number }).affectedRows ?? 0;
    if (rows > 0) {
      console.log(`[migrate] Fixed ${rows} registration payment(s): set amount to ₹${feeRupees}`);
    }
  } catch {
    // Non-fatal — payments table may not exist yet on first boot
  }
}
