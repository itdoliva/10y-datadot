import en from '$lib/i18n/en.json';
import pt from '$lib/i18n/pt.json';

export function getLocaleFromRequest(headers) {
  const acceptLanguage = headers.get('accept-language');

  if (!acceptLanguage) {
    return 'pt'; // Default to English if no language is provided
  }

  // Split the Accept-Language header into an array of languages
  const languages = acceptLanguage.split(',')
    .map((lang) => {
      const [language, q = 'q=1'] = lang.split(';')
      return { language: language.trim(), quality: parseFloat(q.split('=')[1]) }
    })
    .sort((a, b) => b.quality - a.quality); // Sort by quality in descending order

  return languages.length > 0 ? languages[0].language.slice(0, 2) : 'pt'; // Return the top preferred language
}


export function format(value, locale) {
  const data = locale === 'en' ? en : pt
  return value.split('.').reduce((obj, key) => obj && obj[key], data)
}
