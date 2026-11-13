const shop = 'https://csntech.ru/';
const products = {
  mavic: {name: 'DJI Mavic 4 Pro', kind: 'Квадрокоптер с камерой', price: 250000, variable: true, image: 'mavic.jpg', slug: 'dji-mavic-4-pro'},
  autel: {name: 'Autel EVO Max 4T', kind: 'Профессиональный квадрокоптер', price: 589900, image: 'autel-evo.webp', slug: 'autel-evo-max-4t', keywords: '02835'},
  matrice: {name: 'DJI Matrice 4T', kind: 'Профессиональный квадрокоптер', price: 549100, image: 'matrice.webp', slug: 'dji-matrice-4t'},
  moonlight: {name: 'Avatar HD Moonlight Kit', kind: 'Комплект FPV-видеопередачи', price: 17990, image: 'moonlight.webp', slug: 'avatar-hd-moonlight-kit-комплект-fpv-видеопередачи'},
  station: {name: '1.2 G Diversity FPV Ground Station', kind: 'Наземная станция', price: 12990, image: 'ground-station.webp', slug: '1-2-g-diversity-fpv-ground-station', keywords: '04675'},
  motors: {name: 'BetaFPV 0702SE 25000KV', kind: 'Моторы FPV', price: 4990, image: 'betafpv-motor.webp', slug: 'betafpv-0702se-25000-кв'},
  holder: {name: 'Фиксатор пропеллеров DJI Mini 4 Pro', kind: 'Аксессуар', price: 490, image: 'propeller-holder.webp', slug: 'фиксатор-пропеллеров-dji-mini-4-pro'},
};

const number = new Intl.NumberFormat('ru-RU');
const rubles = value => number.format(value) + ' ₽';
const priceText = product => (product.variable ? 'от ' : '') + rubles(product.price);
const productUrl = product => shop + 'product/' + product.slug + '/';

const header = document.querySelector('.store-header');
const nav = document.querySelector('.primary-nav');
const navButtons = [...nav.querySelectorAll('.nav-group > button')];
const canHover = matchMedia('(hover: hover)');
let activeMenu = null;

function updateHeader() {
  header.classList.toggle('is-solid', Boolean(activeMenu) || scrollY > 35);
}

function openMenu(button) {
  if (activeMenu === button) return;
  if (activeMenu) {
    document.getElementById(activeMenu.getAttribute('aria-controls')).hidden = true;
    activeMenu.setAttribute('aria-expanded', 'false');
  }
  activeMenu = button;
  if (button) {
    document.getElementById(button.getAttribute('aria-controls')).hidden = false;
    button.setAttribute('aria-expanded', 'true');
  }
  updateHeader();
}

for (const button of navButtons) {
  button.addEventListener('pointerenter', () => {
    if (canHover.matches) openMenu(button);
  });
  button.addEventListener('click', event => {
    const mouseHover = canHover.matches && event.detail > 0;
    openMenu(activeMenu === button && !mouseHover ? null : button);
  });
}
for (const link of nav.querySelectorAll('a')) {
  link.addEventListener('click', () => openMenu(null));
}
for (const link of nav.querySelectorAll(':scope > a')) {
  link.addEventListener('pointerenter', () => openMenu(null));
}
header.addEventListener('pointerleave', () => {
  if (!nav.contains(document.activeElement)) openMenu(null);
});
header.addEventListener('focusout', event => {
  if (event.relatedTarget && !header.contains(event.relatedTarget)) openMenu(null);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) openMenu(null);
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !activeMenu || document.querySelector('dialog[open]')) return;
  const menuButton = activeMenu;
  openMenu(null);
  menuButton.focus();
});
window.addEventListener('scroll', updateHeader, {passive: true});
updateHeader();

const hero = document.querySelector('.hero');
const slides = [...hero.querySelectorAll('[data-slide]')];
const slideButtons = [...hero.querySelectorAll('[data-select]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let activeSlide = 0;

function playMotion() {
  if (reducedMotion.matches) return;
  const slide = slides[activeSlide];
  slide.classList.remove('playing');
  void slide.offsetWidth;
  slide.classList.add('playing');
}

function selectSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  for (const [position, slide] of slides.entries()) {
    slide.hidden = position !== activeSlide;
    slideButtons[position].setAttribute('aria-pressed', String(position === activeSlide));
  }
  playMotion();
}

for (const button of hero.querySelectorAll('[data-step]')) {
  button.addEventListener('click', () => selectSlide(activeSlide + Number(button.dataset.step)));
}
for (const button of slideButtons) {
  button.addEventListener('click', () => selectSlide(Number(button.dataset.select)));
}
hero.querySelector('.slide-controls').addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  selectSlide(activeSlide + (event.key === 'ArrowRight' ? 1 : -1));
  slideButtons[activeSlide].focus();
});
hero.querySelector('.motion-replay').addEventListener('click', playMotion);
playMotion();

const cart = new Map();
const cartTrigger = document.getElementById('cart-trigger');
const countBadge = cartTrigger.querySelector('.cart-count');
const cartDialog = document.getElementById('cart-dialog');
const cartList = cartDialog.querySelector('.cart-list');
const cartEmpty = cartDialog.querySelector('.cart-empty');
const cartTotal = cartDialog.querySelector('.cart-total');
const toast = document.querySelector('.toast');
let toastTimer;

function announce(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toastTimer = setTimeout(() => { toast.textContent = ''; }, 2300);
}

function cartRow(key, quantity) {
  const product = products[key];
  const row = document.createElement('li');
  const image = document.createElement('img');
  image.alt = '';
  image.src = 'assets/' + product.image;
  const name = document.createElement('a');
  name.className = 'cart-item-name';
  name.href = productUrl(product);
  name.textContent = product.name;
  const controls = document.createElement('div');
  controls.className = 'cart-quantity';
  const amount = document.createElement('span');
  amount.textContent = quantity;
  for (const [delta, label, symbol] of [[-1, 'Уменьшить', '−'], [1, 'Увеличить', '+']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = symbol;
    button.dataset.key = key;
    button.dataset.delta = delta;
    button.setAttribute('aria-label', label + ' количество ' + product.name);
    controls.append(button);
    if (delta === -1) controls.append(amount);
  }
  const price = document.createElement('strong');
  price.textContent = rubles(product.price * quantity);
  row.append(image, name, controls, price);
  return row;
}

function renderCart() {
  let count = 0;
  let total = 0;
  const rows = [];
  for (const [key, quantity] of cart) {
    count += quantity;
    total += products[key].price * quantity;
    rows.push(cartRow(key, quantity));
  }
  cartList.replaceChildren(...rows);
  countBadge.textContent = count;
  countBadge.hidden = count === 0;
  cartTrigger.setAttribute('aria-label', 'Открыть корзину, товаров ' + count);
  cartEmpty.hidden = count > 0;
  cartList.hidden = cartTotal.hidden = count === 0;
  cartTotal.textContent = 'Итого ' + rubles(total);
}

function changeQuantity(key, change) {
  const quantity = (cart.get(key) || 0) + change;
  if (quantity > 0) cart.set(key, quantity);
  else cart.delete(key);
  renderCart();
}

cartList.addEventListener('click', event => {
  const button = event.target.closest('button[data-delta]');
  if (!button) return;
  const {key, delta} = button.dataset;
  changeQuantity(key, Number(delta));
  const replacement = [...cartList.querySelectorAll('button')].find(item => item.dataset.key === key && item.dataset.delta === delta);
  (replacement || cartDialog.querySelector('.close')).focus();
});

const template = document.getElementById('product-template');
function makeCard(key) {
  const product = products[key];
  const card = template.content.firstElementChild.cloneNode(true);
  const photo = card.querySelector('.product-photo');
  photo.href = productUrl(product);
  photo.setAttribute('aria-label', product.name + ', карточка товара');
  photo.querySelector('img').src = 'assets/' + product.image;
  card.querySelector('.product-kind').textContent = product.kind;
  const name = card.querySelector('h3 a');
  name.textContent = product.name;
  name.href = productUrl(product);
  card.querySelector('.product-price').textContent = priceText(product);
  const action = card.querySelector('.card-action');
  if (product.variable) {
    action.href = productUrl(product);
    action.textContent = 'Выбрать';
  } else {
    const add = document.createElement('button');
    add.type = 'button';
    add.className = action.className;
    add.textContent = 'В корзину';
    add.setAttribute('aria-label', 'В корзину: ' + product.name);
    add.addEventListener('click', () => {
      changeQuantity(key, 1);
      announce(product.name + ' добавлен в корзину');
    });
    action.replaceWith(add);
  }
  return card;
}
for (const shelf of document.querySelectorAll('[data-products]')) {
  shelf.append(...shelf.dataset.products.split(' ').map(makeCard));
}

for (const trigger of document.querySelectorAll('[data-dialog]')) {
  trigger.addEventListener('click', () => {
    openMenu(null);
    document.getElementById(trigger.dataset.dialog).showModal();
  });
}

const searchDialog = document.getElementById('search-dialog');
const searchInput = document.getElementById('store-search');
const searchList = searchDialog.querySelector('.search-list');
const searchEmpty = searchDialog.querySelector('.search-empty');

function searchHit(product) {
  const item = document.createElement('li');
  item.className = 'search-hit';
  const link = document.createElement('a');
  link.href = productUrl(product);
  const image = document.createElement('img');
  image.alt = '';
  image.src = 'assets/' + product.image;
  const name = document.createElement('span');
  name.textContent = product.name;
  const price = document.createElement('span');
  price.textContent = priceText(product);
  link.append(image, name, price);
  item.append(link);
  return item;
}

function renderSearch() {
  const words = searchInput.value.trim().toLocaleLowerCase('ru').split(/\s+/);
  const matches = Object.values(products).filter(product => {
    const terms = [product.name, product.kind, product.keywords].join(' ').toLocaleLowerCase('ru');
    return words.every(word => terms.includes(word));
  });
  searchList.replaceChildren(...matches.map(searchHit));
  searchEmpty.hidden = matches.length > 0;
}
searchInput.addEventListener('input', renderSearch);
searchInput.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  event.stopPropagation();
  searchDialog.close();
});
renderSearch();
