import { Symptom, Mood, MascotAccessory } from './types';

export const CUTE_SYMPTOMS: Symptom[] = [
  {
    id: 'cramps',
    name: 'Cramp Monster',
    banglaName: 'Uterus Gym 🏋️‍♀️',
    icon: '⚡',
    category: 'physical',
    description: 'Uterus is doing hardcore squats!'
  },
  {
    id: 'snacks',
    name: 'Snack Attack',
    banglaName: 'Foodie Raakhosh 🍩',
    icon: '🍕',
    category: 'craving',
    description: 'Gimme all the chocolates, chips & fuchka!'
  },
  {
    id: 'sleepy',
    name: 'Sleepy Sloth',
    banglaName: 'Ghum Babaji 🦥',
    icon: '😴',
    category: 'energy',
    description: 'Can I stay in bed forever, please?'
  },
  {
    id: 'cry',
    name: 'Cry Baby',
    banglaName: 'Kanna River 😭',
    icon: '💧',
    category: 'emotional',
    description: 'Crying because a leaf fell off a tree.'
  },
  {
    id: 'bloated',
    name: 'Pufferfish Belly',
    banglaName: 'Pet Fapa 🐡',
    icon: '🎈',
    category: 'physical',
    description: 'I feel like a cute round hot air balloon!'
  },
  {
    id: 'backache',
    name: 'Creaky Back',
    banglaName: 'Komor Betha 🪵',
    icon: '🪵',
    category: 'physical',
    description: 'My spine needs some cozy warm hugs.'
  },
  {
    id: 'headache',
    name: 'Brain Storm',
    banglaName: 'Matha betha 🧠',
    icon: '💥',
    category: 'physical',
    description: 'Little drum players inside my head.'
  },
  {
    id: 'puppy',
    name: 'Golden Puppy',
    banglaName: 'Sparkle Energy 🐕',
    icon: '✨',
    category: 'energy',
    description: 'High energy! Let us dance or conquer world!'
  }
];

export const CUTE_MOODS: Mood[] = [
  {
    id: 'sparkly',
    name: 'Super Sparkly',
    banglaName: 'Onnyorokom Khushi ✨',
    emoji: '🤩',
    color: '#FFD166',
    description: 'Full of bubbly cute vibes today!'
  },
  {
    id: 'cloudy',
    name: 'Moody Cloud',
    banglaName: 'Meghla Mon ☁️',
    emoji: '🥺',
    color: '#BDB2FF',
    description: 'A bit quiet, sensitive, and dreamy.'
  },
  {
    id: 'angry',
    name: 'Spicy Chili',
    banglaName: 'Rage Mode 🔥',
    emoji: '😡',
    color: '#FFADAD',
    description: 'Highly touchy! Do not poke the princess!'
  },
  {
    id: 'marshmallow',
    name: 'Marshmallow',
    banglaName: 'Aalladi Cozy 🌸',
    emoji: '🥰',
    color: '#FFC6FF',
    description: 'Feeling sweet, cozy, and cuddly.'
  },
  {
    id: 'sensitive',
    name: 'Wobbly Jelly',
    banglaName: 'Chonchole Mon 🪼',
    emoji: '🫣',
    color: '#CAFFBF',
    description: 'Vulnerable but overall doing okay.'
  }
];

export const ACCESSORIES: MascotAccessory[] = [
  {
    id: 'ribbon',
    name: 'Cute Hair Ribbon',
    banglaName: 'Khopar Ribbon 🎀',
    icon: '🎀',
    emoji: '🎀',
    cost: 10
  },
  {
    id: 'sunglasses',
    name: 'Thug-Life Shades',
    banglaName: 'Cool Chashma 😎',
    icon: '😎',
    emoji: '😎',
    cost: 20
  },
  {
    id: 'scarf',
    name: 'Cozy Winter Scarf',
    banglaName: 'Gorom Muffler 🧣',
    icon: '🧣',
    emoji: '🧣',
    cost: 35
  },
  {
    id: 'sleepmask',
    name: 'Kitty Sleep Mask',
    banglaName: 'Ghum-er Mask 💤',
    icon: '😴',
    emoji: '💤',
    cost: 50
  },
  {
    id: 'crown',
    name: 'Princess Crown',
    banglaName: 'Uterus Rani Crown 👑',
    icon: '👑',
    emoji: '👑',
    cost: 80
  }
];

export const PHASE_INFO = {
  menstrual: {
    title: 'Winter/Menstrual',
    banglaTitle: 'Masik Din Gulo 🩸',
    color: '#FFCAD4',
    bgColor: '#FFF0F5',
    borderColor: '#3D0C11',
    description: 'Time to rest, cuddle up under blankets, and eat chocolate! Your uterus is busy dusting and cleaning its room.',
    banglaDesc: 'Ekhon shudu ghum ar gorom cha kheye rest neyar shomoy! Choco-bar khao ar arame thako!'
  },
  follicular: {
    title: 'Spring/Follicular',
    banglaTitle: 'Boshonto Shuchona 🌱',
    color: '#B9FBC0',
    bgColor: '#F2FFF5',
    borderColor: '#3D0C11',
    description: 'Energy is rising! Your cute follicles are growing, getting ready for the big show. Go do some fun stuff.',
    banglaDesc: 'Gaye kintu ekhon energy asche! Mon shubhro, kajer utsho barche. Notun kisu koro!'
  },
  ovulatory: {
    title: 'Summer/Ovulatory',
    banglaTitle: 'Glow Rani Phase ✨',
    color: '#FDFFB6',
    bgColor: '#FFFDF0',
    borderColor: '#3D0C11',
    description: 'You are glowing! Your confidence is high, and your social battery is at 100%. Peak sparkly goddess energy!',
    banglaDesc: 'Mon ekdom chonchole ar mukh-e cute glow! Shobai kintu ekhon tomar crush hobe!'
  },
  luteal: {
    title: 'Autumn/Luteal',
    banglaTitle: 'Moody Shrot 🍂',
    color: '#D0D1FF',
    bgColor: '#F4F3FF',
    borderColor: '#3D0C11',
    description: 'Cozy vibes, but maybe some pre-period spicy moods. Time to slow down. Tell everyone to treat you with care.',
    banglaDesc: 'Symptom gulo ashte pare! Rag hole kintu bishforon hobe! Shobai k bolo duto treat diye thanda rakhte!'
  }
};

export const MASCOT_DIALOGUES = {
  menstrual: [
    "Uterus is throwing a cleaning party! It is messy, but I am with you! 🩸",
    "Gorom Cha (Warm Tea) khabe? Or should I turn into a warm hot bag for you? ☕",
    "Chocolates go down, mood goes up! Eat a big one right now! 🍫",
    "Pet-betha? Hug me, squeeze me! Let me take the cramps away! 🤗",
    "Uterus said: 'I work hard, I bleed hard!' True warrior queen! 💪",
    "Ektu rest nao, kajer gulo pore hobe. Go to sleep sweet angel! 🦥"
  ],
  follicular: [
    "Hello beautiful! Energy battery is charging up! 🔋",
    "Notun fresh vibe! Let us start that hobby or complete that cute project! 🌱",
    "Tomake ajke onek cute lagteche! Yes, you! 🥰",
    "Follicles are blooming like baby flowers! Cute vibes only! 🌸",
    "Uterus is calm, and so is our heart! Let us explore the world!"
  ],
  ovulatory: [
    "WOW! Peak sparkle mode! You are glowing like a fairy queen! ✨",
    "Social battery: 100%! Time to hang out, take cute selfies! 🤳",
    "Oof, looks like someone is turning heads today! 💃",
    "Can you feel the high vibes? Dance with me! 🕺",
    "If anyone is annoying today, just smile and blind them with your glow!"
  ],
  luteal: [
    "Warning: PMS monsters approaching! Keep chocolates within reaching distance! 🍫",
    "Are you feeling grumpy? It is completely fine! I am ready to fight whoever bothered you! 😡",
    "Belly feels a bit like a round pufferfish? You are still 100% cute pufferfish! 🐡",
    "Kanna asche? It is okay to cry. Hug me tight! 😭",
    "Mon ke bolo: 'Cholo ektu quiet cozy corner-e boshe resting kori!' 🍂"
  ],
  tapped: [
    "Boop! Stop poking my cute squishy cheeks! 🤭",
    "Hehehe, that tickles! Do it again! ✨",
    "Bengali food: Fuchka, Biryani, Chotpoti... quick, let's order! 🤤",
    "Remember: You are amazing, cycle or no cycle! ❤️",
    "Lulu loves you more than a cat loves catnip! 🐱",
    "Did you drink water today? Drink a glass or I will make sad puppy eyes! 🥺"
  ]
};
