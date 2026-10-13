const translations = {
  tr: {
    navigation: 'Bilgi', guide: 'Nasıl kullanılır?', privacy: 'Gizlilik', back: '← Karşılaştırmaya dön',
    headline: 'Kim takipte, kim değil?', intro: 'Instagram’dan indirdiğin HTML dosyalarını seç, takip listelerini karşılaştır.',
    followers: 'Takipçilerin', following: 'Takip ettiklerin', compare: 'Karşılaştır', local: 'Dosyaların tarayıcında kalır.',
    results: 'Karşılaştırma sonuçları', mutual: 'Karşılıklı', fans: 'Senin takip etmediklerin', unf: 'Seni takip etmeyenler',
    export: 'Dışa aktar', format: 'Dosya formatı', cancel: 'Vazgeç', download: 'İndir', profile: 'Profili aç',
    empty: 'Bu listede kullanıcı yok.', missing: 'Takipçi dosyalarını ve takip edilenler dosyasını seçmelisiniz.',
    reading: 'Dosyalar okunuyor…', readError: 'Dosyalar okunamadı. HTML dosyalarını tekrar seçip deneyin.',
    exportSummary: 'Seçili liste: {list} · {count} hesap', username: 'Kullanıcı adı', profileUrl: 'Profil bağlantısı'
  },
  en: {
    navigation: 'Information', guide: 'How to use', privacy: 'Privacy', back: '← Back to comparison',
    headline: 'Who follows you, who doesn’t?', intro: 'Select the HTML files you downloaded from Instagram and compare your follow lists.',
    followers: 'Your followers', following: 'Accounts you follow', compare: 'Compare', local: 'Your files stay in your browser.',
    results: 'Comparison results', mutual: 'Mutual', fans: 'Accounts you don’t follow', unf: 'Accounts that don’t follow you',
    export: 'Export', format: 'File format', cancel: 'Cancel', download: 'Download', profile: 'Open profile',
    empty: 'There are no users in this list.', missing: 'Select your follower files and your following file.',
    reading: 'Reading files…', readError: 'The files could not be read. Select the HTML files again and retry.',
    exportSummary: 'Selected list: {list} · {count} accounts', username: 'Username', profileUrl: 'Profile URL'
  }
};
let language = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'tr';
function t(key) { return translations[language][key] || key; }
function setLanguage(next) {
  language = next === 'en' ? 'en' : 'tr';
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(el => el.hidden = el.dataset.lang !== language);
  document.querySelectorAll('[data-language]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.language === language)));
  document.querySelectorAll('a[href]').forEach(el => {
    const url = new URL(el.getAttribute('href'), location.href);
    if (url.origin === location.origin && url.pathname.endsWith('.html')) {
      url.searchParams.set('lang', language);
      el.href = url.href;
    }
  });
  const url = new URL(location.href);
  url.searchParams.set('lang', language);
  history.replaceState(null, '', url);
  document.dispatchEvent(new Event('languagechange'));
}
document.querySelectorAll('[data-language]').forEach(el => el.addEventListener('click', () => setLanguage(el.dataset.language)));
setLanguage(language);
