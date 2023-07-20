import ormConfig from './orm.config';

const ormSeedConfig = {
  ...ormConfig,
  migrations: ['src/configs/seeds/*.ts'],
};

export default ormSeedConfig;
