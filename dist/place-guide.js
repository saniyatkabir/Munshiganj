import { districts } from './data.js';

export const publicOrigin = 'https://munshiganj.ishann.workers.dev';
export const placePath = place => '/places/' + place.id + '/';
export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function mapsDestination(place) {
  return place.directionsQuery || (place.coords ? place.coords.join(',') : `${place.name}, ${districts[place.district][0]}, Munshiganj, Bangladesh`);
}

export function directions(place) {
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(mapsDestination(place));
}

export const placeAliases = {
  'idrakpur-fort': ['Idrakpur Kella', 'Idrakpur Qila', 'Idrakpur Durgo', 'ইদ্রাকপুর কেল্লা', 'ইদ্রাকপুর কিলা'],
  'baba-adam-mosque': ['Baba Adam Masjid', 'Baba Adam Shaheed Mosque', 'বাবা আদম শহীদ মসজিদ'],
  sonarang: ['Sonarong', 'Sonarong Jora Moth', 'Sonarang Jora Math', 'সোনারং জোড়া মঠ', 'সোনারং জোড়া মঠ'],
  'arial-beel': ['Arial Bil', 'Arial Bill', 'Aral Beel', 'আড়িয়াল বিল', 'আড়িয়াল বিল', 'আরিয়াল বিল'],
  nateshwar: ['Nateswar', 'Nateshwar Deul', 'Nateswar Buddhist Temple', 'নাটেশ্বর বৌদ্ধ মন্দির'],
  vihara: ['Raghurampur', 'Raghurampur Buddhist Monastery', 'বিক্রমপুর বিহার', 'রঘুরামপুর বিহার'],
  bajrayogini: ['Vajrayogini', 'Bajrojogini', 'Panditer Bhita', 'Atish Dipankar birthplace', 'অতীশ দীপঙ্করের জন্মভিটা', 'পণ্ডিতের ভিটা'],
  shyamsiddhi: ['Shamsiddhi Math', 'Shyamsiddhi Moth'],
  bhagyakul: ['Bhagyakul Zamindar Bari', 'Jadunath Roy Estate', 'ভাগ্যকুল জমিদার বাড়ি', 'যদুনাথ রায়'],
  'bikrampur-museum': ['Vikrampur Museum', 'Balasur Museum', 'বালাশুর জাদুঘর'],
  'radikhal-bose': ['Rarikhal', 'Radikhal', 'J C Bose Home', 'জে সি বসু কমপ্লেক্স'],
  shulpur: ['Sholpur', 'Saint Joseph Church', 'সেন্ট জোসেফ গির্জা'],
  shekharnagar: ['Shekhar Nagar Kalibari', 'শেখরনগর কালীবাড়ি'],
  mawa: ['Mawa Ghat', 'Mawa Ferry Ghat', 'মাওয়া ফেরিঘাট'],
  'padma-bridge': ['Padma Setu', 'পদ্মা সেতু'],
  'mirkadim-bridge': ['Mir Kadim Bridge', 'মীরকাদিম ব্রিজ'],
  'sirajdikhan-bazar': ['Sirajdikhan Bazaar', 'সিরাজদিখান বাজার'],
};

export function placeSearchText(place) {
  const [district, banglaDistrict] = districts[place.district];
  return [place.name, place.bn, district, banglaDistrict, place.category, place.period,
    ...(placeAliases[place.id] || []), place.intro, place.body].join(' ');
}

export const tripCards = [
  { index: 0, label: 'Town and Rampal', stops: 'Idrakpur Fort, Baba Adam’s Mosque and Raghurampur', image: 'fort' },
  { index: 2, label: 'Mawa riverside', stops: 'The old ferry landing and views of Padma Bridge', image: 'mawaghat' },
  { index: 1, label: 'Arial Beel', stops: 'The Sreenagar wetland and an optional stop in Rarikhal', image: 'beel' },
];
