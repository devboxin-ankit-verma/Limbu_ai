-- CreateTable
CREATE TABLE `market_quote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol_id` INTEGER NOT NULL,
    `ask` DECIMAL(18, 4) NOT NULL,
    `bid` DECIMAL(18, 4) NOT NULL,
    `ltp` DECIMAL(18, 4) NOT NULL,
    `change` DECIMAL(18, 4) NOT NULL,
    `high` DECIMAL(18, 4) NOT NULL,
    `low` DECIMAL(18, 4) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `market_quote_symbol_id_key`(`symbol_id`),
    INDEX `market_quote_symbol_id_idx`(`symbol_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `market_quote` ADD CONSTRAINT `market_quote_symbol_id_fkey` FOREIGN KEY (`symbol_id`) REFERENCES `symbol`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
