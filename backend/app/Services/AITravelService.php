<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Category;
use App\Models\Destination;
use Illuminate\Support\Str;

class AITravelService
{
    /**
     * Siem Reap Knowledge Base & Intent Dictionary
     */
    protected array $knowledge = [
        'angkor_pass' => [
            'km' => "🎫 **ព័ត៌មានអំពីសំបុត្រទស្សនាអង្គរ (Angkor Pass):**\n\n• **សំបុត្រ ១ ថ្ងៃ:** $37 (មានសុពលភាព ១ ថ្ងៃ)\n• **សំបុត្រ ៣ ថ្ងៃ:** $62 (មានសុពលភាព ១០ ថ្ងៃ អាចជ្រើសរើសចូលទស្សនា ៣ ថ្ងៃណាដែលមានភាពងាយស្រួល)\n• **សំបុត្រ ៧ ថ្ងៃ:** $72 (មានសុពលភាព ១ ខែ អាចចូលទស្សនា ៧ ថ្ងៃ)\n\n📍 **កន្លែងទិញ:** មជ្ឈមណ្ឌលលក់សំបុត្រអង្គរ (Angkor Enterprise Ticket Center) លើផ្លូវ Apsara Road ឬទិញតាមអនឡាញផ្លូវការ angkorenterprise.gov.kh។\n💡 **ចំណាំ:** កុមារអាយុក្រោម ១២ ឆ្នាំ និងជនជាតិខ្មែរ ចូលទស្សនាដោយឥតគិតថ្លៃ (សូមបង្ហាញលិខិតឆ្លងដែន/សំបុត្រកំណើត)។",
            'en' => "🎫 **Angkor Pass Official Pricing & Info:**\n\n• **1-Day Pass:** $37 USD (Valid for 1 day)\n• **3-Day Pass:** $62 USD (Valid for any 3 days within a 10-day period)\n• **7-Day Pass:** $72 USD (Valid for any 7 days within a 30-day period)\n\n📍 **Where to buy:** Official Angkor Enterprise Ticket Center on Apsara Road or online at official portal angkorenterprise.gov.kh.\n💡 **Note:** Free entry for Cambodian citizens and foreign children under 12 years old (passport required).",
        ],
        'sunrise' => [
            'km' => "🌅 **ទីតាំងមើលថ្ងៃរះស្អាតបំផុតនៅសៀមរាប:**\n\n1. **ប្រាសាទអង្គរវត្ត (Angkor Wat):** ទីតាំងលេខ ១ ពិភពលោក! សូមទៅដល់នៅម៉ោង **05:00 ព្រឹក** ហើយឈរនៅក្បែរស្រះទឹកខាងឆ្វេង (North Reflection Pond) ដើម្បីថតយករូបភាពថ្ងៃរះជះស្រមោលលើផ្ទៃទឹកដ៏អស្ចារ្យ។\n2. **ស្រះស្រង់ (Srah Srang):** ទីតាំងបឹងបុរាណរាជវាំង ស្ងប់ស្ងាត់ មានពន្លឺថ្ងៃជះលើផ្ទៃទឹកធំល្វឹងល្វើយ។\n3. **ភ្នំបាខែង ឬភ្នំគូលែន:** សម្រាប់ទេសភាពថ្ងៃរះលើកំពូលភ្នំព្រៃឈើបៃតង។",
            'en' => "🌅 **Top Sunrise Locations in Siem Reap:**\n\n1. **Angkor Wat Reflection Pond:** The ultimate bucket-list spot! Arrive by **05:00 AM** and find a spot near the Left (Northern) Lotus Library pond to capture the iconic silhouette and lotus mirror reflection.\n2. **Srah Srang (Royal Bath):** Tranquil water reservoir with fewer crowds and golden rays piercing the morning mist.\n3. **Phnom Bakheng / Phnom Bok:** Peaceful hill vistas overlooking the vast jungle canopy.",
        ],
        'sunset' => [
            'km' => "🌇 **ទីតាំងមើលថ្ងៃលិចស្អាតបំផុតនៅសៀមរាប:**\n\n1. **ភ្នំបាខែង (Phnom Bakheng):** មើលឃើញទេសភាពអង្គរវត្ត និងព្រៃព្រឹក្សាជុំវិញ (កំណត់ភ្ញៀវត្រឹម ៣០០ នាក់ គួរឡើងតាំងពីម៉ោង 4:00 ល្ងាច)។\n2. **ប្រាសាទប្រែរូប (Pre Rup):** ប្រាសាទឥដ្ឋក្រហមខ្ពស់ផុតដី ស្រូបយកពន្លឺពណ៌ទឹកក្រូចចែងចាំង។\n3. **បឹងទន្លេសាប (Kampong Phluk / Chong Kneas):** ជិះទូកមើលថ្ងៃលិចលើផ្ទៃទឹកទន្លេសាបដ៏រ៉ូមែនទិក។",
            'en' => "🌇 **Best Sunset Spots in Siem Reap:**\n\n1. **Phnom Bakheng Hilltop:** Stunning panoramic view of Angkor Wat and Tonle Sap basin (Limit 300 visitors at top, arrive before 4:00 PM).\n2. **Pre Rup Temple:** Majestic red brick pyramid glowing with warm golden sunset tones.\n3. **Tonle Sap Lake (Kampong Phluk):** Romantic sunset boat ride over the flooded mangrove forests.",
        ],
        'food' => [
            'km' => "🍲 **ម្ហូបអាហារដែលត្រូវតែសាកល្បងនៅសៀមរាប:**\n\n• **អាម៉ុកត្រី (Fish Amok):** ម្ហូបប្រចាំជាតិខ្មែរ ចំហុយក្នុងស្លឹកចេកជាមួយគ្រឿងការីខ្ទិះដូងឈ្ងុយឆ្ងាញ់។\n• **នំបញ្ចុកសៀមរាប (Nom Banh Chok):** នំបញ្ចុកទឹកសម្លប្រហើរ និងទឹកការីស្រស់ៗជាមួយបន្លែស្រស់។\n• **សាច់គោអាំងអំបិលម្ទេស / ទឹកប្រហុក:** ពេញនិយមខ្លាំងនៅពេលល្ងាចតាមបណ្តោយផ្លូវមាត់ស្ទឹងសៀមរាប។\n• **ឡុកឡាក់សាច់គោ (Beef Lok Lak):** ឆាជាមួយម្រេចកំពត និងទឹកក្រូចឆ្មា។",
            'en' => "🍲 **Must-Try Local Dishes in Siem Reap:**\n\n• **Fish Amok:** Cambodia's signature royal dish, steamed fish mousse in banana leaves with rich lemongrass coconut curry.\n• **Nom Banh Chok (Khmer Noodles):** Fresh rice noodles with fragrant fish gravy and crispy river garden vegetables.\n• **Khmer BBQ & Beef with Teuk Prahok:** Sizzling grilled meats with spicy fermented dipping sauce along Siem Reap River.\n• **Beef Lok Lak:** Tender wok-tossed beef with Kampot black pepper and lime dipping sauce.",
        ],
        'dress_code' => [
            'km' => "👗 **ក្រមសីលធម៌ និងការស្លៀកពាក់ចូលទស្សនាប្រាសាទ (Angkor Code of Conduct):**\n\n• **សម្លៀកបំពាក់:** ត្រូវបិទបាំងស្មា (ពាក់អាវមានដៃ) និងស្លៀកខោ/សំពត់ផុតជង្គង់ (មិនអនុញ្ញាតឱ្យពាក់អាវវាលក្លៀក ឬខោខ្លីលើជង្គង់ឡើយ)។\n• **ការគោរព:** សូមកុំប៉ះពាល់ចម្លាក់បុរាណ កុំអង្គុយលើថ្មប្រាសាទ និងសូមគោរពព្រះសង្ឃ។\n• **សម្ភារៈណែនាំ:** មួកការពារកម្តៅថ្ងៃ វ៉ែនតាការពារពន្លឺ ស្បែកជើងដើរស្រួល និងដបទឹកផ្ទាល់ខ្លួន។",
            'en' => "👗 **Angkor Temple Dress Code & Etiquette:**\n\n• **Shoulders & Knees Covered:** Shirts must have sleeves covering shoulders; pants/skirts must cover below knees (Scarves/sarongs wrapped over tank tops are often not allowed for climbing upper towers).\n• **Respectful Conduct:** Do not touch delicate bas-reliefs, avoid sitting on fragile stones, and respect Buddhist monks.\n• **Essentials to bring:** Breathable cotton clothing, walking sneakers/shoes, sun hat, sunglasses, and refillable water bottle.",
        ],
        'transport' => [
            'km' => "🛵 **មធ្យោបាយធ្វើដំណើរនៅក្រុងសៀមរាប:**\n\n• **កង់បី Remorque / Tuk-Tuk:** ជម្រើសល្អបំផុតសម្រាប់ដើរលេងអង្គរ (តម្លៃប្រមាណ $18 - $25/ថ្ងៃ សម្រាប់រង្វង់តូច Small Circuit និង $25 - $35/ថ្ងៃ សម្រាប់រង្វង់ធំ Grand Circuit)។\n• **រថយន្តឯកជន (Private Car/Van):** មានម៉ាស៊ីនត្រជាក់ ផាសុកភាពសម្រាប់ក្រុមគ្រួសារ ($35 - $60/ថ្ងៃ)។\n• **App កក់តុកតុក:** អាចប្រើ PassApp ឬ Grab សម្រាប់ធ្វើដំណើរក្នុងក្រុងសៀមរាបយ៉ាងងាយស្រួល។",
            'en' => "🛵 **Getting Around Siem Reap & Angkor:**\n\n• **Traditional Remorque (Tuk-Tuk):** The quintessential Angkor experience ($18 - $25/day for Small Circuit, $25 - $35/day for Grand Circuit).\n• **Private Air-Conditioned Car/Van:** Great for hot midday hours and families ($35 - $60/day).\n• **Ride-Hailing Apps:** Grab and PassApp are widely available for quick city hops and dinner trips ($1 - $3 per ride).",
        ]
    ];

    /**
     * Process User Chat Message and generate intelligent response.
     */
    public function chat(string $message, ?string $preferredLanguage = null): array
    {
        $lang = $preferredLanguage ?: ($this->detectLanguage($message));
        $normalized = mb_strtolower($message);

        $matchedIntent = null;
        if (str_contains($normalized, 'pass') || str_contains($normalized, 'ticket') || str_contains($normalized, 'សំបុត្រ') || str_contains($normalized, 'ថ្លៃចូល')) {
            $matchedIntent = 'angkor_pass';
        } elseif (str_contains($normalized, 'sunrise') || str_contains($normalized, 'ថ្ងៃរះ') || str_contains($normalized, 'ព្រឹកព្រលឹម') || str_contains($normalized, 'dawn')) {
            $matchedIntent = 'sunrise';
        } elseif (str_contains($normalized, 'sunset') || str_contains($normalized, 'ថ្ងៃលិច') || str_contains($normalized, 'ល្ងាច') || str_contains($normalized, 'dusk')) {
            $matchedIntent = 'sunset';
        } elseif (str_contains($normalized, 'food') || str_contains($normalized, 'eat') || str_contains($normalized, 'restaurant') || str_contains($normalized, 'ម្ហូប') || str_contains($normalized, 'ញ៉ាំ') || str_contains($normalized, 'អាហារ') || str_contains($normalized, 'amok')) {
            $matchedIntent = 'food';
        } elseif (str_contains($normalized, 'dress') || str_contains($normalized, 'wear') || str_contains($normalized, 'cloth') || str_contains($normalized, 'ស្លៀក') || str_contains($normalized, 'ខោអាវ') || str_contains($normalized, 'ច្បាប់')) {
            $matchedIntent = 'dress_code';
        } elseif (str_contains($normalized, 'tuk') || str_contains($normalized, 'transport') || str_contains($normalized, 'car') || str_contains($normalized, 'តុកតុក') || str_contains($normalized, 'ឡាន') || str_contains($normalized, 'ជិះ')) {
            $matchedIntent = 'transport';
        }

        // Fetch related destinations and businesses from Database
        $relatedDestinations = Destination::with(['category', 'images'])
            ->where('status', 'published')
            ->inRandomOrder()
            ->take(3)
            ->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'name' => $d->khmer_name ?: $d->name,
                'slug' => $d->slug,
                'image' => $d->images->first()?->image ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500',
                'category' => $d->category->name ?? 'Attraction',
                'rating' => (float) ($d->rating ?? 4.9),
                'link' => "/destinations/{$d->slug}"
            ]);

        $relatedBusinesses = Business::with('category')
            ->where('status', 'active')
            ->inRandomOrder()
            ->take(2)
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->khmer_name ?: $b->name,
                'slug' => $b->slug,
                'image' => $b->cover_image ?? $b->logo ?? ($b->gallery_images[0] ?? null) ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
                'category' => $b->category->name ?? 'Dining',
                'rating' => (float) ($b->rating ?? 4.8),
                'link' => "/businesses/{$b->slug}"
            ]);

        if ($matchedIntent && isset($this->knowledge[$matchedIntent])) {
            $answer = $this->knowledge[$matchedIntent][$lang] ?? $this->knowledge[$matchedIntent]['en'];
        } else {
            // General Conversational AI Fallback for Siem Reap
            if ($lang === 'km') {
                $answer = "សួស្តីបាទ! ខ្ញុំជា **SR TesChor AI Assistant** ជំនួយការទេសចរណ៍ឆ្លាតវៃរបស់អ្នកនៅខេត្តសៀមរាប។\n\nខ្ញុំអាចជួយអ្នកបានជាច្រើនដូចជា៖\n• 📍 រៀបចំកាលវិភាគដើរលេង (១ ថ្ងៃ ដល់ ៧ ថ្ងៃ)\n• 🎫 ពន្យល់តម្លៃ និងរបៀបទិញសំបុត្រ Angkor Pass\n• 🌅 ណែនាំកន្លែងមើលថ្ងៃរះ និងថ្ងៃលិចស្អាតបំផុត\n• 🍲 ណែនាំហាងអាហារឆ្ងាញ់ៗ និងសណ្ឋាគារល្បីៗ\n• 🛵 ព័ត៌មានមធ្យោបាយធ្វើដំណើរ (តុកតុក, PassApp)\n\nតើអ្នកចង់ឱ្យខ្ញុំជួយរៀបចំដំណើរកម្សាន្ត ឬចង់សាកសួរអ្វីដែរទេបាទ?";
            } else {
                $answer = "Hello! I am your **SR TesChor AI Travel Concierge** for Siem Reap & Angkor.\n\nI can assist you with:\n• 📍 Custom multi-day itinerary planning (1 to 7 days)\n• 🎫 Angkor Pass ticket pricing & guidelines\n• 🌅 Prime sunrise & sunset photography vantage points\n• 🍲 Authentic Khmer restaurants, coffee shops & nightlife\n• 🛵 Transportation guides (Tuk-tuks, private cars, Grab/PassApp)\n\nHow can I help make your Siem Reap journey unforgettable today?";
            }
        }

        $suggestions = $lang === 'km' ? [
            'តើសំបុត្រ Angkor Pass តម្លៃប៉ុន្មាន?',
            'តើកន្លែងណាខ្លះមើលថ្ងៃរះស្អាតបំផុត?',
            'ណែនាំមុខម្ហូបខ្មែរដែលត្រូវតែញ៉ាំ',
            'រៀបចំកាលវិភាគដើរលេង ៣ ថ្ងៃ',
        ] : [
            'How much is an Angkor Pass?',
            'Where is the best sunrise spot?',
            'What are must-try local dishes?',
            'Create a 3-day itinerary for me',
        ];

        return [
            'status' => 'success',
            'query' => $message,
            'language' => $lang,
            'answer' => $answer,
            'suggestions' => $suggestions,
            'destinations' => $relatedDestinations,
            'businesses' => $relatedBusinesses,
        ];
    }

    /**
     * Generate Comprehensive Structured Travel Itinerary
     */
    public function generateItinerary(array $params): array
    {
        $daysCount = (int) ($params['days'] ?? 3);
        $daysCount = max(1, min(7, $daysCount));
        $style = $params['style'] ?? 'heritage'; // heritage, romantic, family, adventure, photography, foodie
        $budget = $params['budget'] ?? 'comfort'; // budget, comfort, luxury
        $lang = $params['lang'] ?? 'km';

        $allDestinations = Destination::all();

        $days = [];

        // Daily template templates
        $dayBlueprints = [
            1 => [
                'title_km' => 'ថ្ងៃទី ១៖ ថ្ងៃរះអង្គរវត្ត និងប្រាសាទស្នូលរង្វង់តូច',
                'title_en' => 'Day 1: Majestic Angkor Wat Sunrise & Small Circuit',
                'slots' => [
                    ['time' => '05:00 AM', 'place' => 'Angkor Wat (Sunrise Reflection)', 'desc_km' => 'ទស្សនាថ្ងៃរះដ៏ល្បីល្បាញលើពិភពលោកនៅស្រះឈូកខាងឆ្វេង។', 'desc_en' => 'Witness the world-famous sunrise over the northern lotus pond.'],
                    ['time' => '08:30 AM', 'place' => 'Bayon Temple (Angkor Thom)', 'desc_km' => 'ទស្សនាចម្លាក់មុខញញឹមព្រហ្មបាយ័នចំនួន ២១៦ មុខ។', 'desc_en' => 'Explore 216 giant smiling stone faces of Avalokiteshvara.'],
                    ['time' => '11:30 AM', 'place' => 'Ta Prohm (Tomb Raider Temple)', 'desc_km' => 'ប្រាសាទព្រៃបុរាណដែលត្រូវបានឫសដើមស្ពង់យក្សដុះទ្រោបពីលើ។', 'desc_en' => 'Ancient temple embraced by giant silk-cotton and strangler fig tree roots.'],
                    ['time' => '01:00 PM', 'place' => 'Traditional Khmer Restaurant Lunch', 'desc_km' => 'ទទួលទានអាហារថ្ងៃត្រង់ អាម៉ុកត្រី និងដូងក្រអូប។', 'desc_en' => 'Lunch break enjoying authentic Fish Amok and fresh young coconut.'],
                    ['time' => '04:30 PM', 'place' => 'Phnom Bakheng Sunset', 'desc_km' => 'ឡើងភ្នំបាខែងទស្សនាថ្ងៃលិចលើដែនដីអង្គរដ៏ស្រស់ត្រកាល។', 'desc_en' => 'Sunset vantage point overlooking the great plain of Angkor.']
                ]
            ],
            2 => [
                'title_km' => 'ថ្ងៃទី ២៖ រតនសម្បត្តិបន្ទាយស្រី និងសិល្បៈវប្បធម៌ខ្មែរ',
                'title_en' => 'Day 2: Jewel of Khmer Art Banteay Srei & Cultural Arts',
                'slots' => [
                    ['time' => '08:00 AM', 'place' => 'Banteay Srei Temple', 'desc_km' => 'ប្រាសាទបន្ទាយស្រីចម្លាក់ថ្មភក់ពណ៌ផ្កាឈូកយ៉ាងល្អិតល្អន់បំផុត។', 'desc_en' => 'Exquisite miniature pink sandstone temple with delicate carvings.'],
                    ['time' => '11:00 AM', 'place' => 'Preah Khan & Neak Pean', 'desc_km' => 'ប្រាសាទព្រះខ័ន និងប្រាសាទនាគព័ន្ធកណ្តាលបឹងពិសិដ្ឋ។', 'desc_en' => 'Vast historical monastery complex and circular island shrine.'],
                    ['time' => '03:00 PM', 'place' => 'Angkor National Museum', 'desc_km' => 'សារមន្ទីរជាតិអង្គរ ស្វែងយល់ពីប្រវត្តិសាស្ត្រ និងអារ្យធម៌ខ្មែរ។', 'desc_en' => 'State-of-the-art museum dedicated to the golden Khmer Empire.'],
                    ['time' => '07:00 PM', 'place' => 'Phare The Cambodian Circus', 'desc_km' => 'ទស្សនាសៀករឿងខ្មែរ អមដោយភ្លេងបុរាណ និងសម័យរស់រវើក។', 'desc_en' => 'Thrilling acrobatic circus show telling Cambodian folktales.']
                ]
            ],
            3 => [
                'title_km' => 'ថ្ងៃទី ៣៖ ទឹកធ្លាក់ភ្នំគូលែនពិសិដ្ឋ និងភូមិបណ្តែតទឹកទន្លេសាប',
                'title_en' => 'Day 3: Sacred Kulen Mountain Waterfall & Floating Village',
                'slots' => [
                    ['time' => '07:30 AM', 'place' => 'Phnom Kulen Waterfall & 1000 Lingas', 'desc_km' => 'ងូតទឹកធ្លាក់ធម្មជាតិភ្នំគូលែន និងទស្សនាឆ្លាក់លិង្គ ១០០០ ក្រោមបាតស្ទឹង។', 'desc_en' => 'Swim in sacred waterfalls and see 1,000 carved lingas in riverbed.'],
                    ['time' => '12:00 PM', 'place' => 'Preah Ang Thom Reclining Buddha', 'desc_km' => 'ថ្វាយបង្គំព្រះពុទ្ធចូលនិព្វានឆ្លាក់លើផ្ទាំងថ្មភក់ធម្មជាតិធំជាងគេ។', 'desc_en' => 'Pay respects at Cambodia largest 16th-century rock-carved reclining Buddha.'],
                    ['time' => '03:30 PM', 'place' => 'Kampong Phluk Floating Village', 'desc_km' => 'ជិះទូកតាមព្រៃលិចទឹក និងមើលជីវភាពភូមិផ្ទះសសរខ្ពស់លើបឹងទន្លេសាប។', 'desc_en' => 'Scenic boat journey through mangrove forests and stilted village.'],
                    ['time' => '07:30 PM', 'place' => 'Pub Street & Night Market Stroll', 'desc_km' => 'ដើរផ្សាររាត្រី ទិញវត្ថុអនុស្សាវរីយ៍ និងភ្លក្សរសជាតិអាហារតាមផ្លូវ។', 'desc_en' => 'Vibrant night bazaar shopping and street delicacies.']
                ]
            ],
            4 => [
                'title_km' => 'ថ្ងៃទី ៤៖ ប្រាសាទកោះកេរ និងប្រាសាទបេងមាលាអាថ៌កំបាំង',
                'title_en' => 'Day 4: Koh Ker Pyramid & Mysterious Beng Mealea',
                'slots' => [
                    ['time' => '08:00 AM', 'place' => 'Beng Mealea Temple', 'desc_km' => 'ប្រាសាទបុរាណកណ្តាលព្រៃជ្រៅ ដែលរក្សាទុកទ្រង់ទ្រាយដើម។', 'desc_en' => 'Jungle temple left mostly unrestored with giant fallen blocks.'],
                    ['time' => '11:30 AM', 'place' => 'Koh Ker Pyramid (Prasat Thom)', 'desc_km' => 'ប្រាសាទពីរ៉ាមីត ៧ ជាន់ដ៏អស្ចារ្យដែលជាអតីតរាជធានីខ្មែរសតវត្សរ៍ទី ១០។', 'desc_en' => 'Stunning 7-tiered step pyramid temple of 10th-century capital.'],
                    ['time' => '06:00 PM', 'place' => 'Khmer Traditional Spa & Massage', 'desc_km' => 'សម្រាកម៉ាស្សាប្រេងឱសថបំបាត់ការនឿយហត់។', 'desc_en' => 'Traditional herbal massage and wellness rejuvenation.']
                ]
            ],
            5 => [
                'title_km' => 'ថ្ងៃទី ៥៖ ភូមិសិប្បកម្ម ជិះកង់តាមវាលស្រែ និងសហគមន៍ជនបទ',
                'title_en' => 'Day 5: Artisan Crafts, Countryside Bicycle & Local Life',
                'slots' => [
                    ['time' => '08:30 AM', 'place' => 'Artisans Angkor Workshop', 'desc_km' => 'ទស្សនាការផលិតសូត្រ ចម្លាក់ថ្ម និងគំនូរឡាក់ខ្មែរពិតៗ។', 'desc_en' => 'Watch master artisans create silk weavings and stone sculptures.'],
                    ['time' => '11:00 AM', 'place' => 'Khmer Cooking Class', 'desc_km' => 'រៀនធ្វើម្ហូបខ្មែរ ដើរផ្សារស្រស់ជាមួយមេចុងភៅជំនាញ។', 'desc_en' => 'Hands-on cooking class preparing classic Khmer 3-course meal.'],
                    ['time' => '03:30 PM', 'place' => 'Countryside Sunset Quad Bike / Cycling', 'desc_km' => 'ជិះម៉ូតូកង់បួន ឬកង់ទស្សនាវាលស្រែ និងដើមត្នោតពេលរសៀល។', 'desc_en' => 'Sunset quad bike ride through rural palm trails and paddy fields.']
                ]
            ]
        ];

        for ($d = 1; $d <= $daysCount; $d++) {
            $templateIndex = (($d - 1) % count($dayBlueprints)) + 1;
            $bp = $dayBlueprints[$templateIndex];
            
            $days[] = [
                'day' => $d,
                'title' => $lang === 'km' ? $bp['title_km'] : $bp['title_en'],
                'activities' => array_map(function($slot) use ($lang) {
                    return [
                        'time' => $slot['time'],
                        'place' => $slot['place'],
                        'description' => $lang === 'km' ? $slot['desc_km'] : $slot['desc_en'],
                    ];
                }, $bp['slots'])
            ];
        }

        // Budget Calculations
        $dailyEstimates = [
            'budget' => ['transport' => 18, 'food' => 15, 'pass' => 37, 'total_daily' => 35],
            'comfort' => ['transport' => 35, 'food' => 30, 'pass' => 37, 'total_daily' => 70],
            'luxury' => ['transport' => 70, 'food' => 80, 'pass' => 37, 'total_daily' => 160],
        ];

        $est = $dailyEstimates[$budget] ?? $dailyEstimates['comfort'];
        $totalEst = ($est['total_daily'] * $daysCount) + ($daysCount >= 3 ? 62 : 37);

        return [
            'status' => 'success',
            'plan_title' => ($lang === 'km' ? 'កាលវិភាគទេសចរណ៍សៀមរាប ' : 'Siem Reap Travel Itinerary ') . "({$daysCount} Days)",
            'days_count' => $daysCount,
            'style' => $style,
            'budget_category' => $budget,
            'estimated_total_usd' => $totalEst,
            'currency' => 'USD',
            'cost_breakdown' => [
                'transportation_est' => $est['transport'] * $daysCount,
                'food_dining_est' => $est['food'] * $daysCount,
                'angkor_pass_est' => ($daysCount >= 3 ? 62 : 37),
            ],
            'days' => $days,
            'travel_tips' => $lang === 'km' ? [
                '👕 សូមស្លៀកពាក់គ្របស្មា និងជង្គង់ពេលចូលប្រាសាទ',
                '💧 យកដបទឹកផ្ទាល់ខ្លួន និងការពារកម្តៅថ្ងៃ',
                '💵 ប្រើប្រាស់ Bakong KHQR ឬសាច់ប្រាក់ដុល្លារថ្មីៗ',
            ] : [
                '👕 Cover shoulders and knees when visiting holy temples',
                '💧 Carry sunscreen and stay hydrated throughout the day',
                '💵 Use Bakong KHQR or clean crisp USD bills for payments',
            ]
        ];
    }

    protected function detectLanguage(string $text): string
    {
        // Check for Khmer unicode range \x{1780}-\x{17FF}
        if (preg_match('/[\x{1780}-\x{17FF}]/u', $text)) {
            return 'km';
        }
        return 'en';
    }
}
