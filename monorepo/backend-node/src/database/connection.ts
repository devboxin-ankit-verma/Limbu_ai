/**
 * Sequelize database connection and model initialization.
 *
 * Single Sequelize instance shared across the application.
 * Models are initialized and associations set up at import time.
 */

import { Sequelize } from 'sequelize';
import { config } from '../config';
import { initModels } from '../models';

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  logging: config.debug ? (msg: string) => console.log('[SQL]', msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
});

initModels(sequelize);

export default sequelize;
