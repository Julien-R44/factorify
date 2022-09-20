import { defineFactory } from '@julr/factorio'

export const ProfileFactory = defineFactory('profile', ({ faker }) => ({
  age: faker.datatype.number(),
  email: faker.internet.email(),
}))
  .state('old', () => ({ age: '150' }))
  .state('admin', () => ({ email: 'admin@admin.com' }))
  .build()

export const PostFactory = defineFactory('post', ({ faker }) => ({
  title: faker.lorem.sentence(),
}))
  .state('nodeArticle', () => ({ title: 'NodeJS' }))
  .build()

export const UserFactory = defineFactory<any>('user', ({ faker }) => ({
  id: faker.datatype.number(),
}))
  .state('easyPassword', () => ({ password: 'easy' }))
  .state('easyEmail', () => ({ email: 'easy@easy.com' }))
  .hasOne('profile', () => ProfileFactory, { foreignKey: 'user_id', localKey: 'id' })
  .hasMany('posts', () => PostFactory, { foreignKey: 'user_id', localKey: 'id' })
  .build()

export const AdminFactory = defineFactory('admin', ({ faker }) => ({
  id: faker.datatype.number(),
})).build()

export const AccountFactory = defineFactory('account', ({ faker }) => ({
  name: faker.commerce.productName(),
}))
  .belongsTo('user', () => UserFactory, { foreignKey: 'user_id', localKey: 'id' })
  .belongsTo('admin', () => AdminFactory, { foreignKey: 'admin_id', localKey: 'id' })
  .build()
