import { defineFactory } from '@julr/factorio'

export const ProfileFactory = defineFactory(({ faker }) => ({
  tableName: 'profile',
  fields: {
    age: faker.datatype.number(),
    email: faker.internet.email(),
  },
}))
  .state('old', () => ({ age: '150' }))
  .state('admin', () => ({ email: 'admin@admin.com' }))
  .build()

export const PostFactory = defineFactory(({ faker }) => ({
  tableName: 'post',
  fields: { title: faker.lorem.sentence() },
}))
  .state('nodeArticle', () => ({ title: 'NodeJS' }))
  .build()

export const UserFactory = defineFactory<any>(({ faker }) => ({
  tableName: 'user',
  fields: { id: faker.datatype.number() },
}))
  .hasOne('profile', { foreignKey: 'user_id', localKey: 'id', factory: ProfileFactory })
  .hasMany('posts', { foreignKey: 'user_id', localKey: 'id', factory: PostFactory })
  .build()

export const AccountFactory = defineFactory(({ faker }) => ({
  tableName: 'account',
  fields: { name: faker.commerce.productName() },
}))
  // .belongsTo('user', { foreignKey: 'user_id', localKey: 'id', factory: UserFactory })
  .build()
