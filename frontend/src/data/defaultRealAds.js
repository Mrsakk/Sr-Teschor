/**
 * Real Database Active Advertisements Snapshot
 * Used as high-reliability initial state and offline/Vercel fallback
 * when live API is connecting or temporarily blocked by browser mixed-content.
 */
export const DEFAULT_REAL_ADS = [
  {
    id: 18,
    title: 'Special Promotion - Sister Srey Artisan Café',
    placement: 'hero_banner',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
    link_url: '/businesses/sister-srey-cafe',
    price: '25.00',
    status: 'active',
    business: {
      id: 3,
      name: 'Sister Srey Artisan Café',
      slug: 'sister-srey-cafe',
      address: 'Pokambor Ave, Riverside, Siem Reap',
      rating: '4.9',
      short_description: 'Ethical cafe supporting local education in Siem Reap. Organic coffees & gourmet breakfast.',
      cover_image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 16,
    title: 'Angkor Heritage & Sunrise VIP Guided Tour 2026',
    placement: 'hero_banner',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
    link_url: '/packages',
    price: '50.00',
    status: 'active',
    business: {
      name: 'Sr-Teschor Official Partner',
      address: 'Angkor Wat Archaeological Park',
      rating: '5.0',
      short_description: 'Exclusive sunrise temple expedition with certified historical guides.'
    }
  },
  {
    id: 17,
    title: '20% OFF Gourmet Brunch & Specialty Coffee',
    placement: 'search_top',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    link_url: '/businesses/sister-srey-cafe',
    price: '25.00',
    status: 'active',
    business: {
      id: 3,
      name: 'Sister Srey Artisan Café',
      slug: 'sister-srey-cafe',
      address: 'Riverside, Old Market Area, Siem Reap',
      rating: '4.9',
      short_description: 'Handcrafted bakery, healthy smoothie bowls & freshly brewed single-origin coffee.'
    }
  },
  {
    id: 15,
    title: 'Special 25% Off Artisan Coffee & Pastries',
    placement: 'destination_sidebar',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
    link_url: '/businesses/sister-srey-cafe',
    price: '35.00',
    status: 'active',
    business: {
      id: 3,
      name: 'Sister Srey Artisan Café',
      slug: 'sister-srey-cafe',
      address: 'Old Market Bridge, Siem Reap',
      rating: '4.8',
      short_description: 'Relaxing riverside café atmosphere with high-speed WiFi and friendly local staff.'
    }
  },
  {
    id: 2,
    title: "Don't Miss Phare Circus — Cambodia's Must-See Evening Show!",
    placement: 'search_top',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    link_url: '/businesses/phare-circus',
    price: '40.00',
    status: 'active',
    business: {
      id: 2,
      name: 'Phare, The Cambodian Circus',
      slug: 'phare-circus',
      address: 'Ring Road, Siem Reap',
      rating: '5.0',
      short_description: 'Spectacular acrobatics, theatre and music telling Cambodian folk and modern stories.'
    }
  }
];
