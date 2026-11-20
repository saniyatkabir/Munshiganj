import { sources, photos, photoSource, districts, places, timeline, landscapes, people, culture, food, facts, itineraries } from './data.js';

import { directions, escapeHtml as escape, mapsDestination, placePath, placeSearchText, tripCards } from './place-guide.js';

const $ = selector => document.querySelector(selector);
const byId = id => places.find(place => place.id === id);
const categories = [...new Set(places.map(place => place.category))].sort();
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const external = (label, url, className = 'text-link') => `<a class="${className}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
const reference = id => external(sources[id][0], sources[id][1]);
const placeLink = place => `<a class="text-link" href="${placePath(place)}">${escape(place.name)}</a>`;

function photo(id, className = '') {
  return `<img class="${className}" src="assets/${id}-sm.webp" srcset="assets/${id}-sm.webp 620w, assets/${id}.webp 1060w" sizes="(max-width: 610px) 92vw, (max-width: 840px) 46vw, 42vw" loading="lazy" decoding="async" width="1060" height="705" alt="${escape(photos[id][2])}">`;
}

function tabs(tabId, panelId, labels, render, initial = 0) {
  const nav = document.getElementById(tabId);
  const panel = document.getElementById(panelId);
  nav.setAttribute('role', 'tablist');
  nav.innerHTML = labels.map((label, index) => `<button role="tab" type="button" id="${tabId}-${index}" aria-controls="${panelId}">${escape(label)}</button>`).join('');
  const buttons = [...nav.children];
  let current = initial;
  const select = index => {
    current = index;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', buttons[index].id);
    panel.tabIndex = 0;
    for (const [i, button] of buttons.entries()) {
      button.setAttribute('aria-selected', i === index);
      button.tabIndex = i === index ? 0 : -1;
    }
    panel.innerHTML = render(index);
  };
  for (const [index, button] of buttons.entries()) button.addEventListener('click', () => select(index));
  nav.addEventListener('keydown', event => {
    const move = { ArrowRight: (current + 1) % buttons.length, ArrowLeft: (current + buttons.length - 1) % buttons.length, ArrowDown: (current + 1) % buttons.length, ArrowUp: (current + buttons.length - 1) % buttons.length, Home: 0, End: buttons.length - 1 };
    if (!Object.hasOwn(move, event.key)) return;
    event.preventDefault();
    select(move[event.key]);
    buttons[current].focus();
  });
  select(current);
  return select;
}

const districtSelect = tabs('district-tabs', 'district-panel', districts.map(item => item[0]), index => {
  const [name, bangla, description, image] = districts[index];
  const destinations = places.filter(place => place.district === index).slice(0, 5);
  return `<article class="feature-panel"><div class="feature-content"><p class="kicker bengali-name" lang="bn">${bangla}</p><h3>${name}</h3><p>${description}</p><div class="place-links">${destinations.map(placeLink).join('')}</div><button type="button" class="text-link district-map-link" data-map-district="${index}">Show on the map</button></div>${photo(image)}</article>`;
});

const timelineImages = ['', 'vihara', '', 'mosque', 'fort', 'temple', '', 'bridge'];
const warIndex = timeline.findIndex(([name]) => name === 'Liberation War');
const warTribute = $('#liberation-war');
const historySelect = tabs('timeline-tabs', 'timeline-panel', timeline.map(item => item[0]), index => {
  const [, period, title, description, ref] = timeline[index];
  const image = timelineImages[index];
  warTribute.hidden = index !== warIndex;
  if (warTribute.hidden && location.hash === '#liberation-war') history.replaceState(null, '', '#history');
  return `<article class="timeline-article"><p class="period">${period}</p><h3>${title}</h3><p>${description}</p>${reference(ref)}${image ? photo(image, 'timeline-image') : ''}</article>`;
}, location.hash === '#liberation-war' ? warIndex : 1);

const landscapeSelect = tabs('nature-tabs', 'nature-panel', landscapes.map(item => item[0]), index => {
  const [name, title, description, image, ref] = landscapes[index];
  if (name === 'Arial Beel') {
    return `<article class="season-story"><div class="season-intro"><p class="kicker">${name}</p><h3>${title}</h3><p>${description}</p></div><div class="season-pair">
      <figure>${photo('beel')}<figcaption><strong>Monsoon water · June</strong><p>Flooded fields and open water.</p>${external('MD.SHADDAM HOSSAIN · Wikimedia Commons', photoSource('beel'))}</figcaption></figure>
      <figure>${photo('beel-harvest')}<figcaption><strong>Paddy harvest · April</strong><p>The cultivated basin after the winter growing season.</p>${external('Bangladesh Press Information Department · Wikimedia Commons', photoSource('beel-harvest'))}</figcaption></figure>
    </div><div class="place-links">${reference(ref)}${reference('beelWinter')}${placeLink(byId('arial-beel'))}</div></article>`;
  }
  return `<article class="feature-panel ${image ? '' : 'text-only'}"><div class="feature-content"><p class="kicker">${name}</p><h3>${title}</h3><p>${description}</p><div class="place-links">${reference(ref)}</div></div>${image ? photo(image) : ''}</article>`;
}, 4);

function routeLink(stops) {
  const destinations = stops.map(id => mapsDestination(byId(id)));
  const params = new URLSearchParams({ api: '1', origin: destinations[0], destination: destinations.at(-1) });
  if (destinations.length > 2) params.set('waypoints', destinations.slice(1, -1).join('|'));
  return external('Open route in Google Maps', 'https://www.google.com/maps/dir/?' + params, 'button button-line');
}

const travelSelect = tabs('trip-tabs', 'trip-panel', itineraries.map(item => item[0]), index => {
  const [, title, description, stops] = itineraries[index];
  return `<article class="note trip-content"><h3>${title}</h3><p>${description}</p><ol class="trip-stops">${stops.map(id => `<li>${placeLink(byId(id))}</li>`).join('')}</ol>${routeLink(stops)}</article>`;
});

$('#trip-cards').innerHTML = tripCards.map(trip => `<a class="trip-card" href="#trip-panel" data-trip-index="${trip.index}">${photo(trip.image)}<div><h3>${trip.label}</h3><p>${trip.stops}</p><span>View itinerary</span></div></a>`).join('');
$('#trip-cards').addEventListener('click', event => {
  const trip = event.target.closest('[data-trip-index]');
  if (!trip) return;
  travelSelect(Number(trip.dataset.tripIndex));
});

$('#culture-grid').innerHTML = culture.map(([title, description, ref, image]) => `<article class="culture-card">${photo(image, 'card-photo')}<h3>${title}</h3><p>${description}</p>${reference(ref)}</article>`).join('');
$('#people-grid').innerHTML = people.map(([name, description, biography, ref]) => `<article class="note"><p class="kicker">${description}</p><h3>${name}</h3><p>${biography}</p>${reference(ref)}</article>`).join('');
$('#food-grid').innerHTML = food.map(([title, description, image]) => `<article class="${image ? 'food-featured' : ''}">${image ? photo(image, 'card-photo') : ''}<div><h3>${title}</h3><p>${description}</p></div></article>`).join('') + `<p class="food-source">${reference('food')}</p>`;
$('#facts-grid').innerHTML = facts.map(([question, answer, ref]) => `<details><summary>${question}</summary><div><p>${answer}</p>${reference(ref)}</div></details>`).join('');
$('#source-list').innerHTML = `<div><h3>Research and maps</h3><ul>${Object.keys(sources).map(id => `<li>${reference(id)}</li>`).join('')}</ul></div><div><h3>Photographs</h3><ul>${Object.entries(photos).map(([id, item]) => `<li>${external(item[2], photoSource(id))} · ${escape(item[1] || 'See photographer on the original file')} · ${item[4] ? external(item[4], item[5] || photoSource(id)) : external('CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/')} · resized and compressed</li>`).join('')}</ul></div>`;

function populateDistricts(selector) {
  const select = $(selector);
  districts.forEach(([name], index) => select.add(new Option(name, index)));
}
populateDistricts('#place-district');
populateDistricts('#map-district');

function chips(container, labels, onChange) {
  container.innerHTML = labels.map((label, index) => `<button type="button" aria-pressed="${index === 0}">${escape(label)}</button>`).join('');
  container.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    for (const chip of container.children) chip.setAttribute('aria-pressed', chip === button);
    onChange(button.textContent);
  });
}
const normalize = value => value.normalize('NFKC').toLocaleLowerCase().replace(/[’']/g, '').trim();
const matches = (search, text) => normalize(search).split(/\s+/).every(word => normalize(text).includes(word));
const directory = { category: 'All', expanded: false };
const featuredPlaces = ['idrakpur-fort', 'baba-adam-mosque', 'sonarang', 'vihara', 'arial-beel', 'padma-bridge'];
function renderPlaces() {
  const query = $('#place-search').value;
  const district = $('#place-district').value;
  const results = places.filter(place => (
    (directory.category === 'All' || directory.category === place.category) &&
    (district === '' || Number(district) === place.district) &&
    matches(query, placeSearchText(place))
  ));
  const overview = !query && district === '' && directory.category === 'All';
  const ordered = overview ? [...featuredPlaces.map(byId), ...results.filter(place => !featuredPlaces.includes(place.id))] : results;
  const shown = directory.expanded ? ordered : ordered.slice(0, 6);
  $('#place-grid').innerHTML = shown.map(place => `<article class="place-card">${place.image ? photo(place.image, 'card-photo') : ''}<div class="place-card-content"><p class="kicker">${place.category} · ${districts[place.district][0]}</p><h3>${escape(place.name)}</h3><p>${place.intro}</p><a class="text-link" aria-label="Read about ${escape(place.name)}" href="${placePath(place)}">Explore this place</a></div></article>`).join('') || '<p class="empty">No matches. Try another search or clear a filter.</p>';
  $('#place-count').textContent = shown.length === results.length ? `${results.length} ${results.length === 1 ? 'place' : 'places'}` : `Showing ${shown.length} of ${results.length} places`;
  $('#more-places').hidden = results.length <= 6 || directory.expanded;
}
chips($('#place-filters'), ['All', ...categories], label => {
  directory.category = label;
  directory.expanded = false;
  renderPlaces();
});
$('#place-search').addEventListener('input', () => { directory.expanded = false; renderPlaces(); });
$('#place-district').addEventListener('change', () => { directory.expanded = false; renderPlaces(); });
$('#more-places').addEventListener('click', () => {
  directory.expanded = true;
  renderPlaces();
  $('#place-grid').children[6]?.querySelector('a')?.focus({ preventScroll: true });
});
renderPlaces();

const dialogs = { search: $('#search-dialog'), photo: $('#lightbox') };
const dialogReturn = new WeakMap();
function openDialog(dialog, opener) {
  dialogReturn.set(dialog, opener);
  dialog.showModal();
  document.body.classList.add('modal-open');
}
for (const dialog of Object.values(dialogs)) {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (!Object.values(dialogs).some(item => item.open)) document.body.classList.remove('modal-open');
    const opener = dialogReturn.get(dialog);
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
}

const galleryPhotos = Object.keys(photos).filter(id => id !== 'districtmap');
const uncroppedGallery = new Set(['math', 'temple', 'temple2']);
let activeGallery = galleryPhotos;
let photoSet = [];
let photoIndex = 0;
function renderGallery(category = 'All') {
  activeGallery = galleryPhotos.filter(id => category === 'All' || photos[id][3] === category);
  $('#gallery-grid').innerHTML = activeGallery.map(id => `<button class="gallery-tile${uncroppedGallery.has(id) ? ' gallery-tile-uncropped' : ''}" type="button" aria-label="View ${escape(photos[id][2])}" data-photo="${id}">${photo(id)}<span>${escape(photos[id][2])}</span></button>`).join('');
}
function renderLightbox() {
  const id = photoSet[photoIndex];
  const [file, author, caption] = photos[id];
  $('#lightbox-figure').innerHTML = `<img src="assets/${id}.webp" alt="${escape(caption)}"><figcaption>${escape(caption)} · ${external(author || file.replaceAll('_', ' '), photoSource(id), '')}<span class="visually-hidden">. Photo ${photoIndex + 1} of ${photoSet.length}.</span></figcaption>`;
  $('.photo-prev').hidden = $('.photo-next').hidden = photoSet.length < 2;
}
function movePhoto(step) {
  photoIndex = (photoIndex + step + photoSet.length) % photoSet.length;
  renderLightbox();
}
$('.photo-prev').addEventListener('click', () => movePhoto(-1));
$('.photo-next').addEventListener('click', () => movePhoto(1));
dialogs.photo.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
chips($('#gallery-filters'), ['All', ...new Set(galleryPhotos.map(id => photos[id][3]))], renderGallery);
renderGallery();

const searchIndex = [
  ...places.map(place => ({ title: place.name, description: place.intro, place: place.id, keywords: placeSearchText(place) })),
  ...districts.map(([name, bn, description], index) => ({ title: name, description, target: 'discover', index, keywords: bn })),
  { title: 'Shaheed Bir Muktijudda Faizur Rahman', description: 'Lance Naik, East Pakistan Rifles · Liberation War, 1971', target: 'liberation-war', keywords: 'Faizur Foyzur Foyezur Rahman Jamurki Rancha 1971 Gazette 66 ফয়েজুর রহমান ফয়জুর রহমান ল্যান্স নায়েক মুক্তিযুদ্ধ' },
  ...timeline.map(([name, period, title, description], index) => ({ title: name, description: period + ' · ' + title, target: 'history', index, keywords: description + ' ইতিহাস Bikrampur' })),
  ...landscapes.map(([name, title, description], index) => ({ title: name, description: title, target: 'nature', index, keywords: description })),
  ...itineraries.map(([name, title, description], index) => ({ title, description, target: 'travel', index, keywords: name + ' itinerary route visit' })),
  ...people.map(([title, description, keywords]) => ({ title, description, keywords, target: 'culture' })),
  ...food.map(([title, description]) => ({ title, description, target: 'culture', keywords: 'food sweets fish' })),
  ...facts.map(([title, description], index) => ({ title, description, target: 'facts', index, keywords: 'Did you know' })),
  { title: 'Explore Map', description: 'Find places and directions across six upazilas.', target: 'map-section', keywords: 'map locations pins routes' },
  { title: 'Munshiganj Through the Lens', description: 'Explore the district through photographs.', target: 'gallery', keywords: 'photo photos photography images gallery' },
];
function renderSearch() {
  const query = $('#global-search').value.trim();
  if (!query) {
    $('#search-results').innerHTML = '<p class="search-hint">Search by name, historical period, upazila or topic.</p>';
    return;
  }
  const hits = searchIndex.filter(item => matches(query, [item.title, item.description, item.keywords].join(' ')));
  hits.sort((a, b) => Number(normalize(b.title).includes(normalize(query))) - Number(normalize(a.title).includes(normalize(query))));
  $('#search-results').innerHTML = hits.length ? `<p class="search-hint">${hits.length} ${hits.length === 1 ? 'result' : 'results'}${hits.length > 14 ? ' · first 14 shown' : ''}</p><ul class="search-results-list">${hits.slice(0, 14).map(hit => {
    const contents = `${escape(hit.title)}<small>${escape(hit.description)}</small>`;
    const control = hit.place
      ? `<a class="search-hit" href="${placePath(byId(hit.place))}">${contents}</a>`
      : `<button type="button" class="search-hit" data-result="${searchIndex.indexOf(hit)}">${contents}</button>`;
    return `<li>${control}</li>`;
  }).join('')}</ul>` : '<p class="search-hint">No results. Try a shorter name or a different spelling.</p>';
}
$('#search-open').addEventListener('click', () => {
  openDialog(dialogs.search, $('#search-open'));
  renderSearch();
  $('#global-search').focus();
});
$('#global-search').addEventListener('input', renderSearch);
$('#search-results').addEventListener('click', event => {
  const trigger = event.target.closest('[data-result]');
  if (!trigger) return;
  const item = searchIndex[Number(trigger.dataset.result)];
  if (item.target === 'liberation-war') {
    dialogs.search.close();
    if (location.hash === '#liberation-war') revealWarTribute();
    else location.hash = item.target;
    return;
  }
  const select = { discover: districtSelect, history: historySelect, nature: landscapeSelect, travel: travelSelect }[item.target];
  if (select) select(item.index);
  const fact = item.target === 'facts' ? $('#facts-grid').children[item.index] : null;
  if (fact) fact.open = true;
  dialogs.search.close();
  location.hash = item.target;
  requestAnimationFrame(() => {
    const section = fact || document.getElementById(item.target);
    section.scrollIntoView({ block: 'start' });
    if (!fact) section.tabIndex = -1;
    (fact?.querySelector('summary') || section).focus({ preventScroll: true });
  });
});

const pins = places.filter(place => place.coords);
const mapSelectors = { district: $('#map-district'), category: $('#map-category') };
[...new Set(pins.map(place => place.category))].sort().forEach(category => mapSelectors.category.add(new Option(category, category)));
let map, markers;
const visibleMarkers = new Map();
const narrowMap = matchMedia('(max-width: 610px)');
const mapDetail = $('#map-detail');
let activeMapPlace;

function highlightMapPlace(place) {
  for (const button of $('#map-list').querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.pin === place?.id);
  }
}

function showMapPlace(place) {
  activeMapPlace = place;
  highlightMapPlace(place);
  mapDetail.innerHTML = `<div><p class="kicker">${escape(districts[place.district][0])} · ${escape(place.category)}</p><h3 id="map-detail-title" tabindex="-1">${escape(place.name)}</h3><p>${escape(place.intro)}</p><div class="place-links">${external('Directions', directions(place), 'button button-green')}${placeLink(place)}</div></div><button class="icon-button" id="map-detail-close" type="button" aria-label="Close selected place">×</button>`;
  mapDetail.hidden = false;
  $('#map-detail-title').focus({ preventScroll: true });
  mapDetail.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion.matches ? 'instant' : 'smooth' });
}

function clearMapPlace(restoreFocus = false) {
  const selected = activeMapPlace;
  activeMapPlace = undefined;
  mapDetail.hidden = true;
  highlightMapPlace();
  if (restoreFocus && selected) $('#map-list').querySelector(`[data-pin="${selected.id}"]`)?.focus({ preventScroll: true });
}
mapDetail.addEventListener('click', event => {
  if (event.target.closest('#map-detail-close')) clearMapPlace(true);
});
narrowMap.addEventListener('change', () => {
  map?.closePopup();
  renderMap();
});

function initializeMap() {
  if (map || !window.L) return;
  map = L.map('map', { scrollWheelZoom: false, tapHold: false, minZoom: 8, maxZoom: 18 }).setView([23.54, 90.42], 10);
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
  tiles.on('tileerror', () => {
    $('#map-status').dataset.tileError = 'true';
    updateMapStatus();
  });
  tiles.on('tileload', () => {
    if ($('#map-status').dataset.tileError) {
      delete $('#map-status').dataset.tileError;
      updateMapStatus();
    }
  });
  tiles.addTo(map);
  markers = L.featureGroup().addTo(map);
  renderMap();
}
function updateMapStatus() {
  const status = $('#map-status');
  status.textContent = [
    status.dataset.count,
    !window.L ? 'The interactive map is unavailable. The list still opens each place and its directions.' : '',
    status.dataset.tileError ? 'Some map tiles could not load. Pins and directions are still available.' : '',
  ].filter(Boolean).join(' ');
}
function renderMap() {
  const { district, category } = mapSelectors;
  const list = pins.filter(place => (district.value === '' || Number(district.value) === place.district) && (category.value === '' || category.value === place.category));
  if (activeMapPlace && !list.includes(activeMapPlace)) clearMapPlace();
  $('#map-list').innerHTML = list.map(place => `<button type="button" class="map-option" aria-pressed="false" data-pin="${place.id}">${escape(place.name)}<small>${districts[place.district][0]} · ${place.category}</small></button>`).join('') || '<p class="map-list-empty">No pinned places for these filters.</p>';
  highlightMapPlace(activeMapPlace);
  $('#map-status').dataset.count = `${list.length} mapped ${list.length === 1 ? 'location' : 'locations'}.`;
  updateMapStatus();
  if (!map) return;
  markers.clearLayers();
  visibleMarkers.clear();
  for (const place of list) {
    const style = { Nature: 'water', Infrastructure: 'modern', Archaeology: 'heritage', Museums: 'heritage', 'Heritage buildings': 'heritage', Mosques: 'worship', Temples: 'worship', 'Religious sites': 'worship' }[place.category] || '';
    const icon = L.divIcon({ className: `map-pin ${style}`, iconSize: [19, 19], iconAnchor: [9, 16] });
    const marker = L.marker(place.coords, { icon, title: place.name, alt: place.name, keyboard: true }).addTo(markers);
    if (narrowMap.matches) marker.on('click', () => showMapPlace(place));
    else marker.bindPopup(`${place.image ? photo(place.image) : ''}<strong>${escape(place.name)}</strong><div>${districts[place.district][0]}</div><p>${place.intro}</p><div class="place-links">${placeLink(place)}${external('Directions', directions(place))}</div>`, { maxWidth: 255, minWidth: 155 });
    marker.on('popupopen', () => {
      highlightMapPlace(place);
    });
    marker.on('popupclose', () => {
      $('#map-list').querySelector(`[data-pin="${place.id}"]`)?.setAttribute('aria-pressed', 'false');
    });
    visibleMarkers.set(place.id, marker);
  }
  if (list.length) map.fitBounds(markers.getBounds(), { padding: [32, 32], maxZoom: 13, animate: false });
}
for (const select of Object.values(mapSelectors)) select.addEventListener('change', renderMap);
$('#map-reset').addEventListener('click', () => {
  mapSelectors.district.value = mapSelectors.category.value = '';
  renderMap();
});
$('#map-list').addEventListener('click', event => {
  const button = event.target.closest('[data-pin]');
  if (!button) return;
  const marker = visibleMarkers.get(button.dataset.pin);
  if (marker && !narrowMap.matches) marker.openPopup();
  else showMapPlace(byId(button.dataset.pin));
});
renderMap();
if ('IntersectionObserver' in window) {
  const mapObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    initializeMap();
    mapObserver.disconnect();
  }, { rootMargin: '250px' });
  mapObserver.observe($('#map'));
} else initializeMap();

document.addEventListener('click', event => {
  const image = event.target.closest('[data-photo]');
  const district = event.target.closest('[data-map-district]');
  if (image) {
    photoSet = image.closest('#gallery-grid') ? activeGallery : [image.dataset.photo];
    photoIndex = photoSet.indexOf(image.dataset.photo);
    renderLightbox();
    openDialog(dialogs.photo, image);
  }
  if (district) {
    mapSelectors.district.value = district.dataset.mapDistrict;
    mapSelectors.category.value = '';
    renderMap();
    location.hash = 'map-section';
  }
});

const menu = $('#menu-toggle');
const nav = $('#main-nav');
const navLinks = [...document.querySelectorAll('#main-nav a, .quick-nav a')];
const navSections = [...document.querySelectorAll('main > section[id], footer[id]')];

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', open);
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menu.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
$('#to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'instant' : 'smooth' });
  $('.brand').focus({ preventScroll: true });
});
function refreshScroll() {
  const top = window.scrollY;
  const total = document.documentElement.scrollHeight - innerHeight;
  $('.progress i').style.transform = `scaleX(${total > 0 ? Math.min(top / total, 1) : 0})`;
  $('.header').classList.toggle('scrolled', top > 25);
  $('#to-top').hidden = top < 700;
  const nearest = navSections.filter(section => section.getBoundingClientRect().top <= 155).at(-1) || navSections[0];
  for (const link of navLinks) {
    if (link.hash === '#' + nearest.id || (link.hash === '#liberation-war' && location.hash === '#liberation-war' && nearest.id === 'history')) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
let scrollQueued = false;
function queueScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    refreshScroll();
    scrollQueued = false;
  });
}
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll);
document.addEventListener('toggle', queueScroll, true);
if ('ResizeObserver' in window) new ResizeObserver(queueScroll).observe(document.body);
function revealWarTribute() {
  historySelect(warIndex);
  requestAnimationFrame(() => {
    warTribute.scrollIntoView({ block: 'start' });
    $('#war-intro-title').focus({ preventScroll: true });
  });
}
function syncPageAnchor() {
  if (location.hash === '#sources') $('#sources').open = true;
  if (location.hash === '#liberation-war') revealWarTribute();
}
window.addEventListener('hashchange', syncPageAnchor);
document.addEventListener('click', event => {
  if (location.hash === '#liberation-war' && event.target.closest('a[href="#liberation-war"]')) revealWarTribute();
});
syncPageAnchor();
refreshScroll();
