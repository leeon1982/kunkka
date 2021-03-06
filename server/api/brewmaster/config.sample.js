'use strict';

module.exports = {
  dependencies: {
    'ccap': '^0.6.10'
  },
  config: {
    reg_token_expire: 60 * 60 * 24,
    reg_sms_expire: 60 * 10,
    phone_area_code: '86'
  },
  'setting': [
    {
      app: 'auth',
      name: 'auth_logo_url',
      value: '/static/assets/login/logo@2x.png',
      type: 'string',
      description: '登录、注册界面 - logo 地址'
    }, {
      app: 'auth',
      name: 'single_logo_url',
      value: '/static/assets/nav_logo.png',
      type: 'string',
      description: '提示信息页面 - logo 地址'
    }, {
      app: 'auth',
      name: 'company',
      value: '©2016 UnitedStack Inc. All Rights Reserved. 京ICP备13015821号',
      type: 'string',
      description: '登录界面-公司 copyright'
    }, {
      app: 'auth',
      name: 'corporation_name',
      value: 'UnitedStack 有云',
      type: 'string',
      description: '登录界面-公司名称'
    }, {
      app: 'auth',
      name: 'home_url',
      value: 'https://www.ustack.com',
      type: 'string',
      description: '主页网址'
    }, {
      app: 'auth',
      name: 'email_logo_url',
      value: 'https://www.tfcloud.com/static/assets/logo1.png',
      type: 'string',
      description: 'logo的链接，用于邮件中'
    }, {
      app: 'auth',
      name: 'enable_domain',
      value: 'false',
      type: 'boolean',
      description: '登录界面-支持多 domain 功能'
    }, {
      app: 'auth',
      name: 'default_domain',
      value: 'Default',
      type: 'string',
      description: '登录界面-选中默认 domain 功能'
    }, {
      app: 'global',
      name: 'enable_register',
      value: 'false',
      type: 'boolean',
      description: '开启注册功能'
    }, {
      app: 'global',
      name: 'enable_register_approve',
      value: 'false',
      type: 'boolean',
      description: '注册-审批'
    }, {
      app: 'global',
      name: 'enable_register_approve_create_resource',
      value: 'false',
      type: 'boolean',
      description: '注册-审批通过后创建资源'
    }, {
      app: 'auth',
      name: 'eula_content',
      value: '',
      type: 'string',
      description: '注册页面-用户协议页面地址'
    }, {
      app: 'auth',
      name: 'enable_login_captcha',
      value: 'false',
      type: 'boolean',
      description: '登录页面图形验证码'
    }, {
      app: 'global',
      name: 'enable_subaccount',
      value: 'false',
      type: 'boolean',
      description: '开启子账户功能'
    }, {
      app: 'auth',
      name: 'password_expires',
      value: 30,
      type: 'number',
      description: '密码过期时间（天），默认值30'
    }, {
      app: 'auth',
      name: 'lock_minutes',
      value: 1,
      type: 'number',
      description: '账户锁定时间（分钟），默认值1'
    }
  ]
};
