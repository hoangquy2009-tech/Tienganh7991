/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Thông tin chương trình GDPT 2018 môn Tiếng Anh (Tiểu học, THCS & THPT) theo Công văn 7991/BGDĐT-GDTrH
export interface UnitCurriculum {
  unit: number;
  title: string;
  pronunciation: string;
  grammar: string;
  vocabulary: string;
  readingTopic: string;
  writingGenre: string;
}

export interface GradeCurriculum {
  grade: string;
  level: "Tiểu học" | "THCS" | "THPT";
  defaultDuration: number;
  termUnits: {
    midTerm1: number[];
    endTerm1: number[];
    midTerm2: number[];
    endTerm2: number[];
  };
  units: UnitCurriculum[];
}

export const CURRICULUM_DATA: Record<string, GradeCurriculum> = {
  "1": {
    grade: "1",
    level: "Tiểu học",
    defaultDuration: 35,
    termUnits: {
      midTerm1: [1, 2],
      endTerm1: [1, 2, 3, 4],
      midTerm2: [5, 6],
      endTerm2: [5, 6, 7, 8],
    },
    units: [
      { unit: 1, title: "In the School Playground", pronunciation: "Letter sound /b/", grammar: "Hello, I'm... / Bye", vocabulary: "ball, bike, book, boy", readingTopic: "School things and playground", writingGenre: "Trace letters and trace words" },
      { unit: 2, title: "In the Dining Room", pronunciation: "Letter sound /c/", grammar: "I have a...", vocabulary: "cake, car, cat, cup", readingTopic: "Birthday party and dining", writingGenre: "Trace and circle" },
      { unit: 3, title: "At the Street Market", pronunciation: "Letter sound /a/", grammar: "Look at the...", vocabulary: "apple, bag, can, hat", readingTopic: "Market and fruits", writingGenre: "Trace letters and match" },
      { unit: 4, title: "In the Bedroom", pronunciation: "Letter sound /d/", grammar: "This is a...", vocabulary: "desk, dog, door, duck", readingTopic: "Things in the bedroom", writingGenre: "Trace and colour" }
    ]
  },
  "2": {
    grade: "2",
    level: "Tiểu học",
    defaultDuration: 35,
    termUnits: {
      midTerm1: [1, 2],
      endTerm1: [1, 2, 3, 4],
      midTerm2: [5, 6],
      endTerm2: [5, 6, 7, 8],
    },
    units: [
      { unit: 1, title: "At My Birthday Party", pronunciation: "Letter sound /p/", grammar: "Pass me the..., please.", vocabulary: "popcorn, pasta, pizza, pen", readingTopic: "Birthday food and gifts", writingGenre: "Trace and copy words" },
      { unit: 2, title: "In the Backyard", pronunciation: "Letter sound /k/", grammar: "Point to the...", vocabulary: "kite, kitten, bike", readingTopic: "Backyard play", writingGenre: "Match and write" },
      { unit: 3, title: "At the Seaside", pronunciation: "Letter sound /s/", grammar: "I can see a...", vocabulary: "sail, sand, sea, sun", readingTopic: "Beach holiday", writingGenre: "Circle and write" },
      { unit: 4, title: "In the Countryside", pronunciation: "Letter sound /r/", grammar: "There is a...", vocabulary: "river, rainbow, road", readingTopic: "Country nature", writingGenre: "Look and write" }
    ]
  },
  "3": {
    grade: "3",
    level: "Tiểu học",
    defaultDuration: 35,
    termUnits: {
      midTerm1: [1, 2, 3, 4, 5],
      endTerm1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      midTerm2: [11, 12, 13, 14, 15],
      endTerm2: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    units: [
      { unit: 1, title: "Hello", pronunciation: "/h/ and /b/", grammar: "Hello / Hi, I'm... / How are you? - I'm fine, thank you.", vocabulary: "Hello, hi, goodbye, fine, thank you", readingTopic: "Greeting friends", writingGenre: "Complete sentences" },
      { unit: 2, title: "Our Names", pronunciation: "/m/ and /l/", grammar: "What's your name? - My name's...", vocabulary: "name, your, my, friend", readingTopic: "Self-introduction", writingGenre: "Fill in names" },
      { unit: 3, title: "Our Friends", pronunciation: "/t/ and /d/", grammar: "This is... / Is that...? - Yes, it is. / No, it isn't.", vocabulary: "this, that, friend, teacher", readingTopic: "Classroom friends", writingGenre: "Write short sentences" },
      { unit: 4, title: "Our Bodies", pronunciation: "/b/ and /p/", grammar: "Touch your... / What is it? - It's a/an...", vocabulary: "eye, nose, mouth, ear, hair, hand", readingTopic: "Body parts", writingGenre: "Label body parts" },
      { unit: 5, title: "My Hobbies", pronunciation: "/s/ and /sw/", grammar: "What's your hobby? - I like + V-ing.", vocabulary: "singing, dancing, drawing, swimming", readingTopic: "Children's hobbies", writingGenre: "Write about hobbies" },
      { unit: 6, title: "Our School", pronunciation: "/sk/ and /st/", grammar: "Is this our...? - Yes, it is. / No, it isn't.", vocabulary: "school, classroom, library, playground, gym", readingTopic: "School rooms", writingGenre: "Complete descriptions of school" },
      { unit: 7, title: "Classroom Instructions", pronunciation: "/st/ and /sp/", grammar: "Open / Close your... / May I come in?", vocabulary: "open, close, stand up, sit down, ask, speak", readingTopic: "Rules in class", writingGenre: "Write classroom rules" },
      { unit: 8, title: "My School Things", pronunciation: "/p/ and /r/", grammar: "I have a... / Do you have a...? - Yes, I do.", vocabulary: "pen, ruler, book, school bag, pencil case", readingTopic: "School stationery", writingGenre: "List and sentences about stationery" },
      { unit: 9, title: "Colours", pronunciation: "/bl/ and /br/", grammar: "What colour is it? - It's... / Is it...? - Yes, it is.", vocabulary: "red, blue, yellow, green, orange, brown", readingTopic: "Colours in nature", writingGenre: "Write sentences about colours" },
      { unit: 10, title: "Break Time Activities", pronunciation: "/pl/ and /sk/", grammar: "What do you do at break time? - I play...", vocabulary: "football, basketball, chess, badminton, hide-and-seek", readingTopic: "Games at recess", writingGenre: "Write a short note on break time" }
    ]
  },
  "4": {
    grade: "4",
    level: "Tiểu học",
    defaultDuration: 35,
    termUnits: {
      midTerm1: [1, 2, 3, 4, 5],
      endTerm1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      midTerm2: [11, 12, 13, 14, 15],
      endTerm2: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    units: [
      { unit: 1, title: "My Friends", pronunciation: "/fr/ and /tr/", grammar: "Where are you from? - I'm from... / Nationality", vocabulary: "Viet Nam, America, England, Japan, Australia", readingTopic: "International pen-friends", writingGenre: "Write an introductory profile" },
      { unit: 2, title: "Time and Daily Routines", pronunciation: "/cl/ and /pl/", grammar: "What time is it? - It's... / What time do you...?", vocabulary: "o'clock, get up, have breakfast, go to school, sleep", readingTopic: "Daily timetables", writingGenre: "Write daily timetable" },
      { unit: 3, title: "My Week", pronunciation: "/th/ voiced and unvoiced", grammar: "What day is it today? - It's... / What do you do on...?", vocabulary: "Monday, Tuesday, Wednesday, Thursday, Friday, weekend", readingTopic: "Weekly activities", writingGenre: "Describe a weekend" },
      { unit: 4, title: "My Birthday Party", pronunciation: "/st/ and /sk/", grammar: "When is your birthday? - It's in... / What would you like?", vocabulary: "January to December, birthday cake, fruit, juice", readingTopic: "Birthday celebrations", writingGenre: "Write a birthday invitation card" },
      { unit: 5, title: "Things We Can Do", pronunciation: "/sw/ and /sn/", grammar: "What can you do? - I can... / Can you...? - Yes, I can.", vocabulary: "swim, ride a bike, play the piano, cook, dance", readingTopic: "Talents and abilities", writingGenre: "Write about abilities" },
      { unit: 6, title: "Our School Facilities", pronunciation: "/sp/ and /sm/", grammar: "Where is your school? - It's in the... / How many classrooms are there?", vocabulary: "city, countryside, mountains, computer room, garden", readingTopic: "Schools in different places", writingGenre: "Paragraph about school facilities" },
      { unit: 7, title: "Our Timetables", pronunciation: "/bl/ and /gl/", grammar: "What subjects do you have today? - I have...", vocabulary: "Maths, English, Science, Music, Art, PE, Vietnamese", readingTopic: "Favourite subjects", writingGenre: "Write a school timetable" },
      { unit: 8, title: "My Favourite Subjects", pronunciation: "/pr/ and /br/", grammar: "What's your favourite subject? - It's... / Why? - Because...", vocabulary: "interesting, fun, important, teacher, songs", readingTopic: "Reasons for loving subjects", writingGenre: "Short note on favourite subject" },
      { unit: 9, title: "Our Sports Day", pronunciation: "/dr/ and /tr/", grammar: "When is your Sports Day? - It's in... / What are they doing?", vocabulary: "Sports Day, football match, running, jumping, relay", readingTopic: "School sports festival", writingGenre: "Describe Sports Day" },
      { unit: 10, title: "Our School Camp", pronunciation: "/fl/ and /sl/", grammar: "Where were you yesterday? - I was... / What did you do?", vocabulary: "camp, tent, campfire, sing songs, play games", readingTopic: "Weekend camping trip", writingGenre: "Short journal entry about camping" }
    ]
  },
  "5": {
    grade: "5",
    level: "Tiểu học",
    defaultDuration: 35,
    termUnits: {
      midTerm1: [1, 2, 3, 4, 5],
      endTerm1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      midTerm2: [11, 12, 13, 14, 15],
      endTerm2: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    units: [
      { unit: 1, title: "All About Me", pronunciation: "Sentence stress in addresses", grammar: "What's your address? - It's... / What's the city like?", vocabulary: "lane, street, tower, hometown, peaceful, crowded", readingTopic: "Life in cities and villages", writingGenre: "Write an email about home" },
      { unit: 2, title: "Our Homes", pronunciation: "Intonation in Wh-questions", grammar: "Where do you live? - I live in... / How often do you...?", vocabulary: "flat, cottage, city centre, always, usually, often", readingTopic: "Different homes in Viet Nam", writingGenre: "Short description of one's home" },
      { unit: 3, title: "My Foreign Friends", pronunciation: "Word stress in nationalities", grammar: "Where does he/she come from? - He/She is...", vocabulary: "Australian, Malaysian, American, Japanese, English", readingTopic: "Pen pals around the globe", writingGenre: "Letter to a foreign pen pal" },
      { unit: 4, title: "Our Free-Time Activities", pronunciation: "Rhythm in simple sentences", grammar: "What do you do in your free time? - I... / What does he do?", vocabulary: "surf the Internet, clean the house, do karate, go fishing", readingTopic: "Healthy free-time habits", writingGenre: "Paragraph about leisure time" },
      { unit: 5, title: "My Future Job", pronunciation: "Word stress in occupations", grammar: "What would you like to be in the future? - I'd like to be a...", vocabulary: "pilot, architect, writer, nurse, astronaut, engineer", readingTopic: "Dream careers", writingGenre: "Write about future dreams" },
      { unit: 6, title: "Our School Rooms", pronunciation: "Intonation in statements", grammar: "Where's the...? - It's on the first floor. / School rules", vocabulary: "first floor, ground floor, science lab, computer room", readingTopic: "Modern school tour", writingGenre: "Guide to school rooms" },
      { unit: 7, title: "Our Favourite School Activities", pronunciation: "Sentence stress", grammar: "What did you do at the festival? - We played...", vocabulary: "festival, book fair, music show, dance, prize", readingTopic: "School cultural day", writingGenre: "Recount of school event" },
      { unit: 8, title: "School Subjects", pronunciation: "Stress in multi-syllable subject words", grammar: "How often do you have...? - I have it twice a week.", vocabulary: "IT, Science, Vietnamese, English, timetable, practice", readingTopic: "Study routines", writingGenre: "Study plan" },
      { unit: 9, title: "Our Teachers' Day", pronunciation: "Intonation in greetings", grammar: "What are you going to do on Teachers' Day? - We are going to...", vocabulary: "Teachers' Day, present, flowers, card, performance", readingTopic: "Gratitude to teachers", writingGenre: "Greeting card message" },
      { unit: 10, title: "Our School Trip", pronunciation: "Past tense endings", grammar: "Where did you go on holiday? - I went to... / How did you get there?", vocabulary: "Ha Long Bay, Phu Quoc Island, train, coach, plane", readingTopic: "Memorable school trips", writingGenre: "Postcard about a vacation" }
    ]
  },
  "6": {
    grade: "6",
    level: "THCS",
    defaultDuration: 45,
    termUnits: {
      midTerm1: [1, 2, 3],
      endTerm1: [1, 2, 3, 4, 5, 6],
      midTerm2: [7, 8, 9],
      endTerm2: [7, 8, 9, 10, 11, 12],
    },
    units: [
      { unit: 1, title: "My New School", pronunciation: "/ɑː/ and /ʌ/", grammar: "Present simple, Adverbs of frequency", vocabulary: "School things, activities", readingTopic: "School life", writingGenre: "Paragraph about new school" },
      { unit: 2, title: "My House", pronunciation: "/s/ and /z/", grammar: "Possessive case, Prepositions of place", vocabulary: "Types of house, rooms, furniture", readingTopic: "Rooms and houses", writingGenre: "Email about one's house" },
      { unit: 3, title: "My Friends", pronunciation: "/b/ and /p/", grammar: "Present continuous for future", vocabulary: "Personality and appearance", readingTopic: "Friends at summer camp", writingGenre: "Blog post about best friend" },
      { unit: 4, title: "My Neighbourhood", pronunciation: "/iː/ and /ɪ/", grammar: "Comparative adjectives", vocabulary: "Places in neighbourhood", readingTopic: "Neighbourhoods", writingGenre: "Paragraph comparing places" },
      { unit: 5, title: "Natural Wonders of Viet Nam", pronunciation: "/t/ and /d/", grammar: "Countable and uncountable nouns, Must/Mustn't", vocabulary: "Natural wonders, travel items", readingTopic: "Attractions in Viet Nam", writingGenre: "Travel guide entry" },
      { unit: 6, title: "Our Tet Holiday", pronunciation: "/s/ and /ʃ/", grammar: "Should/Shouldn't for advice, Some/Any", vocabulary: "Tet activities, customs", readingTopic: "Tet celebrations", writingGenre: "Email about New Year wishes" }
    ]
  },
  "7": {
    grade: "7",
    level: "THCS",
    defaultDuration: 45,
    termUnits: {
      midTerm1: [1, 2, 3],
      endTerm1: [1, 2, 3, 4, 5, 6],
      midTerm2: [7, 8, 9],
      endTerm2: [7, 8, 9, 10, 11, 12],
    },
    units: [
      { unit: 1, title: "Hobbies", pronunciation: "/ə/ and /ɜː/", grammar: "Present simple, Verbs of liking + V-ing", vocabulary: "Hobbies, leisure activities", readingTopic: "Interesting hobbies", writingGenre: "Paragraph about a hobby" },
      { unit: 2, title: "Healthy Living", pronunciation: "/f/ and /v/", grammar: "Simple sentences", vocabulary: "Health problems, healthy habits", readingTopic: "Healthy tips", writingGenre: "Passage giving health advice" },
      { unit: 3, title: "Community Service", pronunciation: "/t/, /d/, /ɪd/ (-ed)", grammar: "Past simple", vocabulary: "Volunteer activities, charity", readingTopic: "Community projects", writingGenre: "Email about volunteer work" },
      { unit: 4, title: "Music and Arts", pronunciation: "/ʃ/ and /ʒ/", grammar: "Comparisons: (not) as... as, the same as, different from", vocabulary: "Music and arts", readingTopic: "Traditional water puppetry", writingGenre: "Paragraph about artistic events" },
      { unit: 5, title: "Food and Drink", pronunciation: "/ɒ/ and /ɔː/", grammar: "Nouns (countable/uncountable), How much/many, a/an/some/any", vocabulary: "Dishes and ingredients", readingTopic: "Traditional food in Viet Nam", writingGenre: "Recipe instructions" },
      { unit: 6, title: "A Visit to a School", pronunciation: "/tʃ/ and /dʒ/", grammar: "Prepositions of time and place", vocabulary: "School facilities, historical schools", readingTopic: "Imperial Academy", writingGenre: "Passage about school facilities" }
    ]
  },
  "8": {
    grade: "8",
    level: "THCS",
    defaultDuration: 45,
    termUnits: {
      midTerm1: [1, 2, 3],
      endTerm1: [1, 2, 3, 4, 5, 6],
      midTerm2: [7, 8, 9],
      endTerm2: [7, 8, 9, 10, 11, 12],
    },
    units: [
      { unit: 1, title: "Leisure Time", pronunciation: "/ʊ/ and /uː/", grammar: "Verbs of liking + gerunds/to-infinitives", vocabulary: "Leisure activities, hobbies", readingTopic: "Teens and leisure time", writingGenre: "Paragraph on favourite leisure time" },
      { unit: 2, title: "Life in the Countryside", pronunciation: "/ə/ and /ɪ/", grammar: "Comparative adverbs", vocabulary: "Rural activities, scenery", readingTopic: "Living in the countryside", writingGenre: "Paragraph comparing city and countryside" },
      { unit: 3, title: "Teenagers", pronunciation: "/ʊə/ and /ɔɪ/", grammar: "Simple sentences and compound sentences", vocabulary: "Teen stress, clubs, social media", readingTopic: "Teen clubs and forums", writingGenre: "Paragraph about teen problems" },
      { unit: 4, title: "Ethnic Groups of Viet Nam", pronunciation: "/k/ and /g/", grammar: "Yes/No questions and Wh-questions", vocabulary: "Ethnic costumes, customs", readingTopic: "Vietnamese ethnic minorities", writingGenre: "Passage describing an ethnic group" },
      { unit: 5, title: "Our Customs and Traditions", pronunciation: "/n/ and /ŋ/", grammar: "Zero article with plural/uncountable nouns", vocabulary: "Festivals, family traditions", readingTopic: "Traditional customs", writingGenre: "Email describing a family tradition" },
      { unit: 6, title: "Lifestyles", pronunciation: "/br/ and /pr/", grammar: "Future simple with will, First conditional", vocabulary: "Traditional and modern lifestyles", readingTopic: "Nomadic lifestyle", writingGenre: "Paragraph about changes in lifestyle" }
    ]
  },
  "9": {
    grade: "9",
    level: "THCS",
    defaultDuration: 45,
    termUnits: {
      midTerm1: [1, 2, 3],
      endTerm1: [1, 2, 3, 4, 5, 6],
      midTerm2: [7, 8, 9],
      endTerm2: [7, 8, 9, 10, 11, 12],
    },
    units: [
      { unit: 1, title: "Local Community", pronunciation: "Stress in multi-word verbs", grammar: "Question words before to-infinitives, Phrasal verbs", vocabulary: "Community workers, local artisans", readingTopic: "Craft villages and suburbs", writingGenre: "Paragraph about community support" },
      { unit: 2, title: "City Life", pronunciation: "Diphthongs", grammar: "Double comparatives (The more... the more...)", vocabulary: "Urban features, public amenities", readingTopic: "Challenges of metropolitan life", writingGenre: "Article about pros/cons of city living" },
      { unit: 3, title: "Healthy Living for Teens", pronunciation: "Stress in 2-syllable nouns and verbs", grammar: "Modal verbs in first conditional", vocabulary: "Mental health, balanced routine", readingTopic: "Overcoming teenage stress", writingGenre: "Letter giving advice on healthy habits" },
      { unit: 4, title: "Remembering the Past", pronunciation: "Stress in words ending in -ic and -ical", grammar: "Past continuous vs Past simple with when/while", vocabulary: "Historical events, traditions", readingTopic: "Life in the past vs present", writingGenre: "Personal account of old memories" },
      { unit: 5, title: "Our Experiences", pronunciation: "Intonation in choice questions", grammar: "Present perfect with already, yet, since, for", vocabulary: "Memorable experiences, challenges", readingTopic: "Extracurricular trips", writingGenre: "Narrative paragraph about an experience" },
      { unit: 6, title: "Vietnamese Lifestyles: Then and Now", pronunciation: "Linking vowels", grammar: "Used to + infinitive, Be used to + V-ing", vocabulary: "Changes in family, school, society", readingTopic: "Generational shifts in Viet Nam", writingGenre: "Article on changes in Vietnamese family" }
    ]
  },
  "10": {
    grade: "10",
    level: "THPT",
    defaultDuration: 60,
    termUnits: {
      midTerm1: [1, 2, 3],
      endTerm1: [1, 2, 3, 4, 5],
      midTerm2: [6, 7, 8],
      endTerm2: [6, 7, 8, 9, 10],
    },
    units: [
      { unit: 1, title: "Family Life", pronunciation: "Consonant blends /br/, /kr/, /tr/", grammar: "Present simple vs. Present continuous", vocabulary: "Household chores, family values, breadwinner", readingTopic: "Benefits of doing housework for children", writingGenre: "Email/Paragraph about family routines" },
      { unit: 2, title: "Humans and the Environment", pronunciation: "Consonant blends /kl/, /pl/, /gr/, /pr/", grammar: "The future with will & be going to; Passive voice", vocabulary: "Carbon footprint, eco-friendly, green lifestyle", readingTopic: "Green living and environmental protection", writingGenre: "Suggestions for improving the environment" },
      { unit: 3, title: "Music", pronunciation: "Stress in two-syllable words", grammar: "Compound sentences, To-infinitives and bare infinitives", vocabulary: "Music shows, instruments, awards, talent", readingTopic: "American Idol and musical phenomena", writingGenre: "Blog post about music festival experience" },
      { unit: 4, title: "For a Better Community", pronunciation: "Stress in 2-syllable words with same spelling", grammar: "Past simple vs. Past continuous with when and while", vocabulary: "Volunteer work, charity, community development", readingTopic: "Teenagers and voluntary projects", writingGenre: "Application letter for volunteer work" },
      { unit: 5, title: "Inventions", pronunciation: "Stress in three-syllable nouns", grammar: "Present perfect; Gerunds and to-infinitives", vocabulary: "Technological devices, AI, hardware, software", readingTopic: "Artificial Intelligence in daily life", writingGenre: "Descriptive article on benefits of an invention" },
      { unit: 6, title: "Gender Equality", pronunciation: "Stress in 3-syllable adjectives and verbs", grammar: "Passive voice with modals", vocabulary: "Equal rights, employment opportunities, career choice", readingTopic: "Gender equality in the modern world", writingGenre: "Opinion essay about equal jobs for men/women" },
      { unit: 7, title: "Viet Nam and International Organisations", pronunciation: "Stress in words with more than 3 syllables", grammar: "Comparative and superlative adjectives", vocabulary: "UN, UNICEF, WTO, UNDP, diplomacy, peacekeeping", readingTopic: "UNICEF's support for Vietnamese education", writingGenre: "Paragraph on Viet Nam's international integration" },
      { unit: 8, title: "New Ways to Learn", pronunciation: "Sentence stress", grammar: "Relative clauses: defining and non-defining", vocabulary: "Blended learning, digital devices, online resources", readingTopic: "Face-to-face vs. Blended learning", writingGenre: "Article about advantages of online learning" },
      { unit: 9, title: "Protecting the Environment", pronunciation: "Rhythm in connected speech", grammar: "Reported speech", vocabulary: "Deforestation, global warming, biodiversity, endangered species", readingTopic: "The UN Climate Change Conference (COP)", writingGenre: "Leaflet about reducing black carbon emissions" },
      { unit: 10, title: "Ecotourism", pronunciation: "Intonation in statements and questions", grammar: "Conditional sentences Type 1 & Type 2", vocabulary: "Sustainable tourism, local culture, nature reserves", readingTopic: "Ecotour brochures and marine conservation", writingGenre: "Website advertisement for an ecotour" }
    ]
  },
  "11": {
    grade: "11",
    level: "THPT",
    defaultDuration: 60,
    termUnits: {
      midTerm1: [1, 2, 3],
      endTerm1: [1, 2, 3, 4, 5],
      midTerm2: [6, 7, 8],
      endTerm2: [6, 7, 8, 9, 10],
    },
    units: [
      { unit: 1, title: "A Long and Healthy Life", pronunciation: "Strong and weak forms of auxiliary verbs", grammar: "Past simple vs. Present perfect", vocabulary: "Diet, fitness, life expectancy, disease prevention", readingTopic: "Habits for living a long and healthy life", writingGenre: "Short message/letter on healthy lifestyle" },
      { unit: 2, title: "The Generation Gap", pronunciation: "Contracted forms", grammar: "Modal verbs: must, have to, should", vocabulary: "Generational conflicts, family values, digital natives", readingTopic: "Differences between Gen X, Gen Y, Gen Z", writingGenre: "Opinion essay on screen time rules" },
      { unit: 3, title: "Cities of the Future", pronunciation: "Linking final consonants to initial vowels", grammar: "Stative verbs in continuous form, Linking verbs", vocabulary: "Smart cities, green infrastructure, AI urban planning", readingTopic: "Characteristics of sustainable smart cities", writingGenre: "Article on advantages of living in a smart city" },
      { unit: 4, title: "ASEAN and Viet Nam", pronunciation: "Elision of vowels", grammar: "Gerunds as subjects and objects", vocabulary: "Cultural exchange, regional cooperation, volunteer youth", readingTopic: "ASEAN Youth Volunteer Programme (AYVP)", writingGenre: "Proposal for an ASEAN youth event" },
      { unit: 5, title: "Global Warming", pronunciation: "Sentence stress and rhythm", grammar: "Present participle and past participle clauses", vocabulary: "Greenhouse gases, deforestation, extreme weather, renewable energy", readingTopic: "Consequences and solutions to climate change", writingGenre: "Leaflet on reducing carbon emissions" },
      { unit: 6, title: "Preserving Our Heritage", pronunciation: "Intonation in statements, commands, and lists", grammar: "To-infinitive clauses", vocabulary: "Cultural heritage, historical monuments, folk arts", readingTopic: "Youth initiatives to protect national heritage", writingGenre: "Leaflet on promoting a heritage site" },
      { unit: 7, title: "Education Options for School-Leavers", pronunciation: "Intonation in Wh- and Yes/No questions", grammar: "Perfect gerunds and perfect participle clauses", vocabulary: "Higher education, vocational training, apprenticeships", readingTopic: "Vocational schools vs. Academic universities", writingGenre: "Formal letter requesting course details" },
      { unit: 8, title: "Becoming Independent", pronunciation: "Intonation in invitations and suggestions", grammar: "Cleft sentences: It is/was... that/who...", vocabulary: "Life skills, time management, self-motivation, finances", readingTopic: "Building autonomy and decision-making for teens", writingGenre: "Article on pros and cons of self-study" },
      { unit: 9, title: "Social Issues", pronunciation: "Intonation in choice questions", grammar: "Linking words and phrases", vocabulary: "Cyberbullying, peer pressure, poverty, body shaming", readingTopic: "Peer pressure and teen wellbeing", writingGenre: "Proposal for an anti-bullying campaign" },
      { unit: 10, title: "The Ecosystem", pronunciation: "Intonation in question tags", grammar: "Compound nouns", vocabulary: "Biodiversity, ecosystems, marine reserves, national parks", readingTopic: "Protecting national parks and wetlands", writingGenre: "Opinion essay on funding local conservation" }
    ]
  },
  "12": {
    grade: "12",
    level: "THPT",
    defaultDuration: 60,
    termUnits: {
      midTerm1: [1, 2, 3],
      endTerm1: [1, 2, 3, 4, 5],
      midTerm2: [6, 7, 8],
      endTerm2: [6, 7, 8, 9, 10],
    },
    units: [
      { unit: 1, title: "Life Stories We Admire", pronunciation: "Diphthongs /eɪ/ and /əʊ/", grammar: "Past simple vs. Past continuous", vocabulary: "Achievements, biographies, historical figures, perseverance", readingTopic: "Inspirational lives and world contributors", writingGenre: "Biography of an admirable personality" },
      { unit: 2, title: "A Multicultural World", pronunciation: "Diphthongs /ɔɪ/, /aɪ/, and /aʊ/", grammar: "Articles (a, an, the, zero article)", vocabulary: "Cultural diversity, traditions, globalisation, etiquette", readingTopic: "Effects of globalisation on cultural diversity", writingGenre: "Opinion essay on global cultural trends" },
      { unit: 3, title: "Green Living", pronunciation: "Diphthongs /ɪə/, /eə/, and /ʊə/", grammar: "Verbs with prepositions; Relative clauses referring to a whole sentence", vocabulary: "Zero waste, recycling, compost, sustainable lifestyles", readingTopic: "Plastic-free solutions and green consumerism", writingGenre: "Problem-solving report on environmental actions" },
      { unit: 4, title: "Urbanisation", pronunciation: "Unstressed words in connected speech", grammar: "Present perfect review; Double comparatives", vocabulary: "Rural-to-urban migration, infrastructure, city dwellers", readingTopic: "Transformation of urban centers over time", writingGenre: "Description of a line graph on population trends" },
      { unit: 5, title: "The World of Work", pronunciation: "Stressing auxiliary and modal verbs", grammar: "Simple, compound, and complex sentences", vocabulary: "Job qualifications, flexible hours, career sectors, workplace", readingTopic: "Job advertisements and employment requirements", writingGenre: "Formal job application letter" },
      { unit: 6, title: "Artificial Intelligence", pronunciation: "Homophones", grammar: "Active and passive causatives", vocabulary: "Robotics, automation, machine learning, virtual tutors", readingTopic: "AI applications in education and modern healthcare", writingGenre: "Essay on advantages and challenges of home robots" },
      { unit: 7, title: "The World of Mass Media", pronunciation: "Linking /r/ between two vowels", grammar: "Adverbial clauses of manner and result", vocabulary: "Social media, digital journalism, broadcast, fake news", readingTopic: "Digital media vs. Traditional newspapers", writingGenre: "Description of pie charts on media usage" },
      { unit: 8, title: "Wildlife Conservation", pronunciation: "Assimilation", grammar: "Adverbial clauses of condition and comparison", vocabulary: "Endangered habitats, poaching, IUCN Red List, biosphere reserves", readingTopic: "Species recovery programmes and marine reserves", writingGenre: "Problem-solving report on protecting tigers" },
      { unit: 9, title: "Career Paths", pronunciation: "Sentence stress and rhythm", grammar: "Three-word phrasal verbs", vocabulary: "Vocational choices, lifelong skills, mentor advice, job trends", readingTopic: "Guiding school-leavers towards the future workforce", writingGenre: "Curriculum Vitae (CV) for high school seniors" },
      { unit: 10, title: "Lifelong Learning", pronunciation: "Intonation in questions (revision)", grammar: "Reported speech: reporting orders, requests, offers, and advice", vocabulary: "Self-motivation, adult education, distance courses, continuous skill", readingTopic: "Continuous learning in a digital and changing economy", writingGenre: "Article on benefits and challenges of lifelong learning" }
    ]
  }
};
