// Business details. Anything left empty is hidden on the site instead of showing made-up data.
export const SITE = {
  name: 'OneStory',
  tagline: 'סרטוני גדילה ב-AI, בהתאמה אישית',
  description:
    'סרטוני גדילה ב-AI שבהם הדמות עוברת מתמונה לתמונה בתנועה אחת רציפה, בלי דיזולב. כל מעבר מתוכנן ונערך בהתאמה אישית לתמונות שלכם.',
  // While true, every page carries noindex and robots.txt blocks crawlers.
  private: true,
  // International format without "+", e.g. "972501234567". Empty = WhatsApp buttons fall back to the form.
  whatsapp: '',
  email: '',
  // Publication date of the sample film (YYYY-MM-DD), used in the VideoObject schema.
  filmDate: '2026-10-24',
};
