import { DataSource } from 'typeorm';
import ormSeedConfig from './ormseed.config';

export default new DataSource(ormSeedConfig);
