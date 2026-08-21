<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Destination;
use App\Models\DestinationImage;
use App\Models\Business;
use App\Models\BusinessService;
use App\Models\Review;
use App\Models\Favorite;
use App\Models\Booking;
use App\Models\Promotion;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\TripPlan;
use App\Models\TripItem;
use App\Models\Notification;
use App\Models\Advertisement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@teschor.com'],
            [
                'name' => 'Tes Chor Administrator',
                'password' => Hash::make('password123'),
                'phone' => '+855 12 888 999',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $businessOwner1 = User::firstOrCreate(
            ['email' => 'owner@angkorresort.com'],
            [
                'name' => 'Sokha Ratanak (Heritage Hospitality)',
                'password' => Hash::make('password123'),
                'phone' => '+855 92 111 222',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                'role' => 'business',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $businessOwner2 = User::firstOrCreate(
            ['email' => 'owner@bayoncafe.com'],
            [
                'name' => 'Dara Chamnan (Angkor Artisans & Dining)',
                'password' => Hash::make('password123'),
                'phone' => '+855 88 333 444',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
                'role' => 'business',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $businessOwner3 = User::firstOrCreate(
            ['email' => 'owner@siemreaptours.com'],
            [
                'name' => 'Sophorn Travel Experiences',
                'password' => Hash::make('password123'),
                'phone' => '+855 77 555 666',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
                'role' => 'business',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $tourist1 = User::firstOrCreate(
            ['email' => 'emma.travels@gmail.com'],
            [
                'name' => 'Emma Watson',
                'password' => Hash::make('password123'),
                'phone' => '+44 7911 123456',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
                'role' => 'customer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $tourist2 = User::firstOrCreate(
            ['email' => 'sophea.khmer@gmail.com'],
            [
                'name' => 'Chan Sophea',
                'password' => Hash::make('password123'),
                'phone' => '+855 10 999 888',
                'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
                'role' => 'customer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // 2. Categories
        $categoriesData = [
            [
                'name' => 'Historical Temples',
                'slug' => 'historical-temples',
                'description' => 'Magnificent ancient Khmer empire temples and archaeological wonders.',
                'image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
                'icon' => 'Landmark',
                'type' => 'destination',
                'display_order' => 1,
            ],
            [
                'name' => 'Cultural & Heritage',
                'slug' => 'cultural-heritage',
                'description' => 'Living traditions, Khmer dance, silk carving, and local museums.',
                'image' => 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop&q=80',
                'icon' => 'Sparkles',
                'type' => 'all',
                'display_order' => 2,
            ],
            [
                'name' => 'Nature & Waterfalls',
                'slug' => 'nature-waterfalls',
                'description' => 'Sacred mountains, lush waterfalls, and river valley trails.',
                'image' => 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80',
                'icon' => 'Trees',
                'type' => 'destination',
                'display_order' => 3,
            ],
            [
                'name' => 'Floating Villages & Lakes',
                'slug' => 'floating-villages',
                'description' => 'Tonlé Sap ecosystem, stilted houses, and boat safaris.',
                'image' => 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
                'icon' => 'Sailboat',
                'type' => 'all',
                'display_order' => 4,
            ],
            [
                'name' => 'Hidden Gems',
                'slug' => 'hidden-gems',
                'description' => 'Secluded jungle ruins, serene monasteries, and off-the-beaten-path trails.',
                'image' => 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
                'icon' => 'Compass',
                'type' => 'destination',
                'display_order' => 5,
            ],
            [
                'name' => 'Hotels & Boutique Resorts',
                'slug' => 'hotels-resorts',
                'description' => 'Eco-luxury villas, tropical garden resorts, and charming heritage stays.',
                'image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
                'icon' => 'Hotel',
                'type' => 'business',
                'display_order' => 6,
            ],
            [
                'name' => 'Restaurants & Khmer Dining',
                'slug' => 'restaurants-dining',
                'description' => 'Authentic Amok, Lok Lak, royal Khmer recipes, and farm-to-table cuisine.',
                'image' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
                'icon' => 'Utensils',
                'type' => 'business',
                'display_order' => 7,
            ],
            [
                'name' => 'Artisan Cafés & Bakeries',
                'slug' => 'cafes-bakeries',
                'description' => 'Cambodian specialty coffee, organic brunch, and garden coffee spots.',
                'image' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
                'icon' => 'Coffee',
                'type' => 'business',
                'display_order' => 8,
            ],
            [
                'name' => 'Tours, Tuk Tuks & Guides',
                'slug' => 'tours-transportation',
                'description' => 'Certified temple tour guides, electric scooter rentals, and safari tuk tuks.',
                'image' => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
                'icon' => 'Car',
                'type' => 'business',
                'display_order' => 9,
            ],
            [
                'name' => 'Nightlife & Pub Street',
                'slug' => 'nightlife-markets',
                'description' => 'Vibrant evening markets, cocktail lounges, and live music venues.',
                'image' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
                'icon' => 'Moon',
                'type' => 'all',
                'display_order' => 10,
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['slug']] = Category::create($cat);
        }

        // 3. Destinations
        $destinationsData = [
            [
                'category_id' => $categories['historical-temples']->id,
                'created_by' => $admin->id,
                'name' => 'Angkor Wat',
                'khmer_name' => 'ប្រាសាទអង្គរវត្ត',
                'slug' => 'angkor-wat',
                'short_description' => 'The crown jewel of Khmer architecture and the largest religious monument in the world.',
                'description' => "Angkor Wat is the centerpiece of the UNESCO World Heritage Angkor Archaeological Park. Built in the early 12th century by King Suryavarman II, this massive stone masterpiece represents Mount Meru, home of the gods in Hindu cosmology. Marvel at the intricate bas-reliefs stretching hundreds of meters depicting the Churning of the Ocean of Milk, and witness the iconic sunrise casting golden reflections across the lotus ponds.",
                'address' => 'Angkor Archaeological Park, Siem Reap, Cambodia',
                'latitude' => 13.4125,
                'longitude' => 103.8670,
                'entrance_fee' => 37.00,
                'fee_notes' => 'Included in Angkor Park Pass ($37 1-day, $62 3-day, $72 7-day)',
                'opening_time' => '05:00:00',
                'closing_time' => '17:30:00',
                'best_time' => 'Sunrise (05:15 AM - 06:45 AM) & Late Afternoon',
                'facilities' => ['Parking Area', 'Restrooms', 'Information Center', 'Golf Cart Shuttle', 'Official Guides Available'],
                'rating' => 4.95,
                'review_count' => 1420,
                'views_count' => 18500,
                'is_featured' => true,
                'is_hidden_gem' => false,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'category_id' => $categories['historical-temples']->id,
                'created_by' => $admin->id,
                'name' => 'Bayon Temple',
                'khmer_name' => 'ប្រាសាទបាយ័ន',
                'slug' => 'bayon-temple',
                'short_description' => 'The enigmatic temple of 216 giant smiling stone faces in the heart of Angkor Thom.',
                'description' => "Bayon stands at the exact center of King Jayavarman VII's capital city, Angkor Thom. Renowned for its dramatic towers adorned with smiling, serene bodhisattva faces gazing in every direction, Bayon offers one of the most mysterious and photogenic experiences in Cambodia. Its extensive lower galleries feature vivid depictions of 12th-century naval battles, markets, and everyday Khmer life.",
                'address' => 'Angkor Thom, Siem Reap, Cambodia',
                'latitude' => 13.4413,
                'longitude' => 103.8588,
                'entrance_fee' => 0.00,
                'fee_notes' => 'Covered by Angkor Park Pass',
                'opening_time' => '07:30:00',
                'closing_time' => '17:30:00',
                'best_time' => 'Early morning or golden hour (04:00 PM)',
                'facilities' => ['Restrooms nearby', 'Tree shade rest points', 'Tour guide station'],
                'rating' => 4.90,
                'review_count' => 980,
                'views_count' => 14200,
                'is_featured' => true,
                'is_hidden_gem' => false,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1508672019048-805b876b67e2?w=1200&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'category_id' => $categories['historical-temples']->id,
                'created_by' => $admin->id,
                'name' => 'Ta Prohm (Tomb Raider Temple)',
                'khmer_name' => 'ប្រាសាទតាព្រហ្ម',
                'slug' => 'ta-prohm',
                'short_description' => 'Atmospheric temple intertwined with enormous silk-cotton and strangler fig tree roots.',
                'description' => "Left largely as it was found, Ta Prohm demonstrates the raw power of tropical nature reclaiming civilization. Vast tree root systems snake through stone courtyards and breach ancient corridors, creating an otherworldly, atmospheric wonderland popularized internationally by the movie Tomb Raider. Built in 1186 as a Buddhist monastery dedicated to King Jayavarman VII's mother.",
                'address' => 'Angkor Archaeological Park, Siem Reap, Cambodia',
                'latitude' => 13.4348,
                'longitude' => 103.8893,
                'entrance_fee' => 0.00,
                'fee_notes' => 'Covered by Angkor Park Pass',
                'opening_time' => '07:30:00',
                'closing_time' => '17:30:00',
                'best_time' => 'Mid-morning for dramatic sunbeams through foliage',
                'facilities' => ['Wooden boardwalk walkways', 'Restrooms', 'Eco souvenirs'],
                'rating' => 4.92,
                'review_count' => 1120,
                'views_count' => 16700,
                'is_featured' => true,
                'is_hidden_gem' => false,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'category_id' => $categories['historical-temples']->id,
                'created_by' => $admin->id,
                'name' => 'Banteay Srei (Citadel of Women)',
                'khmer_name' => 'ប្រាសាទបន្ទាយស្រី',
                'slug' => 'banteay-srei',
                'short_description' => 'Exquisite 10th-century pink sandstone temple with miniature relief carvings of unparalleled detail.',
                'description' => "Dedicated to Hindu god Shiva, Banteay Srei is celebrated as the jewel of Khmer classical art. Built from rare rose-pink sandstone that hardens with age, its lintels and pediments feature three-dimensional carvings depicting mythological scenes so delicate that local legend claims they could only have been carved by women's hands.",
                'address' => 'Banteay Srei District, 32km North of Siem Reap',
                'latitude' => 13.5989,
                'longitude' => 103.9630,
                'entrance_fee' => 0.00,
                'fee_notes' => 'Covered by Angkor Park Pass',
                'opening_time' => '07:30:00',
                'closing_time' => '17:00:00',
                'best_time' => 'Early morning for best pink sandstone glow',
                'facilities' => ['Visitor Interpretation Center', 'Clean Restrooms', 'Lotus Boat Rides', 'Cafés'],
                'rating' => 4.88,
                'review_count' => 640,
                'views_count' => 9300,
                'is_featured' => false,
                'is_hidden_gem' => false,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'category_id' => $categories['floating-villages']->id,
                'created_by' => $admin->id,
                'name' => 'Kampong Phluk Floating Village',
                'khmer_name' => 'ភូមិបណ្ដែតទឹកកំពង់ភ្លុក',
                'slug' => 'kampong-phluk',
                'short_description' => 'Authentic community of houses built on 8-meter stilts surrounded by tranquil flooded mangrove forests.',
                'description' => "Kampong Phluk is a commune of three villages built on tall stilts along the edge of Tonlé Sap, Southeast Asia's largest freshwater lake. During high water season, the village transforms into a floating wonderland where villagers travel by longtail wooden boat. Take a quiet canoe paddle through the submerged mangrove forest led by local women rowers.",
                'address' => 'Prasat Bakong District, Siem Reap',
                'latitude' => 13.2045,
                'longitude' => 103.9780,
                'entrance_fee' => 20.00,
                'fee_notes' => 'Boat ticket per person including mangrove canoe access',
                'opening_time' => '08:00:00',
                'closing_time' => '18:00:00',
                'best_time' => 'August to January for high water; Sunset cruise',
                'facilities' => ['Community boat pier', 'Floating restaurants', 'Local handicraft shops'],
                'rating' => 4.75,
                'review_count' => 480,
                'views_count' => 8900,
                'is_featured' => true,
                'is_hidden_gem' => false,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'category_id' => $categories['nature-waterfalls']->id,
                'created_by' => $admin->id,
                'name' => 'Phnom Kulen Sacred National Park',
                'khmer_name' => 'ឧទ្យានជាតិភ្នំគូលែន',
                'slug' => 'phnom-kulen',
                'short_description' => 'The birthplace of the Khmer Empire featuring sacred waterfalls and the River of a Thousand Lingas.',
                'description' => "Phnom Kulen is considered Cambodia's most sacred mountain. Here in 802 AD, King Jayavarman II proclaimed himself universal monarch. The park features cascading multi-tiered jungle waterfalls perfect for swimming, the 16th-century reclining Buddha carved atop a massive boulder at Preah Ang Thom, and the riverbed linga carvings at Kbal Spean.",
                'address' => 'Svay Leu District, 48km Northeast of Siem Reap',
                'latitude' => 13.6111,
                'longitude' => 104.1030,
                'entrance_fee' => 20.00,
                'fee_notes' => 'Separate Phnom Kulen park ticket',
                'opening_time' => '07:00:00',
                'closing_time' => '16:00:00',
                'best_time' => 'Year-round, morning ascent recommended',
                'facilities' => ['Waterfall swimming platforms', 'Food stalls', 'Local fruit market', 'Parking'],
                'rating' => 4.82,
                'review_count' => 530,
                'views_count' => 7800,
                'is_featured' => true,
                'is_hidden_gem' => false,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1200&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'category_id' => $categories['hidden-gems']->id,
                'created_by' => $admin->id,
                'name' => 'Beng Mealea Jungle Ruins',
                'khmer_name' => 'ប្រាសាទបេងមាលា',
                'slug' => 'beng-mealea',
                'short_description' => 'Massive untouched 12th-century temple engulfed in deep jungle foliage and giant creeping vines.',
                'description' => "Built to the same architectural layout as Angkor Wat, Beng Mealea remains almost entirely unrestored. Visitors traverse elevated wooden walkways over collapsed sandstone galleries, sprawling roots, and emerald moss carpets. It provides a thrilling, true explorer's adventure without the tour bus crowds.",
                'address' => 'Soutr Nikom District, 40km East of Siem Reap',
                'latitude' => 13.4758,
                'longitude' => 104.2389,
                'entrance_fee' => 0.00,
                'fee_notes' => 'Now included in Angkor Park Pass',
                'opening_time' => '07:30:00',
                'closing_time' => '17:00:00',
                'best_time' => 'Mid-day for cool jungle canopy exploration',
                'facilities' => ['Wooden walkways', 'Restrooms', 'Local iced coconut stalls'],
                'rating' => 4.86,
                'review_count' => 390,
                'views_count' => 6200,
                'is_featured' => false,
                'is_hidden_gem' => true,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
                ],
            ],
            [
                'category_id' => $categories['cultural-heritage']->id,
                'created_by' => $admin->id,
                'name' => 'Angkor National Museum',
                'khmer_name' => 'សារមន្ទីរជាតិអង្គរ',
                'slug' => 'angkor-national-museum',
                'short_description' => 'World-class interactive museum housing the Gallery of 1,000 Buddhas and Golden Era artifacts.',
                'description' => "Angkor National Museum is an ultra-modern cultural landmark that guides visitors through the grandeur of Khmer civilization. Featuring 8 thematic galleries, multimedia touchscreens, cinematic presentations, and thousands of recovered sculptures, it provides invaluable historical context before exploring the temple ruins.",
                'address' => '968 Charles de Gaulle Blvd, Siem Reap',
                'latitude' => 13.3667,
                'longitude' => 103.8611,
                'entrance_fee' => 12.00,
                'fee_notes' => '$12 adult, $3 audio guide (available in 10 languages)',
                'opening_time' => '08:30:00',
                'closing_time' => '18:00:00',
                'best_time' => 'Air-conditioned midday escape (11:00 AM - 02:00 PM)',
                'facilities' => ['Air Conditioning', 'Multilingual Audio Guides', 'Café', 'Bookshop', 'Luggage Storage'],
                'rating' => 4.70,
                'review_count' => 710,
                'views_count' => 9100,
                'is_featured' => false,
                'is_hidden_gem' => false,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&auto=format&fit=crop&q=80',
                ],
            ],
        ];

        $destinations = [];
        foreach ($destinationsData as $dest) {
            $images = $dest['images'];
            unset($dest['images']);
            $destination = Destination::create($dest);
            $destinations[$dest['slug']] = $destination;

            foreach ($images as $index => $imgUrl) {
                DestinationImage::create([
                    'destination_id' => $destination->id,
                    'image' => $imgUrl,
                    'alt_text' => $destination->name . ' photo ' . ($index + 1),
                    'is_primary' => $index === 0,
                    'display_order' => $index,
                ]);
            }
        }

        // 4. Businesses
        $businessesData = [
            [
                'owner_id' => $businessOwner1->id,
                'category_id' => $categories['hotels-resorts']->id,
                'name' => 'Heritage Suites Resort & Spa',
                'khmer_name' => 'រីសត ហេវីថេជ ស៊្វីត',
                'slug' => 'heritage-suites-resort',
                'short_description' => 'Boutique eco-luxury resort surrounded by tropical gardens with private plunge pool villas.',
                'description' => "Heritage Suites Resort & Spa is a boutique retreat combining French colonial elegance with traditional Khmer touches. Located just 15 minutes from Angkor Wat and 5 minutes from Siem Reap town center, the resort offers private open-air steam showers, an emerald swimming pool, signature Khmer herb spas, and candlelit jazz dinners.",
                'address' => 'Wat Polanka, Phum Slokram, Siem Reap',
                'latitude' => 13.3712,
                'longitude' => 103.8645,
                'phone' => '+855 63 969 000',
                'email' => 'booking@heritagesuitesresort.com',
                'website' => 'https://heritagesuitesresort.com',
                'logo' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
                'cover_image' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
                ],
                'price_range' => '$$$',
                'opening_hours' => '24 Hours / 7 Days',
                'rating' => 4.90,
                'review_count' => 184,
                'views_count' => 5400,
                'is_featured' => true,
                'subscription_plan' => 'premium',
                'verification_status' => 'approved',
                'status' => 'active',
            ],
            [
                'owner_id' => $businessOwner2->id,
                'category_id' => $categories['restaurants-dining']->id,
                'name' => 'Haven Restaurant & Training School',
                'khmer_name' => 'ភោជនីយដ្ឋាន ហាវែន',
                'slug' => 'haven-restaurant',
                'short_description' => 'Acclaimed social enterprise serving gourmet Khmer dishes, fresh curries, and European classics.',
                'description' => "HAVEN is an ethical culinary training restaurant creating life-changing vocational opportunities for young adult Cambodians from orphanages and rural communities. Set in a charming tropical courtyard, guests savor signature Fish Amok served in banana leaves, crispy vegetable spring rolls, lemongrass cocktails, and vegan specialties.",
                'address' => 'Chocolate Road, Wat Damnak Area, Siem Reap',
                'latitude' => 13.3534,
                'longitude' => 103.8582,
                'phone' => '+855 78 342 404',
                'email' => 'eat@havencambodia.com',
                'website' => 'https://havencambodia.com',
                'logo' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
                'cover_image' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
                ],
                'price_range' => '$$',
                'opening_hours' => '11:30 AM - 02:30 PM & 05:30 PM - 10:00 PM (Closed Sun/Mon)',
                'rating' => 4.95,
                'review_count' => 340,
                'views_count' => 6900,
                'is_featured' => true,
                'subscription_plan' => 'pro',
                'verification_status' => 'approved',
                'status' => 'active',
            ],
            [
                'owner_id' => $businessOwner2->id,
                'category_id' => $categories['cafes-bakeries']->id,
                'name' => 'Sister Srey Artisan Café',
                'khmer_name' => 'ហាងកាហ្វេ ស៊ីស្ទ័រ ស្រី',
                'slug' => 'sister-srey-cafe',
                'short_description' => 'Riverside social enterprise serving organic espresso, smoothie bowls, and gourmet gluten-free bakes.',
                'description' => "Sister Srey Café is a vibrant riverside meeting point founded to support Khmer youth education and mine-clearing efforts. Enjoy world-class espresso drinks made from locally sourced beans, avocado sourdough toast, tropical açai bowls, and house-made kombucha in a warm, artistic setting along the Siem Reap River.",
                'address' => '9 Pokambor Ave, Riverside, Old Market Area, Siem Reap',
                'latitude' => 13.3562,
                'longitude' => 103.8560,
                'phone' => '+855 97 723 8001',
                'email' => 'hello@sistersreycafe.com',
                'website' => 'https://sistersreycafe.com',
                'logo' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
                'cover_image' => 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
                ],
                'price_range' => '$',
                'opening_hours' => '07:00 AM - 05:00 PM Daily',
                'rating' => 4.88,
                'review_count' => 412,
                'views_count' => 7400,
                'is_featured' => true,
                'subscription_plan' => 'pro',
                'verification_status' => 'approved',
                'status' => 'active',
            ],
            [
                'owner_id' => $businessOwner3->id,
                'category_id' => $categories['tours-transportation']->id,
                'name' => 'Angkor Sunrise Safari & Guide Services',
                'khmer_name' => 'សេវាកម្មមគ្គុទ្ទេសក៍ទេសចរណ៍អង្គរ',
                'slug' => 'angkor-sunrise-safari',
                'short_description' => 'Licensed private guides, luxury electric tuk tuks, and custom photography expeditions.',
                'description' => "Experience the magic of Angkor with official Ministry of Tourism licensed guides. We specialize in sunrise temple photography, off-the-beaten-track ruins, countryside cycling tours, and private cultural excursions with chilled fresh towels and bottled spring water.",
                'address' => 'Sivatha Road, Central Siem Reap',
                'latitude' => 13.3601,
                'longitude' => 103.8550,
                'phone' => '+855 12 777 888',
                'email' => 'tours@angkorsunrisesafari.com',
                'website' => 'https://angkorsunrisesafari.com',
                'logo' => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&auto=format&fit=crop&q=80',
                'cover_image' => 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
                ],
                'price_range' => '$$',
                'opening_hours' => '05:00 AM - 08:00 PM Daily',
                'rating' => 4.96,
                'review_count' => 295,
                'views_count' => 6100,
                'is_featured' => true,
                'subscription_plan' => 'premium',
                'verification_status' => 'approved',
                'status' => 'active',
            ],
            [
                'owner_id' => $businessOwner3->id,
                'category_id' => $categories['cultural-heritage']->id,
                'name' => 'Phare, The Cambodian Circus',
                'khmer_name' => 'ហ្វារ សៀកកម្ពុជា',
                'slug' => 'phare-cambodian-circus',
                'short_description' => 'World-famous theatrical circus blending high-energy acrobatics, theater, music, and Khmer folklore.',
                'description' => "Uniquely Cambodian and daringly modern, Phare artists use theater, music, dance and modern circus arts to tell uniquely Cambodian historical and social stories. Performers are graduates from the Phare Ponleu Selpak vocational training center in Battambang.",
                'address' => 'Ring Road, south of Sok San Road, Siem Reap',
                'latitude' => 13.3510,
                'longitude' => 103.8475,
                'phone' => '+855 15 499 480',
                'email' => 'reservation@pharecircus.org',
                'website' => 'https://pharecircus.org',
                'logo' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
                'cover_image' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
                ],
                'price_range' => '$$',
                'opening_hours' => 'Evening Shows at 08:00 PM Daily',
                'rating' => 4.97,
                'review_count' => 880,
                'views_count' => 12400,
                'is_featured' => true,
                'subscription_plan' => 'premium',
                'verification_status' => 'approved',
                'status' => 'active',
            ],
            [
                'owner_id' => $businessOwner1->id,
                'category_id' => $categories['hotels-resorts']->id,
                'name' => 'Viroth\'s Hotel & Urban Sanctuary',
                'khmer_name' => 'សណ្ឋាគារ វីរោធ',
                'slug' => 'viroths-hotel',
                'short_description' => 'Award-winning 1950s retro-chic design hotel with lush 20-meter vertical gardens.',
                'description' => "Recognized repeatedly by TripAdvisor as one of the world's top boutique hotels, Viroth's combines 1950s modernist aesthetics with lush green vertical gardens, a 20-meter terrazzo lap pool, luxurious spa facilities, and an open-air fine dining restaurant.",
                'address' => '246 Wat Bo Village, Siem Reap',
                'latitude' => 13.3570,
                'longitude' => 103.8610,
                'phone' => '+855 63 761 010',
                'email' => 'info@viroth-hotel.com',
                'website' => 'https://viroth-hotel.com',
                'logo' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
                'cover_image' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
                ],
                'price_range' => '$$$$',
                'opening_hours' => '24 Hours / 7 Days',
                'rating' => 4.98,
                'review_count' => 420,
                'views_count' => 8600,
                'is_featured' => true,
                'subscription_plan' => 'premium',
                'verification_status' => 'approved',
                'status' => 'active',
            ],
        ];

        $businesses = [];
        foreach ($businessesData as $bizData) {
            $biz = Business::create($bizData);
            $businesses[$bizData['slug']] = $biz;
        }

        // 5. Business Services
        $servicesData = [
            [
                'business_id' => $businesses['heritage-suites-resort']->id,
                'name' => 'Heritage Plunge Pool Villa (Per Night)',
                'description' => 'Spacious 120sqm private villa with private plunge pool, daily breakfast, and airport transfer.',
                'price' => 165.00,
                'duration' => '1 Night',
                'status' => 'active',
            ],
            [
                'business_id' => $businesses['heritage-suites-resort']->id,
                'name' => 'Royal Khmer Herbal Spa Package (90 Mins)',
                'description' => 'Traditional hot herbal compress massage followed by natural jasmine aromatherapy oil therapy.',
                'price' => 45.00,
                'duration' => '90 Minutes',
                'status' => 'active',
            ],
            [
                'business_id' => $businesses['haven-restaurant']->id,
                'name' => 'Royal Khmer Tasting Menu (4 Courses for 2 Persons)',
                'description' => 'Banana Blossom Salad, Signature Fish Amok, Lok Lak Beef Tenderloin, and Sticky Rice Mango Dessert.',
                'price' => 38.00,
                'duration' => '2 Hours',
                'status' => 'active',
            ],
            [
                'business_id' => $businesses['sister-srey-cafe']->id,
                'name' => 'Artisan Coffee Tasting & Organic Brunch Combo',
                'description' => 'Selection of 2 specialty coffees, avocado smash sourdough, and açai bowl of choice.',
                'price' => 12.50,
                'duration' => '1 Hour',
                'status' => 'active',
            ],
            [
                'business_id' => $businesses['angkor-sunrise-safari']->id,
                'name' => 'Angkor Wat Sunrise & Grand Circuit Guided Tour',
                'description' => 'Full-day tour including Angkor Wat sunrise, Bayon, Ta Prohm, private air-conditioned tuk tuk, chilled drinks, and licensed guide.',
                'price' => 35.00,
                'duration' => 'Full Day (8 Hours)',
                'status' => 'active',
            ],
            [
                'business_id' => $businesses['phare-cambodian-circus']->id,
                'name' => 'VIP Center Section Ticket & Souvenir Gift',
                'description' => 'Front and center seating with complimentary soft drink and gift bag from Phare boutique.',
                'price' => 38.00,
                'duration' => '75 Minutes',
                'status' => 'active',
            ],
        ];

        $services = [];
        foreach ($servicesData as $serv) {
            $services[] = BusinessService::create($serv);
        }

        // 6. Promotions
        Promotion::create([
            'business_id' => $businesses['heritage-suites-resort']->id,
            'title' => 'Green Season Villa Escape — 25% OFF',
            'description' => 'Enjoy 25% off all pool villas including free 60-minute spa massage and daily gourmet breakfast.',
            'discount' => '25% OFF',
            'promo_code' => 'GREEN25',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonths(2)->toDateString(),
            'image' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
            'status' => 'active',
        ]);

        Promotion::create([
            'business_id' => $businesses['haven-restaurant']->id,
            'title' => 'Complimentary Lemongrass Mocktail with Any Main Course',
            'description' => 'Show your Tes Chor app upon ordering to receive a complimentary signature passionfruit lemongrass mocktail.',
            'discount' => 'Free Drink',
            'promo_code' => 'TESHAVEN',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonths(1)->toDateString(),
            'image' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
            'status' => 'active',
        ]);

        Promotion::create([
            'business_id' => $businesses['angkor-sunrise-safari']->id,
            'title' => 'Early Bird 15% Discount on Private Sunrise Tours',
            'description' => 'Book your private Angkor Wat sunrise safari 3 days in advance and get 15% off total booking.',
            'discount' => '15% OFF',
            'promo_code' => 'SUNRISE15',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonths(3)->toDateString(),
            'image' => 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
            'status' => 'active',
        ]);

        // 7. Subscriptions
        Subscription::create([
            'business_id' => $businesses['heritage-suites-resort']->id,
            'plan' => 'premium',
            'price' => 20.00,
            'billing_cycle' => 'monthly',
            'start_date' => now()->subDays(10)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'status' => 'active',
        ]);

        Subscription::create([
            'business_id' => $businesses['haven-restaurant']->id,
            'plan' => 'pro',
            'price' => 10.00,
            'billing_cycle' => 'monthly',
            'start_date' => now()->subDays(15)->toDateString(),
            'end_date' => now()->addDays(15)->toDateString(),
            'status' => 'active',
        ]);

        Subscription::create([
            'business_id' => $businesses['angkor-sunrise-safari']->id,
            'plan' => 'premium',
            'price' => 20.00,
            'billing_cycle' => 'monthly',
            'start_date' => now()->subDays(5)->toDateString(),
            'end_date' => now()->addDays(25)->toDateString(),
            'status' => 'active',
        ]);

        // 8. Reviews
        Review::create([
            'user_id' => $tourist1->id,
            'reviewable_type' => Destination::class,
            'reviewable_id' => $destinations['angkor-wat']->id,
            'rating' => 5,
            'comment' => "Standing before the five lotus towers of Angkor Wat at sunrise was one of the most emotional travel moments of my life. Highly recommend entering via the eastern gate for fewer crowds before heading to the reflection ponds!",
            'status' => 'approved',
            'created_at' => now()->subDays(3),
        ]);

        Review::create([
            'user_id' => $tourist2->id,
            'reviewable_type' => Destination::class,
            'reviewable_id' => $destinations['ta-prohm']->id,
            'rating' => 5,
            'comment' => "The ancient trees growing over the stone doorways are unbelievable in real life! Make sure to hire a local guide who knows where the quiet hidden courtyards are.",
            'status' => 'approved',
            'created_at' => now()->subDays(5),
        ]);

        Review::create([
            'user_id' => $tourist1->id,
            'reviewable_type' => Business::class,
            'reviewable_id' => $businesses['haven-restaurant']->id,
            'rating' => 5,
            'comment' => "Hands down the best Fish Amok in Siem Reap! The staff is so warm and inspiring, and the garden setting is wonderful. You must book a table in advance.",
            'reply' => "Thank you so much Emma! We are so glad you enjoyed our Fish Amok and our trainee team loved serving you. Hope to welcome you again on your next trip to Siem Reap!",
            'reply_date' => now()->subDays(1),
            'status' => 'approved',
            'created_at' => now()->subDays(2),
        ]);

        Review::create([
            'user_id' => $tourist2->id,
            'reviewable_type' => Business::class,
            'reviewable_id' => $businesses['angkor-sunrise-safari']->id,
            'rating' => 5,
            'comment' => "Our guide Sophorn was fantastic! Incredibly knowledgeable about Khmer history and took stunning photos for our family.",
            'reply' => "Thank you Sophea! It was our pleasure guiding you and your family around our ancestral temples.",
            'reply_date' => now()->subDays(2),
            'status' => 'approved',
            'created_at' => now()->subDays(4),
        ]);

        // 9. Favorites
        Favorite::create([
            'user_id' => $tourist1->id,
            'favoritable_type' => Destination::class,
            'favoritable_id' => $destinations['angkor-wat']->id,
        ]);
        Favorite::create([
            'user_id' => $tourist1->id,
            'favoritable_type' => Destination::class,
            'favoritable_id' => $destinations['ta-prohm']->id,
        ]);
        Favorite::create([
            'user_id' => $tourist1->id,
            'favoritable_type' => Business::class,
            'favoritable_id' => $businesses['haven-restaurant']->id,
        ]);
        Favorite::create([
            'user_id' => $tourist1->id,
            'favoritable_type' => Business::class,
            'favoritable_id' => $businesses['phare-cambodian-circus']->id,
        ]);

        // 10. Bookings
        Booking::create([
            'booking_reference' => 'TC-' . strtoupper(Str::random(8)),
            'user_id' => $tourist1->id,
            'business_id' => $businesses['angkor-sunrise-safari']->id,
            'service_id' => $services[4]->id, // Guided tour
            'booking_date' => now()->addDays(3)->toDateString(),
            'booking_time' => '05:00:00',
            'guests' => 2,
            'total_amount' => 70.00,
            'commission_amount' => 7.00,
            'contact_name' => 'Emma Watson',
            'contact_phone' => '+44 7911 123456',
            'contact_email' => 'emma.travels@gmail.com',
            'notes' => 'Please bring photography tripod assistance if possible.',
            'business_response_notes' => 'Confirmed! We will pick you up at hotel lobby at 04:45 AM.',
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        Booking::create([
            'booking_reference' => 'TC-' . strtoupper(Str::random(8)),
            'user_id' => $tourist2->id,
            'business_id' => $businesses['haven-restaurant']->id,
            'service_id' => $services[2]->id, // Tasting menu
            'booking_date' => now()->addDays(2)->toDateString(),
            'booking_time' => '19:00:00',
            'guests' => 2,
            'total_amount' => 38.00,
            'commission_amount' => 3.80,
            'contact_name' => 'Chan Sophea',
            'contact_phone' => '+855 10 999 888',
            'contact_email' => 'sophea.khmer@gmail.com',
            'notes' => 'Celebration dinner — outdoor garden table requested.',
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        // 11. Trip Plans
        $tripPlan = TripPlan::create([
            'user_id' => $tourist1->id,
            'name' => 'My 3-Day Siem Reap Heritage Adventure',
            'description' => 'A curated 3-day itinerary covering ancient temples, floating villages, circus arts, and organic Khmer cuisine.',
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'is_public' => true,
        ]);

        TripItem::create([
            'trip_plan_id' => $tripPlan->id,
            'destination_id' => $destinations['angkor-wat']->id,
            'day_number' => 1,
            'visit_order' => 1,
            'visit_date' => now()->addDays(3)->toDateString(),
            'notes' => 'Sunrise at Angkor Wat reflections pond',
            'estimated_time' => '3 Hours',
            'estimated_distance' => '6 km from town',
        ]);

        TripItem::create([
            'trip_plan_id' => $tripPlan->id,
            'destination_id' => $destinations['bayon-temple']->id,
            'day_number' => 1,
            'visit_order' => 2,
            'visit_date' => now()->addDays(3)->toDateString(),
            'notes' => 'Explore 216 smiling bodhisattva faces',
            'estimated_time' => '2 Hours',
            'estimated_distance' => '3 km from Angkor Wat',
        ]);

        TripItem::create([
            'trip_plan_id' => $tripPlan->id,
            'business_id' => $businesses['haven-restaurant']->id,
            'day_number' => 1,
            'visit_order' => 3,
            'visit_date' => now()->addDays(3)->toDateString(),
            'notes' => 'Dinner and refreshing cocktail at Haven',
            'estimated_time' => '2 Hours',
            'estimated_distance' => '7 km from Angkor Park',
        ]);

        TripItem::create([
            'trip_plan_id' => $tripPlan->id,
            'destination_id' => $destinations['ta-prohm']->id,
            'day_number' => 2,
            'visit_order' => 1,
            'visit_date' => now()->addDays(4)->toDateString(),
            'notes' => 'Tomb Raider jungle temple morning exploration',
            'estimated_time' => '2.5 Hours',
            'estimated_distance' => '8 km from town',
        ]);

        TripItem::create([
            'trip_plan_id' => $tripPlan->id,
            'destination_id' => $destinations['kampong-phluk']->id,
            'day_number' => 2,
            'visit_order' => 2,
            'visit_date' => now()->addDays(4)->toDateString(),
            'notes' => 'Afternoon sunset boat cruise in stilted village',
            'estimated_time' => '3 Hours',
            'estimated_distance' => '28 km from town',
        ]);

        TripItem::create([
            'trip_plan_id' => $tripPlan->id,
            'business_id' => $businesses['phare-cambodian-circus']->id,
            'day_number' => 2,
            'visit_order' => 3,
            'visit_date' => now()->addDays(4)->toDateString(),
            'notes' => 'Evening 8:00 PM circus performance',
            'estimated_time' => '1.5 Hours',
            'estimated_distance' => '2 km from town',
        ]);

        // 12. Payments (Revenue records)
        Payment::create([
            'user_id' => $businessOwner1->id,
            'business_id' => $businesses['heritage-suites-resort']->id,
            'amount' => 20.00,
            'payment_method' => 'ABA Payway',
            'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
            'type' => 'subscription',
            'status' => 'completed',
            'description' => 'Premium Plan Subscription (1 Month)',
            'created_at' => now()->subDays(10),
        ]);

        Payment::create([
            'user_id' => $businessOwner2->id,
            'business_id' => $businesses['haven-restaurant']->id,
            'amount' => 10.00,
            'payment_method' => 'ABA Payway',
            'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
            'type' => 'subscription',
            'status' => 'completed',
            'description' => 'Pro Plan Subscription (1 Month)',
            'created_at' => now()->subDays(15),
        ]);

        Payment::create([
            'user_id' => $businessOwner3->id,
            'business_id' => $businesses['angkor-sunrise-safari']->id,
            'amount' => 20.00,
            'payment_method' => 'Credit Card',
            'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
            'type' => 'subscription',
            'status' => 'completed',
            'description' => 'Premium Plan Subscription (1 Month)',
            'created_at' => now()->subDays(5),
        ]);

        Payment::create([
            'user_id' => $tourist1->id,
            'business_id' => $businesses['angkor-sunrise-safari']->id,
            'amount' => 7.00,
            'payment_method' => 'ABA Payway',
            'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
            'type' => 'booking_commission',
            'status' => 'completed',
            'description' => '10% Platform Commission for Booking #TC-1',
            'created_at' => now()->subDays(1),
        ]);

        Payment::create([
            'user_id' => $businessOwner1->id,
            'business_id' => $businesses['heritage-suites-resort']->id,
            'amount' => 35.00,
            'payment_method' => 'ABA Payway',
            'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
            'type' => 'advertisement',
            'status' => 'completed',
            'description' => 'Homepage Hero Banner Advertisement Placement',
            'created_at' => now()->subDays(7),
        ]);

        // 13. Advertisements
        Advertisement::create([
            'business_id' => $businesses['heritage-suites-resort']->id,
            'title' => 'Experience Luxury Villas near Angkor Wat — Book Now with Heritage Suites',
            'image' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
            'link_url' => '/businesses/heritage-suites-resort',
            'placement' => 'hero_banner',
            'impressions' => 3420,
            'clicks' => 215,
            'price' => 35.00,
            'start_date' => now()->subDays(7)->toDateString(),
            'end_date' => now()->addDays(23)->toDateString(),
            'status' => 'active',
        ]);

        Advertisement::create([
            'business_id' => $businesses['phare-cambodian-circus']->id,
            'title' => 'Don\'t Miss Phare Circus — Cambodia\'s Must-See Evening Show!',
            'image' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
            'link_url' => '/businesses/phare-cambodian-circus',
            'placement' => 'search_top',
            'impressions' => 1950,
            'clicks' => 140,
            'price' => 25.00,
            'start_date' => now()->subDays(3)->toDateString(),
            'end_date' => now()->addDays(27)->toDateString(),
            'status' => 'active',
        ]);

        // 14. Notifications
        Notification::create([
            'user_id' => $tourist1->id,
            'title' => 'Booking Confirmed!',
            'message' => 'Your Angkor Wat Sunrise Guided Tour with Angkor Sunrise Safari has been confirmed.',
            'type' => 'booking',
            'link' => '/bookings',
        ]);

        Notification::create([
            'user_id' => $businessOwner2->id,
            'title' => 'New Review Received',
            'message' => 'Emma Watson gave Haven Restaurant 5 stars: "Hands down the best Fish Amok in Siem Reap!"',
            'type' => 'review',
            'link' => '/business/dashboard',
        ]);

        Notification::create([
            'user_id' => $admin->id,
            'title' => 'New Booking Activity',
            'message' => 'Booking reference #TC-1 generated $7.00 platform commission.',
            'type' => 'system',
            'link' => '/admin/revenue',
        ]);

        // 15. Roles and Permissions
        $superAdminRole = \App\Models\Role::create([
            'name' => 'super_admin',
            'display_name' => 'Super Administrator',
            'description' => 'Full administrative access across all modules, finances, and system settings.',
        ]);

        $contentAdminRole = \App\Models\Role::create([
            'name' => 'content_admin',
            'display_name' => 'Content Administrator',
            'description' => 'Can manage destinations, categories, reviews, and media library.',
        ]);

        $businessAdminRole = \App\Models\Role::create([
            'name' => 'business_admin',
            'display_name' => 'Business Administrator',
            'description' => 'Can verify businesses, review promotions, and manage partner listings.',
        ]);

        $financeAdminRole = \App\Models\Role::create([
            'name' => 'finance_admin',
            'display_name' => 'Finance Administrator',
            'description' => 'Can manage subscriptions, platform payments, commissions, and revenue analytics.',
        ]);

        $supportAdminRole = \App\Models\Role::create([
            'name' => 'support_admin',
            'display_name' => 'Support Administrator',
            'description' => 'Can manage users, investigate reports, handle complaints, and dispatch notifications.',
        ]);

        $permissionsList = [
            ['name' => 'users.view', 'group' => 'users', 'display_name' => 'View Users'],
            ['name' => 'users.create', 'group' => 'users', 'display_name' => 'Create Users'],
            ['name' => 'users.edit', 'group' => 'users', 'display_name' => 'Edit Users'],
            ['name' => 'users.delete', 'group' => 'users', 'display_name' => 'Delete / Block Users'],
            ['name' => 'businesses.view', 'group' => 'businesses', 'display_name' => 'View Businesses'],
            ['name' => 'businesses.approve', 'group' => 'businesses', 'display_name' => 'Approve / Reject Businesses'],
            ['name' => 'businesses.edit', 'group' => 'businesses', 'display_name' => 'Edit Businesses'],
            ['name' => 'businesses.delete', 'group' => 'businesses', 'display_name' => 'Delete Businesses'],
            ['name' => 'destinations.view', 'group' => 'destinations', 'display_name' => 'View Destinations'],
            ['name' => 'destinations.create', 'group' => 'destinations', 'display_name' => 'Create Destinations'],
            ['name' => 'destinations.edit', 'group' => 'destinations', 'display_name' => 'Edit Destinations'],
            ['name' => 'destinations.delete', 'group' => 'destinations', 'display_name' => 'Delete Destinations'],
            ['name' => 'reviews.view', 'group' => 'reviews', 'display_name' => 'View Reviews'],
            ['name' => 'reviews.moderate', 'group' => 'reviews', 'display_name' => 'Moderate / Hide Reviews'],
            ['name' => 'reviews.delete', 'group' => 'reviews', 'display_name' => 'Delete Reviews'],
            ['name' => 'bookings.view', 'group' => 'bookings', 'display_name' => 'View Bookings'],
            ['name' => 'bookings.manage', 'group' => 'bookings', 'display_name' => 'Manage Bookings'],
            ['name' => 'promotions.view', 'group' => 'promotions', 'display_name' => 'View Promotions'],
            ['name' => 'promotions.approve', 'group' => 'promotions', 'display_name' => 'Approve / Reject Promotions'],
            ['name' => 'advertisements.view', 'group' => 'advertisements', 'display_name' => 'View Advertisements'],
            ['name' => 'advertisements.manage', 'group' => 'advertisements', 'display_name' => 'Manage Advertisements'],
            ['name' => 'subscriptions.view', 'group' => 'subscriptions', 'display_name' => 'View Subscriptions'],
            ['name' => 'subscriptions.manage', 'group' => 'subscriptions', 'display_name' => 'Manage Subscriptions'],
            ['name' => 'payments.view', 'group' => 'payments', 'display_name' => 'View Payments'],
            ['name' => 'revenue.view', 'group' => 'revenue', 'display_name' => 'View Financial Revenue'],
            ['name' => 'analytics.view', 'group' => 'analytics', 'display_name' => 'View Analytics'],
            ['name' => 'reports.view', 'group' => 'reports', 'display_name' => 'View Reports'],
            ['name' => 'reports.manage', 'group' => 'reports', 'display_name' => 'Resolve / Investigate Reports'],
            ['name' => 'notifications.create', 'group' => 'notifications', 'display_name' => 'Send Broadcast Notifications'],
            ['name' => 'settings.manage', 'group' => 'settings', 'display_name' => 'Manage System Settings'],
        ];

        foreach ($permissionsList as $p) {
            $perm = \App\Models\Permission::create($p);
            $superAdminRole->permissions()->attach($perm->id);
        }

        $admin->update(['admin_role' => 'super_admin']);

        // Create secondary test admins
        User::create([
            'name' => 'Sok Dara (Content Manager)',
            'email' => 'content@teschor.com',
            'password' => Hash::make('password123'),
            'phone' => '+855 12 444 555',
            'role' => 'admin',
            'admin_role' => 'content_admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Rithy Finance',
            'email' => 'finance@teschor.com',
            'password' => Hash::make('password123'),
            'phone' => '+855 12 777 666',
            'role' => 'admin',
            'admin_role' => 'finance_admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 16. System Settings
        $settingsData = [
            ['key' => 'site_name', 'value' => 'Tes Chor', 'group' => 'general', 'description' => 'Platform display name'],
            ['key' => 'site_tagline', 'value' => 'Discover More. Travel Better.', 'group' => 'general', 'description' => 'Platform headline'],
            ['key' => 'site_tagline_khmer', 'value' => 'ស្វែងរកកន្លែងថ្មីៗ និងបទពិសោធន៍ល្អៗនៅសៀមរាប', 'group' => 'general', 'description' => 'Khmer tagline'],
            ['key' => 'contact_email', 'value' => 'contact@teschor.com', 'group' => 'general', 'description' => 'Public contact email address'],
            ['key' => 'contact_phone', 'value' => '+855 63 969 888', 'group' => 'general', 'description' => 'Customer support hotline'],
            ['key' => 'default_currency', 'value' => 'USD', 'group' => 'general', 'description' => 'Default platform currency (USD / KHR)'],
            ['key' => 'khr_exchange_rate', 'value' => '4100', 'group' => 'general', 'description' => 'KHR to USD exchange rate'],
            ['key' => 'default_map_lat', 'value' => '13.4125', 'group' => 'general', 'description' => 'Default map center latitude (Siem Reap)'],
            ['key' => 'default_map_lng', 'value' => '103.8670', 'group' => 'general', 'description' => 'Default map center longitude'],
            ['key' => 'facebook_url', 'value' => 'https://facebook.com/teschor.cambodia', 'group' => 'social', 'description' => 'Facebook page link'],
            ['key' => 'instagram_url', 'value' => 'https://instagram.com/teschor_official', 'group' => 'social', 'description' => 'Instagram profile'],
            ['key' => 'telegram_channel', 'value' => 'https://t.me/teschor_siemreap', 'group' => 'social', 'description' => 'Telegram community channel'],
            ['key' => 'tiktok_url', 'value' => 'https://tiktok.com/@teschor', 'group' => 'social', 'description' => 'TikTok account'],
            ['key' => 'smtp_host', 'value' => 'smtp.mailtrap.io', 'group' => 'email', 'description' => 'SMTP mail server host'],
            ['key' => 'smtp_port', 'value' => '2525', 'group' => 'email', 'description' => 'SMTP port'],
            ['key' => 'smtp_from_address', 'value' => 'noreply@teschor.com', 'group' => 'email', 'description' => 'From email header'],
            ['key' => 'maintenance_mode', 'value' => '0', 'group' => 'maintenance', 'description' => 'Enable or disable maintenance mode for public site'],
            ['key' => 'maintenance_message', 'value' => 'Tes Chor is currently undergoing scheduled platform upgrades. We will be back online shortly.', 'group' => 'maintenance', 'description' => 'Notice banner during maintenance'],
        ];

        foreach ($settingsData as $set) {
            \App\Models\Setting::create($set);
        }

        // 17. Reports
        \App\Models\Report::create([
            'user_id' => $tourist1->id,
            'reportable_type' => 'destination',
            'reportable_id' => $destinations['angkor-wat']->id,
            'report_type' => 'incorrect_info',
            'reason' => 'Ticket office moved to Angkor Panorama Museum location on 60m Road, please update note.',
            'status' => 'resolved',
            'admin_notes' => 'Verified and updated fee instructions.',
            'resolved_by' => $admin->id,
        ]);

        \App\Models\Report::create([
            'user_id' => $tourist2->id,
            'reportable_type' => 'review',
            'reportable_id' => 1,
            'report_type' => 'fake_review',
            'reason' => 'Suspected spam review mentioning off-platform booking link.',
            'status' => 'investigating',
            'admin_notes' => 'Under review by content moderator.',
        ]);

        \App\Models\Report::create([
            'user_id' => $tourist1->id,
            'reportable_type' => 'business',
            'reportable_id' => $businesses['haven-restaurant']->id,
            'report_type' => 'other',
            'reason' => 'Menu prices slightly differ on seasonal menu items.',
            'status' => 'pending',
        ]);

        // 18. Media Library Items
        $mediaData = [
            ['title' => 'Angkor Wat Sunrise Panorama', 'file_path' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80', 'category' => 'destinations', 'file_size' => 1048576, 'alt_text' => 'Sunrise over Angkor Wat reflection pool'],
            ['title' => 'Bayon Stone Faces Close-up', 'file_path' => 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop&q=80', 'category' => 'destinations', 'file_size' => 845200, 'alt_text' => 'Smiling stone faces of Bayon temple'],
            ['title' => 'Heritage Suites Tropical Pool Villa', 'file_path' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80', 'category' => 'businesses', 'file_size' => 1258291, 'alt_text' => 'Luxury pool villa in Siem Reap'],
            ['title' => 'Authentic Khmer Fish Amok Cuisine', 'file_path' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80', 'category' => 'businesses', 'file_size' => 954000, 'alt_text' => 'Fish Amok in banana leaf'],
            ['title' => 'Phare Circus Acrobatic Act', 'file_path' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80', 'category' => 'promotions', 'file_size' => 1102000, 'alt_text' => 'Circus performers in action'],
            ['title' => 'Tes Chor Brand Banner Asset', 'file_path' => 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&auto=format&fit=crop&q=80', 'category' => 'website', 'file_size' => 640000, 'alt_text' => 'Tes Chor tourism branding'],
        ];

        foreach ($mediaData as $m) {
            \App\Models\Media::create(array_merge($m, ['user_id' => $admin->id]));
        }

        // 19. Admin Activity Logs
        \App\Models\AdminActivityLog::log('Approved Business', 'businesses', 'Heritage Suites Resort & Spa', 'Verified partner application approved by Super Admin');
        \App\Models\AdminActivityLog::log('Approved Business', 'businesses', 'Haven Restaurant', 'Verified partner application approved');
        \App\Models\AdminActivityLog::log('Created Destination', 'destinations', 'Beng Mealea Jungle Ruins', 'Added new hidden gem archaeological site');
        \App\Models\AdminActivityLog::log('Updated System Settings', 'settings', 'General Settings', 'Configured default currency exchange rate to 4,100 KHR');
        \App\Models\AdminActivityLog::log('Resolved Report', 'reports', 'Angkor Wat Ticket Office', 'Updated fee instructions per user submission');
    }
}
