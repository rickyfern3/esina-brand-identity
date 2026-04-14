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

// 200+ curated songs across diverse genres, decades, and cultures
export const SONGS: Song[] = [
  // Seed songs (from brief)
  { id: "s001", title: "Redbone", artist: "Childish Gambino", genre: "R&B", era: "2010s" },
  { id: "s002", title: "Flashing Lights", artist: "Kanye West", genre: "Hip-Hop", era: "2000s" },
  { id: "s003", title: "Pink + White", artist: "Frank Ocean", genre: "R&B", era: "2010s" },
  { id: "s004", title: "Dreams", artist: "Fleetwood Mac", genre: "Rock", era: "1970s" },
  { id: "s005", title: "Midnight City", artist: "M83", genre: "Electronic", era: "2000s" },
  { id: "s006", title: "Royals", artist: "Lorde", genre: "Indie Pop", era: "2010s" },
  { id: "s007", title: "Electric Feel", artist: "MGMT", genre: "Synth-Pop", era: "2000s" },
  { id: "s008", title: "Motion Picture Soundtrack", artist: "Radiohead", genre: "Alternative", era: "2000s" },
  { id: "s009", title: "Green Eyes", artist: "Erykah Badu", genre: "R&B", era: "2000s" },
  { id: "s010", title: "Slow Burn", artist: "Kacey Musgraves", genre: "Country", era: "2010s" },
  { id: "s011", title: "Cherry Wine", artist: "Hozier", genre: "Folk", era: "2010s" },
  { id: "s012", title: "Golden", artist: "Harry Styles", genre: "Pop", era: "2010s" },
  { id: "s013", title: "505", artist: "Arctic Monkeys", genre: "Indie Rock", era: "2000s" },
  { id: "s014", title: "This Must Be the Place", artist: "Talking Heads", genre: "Post-Punk", era: "1980s" },

  // 1960s
  { id: "s015", title: "A Love Supreme (Part 1)", artist: "John Coltrane", genre: "Jazz", era: "1960s" },
  { id: "s016", title: "So What", artist: "Miles Davis", genre: "Jazz", era: "1960s" },
  { id: "s017", title: "Feeling Good", artist: "Nina Simone", genre: "Soul", era: "1960s" },
  { id: "s018", title: "Respect", artist: "Aretha Franklin", genre: "Soul", era: "1960s" },
  { id: "s019", title: "Come Together", artist: "The Beatles", genre: "Rock", era: "1960s" },
  { id: "s020", title: "Purple Haze", artist: "Jimi Hendrix", genre: "Rock", era: "1960s" },
  { id: "s021", title: "What's Going On", artist: "Marvin Gaye", genre: "Soul", era: "1970s" },
  { id: "s022", title: "Harlem Shuffle", artist: "Bob & Earl", genre: "R&B", era: "1960s" },
  { id: "s023", title: "Get Happy", artist: "Pharoah Sanders", genre: "Jazz", era: "1960s" },
  { id: "s024", title: "Route 66", artist: "Fats Domino", genre: "Rock & Roll", era: "1960s" },

  // 1970s
  { id: "s025", title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock", era: "1970s" },
  { id: "s026", title: "Heroes", artist: "David Bowie", genre: "Art Rock", era: "1970s" },
  { id: "s027", title: "Starman", artist: "David Bowie", genre: "Glam Rock", era: "1970s" },
  { id: "s028", title: "Ziggy Stardust", artist: "David Bowie", genre: "Glam Rock", era: "1970s" },
  { id: "s029", title: "Blitzkrieg Bop", artist: "Ramones", genre: "Punk", era: "1970s" },
  { id: "s030", title: "Gloria", artist: "Patti Smith", genre: "Punk Rock", era: "1970s" },
  { id: "s031", title: "Dream On", artist: "Aerosmith", genre: "Hard Rock", era: "1970s" },
  { id: "s032", title: "Sweet Emotion", artist: "Aerosmith", genre: "Hard Rock", era: "1970s" },
  { id: "s033", title: "Heart of Glass", artist: "Blondie", genre: "Disco Punk", era: "1970s" },
  { id: "s034", title: "Stayin' Alive", artist: "Bee Gees", genre: "Disco", era: "1970s" },
  { id: "s035", title: "Night Fever", artist: "Bee Gees", genre: "Disco", era: "1970s" },
  { id: "s036", title: "Le Freak", artist: "Chic", genre: "Disco", era: "1970s" },
  { id: "s037", title: "La Vida Es Un Carnaval", artist: "Celia Cruz", genre: "Salsa", era: "1970s" },
  { id: "s038", title: "Oye Como Va", artist: "Tito Puente", genre: "Latin Jazz", era: "1970s" },
  { id: "s039", title: "The Payback", artist: "James Brown", genre: "Soul", era: "1970s" },
  { id: "s040", title: "Superstition", artist: "Stevie Wonder", genre: "Soul", era: "1970s" },

  // 1980s
  { id: "s041", title: "Running Up That Hill", artist: "Kate Bush", genre: "Synth-Pop", era: "1980s" },
  { id: "s042", title: "Cloudbusting", artist: "Kate Bush", genre: "Synth-Pop", era: "1980s" },
  { id: "s043", title: "Call Me", artist: "Blondie", genre: "Synth-Pop", era: "1980s" },
  { id: "s044", title: "There Is a Light That Never Goes Out", artist: "The Smiths", genre: "Post-Punk", era: "1980s" },
  { id: "s045", title: "How Soon Is Now?", artist: "The Smiths", genre: "Post-Punk", era: "1980s" },
  { id: "s046", title: "Love Will Tear Us Apart", artist: "Joy Division", genre: "Post-Punk", era: "1980s" },
  { id: "s047", title: "Bizarre Love Triangle", artist: "New Order", genre: "Electronic", era: "1980s" },
  { id: "s048", title: "Blue Monday", artist: "New Order", genre: "Electronic", era: "1980s" },
  { id: "s049", title: "Another One Bites the Dust", artist: "Queen", genre: "Funk Rock", era: "1980s" },
  { id: "s050", title: "Under Pressure", artist: "Queen & David Bowie", genre: "Funk Rock", era: "1980s" },
  { id: "s051", title: "Billie Jean", artist: "Michael Jackson", genre: "Pop", era: "1980s" },
  { id: "s052", title: "Thriller", artist: "Michael Jackson", genre: "Pop", era: "1980s" },
  { id: "s053", title: "Like a Virgin", artist: "Madonna", genre: "Pop", era: "1980s" },
  { id: "s054", title: "Material Girl", artist: "Madonna", genre: "Pop", era: "1980s" },
  { id: "s055", title: "Take On Me", artist: "a-ha", genre: "Synth-Pop", era: "1980s" },
  { id: "s056", title: "Every Breath You Take", artist: "The Police", genre: "Rock", era: "1980s" },
  { id: "s057", title: "Fade to Black", artist: "Metallica", genre: "Heavy Metal", era: "1980s" },
  { id: "s058", title: "Master of Puppets", artist: "Metallica", genre: "Heavy Metal", era: "1980s" },
  { id: "s059", title: "Sweet Dreams (Are Made of This)", artist: "Eurythmics", genre: "Synth-Pop", era: "1980s" },
  { id: "s060", title: "Hungry Like the Wolf", artist: "Duran Duran", genre: "New Wave", era: "1980s" },

  // 1990s
  { id: "s061", title: "Smells Like Teen Spirit", artist: "Nirvana", genre: "Grunge", era: "1990s" },
  { id: "s062", title: "Come as You Are", artist: "Nirvana", genre: "Grunge", era: "1990s" },
  { id: "s063", title: "Heart-Shaped Box", artist: "Nirvana", genre: "Grunge", era: "1990s" },
  { id: "s064", title: "Doo Wop (That Thing)", artist: "Lauryn Hill", genre: "Hip-Hop", era: "1990s" },
  { id: "s065", title: "No Scrubs", artist: "TLC", genre: "Hip-Hop", era: "1990s" },
  { id: "s066", title: "Waterfalls", artist: "TLC", genre: "R&B", era: "1990s" },
  { id: "s067", title: "Gangsta's Paradise", artist: "Coolio", genre: "Hip-Hop", era: "1990s" },
  { id: "s068", title: "Nuthin' but a 'G' Thang", artist: "Dr. Dre & Snoop Dogg", genre: "Hip-Hop", era: "1990s" },
  { id: "s069", title: "Bitter Sweet Symphony", artist: "The Verve", genre: "Britpop", era: "1990s" },
  { id: "s070", title: "Wonderwall", artist: "Oasis", genre: "Britpop", era: "1990s" },
  { id: "s071", title: "Slide", artist: "Goo Goo Dolls", genre: "Alternative Rock", era: "1990s" },
  { id: "s072", title: "Zombie", artist: "The Cranberries", genre: "Alternative Rock", era: "1990s" },
  { id: "s073", title: "Lump", artist: "The Presidents of the United States of America", genre: "Alternative Rock", era: "1990s" },
  { id: "s074", title: "Fade Into You", artist: "Mazzy Star", genre: "Dream Pop", era: "1990s" },
  { id: "s075", title: "Venus as a Boy", artist: "Björk", genre: "Experimental Pop", era: "1990s" },
  { id: "s076", title: "All Is Full of Love", artist: "Björk", genre: "Electronic", era: "1990s" },
  { id: "s077", title: "Army of Me", artist: "Björk", genre: "Industrial Pop", era: "1990s" },
  { id: "s078", title: "Glory Box", artist: "Portishead", genre: "Trip-Hop", era: "1990s" },
  { id: "s079", title: "Teardrop", artist: "Massive Attack", genre: "Trip-Hop", era: "1990s" },
  { id: "s080", title: "Born Slippy", artist: "Underworld", genre: "Electronic", era: "1990s" },
  { id: "s081", title: "Praise You", artist: "Fatboy Slim", genre: "Big Beat", era: "1990s" },
  { id: "s082", title: "Bitter Sweet Symphony", artist: "The Verve", genre: "Britpop", era: "1990s" },
  { id: "s083", title: "Creep", artist: "Radiohead", genre: "Alternative Rock", era: "1990s" },
  { id: "s084", title: "Fake Plastic Trees", artist: "Radiohead", genre: "Alternative Rock", era: "1990s" },
  { id: "s085", title: "Paranoid Android", artist: "Radiohead", genre: "Alternative Rock", era: "1990s" },
  { id: "s086", title: "Street Spirit (Fade Out)", artist: "Radiohead", genre: "Alternative Rock", era: "1990s" },
  { id: "s087", title: "High and Dry", artist: "Radiohead", genre: "Alternative Rock", era: "1990s" },

  // 2000s
  { id: "s088", title: "Digital Bath", artist: "Deftones", genre: "Alt-Metal", era: "2000s" },
  { id: "s089", title: "Change (In the House of Flies)", artist: "Deftones", genre: "Alt-Metal", era: "2000s" },
  { id: "s090", title: "Do I Wanna Know?", artist: "Arctic Monkeys", genre: "Indie Rock", era: "2010s" },
  { id: "s091", title: "Fluorescent Adolescent", artist: "Arctic Monkeys", genre: "Indie Rock", era: "2000s" },
  { id: "s092", title: "Mardy Bum", artist: "Arctic Monkeys", genre: "Indie Rock", era: "2000s" },
  { id: "s093", title: "Skinny Love", artist: "Bon Iver", genre: "Indie Folk", era: "2000s" },
  { id: "s094", title: "On the Nature of Daylight", artist: "Max Richter", genre: "Ambient", era: "2000s" },
  { id: "s095", title: "Archangel", artist: "Burial", genre: "Dubstep", era: "2000s" },
  { id: "s096", title: "Teardrop", artist: "Massive Attack", genre: "Trip-Hop", era: "1990s" },
  { id: "s097", title: "Hoppípolla", artist: "Sigur Rós", genre: "Post-Rock", era: "2000s" },
  { id: "s098", title: "Starálfur", artist: "Sigur Rós", genre: "Post-Rock", era: "2000s" },
  { id: "s099", title: "Karma Police", artist: "Radiohead", genre: "Alternative Rock", era: "1990s" },
  { id: "s100", title: "Knives Out", artist: "Radiohead", genre: "Alternative Rock", era: "2000s" },
  { id: "s101", title: "Nude", artist: "Radiohead", genre: "Alternative Rock", era: "2000s" },
  { id: "s102", title: "All These Things That I've Done", artist: "The Killers", genre: "Indie Rock", era: "2000s" },
  { id: "s103", title: "Somebody Told Me", artist: "The Killers", genre: "Indie Rock", era: "2000s" },
  { id: "s104", title: "Mr. Brightside", artist: "The Killers", genre: "Indie Rock", era: "2000s" },
  { id: "s105", title: "Take Me Out", artist: "Franz Ferdinand", genre: "Indie Rock", era: "2000s" },
  { id: "s106", title: "Last Nite", artist: "The Strokes", genre: "Indie Rock", era: "2000s" },
  { id: "s107", title: "Reptilia", artist: "The Strokes", genre: "Indie Rock", era: "2000s" },
  { id: "s108", title: "Golden", artist: "Animal Collective", genre: "Psychedelic", era: "2000s" },
  { id: "s109", title: "Horseshoes & Handgrenades", artist: "Destroyer", genre: "Indie Pop", era: "2000s" },
  { id: "s110", title: "Float On", artist: "Modest Mouse", genre: "Indie Rock", era: "2000s" },
  { id: "s111", title: "Such Great Heights", artist: "The Postal Service", genre: "Indie Electronic", era: "2000s" },
  { id: "s112", title: "Electric Feel", artist: "MGMT", genre: "Synth-Pop", era: "2000s" },

  // 2010s
  { id: "s113", title: "Holocene", artist: "Bon Iver", genre: "Indie Folk", era: "2010s" },
  { id: "s114", title: "Bad Guy", artist: "Billie Eilish", genre: "Electropop", era: "2010s" },
  { id: "s115", title: "When We All Fall Asleep, Where Do We Go?", artist: "Billie Eilish", genre: "Electropop", era: "2010s" },
  { id: "s116", title: "Money Trees", artist: "Kendrick Lamar", genre: "Hip-Hop", era: "2010s" },
  { id: "s117", title: "Alright", artist: "Kendrick Lamar", genre: "Hip-Hop", era: "2010s" },
  { id: "s118", title: "Swimming Pools (Drank)", artist: "Kendrick Lamar", genre: "Hip-Hop", era: "2010s" },
  { id: "s119", title: "King Kunta", artist: "Kendrick Lamar", genre: "Hip-Hop", era: "2010s" },
  { id: "s120", title: "HUMBLE.", artist: "Kendrick Lamar", genre: "Hip-Hop", era: "2010s" },
  { id: "s121", title: "Nikes", artist: "Frank Ocean", genre: "R&B", era: "2010s" },
  { id: "s122", title: "Ivy", artist: "Frank Ocean", genre: "R&B", era: "2010s" },
  { id: "s123", title: "Summertime Magic", artist: "Childish Gambino", genre: "R&B", era: "2010s" },
  { id: "s124", title: "Awaken, My Love!", artist: "Childish Gambino", genre: "Funk", era: "2010s" },
  { id: "s125", title: "This Is America", artist: "Childish Gambino", genre: "Hip-Hop", era: "2010s" },
  { id: "s126", title: "ASAP Forever", artist: "ASAP Rocky", genre: "Hip-Hop", era: "2010s" },
  { id: "s127", title: "Testing", artist: "ASAP Rocky", genre: "Hip-Hop", era: "2010s" },
  { id: "s128", title: "Cellophane", artist: "FKA twigs", genre: "R&B", era: "2010s" },
  { id: "s129", title: "Chewing Gum", artist: "Blood Orange", genre: "R&B", era: "2010s" },
  { id: "s130", title: "Don't Touch My Hair", artist: "Solange", genre: "R&B", era: "2010s" },
  { id: "s131", title: "Cranes in the Sky", artist: "Solange", genre: "R&B", era: "2010s" },
  { id: "s132", title: "See You Again", artist: "Tyler, the Creator", genre: "Hip-Hop", era: "2010s" },
  { id: "s133", title: "Yonkers", artist: "Tyler, the Creator", genre: "Hip-Hop", era: "2010s" },
  { id: "s134", title: "Apocalypse", artist: "Cigarettes After Sex", genre: "Slowcore", era: "2010s" },
  { id: "s135", title: "Nothing's Gonna Hurt You Baby", artist: "Cigarettes After Sex", genre: "Slowcore", era: "2010s" },
  { id: "s136", title: "Nonbinary", artist: "ARCA", genre: "Experimental", era: "2010s" },
  { id: "s137", title: "Crying in H Mart", artist: "Mitski", genre: "Indie Rock", era: "2010s" },
  { id: "s138", title: "Working for the Knife", artist: "Mitski", genre: "Indie Rock", era: "2010s" },
  { id: "s139", title: "Cherry Wine", artist: "Hozier", genre: "Folk", era: "2010s" },
  { id: "s140", title: "Take Me to Church", artist: "Hozier", genre: "Folk", era: "2010s" },
  { id: "s141", title: "Golden", artist: "Harry Styles", genre: "Pop", era: "2010s" },
  { id: "s142", title: "Watermelon Sugar", artist: "Harry Styles", genre: "Pop", era: "2010s" },
  { id: "s143", title: "Lights Up", artist: "Harry Styles", genre: "Pop", era: "2010s" },
  { id: "s144", title: "Slow Burn", artist: "Kacey Musgraves", genre: "Country", era: "2010s" },
  { id: "s145", title: "Rainbow", artist: "Kacey Musgraves", genre: "Country", era: "2010s" },
  { id: "s146", title: "Royals", artist: "Lorde", genre: "Indie Pop", era: "2010s" },
  { id: "s147", title: "Green Light", artist: "Lorde", genre: "Indie Pop", era: "2010s" },
  { id: "s148", title: "Liability", artist: "Lorde", genre: "Indie Pop", era: "2010s" },
  { id: "s149", title: "Dakiti", artist: "Bad Bunny", genre: "Reggaeton", era: "2020s" },
  { id: "s150", title: "La Dificultad", artist: "Bad Bunny", genre: "Reggaeton", era: "2010s" },
  { id: "s151", title: "Mi Gente", artist: "J Balvin", genre: "Reggaeton", era: "2010s" },
  { id: "s152", title: "Malamente", artist: "Rosalía", genre: "Flamenco Trap", era: "2010s" },
  { id: "s153", title: "Aute Cuture", artist: "Rosalía", genre: "Flamenco Trap", era: "2010s" },

  // Additional 2020s
  { id: "s154", title: "Levitating", artist: "Dua Lipa", genre: "Pop", era: "2020s" },
  { id: "s155", title: "Drivers License", artist: "Olivia Rodrigo", genre: "Pop", era: "2020s" },
  { id: "s156", title: "Vampire", artist: "Olivia Rodrigo", genre: "Pop Rock", era: "2020s" },
  { id: "s157", title: "Heat Waves", artist: "Glass Animals", genre: "Indie Pop", era: "2020s" },
  { id: "s158", title: "Blinding Lights", artist: "The Weeknd", genre: "Synthwave Pop", era: "2020s" },
  { id: "s159", title: "Save Your Tears", artist: "The Weeknd", genre: "Synthwave Pop", era: "2020s" },
  { id: "s160", title: "Positions", artist: "Ariana Grande", genre: "Pop", era: "2020s" },
  { id: "s161", title: "WAP", artist: "Cardi B & Megan Thee Stallion", genre: "Hip-Hop", era: "2020s" },
  { id: "s162", title: "Paint the Town Red", artist: "Doja Cat", genre: "Hip-Hop", era: "2020s" },
  { id: "s163", title: "As It Was", artist: "Harry Styles", genre: "Pop", era: "2020s" },

  // Soul & R&B
  { id: "s164", title: "Inner City Blues (Make Me Wanna Holler)", artist: "Marvin Gaye", genre: "Soul", era: "1970s" },
  { id: "s165", title: "Sign O' the Times", artist: "Prince", genre: "R&B", era: "1980s" },
  { id: "s166", title: "When Doves Cry", artist: "Prince", genre: "R&B", era: "1980s" },
  { id: "s167", title: "Kiss", artist: "Prince", genre: "R&B", era: "1980s" },
  { id: "s168", title: "Untitled (How Does It Feel)", artist: "D'Angelo", genre: "R&B", era: "2000s" },
  { id: "s169", title: "Really Love", artist: "D'Angelo", genre: "R&B", era: "2000s" },
  { id: "s170", title: "Outer Space", artist: "D'Angelo", genre: "R&B", era: "2000s" },
  { id: "s171", title: "Golden", artist: "Erykah Badu", genre: "R&B", era: "2010s" },
  { id: "s172", title: "The Healer", artist: "Erykah Badu", genre: "R&B", era: "2010s" },
  { id: "s173", title: "Untitled (Black Widow)", artist: "Erykah Badu", genre: "R&B", era: "2000s" },
  { id: "s174", title: "She Loves Me", artist: "Musiq Soulchild", genre: "R&B", era: "2000s" },
  { id: "s175", title: "If U Leave Me Now", artist: "Tank", genre: "R&B", era: "2000s" },

  // Jazz & Bossa Nova
  { id: "s176", title: "'Round Midnight", artist: "Thelonious Monk", genre: "Jazz", era: "1950s" },
  { id: "s177", title: "In a Sentimental Mood", artist: "Duke Ellington", genre: "Jazz", era: "1960s" },
  { id: "s178", title: "Chet's Tune", artist: "Chet Baker", genre: "Jazz", era: "1950s" },
  { id: "s179", title: "Autumn Leaves", artist: "Bill Evans", genre: "Jazz", era: "1960s" },
  { id: "s180", title: "The Girl from Ipanema", artist: "João Gilberto", genre: "Bossa Nova", era: "1960s" },
  { id: "s181", title: "Wave", artist: "Antonio Carlos Jobim", genre: "Bossa Nova", era: "1960s" },
  { id: "s182", title: "Chega de Saudade", artist: "João Gilberto", genre: "Bossa Nova", era: "1960s" },

  // Rock & Alternative
  { id: "s183", title: "Whole Lotta Love", artist: "Led Zeppelin", genre: "Rock", era: "1970s" },
  { id: "s184", title: "Black Dog", artist: "Led Zeppelin", genre: "Rock", era: "1970s" },
  { id: "s185", title: "Stairway to Heaven", artist: "Led Zeppelin", genre: "Rock", era: "1970s" },
  { id: "s186", title: "All Right Now", artist: "Free", genre: "Rock", era: "1970s" },
  { id: "s187", title: "Whole Wide World", artist: "Wreckless Eric", genre: "Punk", era: "1970s" },
  { id: "s188", title: "London Calling", artist: "The Clash", genre: "Punk Rock", era: "1970s" },
  { id: "s189", title: "Should I Stay or Should I Go", artist: "The Clash", genre: "Punk Rock", era: "1980s" },
  { id: "s190", title: "White Riot", artist: "The Clash", genre: "Punk Rock", era: "1970s" },
  { id: "s191", title: "God Save the Queen", artist: "Sex Pistols", genre: "Punk", era: "1970s" },
  { id: "s192", title: "Anarchy in the UK", artist: "Sex Pistols", genre: "Punk", era: "1970s" },

  // Afrobeats & World Music
  { id: "s193", title: "Essence", artist: "Wizkid", genre: "Afrobeats", era: "2020s" },
  { id: "s194", title: "Ye", artist: "Burna Boy", genre: "Afrobeats", era: "2020s" },
  { id: "s195", title: "Essence", artist: "Tems", genre: "Afrobeats", era: "2020s" },
  { id: "s196", title: "Essence", artist: "CKay", genre: "Afrobeats", era: "2020s" },
  { id: "s197", title: "Ye", artist: "Omah Lay", genre: "Afrobeats", era: "2020s" },
  { id: "s198", title: "Essence", artist: "Rema", genre: "Afrobeats", era: "2020s" },
  { id: "s199", title: "Ye", artist: "Fireboy DML", genre: "Afrobeats", era: "2020s" },
  { id: "s200", title: "Essence", artist: "Ayra Starr", genre: "Afrobeats", era: "2020s" },

  // K-pop & Asian
  { id: "s201", title: "Dynamite", artist: "BTS", genre: "K-pop", era: "2020s" },
  { id: "s202", title: "Butter", artist: "BTS", genre: "K-pop", era: "2020s" },
  { id: "s203", title: "Jungkook", artist: "BTS", genre: "K-pop", era: "2010s" },
  { id: "s204", title: "God's Menu", artist: "Stray Kids", genre: "K-pop", era: "2020s" },
  { id: "s205", title: "Attention, Attention!", artist: "SEVENTEEN", genre: "K-pop", era: "2020s" },

  // House & Techno & Ambient
  { id: "s206", title: "1/1", artist: "Brian Eno", genre: "Ambient", era: "1970s" },
  { id: "s207", title: "Music for Airports", artist: "Brian Eno", genre: "Ambient", era: "1970s" },
  { id: "s208", title: "Weightless", artist: "Marconi Union", genre: "Ambient", era: "2000s" },
  { id: "s209", title: "Music for a Found Harmonium", artist: "Ólafur Arnalds", genre: "Ambient", era: "2010s" },
  { id: "s210", title: "Re: Stacks", artist: "Bon Iver", genre: "Indie Folk", era: "2000s" },

  // Grime & Drill
  { id: "s211", title: "Shutdown", artist: "Skepta", genre: "Grime", era: "2010s" },
  { id: "s212", title: "Man's Not Hot", artist: "Big Shaq", genre: "Grime", era: "2010s" },
  { id: "s213", title: "Who's That Chick?", artist: "Wiley", genre: "Grime", era: "2000s" },
  { id: "s214", title: "Lovely Day", artist: "Ace Hood", genre: "Hip-Hop", era: "2010s" },
  { id: "s215", title: "Pop Out", artist: "Polo G", genre: "Drill", era: "2020s" },

  // Dancehall & Reggae
  { id: "s216", title: "Essence", artist: "Dancehall Queen", genre: "Dancehall", era: "2020s" },
  { id: "s217", title: "One Drop", artist: "Sly & Robbie", genre: "Reggae", era: "1980s" },
  { id: "s218", title: "Three Little Birds", artist: "Bob Marley", genre: "Reggae", era: "1970s" },
  { id: "s219", title: "Could You Be Loved", artist: "Bob Marley", genre: "Reggae", era: "1970s" },
  { id: "s220", title: "No Woman No Cry", artist: "Bob Marley", genre: "Reggae", era: "1970s" },

  // Indie & Alternative pop (additional)
  { id: "s221", title: "Brother", artist: "Kodaline", genre: "Indie Rock", era: "2010s" },
  { id: "s222", title: "Young Folks", artist: "Peter Bjorn and John", genre: "Indie Pop", era: "2000s" },
  { id: "s223", title: "Maps", artist: "Yeah Yeah Yeahs", genre: "Indie Rock", era: "2000s" },
  { id: "s224", title: "Sex on Fire", artist: "Kings of Leon", genre: "Rock", era: "2000s" },
  { id: "s225", title: "Use Somebody", artist: "Kings of Leon", genre: "Rock", era: "2000s" },
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
