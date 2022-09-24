/* eslint-disable @typescript-eslint/no-use-before-define */
import { defineFactory } from '@julr/factorify'
import type { Builder } from '@julr/factorify'

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

export const AdminFactory = defineFactory('admin', ({ faker }) => ({
  id: faker.datatype.number(),
})).build()

export const UserFactory = defineFactory<any>('user', ({ faker }) => ({
  id: faker.datatype.number(),
}))
  .state('easyPassword', () => ({ password: 'easy' }))
  .state('easyEmail', () => ({ email: 'easy@easy.com' }))
  .hasOne('profile', () => ProfileFactory)
  .hasMany('posts', () => PostFactory)
  .hasOne('account', () => AccountFactory)
  .build() as Builder<any, any>

export const AccountFactory = defineFactory('account', ({ faker }) => ({
  name: faker.commerce.productName(),
}))
  .belongsTo('user', () => UserFactory)
  .belongsTo('admin', () => AdminFactory)
  .build()

export const TestFactory = defineFactory('account', ({ faker }) => ({
  name: faker.commerce.productName(),
}))
  .hasOne('admin', () => AdminFactory)
  .build()
