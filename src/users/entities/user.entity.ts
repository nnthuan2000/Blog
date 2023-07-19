import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { hash } from 'bcrypt';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  image: string;

  @Column()
  @Exclude()
  password: string;

  @BeforeInsert()
  @Exclude()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  token: string;

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }
}
