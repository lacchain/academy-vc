export default async function getMenuData() {
  return [
    /* {
      category: true,
      title: 'Identities (DID)',
    },
    {
      title: 'My Identities',
      key: 'my-dids',
      url: '/ecommerce/product-catalog',
      icon: 'fe fe-users',
    },
    {
      title: 'Create DID',
      key: 'create-did',
      url: '/did/add',
      icon: 'fe fe-plus',
    }, */
    /* {
      title: 'Resolve DID',
      key: 'resolve-did',
      url: '/did/resolve',
      icon: 'fe fe-search',
    }, */
    {
      title: 'Credentials (VC)',
      category: true,
    },
    /* {
      title: 'Sent',
      key: 'sent',
      url: '/ecommerce/orders',
      icon: 'fe fe-credit-card',
    }, */
    {
      title: 'Requests',
      key: 'requests',
      url: '/vc/received',
      icon: 'fe fe-inbox',
    },
    /* {
      title: 'DNS',
      key: 'dns',
      url: '/dns',
      icon: 'fe fe-inbox',
    }, */
    /*
    {
      title: 'Auth Pages',
      key: 'auth',
      icon: 'fe fe-user',
      children: [
        {
          title: 'Login',
          key: 'authLogin',
          url: '/auth/login',
        },
        {
          title: 'Forgot Password',
          key: 'authForgotPassword',
          url: '/auth/forgot-password',
        },
        {
          title: 'Register',
          key: 'authRegister',
          url: '/auth/register',
        },
        {
          title: 'Page 404',
          key: 'auth404',
          url: '/auth/404',
        },
        {
          title: 'Page 500',
          key: 'auth500',
          url: '/auth/500',
        },
      ],
    },
    {
      title: 'Cards',
      key: 'cards',
      icon: 'fe fe-credit-card',
      children: [
        {
          title: 'Tabbed Cards',
          key: 'cardsTabbedCards',
          url: '/cards/tabbed-cards',
        },
      ],
    },
    {
      title: 'Tables',
      key: 'tables',
      icon: 'fe fe-grid',
      children: [
        {
          title: 'Ant Design',
          key: 'tablesAntd',
          url: '/tables/antd',
        }
      ],
    },
    {
      category: true,
      title: 'Advanced',
    },
    {
      title: 'Form Examples',
      key: 'formExamples',
      icon: 'fe fe-menu',
      url: '/advanced/form-examples',
    },
    {
      title: 'Email Templates',
      key: 'emailTemplates',
      icon: 'fe fe-mail',
      url: '/advanced/email-templates',
    }
     */
  ]
}
