
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

i18next
  .use(Backend)
  .init({
    fallbackLng: 'ko',
    backend: {
      loadPath: __dirname + '/../locales/{{lng}}.json',
    },
    ns: ['userUtils', 'aiInsightsService'],
    defaultNS: 'userUtils',
  });

export default i18next;
