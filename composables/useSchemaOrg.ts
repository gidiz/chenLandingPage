const BASE_URL = 'https://drchenpardo.co.il'

export const getMedicalBusinessSchema = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  '@id': `${BASE_URL}/#business`,
  name: 'ד"ר חן פרדו',
  url: BASE_URL,
  telephone: '+972-54-757-7214',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'התעש 20',
    addressLocality: 'כפר סבא',
    addressCountry: 'IL',
  },
  sameAs: ['https://www.instagram.com/dr_chen_pardo/'],
  medicalSpecialty: 'Dermatology',
})

export const getPersonSchema = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${BASE_URL}/#person`,
  name: 'ד"ר חן פרדו',
  url: `${BASE_URL}/about`,
  jobTitle: 'רופאה מומחית לאסתטיקה רפואית',
  worksFor: { '@id': `${BASE_URL}/#business` },
  sameAs: ['https://www.instagram.com/dr_chen_pardo/'],
})

export const getWebSiteSchema = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: 'ד"ר חן פרדו',
  url: BASE_URL,
  inLanguage: 'he',
  publisher: { '@id': `${BASE_URL}/#business` },
})
