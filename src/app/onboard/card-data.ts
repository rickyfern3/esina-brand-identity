// ESINA Brand Identity Onboarding Data
// 9-card carousel with curated, culturally-specific content

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  era: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  era?: string;
}

export interface DinnerGuest {
  id: string;
  name: string;
  domain: string;
}

export type ScentPill = string;
export type TexturePill = string;
export type EnemyPill = string;

// ~70 curated songs across diverse genres
export const SONGS: Song[] = [
  // Frank Ocean
  { id: "pink-white", title: "Pink + White", artist: "Frank Ocean", genre: "R&B", era: "2010s" },
  { id: "nikes", title: "Nikes", artist: "Frank Ocean", genre: "R&B", era: "2010s" },
  { id: "ivy", title: "Ivy", artist: "Frank Ocean", genre: "R&B", era: "2010s" },
  { id: "thinkin-bout-you", title: "Thinkin Bout You", artist: "Frank Ocean", genre: "R&B", era: "2010s" },

  // Kendrick Lamar
  { id: "money-trees", title: "Money Trees", artist: "Kendrick Lamar", genre: "Hip-Hop", era: "2010s" },
  { id: "alright", title: "Alright", artist: "Kendrick Lamar", genre: "Hip-Hop", era: "2010s" },
  { id: "swimming-pools-drank", title: "Swimming Pools (Drank)", artist: "Kendrick Lamar", genre: "Hip-Hop", era: "2010s" },
  { id: "king-kunta", title: "King Kunta", artist: "Kendrick Lamar", genre: "Hip-Hop", era: "2010s" },

  // Childish Gambino
  { id: "redbone", title: "Redbone", artist: "Childish Gambino", genre: "R&B", era: "2010s" },
  { id: "summertime-magic", title: "Summertime Magic", artist: "Childish Gambino", genre: "R&B", era: "2010s" },
  { id: "awaken-my-love", title: "Awaken, My Love!", artist: "Childish Gambino", genre: "Funk", era: "2010s" },

  // Nirvana & Grunge
  { id: "smells-like-teen-spirit", title: "Smells Like Teen Spirit", artist: "Nirvana", genre: "Grunge", era: "1990s" },
  { id: "come-as-you-are", title: "Come as You Are", artist: "Nirvana", genre: "Grunge", era: "1990s" },
  { id: "heart-shaped-box", title: "Heart-Shaped Box", artist: "Nirvana", genre: "Grunge", era: "1990s" },

  // Deftones
  { id: "digital-bath", title: "Digital Bath", artist: "Deftones", genre: "Alt-Metal", era: "2000s" },
  { id: "change-in-the-house-of-flies", title: "Change (In the House of Flies)", artist: "Deftones", genre: "Alt-Metal", era: "2000s" },

  // Arctic Monkeys
  { id: "do-i-wanna-know", title: "Do I Wanna Know?", artist: "Arctic Monkeys", genre: "Indie Rock", era: "2010s" },
  { id: "fluorescent-adolescent", title: "Fluorescent Adolescent", artist: "Arctic Monkeys", genre: "Indie Rock", era: "2000s" },
  { id: "mardy-bum", title: "Mardy Bum", artist: "Arctic Monkeys", genre: "Indie Rock", era: "2000s" },

  // The Smiths & Morrissey
  { id: "there-is-a-light", title: "There Is a Light That Never Goes Out", artist: "The Smiths", genre: "Post-Punk", era: "1980s" },
  { id: "how-soon-is-now", title: "How Soon Is Now?", artist: "The Smiths", genre: "Post-Punk", era: "1980s" },

  // Electronic & Synth
  { id: "electric-feel", title: "Electric Feel", artist: "MGMT", genre: "Synth-Pop", era: "2000s" },
  { id: "midnight-city", title: "Midnight City", artist: "M83", genre: "Synth-Pop", era: "2000s" },
  { id: "bizarre-love-triangle", title: "Bizarre Love Triangle", artist: "New Order", genre: "Electronic", era: "1980s" },
  { id: "blue-monday", title: "Blue Monday", artist: "New Order", genre: "Electronic", era: "1980s" },

  // Billie Eilish
  { id: "bad-guy", title: "bad guy", artist: "Billie Eilish", genre: "Electropop", era: "2010s" },
  { id: "when-we-all-fall-asleep", title: "When We All Fall Asleep, Where Do We Go?", artist: "Billie Eilish", genre: "Electropop", era: "2010s" },

  // Kate Bush & The 80s
  { id: "running-up-that-hill", title: "Running Up That Hill", artist: "Kate Bush", genre: "Synth-Pop", era: "1980s" },
  { id: "cloudbusting", title: "Cloudbusting", artist: "Kate Bush", genre: "Synth-Pop", era: "1980s" },

  // Queen
  { id: "bohemian-rhapsody", title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock", era: "1970s" },
  { id: "another-one-bites-dust", title: "Another One Bites the Dust", artist: "Queen", genre: "Funk Rock", era: "1980s" },
  { id: "under-pressure", title: "Under Pressure", artist: "Queen & David Bowie", genre: "Funk Rock", era: "1980s" },

  // David Bowie
  { id: "heroes", title: "Heroes", artist: "David Bowie", genre: "Art Rock", era: "1970s" },
  { id: "starman", title: "Starman", artist: "David Bowie", genre: "Glam Rock", era: "1970s" },
  { id: "ziggy-stardust", title: "Ziggy Stardust", artist: "David Bowie", genre: "Glam Rock", era: "1970s" },

  // Björk
  { id: "venus-as-a-boy", title: "Venus as a Boy", artist: "Björk", genre: "Experimental Pop", era: "1990s" },
  { id: "all-is-full-of-love", title: "All Is Full of Love", artist: "Björk", genre: "Electronic", era: "1990s" },
  { id: "army-of-me", title: "Army of Me", artist: "Björk", genre: "Industrial Pop", era: "1990s" },

  // Mazzy Star
  { id: "fade-into-you", title: "Fade Into You", artist: "Mazzy Star", genre: "Dream Pop", era: "1990s" },

  // ASAP Rocky
  { id: "asap-forever", title: "ASAP Forever", artist: "ASAP Rocky", genre: "Hip-Hop", era: "2010s" },
  { id: "testing", title: "Testing", artist: "ASAP Rocky", genre: "Hip-Hop", era: "2010s" },

  // Cigarettes After Sex
  { id: "apocalypse", title: "Apocalypse", artist: "Cigarettes After Sex", genre: "Slowcore", era: "2010s" },

  // Aerosmith
  { id: "dream-on", title: "Dream On", artist: "Aerosmith", genre: "Hard Rock", era: "1970s" },
  { id: "sweet-emotion", title: "Sweet Emotion", artist: "Aerosmith", genre: "Hard Rock", era: "1970s" },

  // Blondie
  { id: "heart-of-glass", title: "Heart of Glass", artist: "Blondie", genre: "Disco Punk", era: "1970s" },
  { id: "call-me", title: "Call Me", artist: "Blondie", genre: "Synth-Pop", era: "1980s" },

  // Bon Iver
  { id: "skinny-love", title: "Skinny Love", artist: "Bon Iver", genre: "Indie Folk", era: "2000s" },
  { id: "holocene", title: "Holocene", artist: "Bon Iver", genre: "Indie Folk", era: "2010s" },

  // Jazz Legends
  { id: "coltrane-a-love-supreme", title: "A Love Supreme (Part 1)", artist: "John Coltrane", genre: "Jazz", era: "1960s" },
  { id: "miles-so-what", title: "So What", artist: "Miles Davis", genre: "Jazz", era: "1960s" },
  { id: "miles-kind-of-blue", title: "So What", artist: "Miles Davis", genre: "Modal Jazz", era: "1960s" },
  { id: "thelonious-monk-round-midnight", title: "'Round Midnight", artist: "Thelonious Monk", genre: "Jazz", era: "1950s" },

  // Soul & R&B Legends
  { id: "nina-simone-feeling-good", title: "Feeling Good", artist: "Nina Simone", genre: "Soul", era: "1960s" },
  { id: "aretha-respect", title: "Respect", artist: "Aretha Franklin", genre: "Soul", era: "1960s" },
  { id: "marvin-gaye-inner-city-blues", title: "Inner City Blues (Make Me Wanna Holler)", artist: "Marvin Gaye", genre: "Soul", era: "1970s" },

  // Punk & Post-Punk
  { id: "ramones-blitzkrieg-bop", title: "Blitzkrieg Bop", artist: "Ramones", genre: "Punk", era: "1970s" },
  { id: "patti-smith-gloria", title: "Gloria", artist: "Patti Smith", genre: "Punk Rock", era: "1970s" },
  { id: "joy-division-love-will-tear-us-apart", title: "Love Will Tear Us Apart", artist: "Joy Division", genre: "Post-Punk", era: "1980s" },

  // Modern Artists
  { id: "fka-twigs-cellophane", title: "Cellophane", artist: "FKA twigs", genre: "R&B", era: "2010s" },
  { id: "blood-orange-chewing-gum", title: "Chewing Gum", artist: "Blood Orange", genre: "R&B", era: "2010s" },
  { id: "solange-don-t-touch-my-hair", title: "Don't Touch My Hair", artist: "Solange", genre: "R&B", era: "2010s" },
  { id: "tyler-the-creator-see-you-again", title: "See You Again", artist: "Tyler, the Creator", genre: "Hip-Hop", era: "2010s" },

  // Electronic & Ambient
  { id: "brian-eno-music-for-airports", title: "1/1", artist: "Brian Eno", genre: "Ambient", era: "1970s" },
  { id: "max-richter-on-the-nature", title: "On the Nature of Daylight", artist: "Max Richter", genre: "Ambient", era: "2000s" },

  // Latin & Reggaeton (Contemporary)
  { id: "bad-bunny-dakiti", title: "Dakiti", artist: "Bad Bunny", genre: "Reggaeton", era: "2020s" },
  { id: "j-balvin-mi-gente", title: "Mi Gente", artist: "J Balvin", genre: "Reggaeton", era: "2010s" },
  { id: "rosalía-malamente", title: "Malamente", artist: "Rosalía", genre: "Flamenco Trap", era: "2010s" },

  // Additional Diverse Artists
  { id: "burial-archangel", title: "Archangel", artist: "Burial", genre: "Dubstep", era: "2000s" },
  { id: "arca-nonbinary", title: "Nonbinary", artist: "ARCA", genre: "Experimental", era: "2010s" },
  { id: "lauryn-hill-doo-wop", title: "Doo Wop (That Thing)", artist: "Lauryn Hill", genre: "Hip-Hop", era: "1990s" },
];

// ~50 culturally-specific neighborhoods
export const NEIGHBORHOODS: Neighborhood[] = [
  // Los Angeles
  { id: "silver-lake-la", name: "Silver Lake LA", city: "Los Angeles", era: "2000s" },
  { id: "echo-park-la", name: "Echo Park LA", city: "Los Angeles", era: "2000s" },
  { id: "laurel-canyon-1970s", name: "Laurel Canyon", city: "Los Angeles", era: "1970s" },
  { id: "joshua-tree", name: "Joshua Tree", city: "California", era: "1990s" },
  { id: "venice-beach-ca", name: "Venice Beach CA", city: "Los Angeles", era: "1970s" },

  // New York
  { id: "williamsburg-2012", name: "Williamsburg", city: "Brooklyn", era: "2012" },
  { id: "bushwick-brooklyn", name: "Bushwick Brooklyn", city: "Brooklyn", era: "2000s" },
  { id: "lower-east-side-1990s", name: "Lower East Side", city: "NYC", era: "1990s" },
  { id: "tribeca", name: "Tribeca", city: "NYC", era: "1980s" },
  { id: "dumbo-brooklyn", name: "Dumbo Brooklyn", city: "Brooklyn", era: "2000s" },
  { id: "bed-stuy-brooklyn", name: "Bed-Stuy Brooklyn", city: "Brooklyn", era: "2000s" },
  { id: "soho-nyc-1980s", name: "SoHo NYC", city: "NYC", era: "1980s" },
  { id: "montauk", name: "Montauk", city: "Long Island", era: "1970s" },

  // London
  { id: "east-london-shoreditch", name: "East London Shoreditch", city: "London", era: "2000s" },
  { id: "notting-hill-london", name: "Notting Hill London", city: "London", era: "1960s" },
  { id: "portobello-road-london", name: "Portobello Road London", city: "London", era: "1960s" },
  { id: "hackney-london", name: "Hackney London", city: "London", era: "2000s" },

  // Tokyo & Japan
  { id: "harajuku-tokyo", name: "Harajuku Tokyo", city: "Tokyo", era: "1990s" },
  { id: "shibuya", name: "Shibuya", city: "Tokyo", era: "1980s" },
  { id: "shimokitazawa-tokyo", name: "Shimokitazawa Tokyo", city: "Tokyo", era: "2000s" },
  { id: "kyoto-backstreets", name: "Kyoto backstreets", city: "Kyoto", era: "pre-modern" },

  // Berlin
  { id: "berlin-kreuzberg", name: "Berlin Kreuzberg", city: "Berlin", era: "1980s" },
  { id: "friedrichshain-berlin", name: "Friedrichshain Berlin", city: "Berlin", era: "1990s" },

  // Europe
  { id: "lisbon-alfama", name: "Lisbon Alfama", city: "Lisbon", era: "historic" },
  { id: "copenhagen-nørrebro", name: "Copenhagen Nørrebro", city: "Copenhagen", era: "2000s" },
  { id: "le-marais-paris", name: "Le Marais Paris", city: "Paris", era: "medieval" },
  { id: "pigalle-paris", name: "Pigalle Paris", city: "Paris", era: "1900s" },
  { id: "gràcia-barcelona", name: "Gràcia Barcelona", city: "Barcelona", era: "2000s" },

  // Mexico & Central America
  { id: "tulum", name: "Tulum", city: "Quintana Roo", era: "pre-Columbian" },
  { id: "colonia-roma-mexico-city", name: "Colonia Roma Mexico City", city: "Mexico City", era: "1920s" },

  // South America
  { id: "palermo-buenos-aires", name: "Palermo Buenos Aires", city: "Buenos Aires", era: "1900s" },
  { id: "medellin-colombia", name: "Medellín Colombia", city: "Medellín", era: "2010s" },

  // Asia
  { id: "itaewon-seoul", name: "Itaewon Seoul", city: "Seoul", era: "1990s" },
  { id: "canggu-bali", name: "Canggu Bali", city: "Bali", era: "2010s" },

  // Australia
  { id: "byron-bay-australia", name: "Byron Bay Australia", city: "Byron Bay", era: "1970s" },
  { id: "fitzroy-melbourne", name: "Fitzroy Melbourne", city: "Melbourne", era: "2000s" },

  // USA South/Southeast
  { id: "french-quarter-new-orleans", name: "French Quarter New Orleans", city: "New Orleans", era: "1800s" },
  { id: "wynwood-miami", name: "Wynwood Miami", city: "Miami", era: "2000s" },
  { id: "savannah-ga-historic", name: "Savannah GA Historic District", city: "Savannah", era: "1700s" },

  // Africa & Middle East
  { id: "lagos-nigeria", name: "Lagos Nigeria", city: "Lagos", era: "2000s" },
  { id: "marrakech-medina", name: "Marrakech Medina", city: "Marrakech", era: "medieval" },
  { id: "tel-aviv-bauhaus", name: "Tel Aviv Bauhaus", city: "Tel Aviv", era: "1930s" },

  // Hawaii
  { id: "kakaako-honolulu", name: "Kakaako Honolulu", city: "Honolulu", era: "2010s" },

  // Iceland
  { id: "reykjavik-downtown", name: "Reykjavik Downtown", city: "Reykjavik", era: "2000s" },

  // Additional Nordic/Baltic
  { id: "kallio-helsinki", name: "Kallio Helsinki", city: "Helsinki", era: "2000s" },
  { id: "gamla-stan-stockholm", name: "Gamla Stan Stockholm", city: "Stockholm", era: "medieval" },
];

// ~100 curated dinner guests from diverse domains
export const DINNER_GUESTS: DinnerGuest[] = [
  // Art & Visual Arts
  { id: "frida-kahlo", name: "Frida Kahlo", domain: "art" },
  { id: "jean-michel-basquiat", name: "Jean-Michel Basquiat", domain: "art" },
  { id: "andy-warhol", name: "Andy Warhol", domain: "art" },
  { id: "georgia-okeeffe", name: "Georgia O'Keeffe", domain: "art" },
  { id: "yayoi-kusama", name: "Yayoi Kusama", domain: "art" },
  { id: "marina-abramovic", name: "Marina Abramović", domain: "art" },
  { id: "takashi-murakami", name: "Takashi Murakami", domain: "art" },
  { id: "mark-rothko", name: "Mark Rothko", domain: "art" },
  { id: "louise-bourgeois", name: "Louise Bourgeois", domain: "art" },
  { id: "banksy", name: "Banksy", domain: "art" },
  { id: "kehinde-wiley", name: "Kehinde Wiley", domain: "art" },
  { id: "cindy-sherman", name: "Cindy Sherman", domain: "art" },
  { id: "kara-walker", name: "Kara Walker", domain: "art" },

  // Music & Musicians
  { id: "david-bowie", name: "David Bowie", domain: "music" },
  { id: "jimi-hendrix", name: "Jimi Hendrix", domain: "music" },
  { id: "kurt-cobain", name: "Kurt Cobain", domain: "music" },
  { id: "patti-smith", name: "Patti Smith", domain: "music" },
  { id: "björk", name: "Björk", domain: "music" },
  { id: "nina-simone", name: "Nina Simone", domain: "music" },
  { id: "john-coltrane", name: "John Coltrane", domain: "music" },
  { id: "miles-davis", name: "Miles Davis", domain: "music" },
  { id: "kendrick-lamar", name: "Kendrick Lamar", domain: "music" },
  { id: "jay-z", name: "Jay-Z", domain: "music" },
  { id: "kanye-west", name: "Kanye West", domain: "music" },
  { id: "solange", name: "Solange", domain: "music" },
  { id: "asap-rocky", name: "ASAP Rocky", domain: "music" },
  { id: "andre-3000", name: "André 3000", domain: "music" },
  { id: "pharrell-williams", name: "Pharrell Williams", domain: "music" },
  { id: "tyler-the-creator", name: "Tyler, the Creator", domain: "music" },
  { id: "fka-twigs", name: "FKA twigs", domain: "music" },
  { id: "blood-orange", name: "Blood Orange", domain: "music" },
  { id: "rihanna", name: "Rihanna", domain: "music" },
  { id: "frank-ocean", name: "Frank Ocean", domain: "music" },
  { id: "grimes", name: "Grimes", domain: "music" },
  { id: "james-blake", name: "James Blake", domain: "music" },
  { id: "oneohtrix-point-never", name: "Oneohtrix Point Never", domain: "music" },
  { id: "death-grips", name: "Death Grips", domain: "music" },
  { id: "arca", name: "ARCA", domain: "music" },

  // Fashion & Design
  { id: "virgil-abloh", name: "Virgil Abloh", domain: "fashion" },
  { id: "phoebe-philo", name: "Phoebe Philo", domain: "fashion" },
  { id: "rei-kawakubo", name: "Rei Kawakubo", domain: "fashion" },
  { id: "rick-owens", name: "Rick Owens", domain: "fashion" },
  { id: "grace-jones", name: "Grace Jones", domain: "fashion" },
  { id: "iris-apfel", name: "Iris Apfel", domain: "fashion" },
  { id: "coco-chanel", name: "Coco Chanel", domain: "fashion" },
  { id: "alexander-mcqueen", name: "Alexander McQueen", domain: "fashion" },
  { id: "issey-miyake", name: "Issey Miyake", domain: "design" },
  { id: "paul-smith", name: "Paul Smith", domain: "fashion" },
  { id: "dieter-rams", name: "Dieter Rams", domain: "design" },
  { id: "ettore-sottsass", name: "Ettore Sottsass", domain: "design" },
  { id: "jonathan-anderson", name: "Jonathan Anderson", domain: "fashion" },
  { id: "haider-ackermann", name: "Haider Ackermann", domain: "fashion" },
  { id: "raf-simons", name: "Raf Simons", domain: "fashion" },
  { id: "Ann-Demeulemeester", name: "Ann Demeulemeester", domain: "fashion" },

  // Film & Directing
  { id: "wes-anderson", name: "Wes Anderson", domain: "film" },
  { id: "quentin-tarantino", name: "Quentin Tarantino", domain: "film" },
  { id: "jean-luc-godard", name: "Jean-Luc Godard", domain: "film" },
  { id: "wong-kar-wai", name: "Wong Kar-wai", domain: "film" },
  { id: "sofia-coppola", name: "Sofia Coppola", domain: "film" },
  { id: "hayao-miyazaki", name: "Hayao Miyazaki", domain: "film" },
  { id: "bong-joon-ho", name: "Bong Joon-ho", domain: "film" },
  { id: "pedro-almodovar", name: "Pedro Almodóvar", domain: "film" },
  { id: "agnes-varda", name: "Agnès Varda", domain: "film" },
  { id: "david-lynch", name: "David Lynch", domain: "film" },
  { id: "stanley-kubrick", name: "Stanley Kubrick", domain: "film" },
  { id: "kurosawa-akira", name: "Kurosawa Akira", domain: "film" },
  { id: "park-chan-wook", name: "Park Chan-wook", domain: "film" },

  // Architecture
  { id: "frank-lloyd-wright", name: "Frank Lloyd Wright", domain: "architecture" },
  { id: "zaha-hadid", name: "Zaha Hadid", domain: "architecture" },
  { id: "tadao-ando", name: "Tadao Ando", domain: "architecture" },
  { id: "rem-koolhaas", name: "Rem Koolhaas", domain: "architecture" },
  { id: "le-corbusier", name: "Le Corbusier", domain: "architecture" },
  { id: "i-m-pei", name: "I.M. Pei", domain: "architecture" },
  { id: "david-adjaye", name: "David Adjaye", domain: "architecture" },

  // Food & Culinary
  { id: "anthony-bourdain", name: "Anthony Bourdain", domain: "food" },
  { id: "massimo-bottura", name: "Massimo Bottura", domain: "food" },
  { id: "rene-redzepi", name: "René Redzepi", domain: "food" },
  { id: "nobu-matsuhisa", name: "Nobu Matsuhisa", domain: "food" },
  { id: "alice-waters", name: "Alice Waters", domain: "food" },
  { id: "thomas-keller", name: "Thomas Keller", domain: "food" },

  // Literature & Writing
  { id: "james-baldwin", name: "James Baldwin", domain: "literature" },
  { id: "zadie-smith", name: "Zadie Smith", domain: "literature" },
  { id: "toni-morrison", name: "Toni Morrison", domain: "literature" },
  { id: "haruki-murakami", name: "Haruki Murakami", domain: "literature" },
  { id: "bell-hooks", name: "bell hooks", domain: "literature" },
  { id: "octavia-butler", name: "Octavia Butler", domain: "literature" },
  { id: "joyce-carol-oates", name: "Joyce Carol Oates", domain: "literature" },
  { id: "david-foster-wallace", name: "David Foster Wallace", domain: "literature" },
  { id: "susan-sontag", name: "Susan Sontag", domain: "literature" },
  { id: "hannah-arendt", name: "Hannah Arendt", domain: "philosophy" },

  // Philosophy & Theory
  { id: "simone-de-beauvoir", name: "Simone de Beauvoir", domain: "philosophy" },
  { id: "michel-foucault", name: "Michel Foucault", domain: "philosophy" },
  { id: "jacques-derrida", name: "Jacques Derrida", domain: "philosophy" },
  { id: "donna-haraway", name: "Donna Haraway", domain: "philosophy" },
  { id: "giorgio-agamben", name: "Giorgio Agamben", domain: "philosophy" },

  // Business & Innovation
  { id: "steve-jobs", name: "Steve Jobs", domain: "business" },
  { id: "dieter-rams", name: "Dieter Rams", domain: "design" },

  // Sports & Athletics
  { id: "muhammad-ali", name: "Muhammad Ali", domain: "sport" },
  { id: "serena-williams", name: "Serena Williams", domain: "sport" },
  { id: "spike-lee", name: "Spike Lee", domain: "film" },

  // Politics & Activism
  { id: "malala-yousafzai", name: "Malala Yousafzai", domain: "politics" },
  { id: "rosa-parks", name: "Rosa Parks", domain: "politics" },
];

// Exactly 35 scent pills
export const SCENT_PILLS: ScentPill[] = [
  "old books",
  "wet concrete",
  "cedar",
  "incense",
  "thrift store leather",
  "sunscreen",
  "salt water",
  "fresh linen",
  "gasoline",
  "espresso",
  "rain on hot asphalt",
  "campfire smoke",
  "dried flowers",
  "sandalwood",
  "cold metal",
  "warm wood",
  "pine needles",
  "tobacco",
  "ocean air",
  "fresh paint",
  "sawdust",
  "burnt sugar",
  "citrus peel",
  "moss",
  "dark chocolate",
  "motor oil",
  "clay",
  "clean cotton",
  "patchouli",
  "wildflowers",
  "new car",
  "vanilla",
  "amber resin",
  "wet earth",
  "rubbing alcohol",
  "copper",
];

// Exactly 28 texture pills
export const TEXTURE_PILLS: TexturePill[] = [
  "worn leather",
  "raw denim",
  "cold marble",
  "sun-warmed wood",
  "wet clay",
  "brushed steel",
  "crumpled linen",
  "velvet",
  "rough concrete",
  "smooth ceramic",
  "woven cotton",
  "cork",
  "hammered metal",
  "soft wool",
  "dried grass",
  "polished stone",
  "weathered wood",
  "silk",
  "recycled cardboard",
  "hand-thrown pottery",
  "bone",
  "wax",
  "unfinished plywood",
  "knit",
  "tattered paper",
  "sanded brass",
  "frosted glass",
  "volcanic rock",
];

// Exactly 20 enemy pills
export const ENEMY_PILLS: EnemyPill[] = [
  "fast fashion",
  "algorithmic sameness",
  "corporate wellness",
  "fake sustainability",
  "overpriced basics",
  "trend-chasing",
  "hustle culture",
  "minimalism-as-personality",
  "luxury gatekeeping",
  "mass production",
  "performative activism",
  "influencer culture",
  "disposability",
  "boring design",
  "greenwashing",
  "toxic positivity",
  "subscription fatigue",
  "AI-generated everything",
  "beige aesthetics",
  "overconsumption",
];

// Helper function: Search songs by title or artist
export function searchSongs(query: string): Song[] {
  const lowerQuery = query.toLowerCase();
  return SONGS.filter(
    (song) =>
      song.title.toLowerCase().includes(lowerQuery) ||
      song.artist.toLowerCase().includes(lowerQuery)
  );
}

// Helper function: Search neighborhoods by name or city
export function searchNeighborhoods(query: string): Neighborhood[] {
  const lowerQuery = query.toLowerCase();
  return NEIGHBORHOODS.filter(
    (neighborhood) =>
      neighborhood.name.toLowerCase().includes(lowerQuery) ||
      neighborhood.city.toLowerCase().includes(lowerQuery)
  );
}

// Helper function: Search dinner guests by name or domain
export function searchGuests(query: string): DinnerGuest[] {
  const lowerQuery = query.toLowerCase();
  return DINNER_GUESTS.filter(
    (guest) =>
      guest.name.toLowerCase().includes(lowerQuery) ||
      guest.domain.toLowerCase().includes(lowerQuery)
  );
}
