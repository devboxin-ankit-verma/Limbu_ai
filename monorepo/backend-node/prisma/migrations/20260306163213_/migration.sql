/*
  Warnings:

  - You are about to drop the `market_quote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `market_quote` DROP FOREIGN KEY `market_quote_symbol_id_fkey`;

-- DropTable
DROP TABLE `market_quote`;

-- CreateTable
CREATE TABLE `MarketQuote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol_id` INTEGER NOT NULL,
    `ask` DECIMAL(18, 4) NOT NULL,
    `bid` DECIMAL(18, 4) NOT NULL,
    `ltp` DECIMAL(18, 4) NOT NULL,
    `change` DECIMAL(18, 4) NOT NULL,
    `high` DECIMAL(18, 4) NOT NULL,
    `low` DECIMAL(18, 4) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MarketQuote_symbol_id_key`(`symbol_id`),
    INDEX `MarketQuote_symbol_id_idx`(`symbol_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MarketQuote` ADD CONSTRAINT `MarketQuote_symbol_id_fkey` FOREIGN KEY (`symbol_id`) REFERENCES `Symbol`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
