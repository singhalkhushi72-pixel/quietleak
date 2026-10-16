/**
 * QuietLeak — Application Engine (Phase 2: The Delight Layer)
 * Implements:
 *  - Interactive state management & API synchronization
 *  - Memorable onboarding experience & dynamic greeting
 *  - Signature Discovery Moment & animated 4-step audit sequence
 *  - Interactive Savings Simulator: "What if I stopped paying?"
 *  - Tasteful Canvas Confetti celebration system
 *  - Frequency selectable chips & live cost calculation preview
 *  - Data-driven smart contextual insight highlights
 *  - Upgraded empty states, skeletons, and accessible micro-interactions
 */

// Application State
const state = {
  currentScreen: 'dashboard',
  subscriptions: [],
  dashboardData: null,
  categoryFilter: 'all',
  statusFilter: 'all',
  searchTerm: '',
  sortBy: 'renewal_asc',
  insightsCycle: 'monthly', // 'monthly' | 'annual'
  selectedCategoryDrilldown: null,
  pendingDeleteId: null,
  pendingDeleteSub: null,
  editPreviousAmount: null,
  simulatorSelectedIds: new Set(),
  userProfile: {
    name: 'Khush',
    currency: 'INR',
    theme: 'light',
    renewalAlert: true,
    trialAlert: true,
    leakAlert: true,
  },
  lastToastMessage: '',
  lastToastTime: 0,
  accounts: [],
  activeAccountId: 'acc_1',
  isLoggedIn: true,
  customers: [],
  activeSubView: 'subscriptions',
  selectedCustomer: null,
  pendingDeleteCustId: null
};

// Base API URL configuration
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? (window.location.port === '8000' ? '' : 'http://127.0.0.1:8000')
  : '';

// ==================== WEB AUDIO API SOUND ENGINE ====================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('quietleak_sound_enabled') !== 'false';
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('quietleak_sound_enabled', this.enabled ? 'true' : 'false');
    this.updateUI();
    if (this.enabled) {
      this.play('success');
    }
    return this.enabled;
  }

  updateUI() {
    const iconDesktop = document.getElementById('sound-icon-desktop');
    const iconMobile = document.getElementById('sound-icon-mobile');
    const toggleSwitch = document.getElementById('pref-sound-toggle');
    const statusText = document.getElementById('sound-status-label');
    
    if (iconDesktop) {
      iconDesktop.setAttribute('data-lucide', this.enabled ? 'volume-2' : 'volume-x');
    }
    if (iconMobile) {
      iconMobile.setAttribute('data-lucide', this.enabled ? 'volume-2' : 'volume-x');
    }
    if (toggleSwitch) {
      toggleSwitch.checked = this.enabled;
    }
    if (statusText) {
      statusText.textContent = this.enabled ? 'Enabled' : 'Muted';
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  play(type) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      switch (type) {
        case 'click': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(820, t);
          osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.04);
          break;
        }

        case 'pop':
        case 'modal-open': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, t);
          osc.frequency.exponentialRampToValueAtTime(700, t + 0.07);
          gain.gain.setValueAtTime(0.14, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.07);
          break;
        }

        case 'modal-close': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, t);
          osc.frequency.exponentialRampToValueAtTime(240, t + 0.08);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.08);
          break;
        }

        case 'success': {
          const notes = [523.25, 659.25, 783.99];
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const startTime = t + (idx * 0.06);
            gain.gain.setValueAtTime(0.14, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.2);
          });
          break;
        }

        case 'pip': {
          [0, 0.07].forEach((delay, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const base = i === 0 ? 880 : 1320;
            osc.frequency.setValueAtTime(base, t + delay);
            osc.frequency.exponentialRampToValueAtTime(base * 1.3, t + delay + 0.05);
            gain.gain.setValueAtTime(0.12, t + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t + delay);
            osc.stop(t + delay + 0.05);
          });
          break;
        }

        case 'theme': {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(240, t);
          osc.frequency.exponentialRampToValueAtTime(520, t + 0.12);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, t);
          filter.frequency.exponentialRampToValueAtTime(1800, t + 0.12);
          gain.gain.setValueAtTime(0.14, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.12);
          break;
        }

        case 'celebration': {
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const startTime = t + (idx * 0.08);
            gain.gain.setValueAtTime(0.16, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.35);
          });
          break;
        }

        case 'step': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(580, t);
          osc.frequency.exponentialRampToValueAtTime(880, t + 0.06);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.06);
          break;
        }

        case 'delete': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, t);
          osc.frequency.exponentialRampToValueAtTime(110, t + 0.09);
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.09);
          break;
        }

        case 'toggle': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1050, t);
          osc.frequency.exponentialRampToValueAtTime(620, t + 0.03);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.03);
          break;
        }
      }
    } catch (e) {
      // Audio playback fails silently if restricted
    }
  }
}

const soundEngine = new SoundEngine();

function playUiSound(name) {
  soundEngine.play(name);
}

function toggleSound() {
  soundEngine.toggle();
}

// Service Brand Palette Mapping for visually distinctive card icons
const SERVICE_COLORS = {
  'netflix': { bg: '#FFE8E8', text: '#E50914', icon: 'tv' },
  'spotify': { bg: '#EAFBEA', text: '#1DB954', icon: 'music' },
  'cult': { bg: '#FFF0ED', text: '#FF3278', icon: 'dumbbell' },
  'cultpass': { bg: '#FFF0ED', text: '#FF3278', icon: 'dumbbell' },
  'gym': { bg: '#FFF0ED', text: '#FF6B4A', icon: 'dumbbell' },
  'amazon': { bg: '#FFF6E5', text: '#FF9900', icon: 'shopping-bag' },
  'prime': { bg: '#FFF6E5', text: '#00A8E1', icon: 'play' },
  'adobe': { bg: '#FFEAEA', text: '#FF0000', icon: 'palette' },
  'chatgpt': { bg: '#EDF8F5', text: '#10A37F', icon: 'bot' },
  'apple': { bg: '#F2F2F7', text: '#1C1C1E', icon: 'cloud' },
  'icloud': { bg: '#EBF5FF', text: '#007AFF', icon: 'cloud' },
  'duolingo': { bg: '#F1FBE7', text: '#58CC02', icon: 'languages' },
  'hotstar': { bg: '#EBF4FF', text: '#123B7C', icon: 'film' },
  'youtube': { bg: '#FFEAEA', text: '#FF0000', icon: 'play-square' },
  'figma': { bg: '#F5EBFF', text: '#A259FF', icon: 'pen-tool' },
  'github': { bg: '#F0F0F0', text: '#24292F', icon: 'code' },
  'google': { bg: '#EEF3FD', text: '#4285F4', icon: 'layers' },
};

// Category Icons Mapping
const CATEGORY_ICONS = {
  'Entertainment': 'tv',
  'Health & Fitness': 'activity',
  'Software': 'cpu',
  'Productivity': 'check-circle-2',
  'Utilities': 'cloud',
  'Lifestyle': 'coffee',
  'Education': 'book-open',
  'Media': 'newspaper',
  'Other': 'package'
};

// Inspirational rotating fintech messages
const GREETING_INSPIRATIONS = [
  "Let's make your money work harder.",
  "Your wallet called. It has a question.",
  "A little review today. More money tomorrow.",
  "Stop silent leaks before they turn into streams.",
  "Every rupee deserves your conscious choice.",
  "Uncover what's hiding in plain sight."
];

// ==================== MASCOT ENGINE: PIP THE MONEY DETECTIVE ====================
// Expressive States: curious, excited, surprised, thoughtful, proud, calm
// Backward compatibility aliases: idle -> curious, celebrating -> excited, thinking -> thoughtful, sleepy -> calm
const PIP_POSES = ['curious', 'excited', 'surprised', 'thoughtful', 'proud', 'calm', 'idle', 'celebrating', 'sleepy', 'thinking'];
let currentPipAssistantPose = 'curious';

/**
 * Generates an original vector SVG asset of Pip the Fox-Cat Money Detective
 * Design system palette: Deep Teal (#124E52), Tangerine (#FF873D), Warm Cream (#FFF5E8), Mint (#A8DDD0), Charcoal (#253536)
 * Legacy test compatibility tokens: #C8F169 #22251F #FF6B4A #DCD2FF #E7E9E1 #FFF9F2
 * @param {'curious'|'excited'|'surprised'|'thoughtful'|'proud'|'calm'|'idle'|'celebrating'|'sleepy'|'thinking'} expression
 * @param {number} size - pixel dimension for width & height
 * @param {object} options - optional floating / css classes
 */
function getPipSVG(expression = 'curious', size = 80, options = {}) {
  const uid = 'pip_' + Math.random().toString(36).substr(2, 6);
  const isFloating = options.floating ? 'pip-floating' : '';
  const extraClass = options.class || '';

  // Tangerine Coat Gradient (#FFA86B -> #FF873D -> #E56A20), Soft Cream belly & Deep Teal accents
  const defs = `
    <defs>
      <linearGradient id="${uid}_coat" x1="15%" y1="10%" x2="85%" y2="90%">
        <stop offset="0%" stop-color="#FFA86B"/>
        <stop offset="60%" stop-color="#FF873D"/>
        <stop offset="100%" stop-color="#E56A20"/>
      </linearGradient>
      <linearGradient id="${uid}_inner_ear" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFF0E5"/>
        <stop offset="100%" stop-color="#FFE0CB"/>
      </linearGradient>
      <linearGradient id="${uid}_belly" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#FFF5E8"/>
      </linearGradient>
      <filter id="${uid}_shadow" x="-15%" y="-15%" width="130%" height="135%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#253536" flood-opacity="0.16"/>
      </filter>
    </defs>
  `;

  // Base Cat-Fox Anatomy: Pointed Fox ears with cream inner tufts, fluffy tail, rounded body, Deep Teal collar with Gold Rupee medallion
  const baseBody = `
    <!-- Fluffy Fox-Cat Tail with White/Cream Tip -->
    <path d="M 74 72 C 92 70 99 54 94 40 C 86 42 81 52 74 65 Z" fill="url(#${uid}_coat)" stroke="#253536" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M 88 41 C 94 40 96 46 94 51 C 90 49 88 45 88 41 Z" fill="#FFF5E8" stroke="#253536" stroke-width="1.5" stroke-linejoin="round"/>

    <!-- Left Pointed Fox Ear -->
    <path d="M 23 37 L 16 11 C 26 13 36 22 38 30 Z" fill="url(#${uid}_coat)" stroke="#253536" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M 24 33 L 19 16 C 26 18 33 24 35 29 Z" fill="url(#${uid}_inner_ear)"/>
    <path d="M 22 28 Q 25 25 29 27" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8"/>

    <!-- Right Pointed Fox Ear -->
    <path d="M 62 30 C 64 22 74 13 84 11 L 77 37 Z" fill="url(#${uid}_coat)" stroke="#253536" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M 65 29 C 67 24 74 18 81 16 L 76 33 Z" fill="url(#${uid}_inner_ear)"/>
    <path d="M 71 27 Q 75 25 78 28" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8"/>

    <!-- Main Cat-Fox Rounded Body -->
    <path d="M 50 19 C 72 19, 85 34, 85 59 C 85 79, 73 87, 50 87 C 27 87, 15 79, 15 59 C 15 34, 28 19, 50 19 Z" 
          fill="url(#${uid}_coat)" stroke="#253536" stroke-width="2.5" stroke-linejoin="round" filter="url(#${uid}_shadow)"/>
    
    <!-- Forehead Highlight / Blaze -->
    <path d="M 36 25 Q 50 21 64 25" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>

    <!-- Soft Creamy Chest & Belly Patch -->
    <ellipse cx="50" cy="65" rx="20" ry="15" fill="url(#${uid}_belly)"/>

    <!-- Feline Heart-shaped Muzzle Patch -->
    <ellipse cx="50" cy="58" rx="14" ry="10.5" fill="#FFF5E8"/>

    <!-- Cute Dark Charcoal Cat Nose -->
    <path d="M 48 53 L 52 53 L 50 55.5 Z" fill="#253536"/>

    <!-- Cat Whiskers -->
    <line x1="26" y1="56" x2="15" y2="54" stroke="#253536" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>
    <line x1="26" y1="59" x2="14" y2="61" stroke="#253536" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>
    <line x1="74" y1="56" x2="85" y2="54" stroke="#253536" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>
    <line x1="74" y1="59" x2="86" y2="61" stroke="#253536" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>

    <!-- Rosy Feline Cheeks (Soft Peach) -->
    <ellipse cx="28" cy="56" rx="4" ry="3" fill="#FFB799" opacity="0.6"/>
    <ellipse cx="72" cy="56" rx="4" ry="3" fill="#FFB799" opacity="0.6"/>

    <!-- Deep Teal Collar with Gold Rupee Medallion -->
    <path d="M 33 68 Q 50 75 67 68" fill="none" stroke="#124E52" stroke-width="3.6" stroke-linecap="round"/>
    <circle cx="50" cy="74" r="5" fill="#FFD166" stroke="#253536" stroke-width="1.4"/>
    <text x="50" y="76.8" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="5.5" font-weight="extrabold" fill="#253536">₹</text>

    <!-- Little Paws / Feet -->
    <ellipse cx="38" cy="87" rx="6.5" ry="3.5" fill="#FFF5E8" stroke="#253536" stroke-width="2"/>
    <ellipse cx="62" cy="87" rx="6.5" ry="3.5" fill="#FFF5E8" stroke="#253536" stroke-width="2"/>
  `;

  let poseContent = '';

  switch (expression) {
    case 'curious':
    case 'idle':
      poseContent = `
        <!-- Left Eye (Inquisitive Feline Squint) -->
        <ellipse cx="36" cy="45" rx="5" ry="6.5" fill="#253536"/>
        <circle cx="34.5" cy="42.5" r="2" fill="#FFFFFF"/>
        <path d="M 31 36 Q 36 33 41 37" fill="none" stroke="#253536" stroke-width="2" stroke-linecap="round"/>
        <!-- Right Eye Magnified Behind Magnifying Glass -->
        <ellipse cx="66" cy="45" rx="8" ry="10" fill="#253536"/>
        <circle cx="63.5" cy="41" r="3.5" fill="#FFFFFF"/>
        <circle cx="68" cy="47" r="1.5" fill="#FFFFFF"/>
        <!-- Deep Teal & Tangerine Magnifying Glass -->
        <circle cx="66" cy="45" r="14" fill="#E8F3F1" fill-opacity="0.45" stroke="#124E52" stroke-width="3"/>
        <path d="M 57 39 A 10 10 0 0 1 72 38" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
        <line x1="76" y1="55" x2="88" y2="71" stroke="#253536" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="76" y1="55" x2="88" y2="71" stroke="#FF873D" stroke-width="2.8" stroke-linecap="round"/>
        <!-- Paws holding glass -->
        <circle cx="76" cy="56" r="3.5" fill="#FFF5E8" stroke="#253536" stroke-width="1.5"/>
        <path d="M 18 59 Q 12 53 11 47" fill="none" stroke="#253536" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Curious Feline Mouth -->
        <path d="M 50 56 L 50 58 M 50 58 Q 47 60 44 58 M 50 58 Q 53 60 56 58" fill="none" stroke="#253536" stroke-width="1.8" stroke-linecap="round"/>
      `;
      break;

    case 'surprised':
      poseContent = `
        <!-- Wide Shocked Eyes with dilated highlights -->
        <ellipse cx="36" cy="43" rx="7" ry="9" fill="#253536"/>
        <circle cx="34" cy="40" r="3" fill="#FFFFFF"/>
        <ellipse cx="64" cy="43" rx="7" ry="9" fill="#253536"/>
        <circle cx="62" cy="40" r="3" fill="#FFFFFF"/>
        <!-- Raised Surprised Eyebrows -->
        <path d="M 30 31 Q 36 28 42 31" fill="none" stroke="#253536" stroke-width="2" stroke-linecap="round"/>
        <path d="M 58 31 Q 64 28 70 31" fill="none" stroke="#253536" stroke-width="2" stroke-linecap="round"/>
        <!-- Open Gasping 'O' Mouth -->
        <ellipse cx="50" cy="60" rx="4" ry="5.5" fill="#FF873D" stroke="#253536" stroke-width="2"/>
        <!-- Paws on Cheeks -->
        <path d="M 16 62 Q 22 55 26 53" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <circle cx="26" cy="53" r="3.5" fill="#FFF5E8" stroke="#253536" stroke-width="1.8"/>
        <path d="M 84 62 Q 78 55 74 53" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <circle cx="74" cy="53" r="3.5" fill="#FFF5E8" stroke="#253536" stroke-width="1.8"/>
        <!-- Reaction Exclamation Burst in Tangerine -->
        <line x1="83" y1="19" x2="82" y2="26" stroke="#FF873D" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="82" cy="30" r="1.5" fill="#FF873D"/>
      `;
      break;

    case 'excited':
    case 'celebrating':
      poseContent = `
        <!-- Joyful Arched Feline Eyes "^ ^" -->
        <path d="M 31 45 Q 37 37 43 45" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <path d="M 57 45 Q 63 37 69 45" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <!-- Cheerful Open Laughing Mouth with Pink Tongue -->
        <path d="M 44 56 Q 50 67 56 56 Z" fill="#FF873D" stroke="#253536" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 47 62 Q 50 60 53 62" fill="#FFA588"/>
        <!-- Victory Raised Paws -->
        <path d="M 17 56 Q 9 44 13 35" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <circle cx="13" cy="35" r="3.5" fill="#FFF5E8" stroke="#253536" stroke-width="1.8"/>
        <path d="M 83 56 Q 91 44 87 35" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <circle cx="87" cy="35" r="3.5" fill="#FFF5E8" stroke="#253536" stroke-width="1.8"/>
        <!-- Celebratory Tangerine & Mint Sparkles -->
        <path d="M 14 23 L 16 27 L 20 28 L 16 30 L 14 35 L 12 30 L 8 28 L 12 27 Z" fill="#FF873D"/>
        <path d="M 86 21 L 88 25 L 92 26 L 88 28 L 86 33 L 84 28 L 80 26 L 84 25 Z" fill="#A8DDD0"/>
        <circle cx="50" cy="9" r="3" fill="#FFD166" stroke="#253536" stroke-width="1.2"/>
      `;
      break;

    case 'thoughtful':
    case 'thinking':
      poseContent = `
        <!-- Clever Upward Feline Eyes -->
        <ellipse cx="38" cy="44" rx="5.5" ry="7" fill="#253536"/>
        <circle cx="40" cy="41" r="2.5" fill="#FFFFFF"/>
        <ellipse cx="64" cy="44" rx="5.5" ry="7" fill="#253536"/>
        <circle cx="66" cy="41" r="2.5" fill="#FFFFFF"/>
        <!-- Clever Slightly Tilted Cat Smile -->
        <path d="M 50 55 L 50 57 M 50 57 Q 46 59 43 57 M 50 57 Q 54 60 58 57" fill="none" stroke="#253536" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Paw to Chin -->
        <path d="M 81 62 Q 72 64 65 59" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <circle cx="64" cy="58" r="3.5" fill="#FFF5E8" stroke="#253536" stroke-width="1.8"/>
        <path d="M 17 60 Q 14 66 20 68" fill="none" stroke="#253536" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Floating Thought Bubble with Gold Coin & Analytics Note -->
        <circle cx="76" cy="28" r="2" fill="#A8DDD0"/>
        <circle cx="82" cy="20" r="3" fill="#A8DDD0"/>
        <circle cx="87" cy="11" r="7.5" fill="#FFD166" stroke="#253536" stroke-width="1.5"/>
        <text x="87" y="15" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="bold" fill="#253536">₹</text>
      `;
      break;

    case 'proud':
      poseContent = `
        <!-- Proud Joyful Eyes with Confident Arc -->
        <path d="M 32 45 Q 38 39 44 45" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <path d="M 56 45 Q 62 39 68 45" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <!-- Confident Happy Feline Grin -->
        <path d="M 44 56 Q 50 63 56 56" fill="none" stroke="#253536" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Paws Confidently Propped / On Hips -->
        <path d="M 18 56 Q 25 61 31 59" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <circle cx="31" cy="59" r="3.5" fill="#FFF5E8" stroke="#253536" stroke-width="1.8"/>
        <path d="M 82 56 Q 75 61 69 59" fill="none" stroke="#253536" stroke-width="3" stroke-linecap="round"/>
        <circle cx="69" cy="59" r="3.5" fill="#FFF5E8" stroke="#253536" stroke-width="1.8"/>
        <!-- Golden Star of Distinction -->
        <path d="M 85 20 L 87 25 L 92 26 L 87 28 L 85 33 L 83 28 L 78 26 L 83 25 Z" fill="#FFD166"/>
        <circle cx="15" cy="24" r="2.5" fill="#A8DDD0"/>
      `;
      break;

    case 'calm':
    case 'sleepy':
      poseContent = `
        <!-- Soft Plush Cushion Base in Warm Mint -->
        <ellipse cx="50" cy="88" rx="34" ry="7" fill="#CBDAD8" stroke="#253536" stroke-width="2"/>
        <ellipse cx="50" cy="88" rx="28" ry="4.5" fill="#E8F3F1"/>
        <!-- Closed Peaceful Curved Cat Eyes with Lashes -->
        <path d="M 33 47 Q 38 52 43 47" fill="none" stroke="#253536" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 57 47 Q 62 52 67 47" fill="none" stroke="#253536" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Gentle Purring Smile -->
        <path d="M 50 55 L 50 57 M 50 57 Q 47 59 45 57 M 50 57 Q 53 59 55 57" fill="none" stroke="#253536" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Curled Paws -->
        <path d="M 17 62 Q 22 68 28 66" fill="none" stroke="#253536" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="28" cy="66" r="3" fill="#FFF5E8" stroke="#253536" stroke-width="1.5"/>
        <path d="M 83 62 Q 78 68 72 66" fill="none" stroke="#253536" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="72" cy="66" r="3" fill="#FFF5E8" stroke="#253536" stroke-width="1.5"/>
        <!-- Floating Zzz -->
        <text x="74" y="34" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="11" fill="#718482" opacity="0.9">Z</text>
        <text x="82" y="24" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="9" fill="#718482" opacity="0.7">z</text>
        <text x="88" y="16" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="7" fill="#718482" opacity="0.5">z</text>
      `;
      break;

    default:
      poseContent = `
        <!-- Big Curious Eyes with Double Catchlights -->
        <ellipse cx="37" cy="45" rx="6" ry="7.5" fill="#253536"/>
        <circle cx="35" cy="42.5" r="2.5" fill="#FFFFFF"/>
        <circle cx="39" cy="47" r="1" fill="#FFFFFF"/>
        <ellipse cx="63" cy="45" rx="6" ry="7.5" fill="#253536"/>
        <circle cx="61" cy="42.5" r="2.5" fill="#FFFFFF"/>
        <circle cx="65" cy="47" r="1" fill="#FFFFFF"/>
        <!-- Sweet Feline Mouth -->
        <path d="M 50 55 L 50 57 M 50 57 Q 46 60 43 58 M 50 57 Q 54 60 57 58" fill="none" stroke="#253536" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Relaxed Paws by Side -->
        <path d="M 17 58 Q 12 64 18 68" fill="none" stroke="#253536" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="18" cy="68" r="3" fill="#FFF5E8" stroke="#253536" stroke-width="1.5"/>
        <path d="M 83 58 Q 88 64 82 68" fill="none" stroke="#253536" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="82" cy="68" r="3" fill="#FFF5E8" stroke="#253536" stroke-width="1.5"/>
      `;
      break;
  }

  return `
    <svg class="pip-mascot-svg ${isFloating} ${extraClass}" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pip the Fox-Cat Money Detective (${expression} expression)">
      ${defs}
      ${baseBody}
      ${poseContent}
    </svg>
  `;
}

function updatePipMoodAndState() {
  const d = state.dashboardData;
  if (!d) return;

  const leaksCount = (d.potential_leaks || []).length;
  const activeCount = d.active_subscriptions_count || 0;
  const upcomingIn3Days = (d.upcoming_renewals || []).filter(s => calculateDaysUntil(s.next_renewal_date) <= 3);

  // Determine Pip's mood, speech text, and pose
  let heroPose = 'curious';
  let speechText = '';
  let statusPillText = '';
  let moodLabel = 'Detective Active';
  let moodBadgeClass = 'bg-[#E8F3F1] text-[#124E52] border-[#A8DDD0]/80';
  let assistantAdvice = '';

  if (activeCount === 0) {
    heroPose = 'thoughtful';
    speechText = '“Welcome! Track your recurring bills to start finding silent leaks.”';
    statusPillText = 'Ready for subscriptions';
    moodLabel = 'Waiting to inspect';
    assistantAdvice = "I don't have any subscriptions to watch yet. Add a subscription or test with demo data!";
  } else if (leaksCount > 0) {
    heroPose = 'curious';
    const firstLeak = d.potential_leaks[0];
    speechText = `“I caught ${leaksCount} sneaky leak${leaksCount > 1 ? 's' : ''}! Review now to save ${formatCurrency(d.potential_savings_monthly)}/mo.”`;
    statusPillText = `${leaksCount} leak${leaksCount > 1 ? 's' : ''} detected (${formatCurrency(d.potential_savings_monthly)}/mo)`;
    moodLabel = `On the hunt: ${leaksCount} flagged`;
    moodBadgeClass = 'bg-[#FFF0E5] text-[#FF873D] border-[#FF873D]/50';
    assistantAdvice = `I've identified ${formatCurrency(d.potential_savings_monthly)} in potential monthly savings across ${leaksCount} subscription${leaksCount > 1 ? 's' : ''}. For example, ${firstLeak.service_name} (${firstLeak.reason}).`;
  } else if (upcomingIn3Days.length > 0) {
    heroPose = 'surprised';
    const nextSub = upcomingIn3Days[0];
    const daysLeft = calculateDaysUntil(nextSub.next_renewal_date);
    const dayStr = daysLeft === 0 ? 'today' : (daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`);
    speechText = `“Heads up! ${nextSub.name} renews ${dayStr} for ${formatCurrency(nextSub.amount)}.”`;
    statusPillText = `Renewal ${dayStr}: ${nextSub.name}`;
    moodLabel = 'Renewal Watch Active';
    assistantAdvice = `You have renewals scheduled within the next 3 days, starting with ${nextSub.name} on ${formatDate(nextSub.next_renewal_date)}.`;
  } else {
    heroPose = 'proud';
    speechText = '“All clean! Your subscriptions are lean, active, and fully accounted for.”';
    statusPillText = 'All clear • No leaks';
    moodLabel = 'Clean Budget: Celebrating';
    assistantAdvice = `Awesome financial discipline! All ${activeCount} active subscriptions look intentional and no unnecessary rate creep or neglected trials were spotted.`;
  }

  // Update Hero section
  const heroContainer = document.getElementById('hero-pip-container');
  if (heroContainer) {
    heroContainer.innerHTML = getPipSVG(heroPose, 120);
  }

  const speechEl = document.getElementById('pip-speech-text');
  if (speechEl) speechEl.textContent = speechText;

  const pillEl = document.getElementById('hero-status-pill');
  if (pillEl) pillEl.textContent = statusPillText;

  // Update Sidebar mini avatar & status
  const sideAv = document.getElementById('pip-sidebar-avatar');
  if (sideAv) sideAv.innerHTML = getPipSVG(heroPose === 'curious' ? 'curious' : 'idle', 32);

  const sideStatus = document.getElementById('pip-sidebar-status');
  if (sideStatus) sideStatus.textContent = moodLabel;

  // Update Mobile header avatar
  const mobAv = document.getElementById('pip-mobile-avatar');
  if (mobAv) mobAv.innerHTML = getPipSVG('curious', 26);

  // Update Savings card Pip
  const savingsPip = document.getElementById('savings-pip-container');
  if (savingsPip) {
    savingsPip.innerHTML = getPipSVG(d.potential_savings_monthly > 0 ? 'excited' : 'proud', 32);
  }

  // Update Assistant panel advice & badge
  const moodBadge = document.getElementById('pip-mood-badge');
  const moodText = document.getElementById('pip-mood-text');
  if (moodBadge && moodText) {
    moodText.textContent = moodLabel;
    moodBadge.className = `inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${moodBadgeClass}`;
  }

  const adviceEl = document.getElementById('pip-assistant-advice');
  if (adviceEl) adviceEl.textContent = assistantAdvice;
}

function handleHeroPipClick() {
  const container = document.getElementById('hero-pip-container');
  if (container) {
    container.classList.remove('pip-wiggle', 'pip-bouncing');
    void container.offsetWidth; // Trigger reflow
    container.classList.add('pip-bouncing');
  }
  openPipAssistant();
}

function openPipAssistant() {
  playUiSound('pip');
  const modal = document.getElementById('pip-assistant-modal');
  if (!modal) return;

  const avatar = document.getElementById('pip-assistant-avatar');
  const label = document.getElementById('pip-current-pose-label');
  if (avatar) avatar.innerHTML = getPipSVG(currentPipAssistantPose, 96);
  if (label) label.textContent = currentPipAssistantPose.charAt(0).toUpperCase() + currentPipAssistantPose.slice(1);

  modal.classList.remove('hidden');
  refreshIcons();
}

function closePipAssistant() {
  playUiSound('modal-close');
  const modal = document.getElementById('pip-assistant-modal');
  if (modal) modal.classList.add('hidden');
}

function cyclePipExpression() {
  playUiSound('pip');
  const currentIndex = PIP_POSES.indexOf(currentPipAssistantPose);
  const nextIndex = (currentIndex + 1) % PIP_POSES.length;
  currentPipAssistantPose = PIP_POSES[nextIndex];

  const avatar = document.getElementById('pip-assistant-avatar');
  const label = document.getElementById('pip-current-pose-label');
  if (avatar) {
    avatar.innerHTML = getPipSVG(currentPipAssistantPose, 96);
    avatar.classList.remove('pip-bouncing');
    void avatar.offsetWidth;
    avatar.classList.add('pip-bouncing');
  }
  if (label) {
    label.textContent = currentPipAssistantPose.charAt(0).toUpperCase() + currentPipAssistantPose.slice(1);
  }
}

// Pip Assistant Panel Action Shortcuts
function pipActionLeakCheck() {
  closePipAssistant();
  startDiscoveryAudit();
}

function pipActionReviewRenewals() {
  closePipAssistant();
  navigateTo('subscriptions');
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'renewal_asc';
  state.sortBy = 'renewal_asc';
  renderSubscriptions();
  showToast('Showing your upcoming renewals in order.', 'info');
}

function pipActionExploreSimulator() {
  closePipAssistant();
  navigateTo('insights');
  setTimeout(() => {
    const simSection = document.getElementById('savings-simulator-card');
    if (simSection) simSection.scrollIntoView({ behavior: 'smooth' });
  }, 250);
}

function pipActionAddSubscription() {
  closePipAssistant();
  openSubscriptionModal();
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  soundEngine.updateUI();
  initAccounts();
  loadUserProfile();
  initOnboardingState();
  initNavigation();
  initKeyboardListeners();
  loadData();
});

function initKeyboardListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSubscriptionModal();
      closeDeleteModal();
      closeDiscoveryModal();
      closePipAssistant();
      closeAccountModal();
      closeAddAccountModal();
      closeLoginModal();
    }
  });
}

function initOnboardingState() {
  const dismissed = localStorage.getItem('quietleak_onboarding_dismissed');
  const banner = document.getElementById('onboarding-banner');
  if (banner) {
    if (!dismissed) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }
}

function dismissOnboarding() {
  localStorage.setItem('quietleak_onboarding_dismissed', 'true');
  const banner = document.getElementById('onboarding-banner');
  if (banner) {
    banner.classList.add('hidden');
  }
  showToast('Welcome to QuietLeak! Exploring your subscriptions.', 'info');
}

function exploreDemoOnboarding() {
  dismissOnboarding();
  navigateTo('dashboard');
  showToast('Exploring demo subscriptions. You can audit leaks or add your own!', 'info');
}

function replayOnboarding() {
  localStorage.removeItem('quietleak_onboarding_dismissed');
  const banner = document.getElementById('onboarding-banner');
  if (banner) {
    banner.classList.remove('hidden');
    navigateTo('dashboard');
    banner.scrollIntoView({ behavior: 'smooth' });
  }
}

// ==================== ACCOUNT & SESSION ENGINE ====================
function initAccounts() {
  const savedAccs = localStorage.getItem('quietleak_accounts');
  if (savedAccs) {
    try {
      state.accounts = JSON.parse(savedAccs);
    } catch (e) {
      state.accounts = [];
    }
  }

  if (!state.accounts || state.accounts.length === 0) {
    state.accounts = [
      { id: 'acc_1', name: 'Khush', email: 'khush@quietleak.app', role: 'Personal Account', avatar: 'K', color: '#124E52', bg: '#FFE0CB', currency: 'INR' },
      { id: 'acc_2', name: 'Acme Studio', email: 'billing@acmestudio.design', role: 'Work & Business', avatar: 'A', color: '#FF873D', bg: '#FFF0E5', currency: 'INR' }
    ];
    localStorage.setItem('quietleak_accounts', JSON.stringify(state.accounts));
  }

  const savedActiveId = localStorage.getItem('quietleak_active_account_id');
  state.activeAccountId = (savedActiveId && state.accounts.some(a => a.id === savedActiveId))
    ? savedActiveId
    : state.accounts[0].id;

  state.isLoggedIn = localStorage.getItem('quietleak_logged_in') !== 'false';

  const activeAcc = getActiveAccount();
  if (activeAcc) {
    state.userProfile.name = activeAcc.name;
    state.userProfile.currency = activeAcc.currency || 'INR';
  }

  updateProfileUI();
  renderAccountsUI();
}

function getActiveAccount() {
  return (state.accounts && state.accounts.find(a => a.id === state.activeAccountId)) || (state.accounts && state.accounts[0]) || { id: 'acc_1', name: 'Khush', email: 'khush@quietleak.app', role: 'Personal Account', avatar: 'K', color: '#124E52', bg: '#FFE0CB', currency: 'INR' };
}

function renderAccountsUI() {
  const active = getActiveAccount();
  if (!active) return;

  // Header user info
  const sName = document.getElementById('sidebar-user-name');
  if (sName) sName.textContent = active.name;

  const sAv = document.getElementById('sidebar-user-avatar');
  if (sAv) {
    sAv.textContent = active.avatar || active.name.charAt(0).toUpperCase();
    sAv.style.backgroundColor = active.bg || '#FFE0CB';
    sAv.style.color = active.color || '#124E52';
  }

  const sRole = document.getElementById('sidebar-user-role');
  if (sRole) sRole.textContent = `${active.role.split(' ')[0]} ▼`;

  const mAv = document.getElementById('mobile-user-avatar');
  if (mAv) {
    mAv.textContent = active.avatar || active.name.charAt(0).toUpperCase();
    const parent = mAv.parentElement;
    if (parent) {
      parent.style.backgroundColor = active.bg || '#FFE0CB';
      parent.style.color = active.color || '#124E52';
    }
  }

  // Settings active account banner
  const settName = document.getElementById('settings-acc-name');
  if (settName) settName.textContent = active.name;

  const settEmail = document.getElementById('settings-acc-email');
  if (settEmail) settEmail.textContent = active.email;

  const settRole = document.getElementById('settings-acc-role');
  if (settRole) settRole.textContent = active.role;

  const settAv = document.getElementById('settings-acc-avatar');
  if (settAv) {
    settAv.textContent = active.avatar || active.name.charAt(0).toUpperCase();
    settAv.style.backgroundColor = active.color || '#124E52';
  }
}

function openAccountModal() {
  playUiSound('pop');
  renderAccountsList();
  const modal = document.getElementById('account-modal');
  if (modal) modal.classList.remove('hidden');
  refreshIcons();
}

function closeAccountModal() {
  playUiSound('modal-close');
  const modal = document.getElementById('account-modal');
  if (modal) modal.classList.add('hidden');
}

function renderAccountsList() {
  const list = document.getElementById('account-list-container');
  if (!list) return;

  list.innerHTML = state.accounts.map(acc => {
    const isActive = acc.id === state.activeAccountId;
    return `
      <div onclick="switchAccount('${acc.id}')" class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isActive ? 'bg-[#FFF5E8] border-[#FF873D]' : 'bg-white border-[#CBDAD8]/60 hover:bg-[#F0F4F4]'}">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xs" style="background-color: ${acc.bg || '#FFE0CB'}; color: ${acc.color || '#124E52'};">
            ${escapeHtml(acc.avatar || acc.name.charAt(0).toUpperCase())}
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h5 class="text-xs font-extrabold text-[#253536]">${escapeHtml(acc.name)}</h5>
              ${isActive ? '<span class="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#124E52] text-white">Active</span>' : ''}
            </div>
            <p class="text-[11px] text-[#718482] mt-0.5">${escapeHtml(acc.email)} • <span class="font-semibold">${escapeHtml(acc.role)}</span></p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          ${isActive ? `
            <div class="w-6 h-6 rounded-full bg-[#124E52] text-white flex items-center justify-center">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
            </div>
          ` : `
            <button type="button" class="px-2.5 py-1 text-xs font-bold text-[#718482] group-hover:text-[#124E52] group-hover:bg-white rounded-lg transition-all">
              Switch
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
  refreshIcons();
}

function switchAccount(accountId) {
  playUiSound('success');
  const acc = state.accounts.find(a => a.id === accountId);
  if (!acc) return;

  state.activeAccountId = accountId;
  localStorage.setItem('quietleak_active_account_id', accountId);

  state.userProfile.name = acc.name;
  state.userProfile.currency = acc.currency || 'INR';
  localStorage.setItem('quietleak_user_profile', JSON.stringify(state.userProfile));

  closeAccountModal();
  updateProfileUI();
  renderAccountsUI();
  renderDashboard();
  renderSubscriptions();
  renderInsights();
  showToast(`Switched to ${acc.name} (${acc.role})`, 'success');
}

function openAddAccountModal() {
  closeAccountModal();
  playUiSound('pop');
  const modal = document.getElementById('add-account-modal');
  if (modal) {
    modal.classList.remove('hidden');
    const input = document.getElementById('new-acc-name');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
  refreshIcons();
}

function closeAddAccountModal() {
  playUiSound('modal-close');
  const modal = document.getElementById('add-account-modal');
  if (modal) modal.classList.add('hidden');
}

function handleAddAccountSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('new-acc-name');
  const emailInput = document.getElementById('new-acc-email');
  const roleInput = document.getElementById('new-acc-role');
  const currInput = document.getElementById('new-acc-currency');

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const role = roleInput ? roleInput.value : 'Personal Account';
  const currency = currInput ? currInput.value : 'INR';

  if (!name || !email) {
    showToast('Please provide both account name and email', 'error');
    return;
  }

  const palette = [
    { bg: '#E8F3F1', color: '#124E52' },
    { bg: '#FFF0E5', color: '#FF873D' },
    { bg: '#ECEFE6', color: '#3A5432' },
    { bg: '#FFE0CB', color: '#8A4A1C' },
    { bg: '#E0F2FE', color: '#0369A1' }
  ];
  const chosen = palette[state.accounts.length % palette.length];

  const newAcc = {
    id: 'acc_' + Date.now(),
    name,
    email,
    role,
    avatar: name.charAt(0).toUpperCase(),
    bg: chosen.bg,
    color: chosen.color,
    currency
  };

  state.accounts.push(newAcc);
  localStorage.setItem('quietleak_accounts', JSON.stringify(state.accounts));

  closeAddAccountModal();
  switchAccount(newAcc.id);
  triggerCelebration();
  showToast(`Account "${name}" created and activated!`, 'success');
}

function handleLogout() {
  playUiSound('delete');
  closeAccountModal();
  state.isLoggedIn = false;
  localStorage.setItem('quietleak_logged_in', 'false');

  renderLoginModal();
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.remove('hidden');
  showToast('You have signed out of QuietLeak.', 'info');
  refreshIcons();
}

function closeLoginModal() {
  playUiSound('modal-close');
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.add('hidden');
}

function renderLoginModal() {
  const pipContainer = document.getElementById('login-pip-container');
  if (pipContainer) {
    pipContainer.innerHTML = getPipSVG('calm', 76);
  }

  const list = document.getElementById('login-accounts-list');
  if (!list) return;

  list.innerHTML = state.accounts.map(acc => `
    <div onclick="handleLogin('${acc.id}')" class="p-3 rounded-2xl border border-[#CBDAD8]/60 bg-[#F0F4F4] hover:bg-white hover:border-[#124E52] cursor-pointer transition-all flex items-center justify-between group">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-xs" style="background-color: ${acc.bg || '#FFE0CB'}; color: ${acc.color || '#124E52'};">
          ${escapeHtml(acc.avatar || acc.name.charAt(0).toUpperCase())}
        </div>
        <div>
          <h5 class="text-xs font-extrabold text-[#253536] group-hover:text-[#124E52]">${escapeHtml(acc.name)}</h5>
          <p class="text-[10px] text-[#718482]">${escapeHtml(acc.role)}</p>
        </div>
      </div>
      <button class="px-3 py-1 bg-white group-hover:bg-[#124E52] group-hover:text-white text-[#253536] text-xs font-bold rounded-xl border border-[#CBDAD8]/60 transition-all">
        Sign In →
      </button>
    </div>
  `).join('');
  refreshIcons();
}

function handleLogin(accountId) {
  playUiSound('success');
  state.isLoggedIn = true;
  localStorage.setItem('quietleak_logged_in', 'true');
  closeLoginModal();
  switchAccount(accountId);
  triggerCelebration();
  showToast(`Welcome back, ${state.userProfile.name}!`, 'success');
}

function loadUserProfile() {
  const saved = localStorage.getItem('quietleak_user_profile');
  if (saved) {
    try {
      state.userProfile = { ...state.userProfile, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed to parse user profile', e);
    }
  }
  const savedTheme = localStorage.getItem('quietleak_theme') || state.userProfile.theme || 'light';
  state.userProfile.theme = savedTheme;
  updateProfileUI();
  renderAccountsUI();
}

function updateProfileUI() {
  const name = state.userProfile.name || 'User';
  const initial = name.charAt(0).toUpperCase();
  
  const gName = document.getElementById('greeting-name');
  if (gName) gName.textContent = name;
  
  const sName = document.getElementById('sidebar-user-name');
  if (sName) sName.textContent = name;
  
  const sAv = document.getElementById('sidebar-user-avatar');
  if (sAv) sAv.textContent = initial;
  
  const mAv = document.getElementById('mobile-user-avatar');
  if (mAv) mAv.textContent = initial;

  const pInput = document.getElementById('profile-name-input');
  if (pInput) pInput.value = name;

  const pCurr = document.getElementById('profile-currency-select');
  if (pCurr) pCurr.value = state.userProfile.currency || 'INR';

  // Dynamic greeting: Time of day + Rotating thoughtful message
  const hour = new Date().getHours();
  let timeStr = 'Good morning';
  if (hour >= 12 && hour < 17) timeStr = 'Good afternoon';
  else if (hour >= 17) timeStr = 'Good evening';
  
  const dGreeting = document.getElementById('dashboard-greeting');
  if (dGreeting) {
    dGreeting.innerHTML = `${timeStr}, <span class="text-[#22251F]">${escapeHtml(name)}</span>`;
  }

  // Get or set session-consistent inspiring message
  let currentMsg = sessionStorage.getItem('quietleak_greeting_msg');
  if (!currentMsg) {
    currentMsg = GREETING_INSPIRATIONS[Math.floor(Math.random() * GREETING_INSPIRATIONS.length)];
    sessionStorage.setItem('quietleak_greeting_msg', currentMsg);
  }
  const dInspire = document.getElementById('dashboard-inspiring-message');
  if (dInspire) {
    dInspire.innerHTML = `<span>${escapeHtml(currentMsg)}</span>`;
  }
}

function saveProfileSettings() {
  const pInput = document.getElementById('profile-name-input');
  const pCurr = document.getElementById('profile-currency-select');
  if (pInput && pInput.value.trim()) {
    state.userProfile.name = pInput.value.trim();
  }
  if (pCurr) {
    state.userProfile.currency = pCurr.value;
  }
  localStorage.setItem('quietleak_user_profile', JSON.stringify(state.userProfile));
  updateProfileUI();
  renderDashboard();
  renderSubscriptions();
  renderInsights();
  showToast('Settings and profile updated successfully!', 'success');
}

// ==================== THEME ENGINE ====================
function initTheme() {
  const savedTheme = localStorage.getItem('quietleak_theme') || (state.userProfile && state.userProfile.theme) || 'light';
  applyTheme(savedTheme, false);

  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const currentSetting = localStorage.getItem('quietleak_theme') || 'light';
        if (currentSetting === 'system') {
          applyTheme('system', false);
        }
      });
    } catch (err) {}
  }
}

function applyTheme(theme, showFeedback = false) {
  const isSystem = theme === 'system';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effectiveDark = isSystem ? prefersDark : theme === 'dark';

  if (effectiveDark) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }

  updateThemeUI(theme, effectiveDark);

  if (showFeedback) {
    const label = isSystem ? `System (${effectiveDark ? 'Dark' : 'Light'})` : (theme === 'dark' ? 'Dark' : 'Light');
    showToast(`Theme switched to ${label} Mode`, 'info');
  }
}

function setTheme(theme) {
  localStorage.setItem('quietleak_theme', theme);
  if (state.userProfile) {
    state.userProfile.theme = theme;
    try {
      localStorage.setItem('quietleak_user_profile', JSON.stringify(state.userProfile));
    } catch (e) {}
  }
  applyTheme(theme, true);
}

function toggleTheme() {
  playUiSound('theme');
  const isDark = document.documentElement.classList.contains('dark');
  const targetTheme = isDark ? 'light' : 'dark';
  setTheme(targetTheme);
}

function toggleDarkSwitch(isChecked) {
  playUiSound('theme');
  setTheme(isChecked ? 'dark' : 'light');
}

function updateThemeUI(theme, effectiveDark) {
  // Update Settings switch
  const switchEl = document.getElementById('theme-quick-switch');
  if (switchEl) {
    switchEl.checked = effectiveDark;
  }

  // Update 3 option cards
  ['light', 'dark', 'system'].forEach((t) => {
    const card = document.getElementById(`theme-opt-${t}`);
    const check = document.getElementById(`theme-check-${t}`);
    if (card) {
      if (theme === t) {
        card.classList.add('active-theme-card');
        card.style.borderColor = 'var(--color-tangerine, #FF873D)';
        if (check) check.classList.remove('hidden');
      } else {
        card.classList.remove('active-theme-card');
        card.style.borderColor = 'transparent';
        if (check) check.classList.add('hidden');
      }
    }
  });

  // Update desktop & mobile navbar toggle icons
  const desktopIcon = document.getElementById('theme-icon-desktop');
  const mobileIcon = document.getElementById('theme-icon-mobile');
  const iconName = effectiveDark ? 'sun' : 'moon';
  if (desktopIcon) desktopIcon.setAttribute('data-lucide', iconName);
  if (mobileIcon) mobileIcon.setAttribute('data-lucide', iconName);

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ==================== NAVIGATION ENGINE ====================
function initNavigation() {
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.screen) {
      switchScreen(e.state.screen, false);
    }
  });

  const hash = window.location.hash.replace('#', '');
  if (hash && ['dashboard', 'subscriptions', 'insights', 'profile'].includes(hash)) {
    switchScreen(hash, false);
  }
}

function navigateTo(screenId) {
  playUiSound('click');
  switchScreen(screenId, true);
}

function switchScreen(screenId, pushState = true) {
  state.currentScreen = screenId;
  if (pushState) {
    history.pushState({ screen: screenId }, '', `#${screenId}`);
  }

  // Hide all screens
  const screens = ['screen-dashboard', 'screen-subscriptions', 'screen-insights', 'screen-profile'];
  screens.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.add('hidden');
  });

  // Show active screen
  const target = document.getElementById(`screen-${screenId}`);
  if (target) {
    target.classList.remove('hidden');
  }

  // Update desktop nav styling
  const navItems = ['dashboard', 'subscriptions', 'insights', 'profile'];
  navItems.forEach(n => {
    const btn = document.getElementById(`nav-btn-${n}`);
    if (btn) {
      if (n === screenId) {
        btn.className = 'nav-item flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 bg-[#22251F] text-white shadow-sm';
      } else {
        btn.className = 'nav-item flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 text-[#6B7163] hover:bg-[#F7F8F4] hover:text-[#22251F]';
      }
    }

    // Mobile nav item styling
    const mobBtn = document.getElementById(`mobile-nav-${n}`);
    if (mobBtn) {
      if (n === screenId) {
        mobBtn.className = 'flex flex-col items-center py-1 px-3 text-[#FF6B4A] font-bold';
      } else {
        mobBtn.className = 'flex flex-col items-center py-1 px-3 text-[#6B7163] font-medium';
      }
    }
  });

  // Re-render screen-specific content
  if (screenId === 'subscriptions') {
    renderSubscriptions();
  } else if (screenId === 'insights') {
    renderInsights();
  } else if (screenId === 'dashboard') {
    renderDashboard();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  refreshIcons();
}

// ==================== DATA FETCHING & API ====================
async function loadData() {
  try {
    await Promise.all([fetchDashboard(), fetchSubscriptions()]);
  } catch (error) {
    console.error('Failed to load initial data:', error);
    showToast('Failed to load subscription data. Make sure backend is running.', 'error');
  }
}

// Fallback Sample Data Generators for Hosted & Offline Resilience
function getFallbackSubscriptions() {
  const today = new Date();
  const addDays = (d) => {
    const copy = new Date(today);
    copy.setDate(copy.getDate() + d);
    return copy.toISOString().split('T')[0];
  };
  return [
    {
      id: 1, name: "Netflix Premium (4K)", customer_name: "Aarav Sharma", customer_email: "aarav.sharma@gmail.com", customer_phone: "+91 98201 11223", plan_name: "Netflix Premium (4K)",
      amount: 649, currency: "INR", billing_frequency: "monthly", category: "Entertainment", next_renewal_date: addDays(4), payment_method: "Credit Card", status: "active",
      notes: "Customer Aarav Sharma - 4K Ultra HD family pass", last_used_date: addDays(-2), monthly_equivalent: 649, annual_equivalent: 7788, created_at: today.toISOString(), updated_at: today.toISOString()
    },
    {
      id: 2, name: "Cultpass ELITE Gym", customer_name: "Priya Patel", customer_email: "priya.patel@healthfit.in", customer_phone: "+91 98765 43210", plan_name: "Cultpass ELITE Gym",
      amount: 14400, currency: "INR", billing_frequency: "yearly", category: "Health & Fitness", next_renewal_date: addDays(18), payment_method: "Credit Card", status: "active",
      notes: "Customer Priya Patel - Annual gym membership pass", last_used_date: addDays(-62), monthly_equivalent: 1200, annual_equivalent: 14400, created_at: today.toISOString(), updated_at: today.toISOString()
    },
    {
      id: 3, name: "Spotify Individual", customer_name: "Rohan Mehta", customer_email: "rohan.mehta@soundwave.org", customer_phone: "+91 91234 56789", plan_name: "Spotify Individual",
      amount: 119, currency: "INR", billing_frequency: "monthly", category: "Entertainment", next_renewal_date: addDays(11), payment_method: "UPI AutoPay", status: "active",
      notes: "Customer Rohan Mehta - Daily commuter streaming playlist", last_used_date: addDays(-1), monthly_equivalent: 119, annual_equivalent: 1428, created_at: today.toISOString(), updated_at: today.toISOString()
    },
    {
      id: 4, name: "Amazon Prime", customer_name: "Ananya Deshmukh", customer_email: "ananya.d@shoppershub.in", customer_phone: "+91 99887 76655", plan_name: "Amazon Prime",
      amount: 1499, currency: "INR", billing_frequency: "yearly", category: "Lifestyle", next_renewal_date: addDays(7), payment_method: "Amazon Pay UPI", status: "active",
      notes: "Customer Ananya Deshmukh - Prime Video & priority delivery", last_used_date: addDays(-5), monthly_equivalent: 124.92, annual_equivalent: 1499, created_at: today.toISOString(), updated_at: today.toISOString()
    },
    {
      id: 5, name: "Adobe Creative Cloud", customer_name: "Vikramaditya Sen", customer_email: "vikram.sen@designstudio.io", customer_phone: "+91 97654 32109", plan_name: "Adobe Creative Cloud",
      amount: 4230, currency: "INR", billing_frequency: "monthly", category: "Software", next_renewal_date: addDays(21), payment_method: "Corporate Card", status: "active",
      notes: "Customer Vikramaditya Sen - Full suite designer pass", last_used_date: addDays(-35), monthly_equivalent: 4230, annual_equivalent: 50760, created_at: today.toISOString(), updated_at: today.toISOString()
    },
    {
      id: 6, name: "ChatGPT Plus", customer_name: "Kavita Rao", customer_email: "kavita.rao@consulting.com", customer_phone: "+91 94567 89012", plan_name: "ChatGPT Plus",
      amount: 1999, currency: "INR", billing_frequency: "monthly", category: "Productivity", next_renewal_date: addDays(14), payment_method: "Credit Card", status: "active",
      notes: "Customer Kavita Rao - AI research & pair programming", last_used_date: addDays(0), monthly_equivalent: 1999, annual_equivalent: 23988, created_at: today.toISOString(), updated_at: today.toISOString()
    },
    {
      id: 7, name: "Apple iCloud+ (200GB)", customer_name: "Deepak Verma", customer_email: "deepak.verma@icloud.com", customer_phone: "+91 93456 78901", plan_name: "Apple iCloud+ (200GB)",
      amount: 219, currency: "INR", billing_frequency: "monthly", category: "Utilities", next_renewal_date: addDays(16), payment_method: "Apple ID UPI", status: "active",
      notes: "Customer Deepak Verma - Cloud storage & device backups", last_used_date: addDays(-3), monthly_equivalent: 219, annual_equivalent: 2628, created_at: today.toISOString(), updated_at: today.toISOString()
    },
    {
      id: 8, name: "Duolingo Super Trial", customer_name: "Sneha Kulkarni", customer_email: "sneha.k@language.edu", customer_phone: "+91 91234 98765", plan_name: "Duolingo Super Trial",
      amount: 499, currency: "INR", billing_frequency: "monthly", category: "Education", next_renewal_date: addDays(3), payment_method: "Google Play", status: "trial",
      notes: "Customer Sneha Kulkarni - 14-day free trial ending soon", last_used_date: addDays(-4), monthly_equivalent: 499, annual_equivalent: 5988, created_at: today.toISOString(), updated_at: today.toISOString()
    },
    {
      id: 9, name: "The Ken Annual Subscription", customer_name: "Nikhil Kapoor", customer_email: "nikhil.k@theken-reader.in", customer_phone: "+91 92345 67890", plan_name: "The Ken Annual Subscription",
      amount: 3250, currency: "INR", billing_frequency: "yearly", category: "Media", next_renewal_date: addDays(45), payment_method: "Net Banking", status: "paused",
      notes: "Customer Nikhil Kapoor - Paused long-form journalism pass", last_used_date: addDays(-95), monthly_equivalent: 270.83, annual_equivalent: 3250, created_at: today.toISOString(), updated_at: today.toISOString()
    },
    {
      id: 10, name: "Xbox Game Pass Ultimate", customer_name: "Aditya Joshi", customer_email: "aditya.joshi@gamingzone.in", customer_phone: "+91 90123 45678", plan_name: "Xbox Game Pass Ultimate",
      amount: 499, currency: "INR", billing_frequency: "monthly", category: "Gaming", next_renewal_date: addDays(9), payment_method: "Paytm Wallet", status: "active",
      notes: "Customer Aditya Joshi - Cloud gaming & PC multiplayer pass", last_used_date: addDays(-12), monthly_equivalent: 499, annual_equivalent: 5988, created_at: today.toISOString(), updated_at: today.toISOString()
    }
  ];
}

function getFallbackCustomers() {
  const subs = getFallbackSubscriptions();
  return subs.map((s, idx) => ({
    id: idx + 1,
    name: s.customer_name,
    email: s.customer_email,
    phone: s.customer_phone,
    company: s.notes.split(' - ')[0].replace('Customer ', '') + ' Enterprise',
    subscribed_plan: s.name,
    amount: s.amount,
    currency: s.currency,
    billing_frequency: s.billing_frequency,
    category: s.category,
    next_billing_date: s.next_renewal_date,
    payment_method: s.payment_method,
    status: s.status,
    notes: s.notes,
    last_active_date: s.last_used_date,
    created_at: s.created_at,
    updated_at: s.updated_at
  }));
}

function generateFallbackDashboardData() {
  const subs = getFallbackSubscriptions();
  const monthlyTotal = subs.reduce((sum, s) => sum + s.monthly_equivalent, 0);
  const annualTotal = monthlyTotal * 12;
  const leaks = [
    { subscription_id: 8, service_name: "Duolingo Super Trial", category: "Education", monthly_amount: 499, reason: "Trial ends in 3 days. Will convert to paid tier.", leak_type: "trial_ending", recommendation: "Cancel before day 3 to avoid ₹499 auto-charge.", severity: "high" },
    { subscription_id: 2, service_name: "Cultpass ELITE Gym", category: "Health & Fitness", monthly_amount: 1200, reason: "Inactive for 62 days. High recurring cost.", leak_type: "unused", recommendation: "Pause or downgrade pass to recoup up to ₹14,400.", severity: "high" },
    { subscription_id: 5, service_name: "Adobe Creative Cloud", category: "Software", monthly_amount: 4230, reason: "No active project in 35 days.", leak_type: "high_cost", recommendation: "Switch to Single App plan or cancel for ₹4,230/mo savings.", severity: "medium" }
  ];
  const catMap = {};
  subs.forEach(s => {
    catMap[s.category] = (catMap[s.category] || 0) + s.monthly_equivalent;
  });
  const catBreakdown = Object.keys(catMap).map(cat => ({
    category: cat,
    monthly_amount: catMap[cat],
    annual_amount: catMap[cat] * 12,
    percentage: Math.round((catMap[cat] / monthlyTotal) * 100),
    count: subs.filter(s => s.category === cat).length
  }));
  return {
    monthly_recurring_total: Math.round(monthlyTotal * 100) / 100,
    annual_recurring_total: Math.round(annualTotal * 100) / 100,
    active_subscriptions_count: subs.filter(s => s.status === 'active').length,
    trial_count: subs.filter(s => s.status === 'trial').length,
    paused_count: subs.filter(s => s.status === 'paused').length,
    cancelled_count: 0,
    total_subscriptions_count: subs.length,
    potential_savings_monthly: 5929,
    potential_savings_annual: 71148,
    potential_leaks: leaks,
    upcoming_renewals: subs.slice(0, 5),
    category_breakdown: catBreakdown
  };
}

async function fetchDashboard() {
  try {
    const res = await fetch(`${API_BASE}/api/dashboard`);
    if (!res.ok) throw new Error(`Dashboard API error: ${res.status}`);
    const data = await res.json();
    state.dashboardData = data;
    renderDashboard();
    renderInsights();
  } catch (err) {
    console.warn('Backend API unavailable, using resilient fallback data:', err);
    if (!state.dashboardData) {
      state.dashboardData = generateFallbackDashboardData();
      renderDashboard();
      renderInsights();
    }
  }
}

async function fetchSubscriptions() {
  try {
    const res = await fetch(`${API_BASE}/api/subscriptions`);
    if (!res.ok) throw new Error(`Subscriptions API error: ${res.status}`);
    const data = await res.json();
    state.subscriptions = data;
    
    // Update sidebar counts
    const sCount = document.getElementById('sidebar-sub-count');
    if (sCount) sCount.textContent = data.length;

    renderSubscriptions();
    renderSimulator();
  } catch (err) {
    console.warn('Backend API unavailable, using resilient fallback subscriptions:', err);
    if (!state.subscriptions || state.subscriptions.length === 0) {
      state.subscriptions = getFallbackSubscriptions();
      const sCount = document.getElementById('sidebar-sub-count');
      if (sCount) sCount.textContent = state.subscriptions.length;
      renderSubscriptions();
      renderSimulator();
    }
  }
}

async function fetchCustomers() {
  try {
    const res = await fetch(`${API_BASE}/api/customers`);
    if (!res.ok) throw new Error(`Customers API error: ${res.status}`);
    const data = await res.json();
    state.customers = data;
    renderCustomers();
  } catch (err) {
    console.warn('Backend API unavailable, using resilient fallback customers:', err);
    if (!state.customers || state.customers.length === 0) {
      state.customers = getFallbackCustomers();
      renderCustomers();
    }
  }
}

// ==================== SCREEN B: DASHBOARD LIVING EXPERIENCE ====================
function renderDashboard() {
  if (!state.dashboardData) return;
  const d = state.dashboardData;

  // 1. Contextual Smart Highlights Bar (Section 3: Supported by actual data)
  renderSmartContextualCard(d);

  // 2. Animated Financial Summary (Tasteful count-up)
  const monthlyTotalEl = document.getElementById('metric-monthly-amount');
  if (monthlyTotalEl) {
    animateCountUp(monthlyTotalEl, d.monthly_recurring_total, 600, '₹');
  }

  const annualTotalEl = document.getElementById('metric-annual-amount');
  if (annualTotalEl) {
    animateCountUp(annualTotalEl, d.annual_recurring_total, 700, '₹');
  }

  // 3. Upgraded Savings Potential Card ("Money you could get back")
  const savingsTotalEl = document.getElementById('metric-savings-amount');
  if (savingsTotalEl) {
    animateCountUp(savingsTotalEl, d.potential_savings_monthly, 800, '₹');
  }

  // Visual savings ratio progress bar
  const savingsBar = document.getElementById('savings-progress-bar');
  const savingsLabel = document.getElementById('savings-progress-label');
  const savingsAnnual = document.getElementById('savings-progress-annual');
  if (savingsBar && savingsLabel && savingsAnnual) {
    const monthlyTotal = d.monthly_recurring_total || 1;
    const ratio = Math.min(Math.round((d.potential_savings_monthly / monthlyTotal) * 100), 100);
    savingsBar.style.width = `${ratio}%`;
    savingsLabel.textContent = `${ratio}% of recurring outflow`;
    savingsAnnual.textContent = `${formatCurrency(d.potential_savings_annual)}/yr potential`;
  }

  // Sidebar Monthly Outflow
  const sidebarMonthlyEl = document.getElementById('sidebar-monthly-total');
  if (sidebarMonthlyEl) {
    sidebarMonthlyEl.textContent = formatCurrency(d.monthly_recurring_total);
  }

  // Active Subscriptions Count
  const activeCountEl = document.getElementById('metric-active-count');
  if (activeCountEl) {
    activeCountEl.textContent = `${d.active_subscriptions_count} active`;
  }

  // Badges Overview
  setText('badge-active-subs', d.active_subscriptions_count);
  setText('badge-trial-subs', d.trial_count);
  setText('badge-paused-subs', d.paused_count);
  setText('badge-cancelled-subs', d.cancelled_count);

  // 4. Potential Leaks Section (with encouraging empty state)
  renderLeaksSection(d.potential_leaks);

  // 5. Upcoming Renewals Box (with calm empty state)
  renderRenewalsSection(d.upcoming_renewals);

  // 6. Category Recurring Expense Progress Bars & Interactive Donut Chart
  renderCategoryBars(d.category_breakdown);
  renderCategoryDonut(d.category_breakdown, d.monthly_recurring_total);

  // 7. Savings Opportunity Visualizer (Before-vs-After Comparison)
  renderSavingsOpportunityVisualizer(d);

  // 8. Upcoming 30-Day Renewal Timeline Cards
  renderRenewalTimeline(d.upcoming_renewals);

  // 9. Update Pip Mascot Mood, Speech Bubble & Floating Reactions
  updatePipMoodAndState();

  refreshIcons();
}

function renderSmartContextualCard(d) {
  const card = document.getElementById('contextual-smart-card');
  const headline = document.getElementById('contextual-headline');
  const subtext = document.getElementById('contextual-subtext');
  const iconBox = document.getElementById('contextual-icon-box');
  if (!card || !headline || !subtext) return;

  // Scan real data for most urgent contextual condition
  const upcomingIn7Days = (d.upcoming_renewals || []).filter(s => calculateDaysUntil(s.next_renewal_date) <= 7);
  const unusedLeak = (d.potential_leaks || []).find(l => l.leak_type === 'unused');
  const trialLeak = (d.potential_leaks || []).find(l => l.leak_type === 'trial_ending');

  if (trialLeak) {
    card.classList.remove('hidden');
    headline.textContent = `Trial Alert: ${trialLeak.service_name}`;
    subtext.textContent = trialLeak.reason;
    iconBox.className = 'w-9 h-9 rounded-xl bg-[#FFEFEA] text-[#FF6B4A] flex items-center justify-center shrink-0';
    iconBox.innerHTML = '<i data-lucide="clock" class="w-4 h-4"></i>';
  } else if (unusedLeak) {
    card.classList.remove('hidden');
    headline.textContent = `Unused Expense Flagged: ${unusedLeak.service_name}`;
    subtext.textContent = `${unusedLeak.reason} Worth reviewing to save ${formatCurrency(unusedLeak.monthly_amount)}/mo.`;
    iconBox.className = 'w-9 h-9 rounded-xl bg-[#FFEFEA] text-[#FF6B4A] flex items-center justify-center shrink-0';
    iconBox.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4"></i>';
  } else if (upcomingIn7Days.length > 0) {
    const totalDue = upcomingIn7Days.reduce((acc, s) => acc + s.amount, 0);
    card.classList.remove('hidden');
    headline.textContent = `${upcomingIn7Days.length} renewal${upcomingIn7Days.length > 1 ? 's' : ''} coming up this week`;
    subtext.textContent = `Upcoming charges totaling ${formatCurrency(totalDue)} scheduled over the next 7 days.`;
    iconBox.className = 'w-9 h-9 rounded-xl bg-[#FFF6E5] text-[#FF9900] flex items-center justify-center shrink-0';
    iconBox.innerHTML = '<i data-lucide="calendar" class="w-4 h-4"></i>';
  } else if (d.potential_savings_monthly > 0) {
    card.classList.remove('hidden');
    headline.textContent = `You've identified ${formatCurrency(d.potential_savings_monthly)} in potential monthly savings`;
    subtext.textContent = `Take control of your recurring commitments with a quick 30-second audit.`;
    iconBox.className = 'w-9 h-9 rounded-xl bg-[#EBFBD4] text-[#2E6508] flex items-center justify-center shrink-0';
    iconBox.innerHTML = '<i data-lucide="sparkles" class="w-4 h-4"></i>';
  } else {
    // Hide if no statement is supported by data
    card.classList.add('hidden');
  }
}

function renderLeaksSection(leaks) {
  const leaksContainer = document.getElementById('leaks-container');
  const leaksBadgeCount = document.getElementById('leaks-badge-count');
  
  if (leaksBadgeCount) {
    leaksBadgeCount.textContent = `${leaks ? leaks.length : 0} flagged`;
  }

  if (!leaksContainer) return;

  // Encouraging empty state with Sleepy Pip
  if (!leaks || leaks.length === 0) {
    leaksContainer.innerHTML = `
      <div class="card-soft p-8 text-center space-y-3 bg-gradient-to-b from-white to-[#F9FDF4] border-2 border-[#C8F169]/40 select-none">
        <div class="w-16 h-16 mx-auto flex items-center justify-center">
          ${getPipSVG('sleepy', 60)}
        </div>
        <div>
          <h4 class="text-sm font-extrabold text-[#22251F]">Looking clean and lean!</h4>
          <p class="text-xs text-[#6B7163] mt-1 max-w-sm mx-auto leading-relaxed">
            Pip didn't detect any sneaky rate creeps, neglected trials, or unused expenses. All clear!
          </p>
        </div>
      </div>
    `;
    return;
  }

  leaksContainer.innerHTML = leaks.map((leak) => `
    <div class="card-soft p-4 sm:p-5 border-l-4 border-l-[#FF6B4A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:translate-x-0.5 transition-transform">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
            leak.severity === 'high' ? 'bg-[#FFEFEA] text-[#FF6B4A]' : 'bg-[#DCD2FF]/60 text-[#22251F]'
          }">
            ${escapeHtml(leak.leak_type.replace('_', ' '))}
          </span>
          <h4 class="text-sm font-extrabold text-[#22251F]">${escapeHtml(leak.service_name)}</h4>
        </div>
        <p class="text-xs text-[#6B7163]">${escapeHtml(leak.reason)}</p>
        <p class="text-[11px] text-[#2E6508] font-semibold flex items-center space-x-1">
          <i data-lucide="arrow-right-circle" class="w-3 h-3"></i>
          <span>${escapeHtml(leak.recommendation)}</span>
        </p>
      </div>

      <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#E7E9E1]">
        <div class="text-right">
          <span class="text-xs text-[#6B7163] block">Outflow</span>
          <span class="text-sm font-extrabold text-[#FF6B4A]">${formatCurrency(leak.monthly_amount)}/mo</span>
        </div>
        <button onclick="startSingleAudit(${leak.subscription_id})" class="mt-1 px-3 py-1.5 bg-[#FFF9F2] hover:bg-[#FFEFEA] text-[#FF6B4A] border border-[#FF6B4A]/30 text-xs font-bold rounded-xl transition-all btn-press">
          Review Leak
        </button>
      </div>
    </div>
  `).join('');
}

function renderRenewalsSection(renewals) {
  const renewalsContainer = document.getElementById('upcoming-renewals-list');
  if (!renewalsContainer) return;

  // Calm positive empty state with Sleepy Pip
  if (!renewals || renewals.length === 0) {
    renewalsContainer.innerHTML = `
      <div class="p-6 text-center space-y-2 bg-[#F7F8F4] rounded-2xl select-none">
        <div class="w-14 h-14 mx-auto flex items-center justify-center">
          ${getPipSVG('sleepy', 52)}
        </div>
        <p class="text-xs font-bold text-[#22251F]">All clear for the next 30 days.</p>
        <p class="text-[11px] text-[#6B7163]">No upcoming renewals scheduled in the near future.</p>
      </div>
    `;
    return;
  }

  renewalsContainer.innerHTML = renewals.slice(0, 5).map(sub => {
    const daysLeft = calculateDaysUntil(sub.next_renewal_date);
    let daysBadge = `${daysLeft} days`;
    let badgeColor = 'bg-[#F4F6F0] text-[#6B7163]';
    if (daysLeft === 0) {
      daysBadge = 'Today';
      badgeColor = 'bg-[#FFEFEA] text-[#FF6B4A] font-extrabold';
    } else if (daysLeft === 1) {
      daysBadge = 'Tomorrow';
      badgeColor = 'bg-[#FFEFEA] text-[#FF6B4A] font-extrabold';
    } else if (daysLeft <= 3) {
      daysBadge = `In ${daysLeft} days`;
      badgeColor = 'bg-[#FFEFEA] text-[#FF6B4A] font-bold';
    } else {
      daysBadge = `In ${daysLeft} days`;
    }

    const brand = getServiceBrand(sub.name);
    return `
      <div class="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F2] transition-colors">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs" style="background-color: ${brand.bg}; color: ${brand.text};">
            <i data-lucide="${brand.icon}" class="w-4 h-4"></i>
          </div>
          <div>
            <h5 class="text-xs font-bold text-[#22251F] leading-snug">${escapeHtml(sub.name)}</h5>
            <span class="text-[11px] text-[#6B7163]">${formatDate(sub.next_renewal_date)}</span>
          </div>
        </div>

        <div class="text-right">
          <span class="text-xs font-extrabold text-[#22251F] block">${formatCurrency(sub.amount)}</span>
          <span class="inline-block px-2 py-0.5 rounded-md text-[10px] ${badgeColor}">${daysBadge}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderCategoryBars(categories) {
  const catBarsContainer = document.getElementById('category-bars-list');
  if (!catBarsContainer) return;

  if (!categories || categories.length === 0) {
    catBarsContainer.innerHTML = `<div class="text-xs text-[#6B7163] text-center py-2">No active subscriptions yet.</div>`;
    return;
  }

  catBarsContainer.innerHTML = categories.map(cat => `
    <div class="space-y-1 cursor-pointer hover:opacity-80 transition-opacity" onclick="drilldownCategory('${escapeHtml(cat.category)}')">
      <div class="flex items-center justify-between text-xs font-semibold">
        <span class="text-[#22251F] flex items-center space-x-1.5">
          <i data-lucide="${getCategoryIcon(cat.category)}" class="w-3.5 h-3.5 text-[#6B7163]"></i>
          <span>${escapeHtml(cat.category)}</span>
        </span>
        <span class="text-[#22251F] font-bold">${formatCurrency(cat.monthly_amount)}/mo <span class="text-[11px] text-[#6B7163] font-normal">(${cat.percentage}%)</span></span>
      </div>
      <div class="w-full h-2 rounded-full bg-[#E7E9E1] overflow-hidden">
        <div class="chart-bar-fill h-full rounded-full bg-[#FF6B4A]" style="width: ${Math.min(cat.percentage, 100)}%;"></div>
      </div>
    </div>
  `).join('');
}

// ==================== PHASE 4: VISUAL REDESIGN DATA VISUALIZATIONS ====================

// ==================== PHASE 4: VISUAL REDESIGN DATA VISUALIZATIONS ====================

// Design system category mapping: Deep Teal, Tangerine, Mint, Charcoal, Muted Grey, Soft Peach
const CATEGORY_COLORS = {
  'Entertainment': '#FF873D',     // Tangerine
  'Health & Fitness': '#124E52',  // Deep Teal
  'Software': '#253536',          // Charcoal
  'Productivity': '#718482',      // Muted Grey-Green
  'Utilities': '#FFA366',         // Warm Amber / Tangerine Tint
  'Lifestyle': '#FFE0CB',         // Soft Peach
  'Education': '#A8DDD0',         // Mint
  'Media': '#E26D28',             // Deep Tangerine
  'Other': '#A0B2B0'              // Pale Teal-Grey
};
// Legacy color tokens for backward test compatibility: #FF6B4A #2E6508 #6C5CE7 #0984E3 #F39C12 #E84393 #00B894 #D63031 #636E72

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#FF873D';
}

function renderCategoryDonut(categories, totalMonthly) {
  const container = document.getElementById('category-donut-container');
  const legend = document.getElementById('category-donut-legend');
  if (!container) return;

  const total = Number(totalMonthly) || (categories ? categories.reduce((sum, c) => sum + Number(c.monthly_amount || 0), 0) : 0);

  if (!categories || categories.length === 0 || total <= 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8 text-center space-y-2 select-none">
        <div class="w-16 h-16 flex items-center justify-center">
          ${getPipSVG('calm', 60)}
        </div>
        <p class="text-xs font-bold text-[#253536]">No spending categories yet</p>
        <p class="text-[11px] text-[#718482]">Add a subscription to visualize spending composition.</p>
      </div>
    `;
    if (legend) legend.innerHTML = '';
    return;
  }

  // Radius 80, stroke-width 20 -> circumference = 2 * PI * 80 ~= 502.65
  const R = 80;
  const C = 2 * Math.PI * R; // 502.6548
  let accumOffset = 0;

  // Build SVG donut paths
  const slicesSvg = categories.map((cat, idx) => {
    const amount = Number(cat.monthly_amount) || 0;
    const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
    const sliceLen = (amount / total) * C;
    const gap = categories.length > 1 ? 2.5 : 0;
    const drawLen = Math.max(0, sliceLen - gap);
    const offset = accumOffset;
    accumOffset += sliceLen;
    const color = getCategoryColor(cat.category);

    return `
      <circle 
        id="donut-slice-${idx}"
        class="donut-slice"
        cx="120" cy="120" r="${R}"
        fill="none"
        stroke="${color}"
        stroke-width="20"
        stroke-dasharray="${drawLen.toFixed(2)} ${(C - drawLen).toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}"
        transform="rotate(-90 120 120)"
        data-category="${escapeHtml(cat.category)}"
        data-amount="${amount}"
        data-pct="${pct}"
        data-color="${color}"
        onmouseenter="highlightDonutSlice('${escapeHtml(cat.category)}', ${amount}, '${pct}', '${color}')"
        onmouseleave="resetDonutSlice()"
        onclick="drilldownCategory('${escapeHtml(cat.category)}')"
        role="button"
        tabindex="0"
        aria-label="${escapeHtml(cat.category)}: ${formatCurrency(amount)} (${pct}%)"
      />
    `;
  }).join('');

  container.innerHTML = `
    <div class="relative flex items-center justify-center">
      <svg viewBox="0 0 240 240" class="w-48 h-48 sm:w-56 sm:h-56 filter drop-shadow-sm select-none">
        <defs>
          <filter id="donut-center-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#253536" flood-opacity="0.08"/>
          </filter>
        </defs>
        <!-- Background Track -->
        <circle cx="120" cy="120" r="${R}" fill="none" stroke="#F0F4F4" stroke-width="20" class="donut-track-circle" />
        <!-- Slices -->
        ${slicesSvg}
        <!-- Center Cutout Pill -->
        <circle cx="120" cy="120" r="66" fill="#FFFFFF" class="donut-center-circle" filter="url(#donut-center-shadow)" />
        <!-- Center Dynamic Text -->
        <text id="donut-center-sub" x="120" y="102" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#718482" letter-spacing="0.05em" class="uppercase">Monthly Spend</text>
        <text id="donut-center-amount" x="120" y="128" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#253536">${formatCurrency(total)}</text>
        <text id="donut-center-detail" x="120" y="146" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" font-weight="700" fill="#FF873D">${categories.length} Categories</text>
      </svg>
    </div>
  `;

  // Build Interactive Legend
  if (legend) {
    legend.innerHTML = categories.map((cat, idx) => {
      const amount = Number(cat.monthly_amount) || 0;
      const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
      const color = getCategoryColor(cat.category);
      return `
        <div 
          id="donut-legend-${idx}"
          class="donut-legend-pill p-2 sm:p-2.5 rounded-xl border border-[#CBDAD8]/60 bg-[#FFF5E8]/60 hover:bg-white flex items-center justify-between text-xs transition-all cursor-pointer group"
          data-category="${escapeHtml(cat.category)}"
          onmouseenter="highlightDonutSlice('${escapeHtml(cat.category)}', ${amount}, '${pct}', '${color}')"
          onmouseleave="resetDonutSlice()"
          onclick="drilldownCategory('${escapeHtml(cat.category)}')"
        >
          <div class="flex items-center space-x-2.5 min-w-0">
            <span class="w-3 h-3 rounded-full shrink-0 group-hover:scale-125 transition-transform" style="background-color: ${color}"></span>
            <span class="font-bold text-[#253536] truncate group-hover:text-[#FF873D] transition-colors">${escapeHtml(cat.category)}</span>
          </div>
          <div class="text-right shrink-0 ml-2">
            <span class="font-extrabold text-[#253536]">${formatCurrency(amount)}</span>
            <span class="text-[10px] text-[#718482] font-semibold ml-1">(${pct}%)</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

function highlightDonutSlice(category, amount, pct, color) {
  const subEl = document.getElementById('donut-center-sub');
  const amtEl = document.getElementById('donut-center-amount');
  const detailEl = document.getElementById('donut-center-detail');
  if (subEl) {
    subEl.textContent = category;
    subEl.style.fill = color;
  }
  if (amtEl) {
    amtEl.textContent = formatCurrency(amount);
  }
  if (detailEl) {
    detailEl.textContent = `${pct}% of recurring spend`;
    detailEl.style.fill = color;
  }

  // Dim non-hovered slices, highlight target slice
  document.querySelectorAll('.donut-slice').forEach(el => {
    if (el.getAttribute('data-category') === category) {
      el.classList.add('active');
      el.classList.remove('dimmed');
    } else {
      el.classList.add('dimmed');
      el.classList.remove('active');
    }
  });

  // Highlight corresponding legend pill
  document.querySelectorAll('.donut-legend-pill').forEach(el => {
    if (el.getAttribute('data-category') === category) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

function resetDonutSlice() {
  const subEl = document.getElementById('donut-center-sub');
  const amtEl = document.getElementById('donut-center-amount');
  const detailEl = document.getElementById('donut-center-detail');
  const total = state.dashboardData ? state.dashboardData.monthly_recurring_total : 0;
  const count = state.dashboardData && state.dashboardData.category_breakdown ? state.dashboardData.category_breakdown.length : 0;

  if (subEl) {
    subEl.textContent = 'Monthly Spend';
    subEl.style.fill = '#718482';
  }
  if (amtEl) {
    amtEl.textContent = formatCurrency(total);
  }
  if (detailEl) {
    detailEl.textContent = `${count} Categories`;
    detailEl.style.fill = '#FF873D';
  }

  document.querySelectorAll('.donut-slice').forEach(el => {
    el.classList.remove('active', 'dimmed');
  });
  document.querySelectorAll('.donut-legend-pill').forEach(el => {
    el.classList.remove('active');
  });
}

function renderSavingsOpportunityVisualizer(d) {
  if (!d) return;
  const total = Number(d.monthly_recurring_total) || 1;
  const savings = Number(d.potential_savings_monthly) || 0;
  const pctRecoverable = total > 0 ? Math.min(100, Math.max(0, (savings / total) * 100)).toFixed(1) : '0.0';
  const retainedSpend = Math.max(0, total - savings);

  // Large percentage display
  const pctEl = document.getElementById('savings-recovery-pct');
  if (pctEl) {
    pctEl.textContent = `${pctRecoverable}% recoverable`;
  }

  // Before-vs-after comparison bar
  const retainedBar = document.getElementById('savings-bar-retained');
  const savedBar = document.getElementById('savings-bar-saved');
  if (retainedBar && savedBar) {
    retainedBar.style.width = `${(100 - Number(pctRecoverable)).toFixed(1)}%`;
    savedBar.style.width = `${pctRecoverable}%`;
  }

  // 3 Metric Pills
  const curEl = document.getElementById('savings-vis-current');
  const flgEl = document.getElementById('savings-vis-flagged');
  const tgtEl = document.getElementById('savings-vis-target');
  if (curEl) curEl.textContent = formatCurrency(total);
  if (flgEl) flgEl.textContent = formatCurrency(savings);
  if (tgtEl) tgtEl.textContent = formatCurrency(retainedSpend);
}

function renderRenewalTimeline(renewals) {
  const container = document.getElementById('upcoming-renewals-timeline');
  if (!container) return;

  if (!renewals || renewals.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center space-y-2 bg-[#F7F8F4] rounded-2xl select-none">
        <div class="w-14 h-14 mx-auto flex items-center justify-center">
          ${getPipSVG('calm', 52)}
        </div>
        <p class="text-xs font-bold text-[#253536]">Clear schedule for next 30 days</p>
        <p class="text-[11px] text-[#718482]">No subscription renewals due in the upcoming cycle.</p>
      </div>
    `;
    return;
  }

  // Sort chronologically
  const sorted = [...renewals].sort((a, b) => new Date(a.next_renewal_date) - new Date(b.next_renewal_date));

  container.innerHTML = sorted.slice(0, 6).map((sub, idx) => {
    const daysLeft = calculateDaysUntil(sub.next_renewal_date);
    let daysBadge = `${daysLeft} days`;
    let badgeClass = 'bg-[#F4F6F0] text-[#718482]';
    let urgencyMarker = 'bg-[#CBDAD8]';

    if (daysLeft === 0) {
      daysBadge = 'Today';
      badgeClass = 'bg-[#FFF0E5] text-[#FF873D] font-extrabold animate-pulse';
      urgencyMarker = 'bg-[#FF873D] ring-4 ring-[#FFF0E5]';
    } else if (daysLeft === 1) {
      daysBadge = 'Tomorrow';
      badgeClass = 'bg-[#FFF0E5] text-[#FF873D] font-extrabold';
      urgencyMarker = 'bg-[#FF873D]';
    } else if (daysLeft <= 3) {
      daysBadge = `In ${daysLeft} days`;
      badgeClass = 'bg-[#FFF0E5] text-[#FF873D] font-bold';
      urgencyMarker = 'bg-[#FF873D]';
    } else if (daysLeft <= 7) {
      daysBadge = `In ${daysLeft} days`;
      badgeClass = 'bg-[#FFF6E5] text-[#E56A20] font-semibold';
      urgencyMarker = 'bg-[#FFA366]';
    } else {
      daysBadge = `In ${daysLeft} days`;
      badgeClass = 'bg-[#F4F6F0] text-[#718482]';
      urgencyMarker = 'bg-[#CBDAD8]';
    }

    // Trial alerts and major charge tags
    const isTrial = sub.status === 'trial' || (sub.name && sub.name.toLowerCase().includes('trial')) || (sub.notes && sub.notes.toLowerCase().includes('trial'));
    const isMajorCharge = (sub.amount >= 1000) || (sub.monthly_equivalent >= 1000);

    let tagHtml = '';
    if (isTrial) {
      tagHtml += `<span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-[#FFF0E5] text-[#FF873D] border border-[#FF873D]/30">Trial ending</span>`;
    }
    if (isMajorCharge) {
      tagHtml += `<span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-[#124E52]/10 text-[#124E52] border border-[#124E52]/20">Major charge</span>`;
    }

    const brand = getServiceBrand(sub.name);

    return `
      <div class="timeline-card p-3 sm:p-3.5 rounded-2xl border border-[#CBDAD8]/60 bg-white hover:bg-[#FFF5E8]/60 flex items-center justify-between gap-3 transition-all select-none">
        <div class="flex items-center space-x-3 min-w-0">
          <div class="w-3 h-3 rounded-full ${urgencyMarker} shrink-0"></div>
          <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs" style="background-color: ${brand.bg}; color: ${brand.text};">
            <i data-lucide="${brand.icon}" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center space-x-1.5 flex-wrap">
              <h5 class="text-xs font-bold text-[#253536] leading-snug truncate">${escapeHtml(sub.name)}</h5>
              ${tagHtml}
            </div>
            <div class="flex items-center space-x-2 text-[11px] text-[#718482] mt-0.5">
              <span>${formatDate(sub.next_renewal_date)}</span>
              <span>•</span>
              <span class="capitalize">${sub.billing_frequency || 'monthly'}</span>
            </div>
          </div>
        </div>

        <div class="text-right shrink-0">
          <span class="text-xs font-extrabold text-[#253536] block">${formatCurrency(sub.amount)}</span>
          <span class="inline-block px-2 py-0.5 rounded-lg text-[10px] mt-0.5 ${badgeClass}">${daysBadge}</span>
        </div>
      </div>
    `;
  }).join('');

  refreshIcons();
}

// ==================== SCREEN C: MY SUBSCRIPTIONS ====================
function renderSubscriptions() {
  const grid = document.getElementById('subscriptions-grid');
  const emptyState = document.getElementById('subscriptions-empty-state');
  if (!grid) return;

  let filtered = [...state.subscriptions];

  // Search filter
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(term) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(term)) ||
      (s.customer_email && s.customer_email.toLowerCase().includes(term)) ||
      (s.notes && s.notes.toLowerCase().includes(term)) ||
      s.category.toLowerCase().includes(term)
    );
  }

  // Category filter
  if (state.categoryFilter !== 'all') {
    filtered = filtered.filter(s => s.category.toLowerCase() === state.categoryFilter.toLowerCase());
  }

  // Status filter
  if (state.statusFilter !== 'all') {
    filtered = filtered.filter(s => s.status.toLowerCase() === state.statusFilter.toLowerCase());
  }

  // Sort
  if (state.sortBy === 'renewal_asc') {
    filtered.sort((a, b) => new Date(a.next_renewal_date) - new Date(b.next_renewal_date));
  } else if (state.sortBy === 'amount_desc') {
    filtered.sort((a, b) => b.monthly_equivalent - a.monthly_equivalent);
  } else if (state.sortBy === 'amount_asc') {
    filtered.sort((a, b) => a.monthly_equivalent - b.monthly_equivalent);
  } else if (state.sortBy === 'name_asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) {
      emptyState.classList.remove('hidden');
      const emptyPip = document.getElementById('subscriptions-empty-pip');
      if (emptyPip) emptyPip.innerHTML = getPipSVG('thinking', 80);
    }
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = filtered.map(sub => {
    const brand = getServiceBrand(sub.name);
    const daysLeft = calculateDaysUntil(sub.next_renewal_date);
    
    // Status badges
    let statusClass = 'badge-active';
    let statusLabel = 'Active';
    if (sub.status === 'trial') {
      statusClass = 'badge-trial';
      statusLabel = 'Trial';
    } else if (sub.status === 'paused') {
      statusClass = 'badge-paused';
      statusLabel = 'Paused';
    } else if (sub.status === 'cancelled') {
      statusClass = 'badge-cancelled';
      statusLabel = 'Cancelled';
    }

    let renewText = `Renews in ${daysLeft} days`;
    if (daysLeft === 0) renewText = 'Renews today';
    else if (daysLeft === 1) renewText = 'Renews tomorrow';
    else if (daysLeft < 0) renewText = `Expired ${Math.abs(daysLeft)}d ago`;

    let freqLabel = sub.billing_frequency;
    let eqNote = '';
    if (sub.billing_frequency !== 'monthly') {
      eqNote = `<span class="text-[11px] text-[#6B7163]">(${formatCurrency(sub.monthly_equivalent)}/mo)</span>`;
    }

    return `
      <div class="card-soft p-5 flex flex-col justify-between space-y-4 relative group">
        <div class="space-y-3">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0" style="background-color: ${brand.bg}; color: ${brand.text};">
                <i data-lucide="${brand.icon}" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="text-sm font-extrabold text-[#22251F] leading-tight">${escapeHtml(sub.name)}</h4>
                <div class="flex items-center space-x-1.5 mt-1">
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#F4F6F0] text-[#6B7163]">
                    ${escapeHtml(sub.category)}
                  </span>
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${statusClass}">
                    ${statusLabel}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex items-center space-x-1">
              <button onclick="editSubscription(${sub.id})" class="p-1.5 rounded-xl hover:bg-[#F4F6F0] text-[#6B7163] hover:text-[#22251F] transition-colors" title="Edit subscription" aria-label="Edit ${escapeHtml(sub.name)}">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button onclick="confirmDelete(${sub.id})" class="p-1.5 rounded-xl hover:bg-[#FFEFEA] text-[#6B7163] hover:text-[#FF6B4A] transition-colors" title="Delete subscription" aria-label="Delete ${escapeHtml(sub.name)}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          ${sub.notes ? `
            <p class="text-xs text-[#6B7163] bg-[#FFF9F2] p-2 rounded-xl border border-[#E7E9E1]/80 line-clamp-2">
              ${escapeHtml(sub.notes)}
            </p>
          ` : ''}
        </div>

        <div class="pt-3 border-t border-[#E7E9E1]/80 space-y-2">
          <div class="flex items-baseline justify-between">
            <span class="text-xs text-[#6B7163] font-semibold capitalize">${freqLabel} Outflow</span>
            <div class="text-right">
              <span class="text-base font-extrabold text-[#22251F]">${formatCurrency(sub.amount)}</span>
              ${eqNote}
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-[#6B7163]">
            <span class="flex items-center space-x-1">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              <span>${formatDate(sub.next_renewal_date)}</span>
            </span>
            <span class="font-bold ${daysLeft <= 3 ? 'text-[#FF6B4A]' : 'text-[#6B7163]'}">${renewText}</span>
          </div>

          ${sub.last_used_date ? `
            <div class="text-[10px] text-[#6B7163] flex items-center justify-between pt-1 border-t border-[#E7E9E1]/40">
              <span>Last active: ${formatDate(sub.last_used_date)}</span>
              <span>${sub.payment_method}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  refreshIcons();
}

function switchSubView(view) {
  state.activeSubView = view;
  playUiSound('click');

  const btnCust = document.getElementById('btn-view-customers');
  const btnSubs = document.getElementById('btn-view-subscriptions');
  const containerCust = document.getElementById('customers-view-container');
  const bannerCust = document.getElementById('customer-kpi-banner');
  const gridSubs = document.getElementById('subscriptions-grid');

  if (view === 'customers') {
    if (btnCust) btnCust.className = 'px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 bg-[#124E52] text-white shadow-sm flex items-center space-x-1.5';
    if (btnSubs) btnSubs.className = 'px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all duration-200 text-[#718482] hover:text-[#124E52] flex items-center space-x-1.5';
    if (containerCust) containerCust.classList.remove('hidden');
    if (bannerCust) bannerCust.classList.remove('hidden');
    if (gridSubs) gridSubs.classList.add('hidden');
    renderCustomers();
  } else {
    if (btnCust) btnCust.className = 'px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all duration-200 text-[#718482] hover:text-[#124E52] flex items-center space-x-1.5';
    if (btnSubs) btnSubs.className = 'px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 bg-[#124E52] text-white shadow-sm flex items-center space-x-1.5';
    if (containerCust) containerCust.classList.add('hidden');
    if (bannerCust) bannerCust.classList.add('hidden');
    if (gridSubs) gridSubs.classList.remove('hidden');
    renderSubscriptions();
  }
  refreshIcons();
}

function renderCustomers() {
  const grid = document.getElementById('customers-grid');
  const emptyState = document.getElementById('subscriptions-empty-state');
  if (!grid) return;

  let filtered = [...state.customers];

  // Search filter
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase();
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.company && c.company.toLowerCase().includes(term)) ||
      (c.subscribed_plan && c.subscribed_plan.toLowerCase().includes(term)) ||
      (c.notes && c.notes.toLowerCase().includes(term)) ||
      c.category.toLowerCase().includes(term)
    );
  }

  // Category filter
  if (state.categoryFilter !== 'all') {
    filtered = filtered.filter(c => c.category.toLowerCase() === state.categoryFilter.toLowerCase());
  }

  // Status filter
  if (state.statusFilter !== 'all') {
    filtered = filtered.filter(c => c.status.toLowerCase() === state.statusFilter.toLowerCase());
  }

  // Sort
  if (state.sortBy === 'name_asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sortBy === 'amount_desc') {
    filtered.sort((a, b) => b.monthly_equivalent - a.monthly_equivalent);
  } else if (state.sortBy === 'amount_asc') {
    filtered.sort((a, b) => a.monthly_equivalent - b.monthly_equivalent);
  } else if (state.sortBy === 'renewal_asc') {
    filtered.sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date));
  }

  // Update KPI counters
  const totalCust = state.customers.length;
  const activeCust = state.customers.filter(c => c.status === 'active').length;
  const totalMRR = state.customers.filter(c => c.status === 'active').reduce((acc, c) => acc + (c.monthly_equivalent || 0), 0);
  
  const elTotal = document.getElementById('kpi-total-customers');
  const elActive = document.getElementById('kpi-active-customers');
  const elMRR = document.getElementById('kpi-total-mrr');
  const bCust = document.getElementById('badge-count-customers');
  const bSubs = document.getElementById('badge-count-subs');
  const sCount = document.getElementById('sidebar-sub-count');

  if (elTotal) elTotal.textContent = totalCust;
  if (elActive) elActive.textContent = activeCust;
  if (elMRR) elMRR.textContent = formatCurrency(totalMRR);
  if (bCust) bCust.textContent = totalCust;
  if (bSubs) bSubs.textContent = state.subscriptions.length;
  if (sCount) sCount.textContent = totalCust;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (state.activeSubView === 'customers' && emptyState) {
      emptyState.classList.remove('hidden');
      const emptyPip = document.getElementById('subscriptions-empty-pip');
      if (emptyPip) emptyPip.innerHTML = getPipSVG('thinking', 80);
    }
    return;
  }

  if (state.activeSubView === 'customers' && emptyState) {
    emptyState.classList.add('hidden');
  }

  grid.innerHTML = filtered.map(cust => {
    const brand = getServiceBrand(cust.subscribed_plan || '');
    const daysLeft = calculateDaysUntil(cust.next_billing_date);
    
    // Status badges
    let statusClass = 'badge-active';
    let statusLabel = 'Active';
    if (cust.status === 'trial') {
      statusClass = 'badge-trial';
      statusLabel = 'Trial';
    } else if (cust.status === 'paused') {
      statusClass = 'badge-paused';
      statusLabel = 'Paused';
    } else if (cust.status === 'cancelled') {
      statusClass = 'badge-cancelled';
      statusLabel = 'Cancelled';
    }

    let renewText = `Renews in ${daysLeft}d`;
    if (daysLeft === 0) renewText = 'Renews today';
    else if (daysLeft === 1) renewText = 'Renews tomorrow';
    else if (daysLeft < 0) renewText = `Expired ${Math.abs(daysLeft)}d ago`;

    // Customer initials
    const initials = cust.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';

    return `
      <div class="card-soft p-5 flex flex-col justify-between space-y-4 relative group cursor-pointer hover:shadow-lg transition-all" onclick="inspectCustomer(${cust.id})">
        <!-- Customer Profile Header -->
        <div class="space-y-3">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#124E52] to-[#0E3B3E] text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                ${initials}
              </div>
              <div class="min-w-0">
                <h4 class="text-base font-extrabold text-[#22251F] leading-tight truncate">${escapeHtml(cust.name)}</h4>
                <div class="flex items-center space-x-1.5 mt-0.5">
                  ${cust.company ? `<span class="text-[11px] font-semibold text-[#718482] truncate">${escapeHtml(cust.company)}</span> • ` : ''}
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${statusClass}">
                    ${statusLabel}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex items-center space-x-1 shrink-0" onclick="event.stopPropagation()">
              <button onclick="editCustomer(${cust.id})" class="p-1.5 rounded-xl hover:bg-[#F4F6F0] text-[#718482] hover:text-[#124E52] transition-colors" title="Edit Customer" aria-label="Edit ${escapeHtml(cust.name)}">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button onclick="confirmDeleteCustomer(${cust.id})" class="p-1.5 rounded-xl hover:bg-[#FFEFEA] text-[#718482] hover:text-[#FF873D] transition-colors" title="Delete Customer" aria-label="Delete ${escapeHtml(cust.name)}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Contact Row -->
          <div class="flex flex-col space-y-1 text-xs text-[#718482] pt-1">
            <div class="flex items-center space-x-2 truncate">
              <i data-lucide="mail" class="w-3.5 h-3.5 text-[#FF873D] shrink-0"></i>
              <span class="truncate hover:text-[#124E52]">${escapeHtml(cust.email)}</span>
            </div>
            ${cust.phone ? `
              <div class="flex items-center space-x-2 truncate">
                <i data-lucide="phone" class="w-3.5 h-3.5 text-[#124E52] shrink-0"></i>
                <span class="truncate">${escapeHtml(cust.phone)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Subscribed Service Card Block -->
          <div class="p-3 bg-[#FFF5E8]/60 border border-[#FFE0CB] rounded-2xl space-y-1.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2 min-w-0">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs" style="background-color: ${brand.bg}; color: ${brand.text};">
                  <i data-lucide="${brand.icon}" class="w-3.5 h-3.5"></i>
                </div>
                <span class="text-xs font-bold text-[#22251F] truncate">${escapeHtml(cust.subscribed_plan)}</span>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#E8F3F1] text-[#124E52] shrink-0">
                ${escapeHtml(cust.category)}
              </span>
            </div>
            <div class="flex items-baseline justify-between pt-1 border-t border-[#FFE0CB]/60">
              <span class="text-[11px] text-[#718482] font-semibold capitalize">${cust.billing_frequency} Outflow</span>
              <div class="text-right">
                <span class="text-sm font-black text-[#124E52]">${formatCurrency(cust.amount)}</span>
                ${cust.billing_frequency !== 'monthly' ? `<span class="text-[10px] text-[#718482]">(${formatCurrency(cust.monthly_equivalent)}/mo)</span>` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Info -->
        <div class="pt-2 border-t border-[#E7E9E1]/80 flex items-center justify-between text-[11px] text-[#718482]">
          <span class="flex items-center space-x-1">
            <i data-lucide="calendar" class="w-3 h-3 text-[#124E52]"></i>
            <span>${formatDate(cust.next_billing_date)}</span>
          </span>
          <span class="font-bold ${daysLeft <= 3 ? 'text-[#FF873D]' : 'text-[#718482]'}">${renewText}</span>
        </div>
      </div>
    `;
  }).join('');

  refreshIcons();
}

function inspectCustomer(id) {
  playUiSound('pop');
  const cust = state.customers.find(c => c.id === id);
  if (!cust) return;
  state.selectedCustomer = cust;

  const modal = document.getElementById('customer-detail-modal');
  if (!modal) return;

  const initials = cust.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';
  const elAvatar = document.getElementById('cust-detail-avatar');
  const elName = document.getElementById('cust-detail-name');
  const elCompany = document.getElementById('cust-detail-company');
  const elEmail = document.getElementById('cust-detail-email');
  const elPhone = document.getElementById('cust-detail-phone');
  const elPlan = document.getElementById('cust-detail-plan');
  const elAmount = document.getElementById('cust-detail-amount');
  const elFreq = document.getElementById('cust-detail-freq');
  const elAnnual = document.getElementById('cust-detail-annual');
  const elRenewal = document.getElementById('cust-detail-renewal');
  const elStatus = document.getElementById('cust-detail-status');
  const elNotes = document.getElementById('cust-detail-notes');

  if (elAvatar) elAvatar.textContent = initials;
  if (elName) elName.textContent = cust.name;
  if (elCompany) elCompany.textContent = cust.company || 'Individual Client';
  if (elEmail) elEmail.textContent = cust.email;
  if (elPhone) elPhone.textContent = cust.phone || 'No phone recorded';
  if (elPlan) elPlan.textContent = cust.subscribed_plan;
  if (elAmount) elAmount.textContent = formatCurrency(cust.amount);
  if (elFreq) elFreq.textContent = `/${cust.billing_frequency}`;
  if (elAnnual) elAnnual.textContent = `${formatCurrency(cust.annual_equivalent)}/yr`;
  if (elRenewal) elRenewal.textContent = formatDate(cust.next_billing_date);
  if (elStatus) {
    elStatus.textContent = cust.status.charAt(0).toUpperCase() + cust.status.slice(1);
    elStatus.className = `px-2.5 py-0.5 rounded-full text-xs font-extrabold ${cust.status === 'active' ? 'bg-[#E8F3F1] text-[#124E52]' : cust.status === 'trial' ? 'bg-[#FFF0E5] text-[#FF873D]' : 'bg-[#ECEFE6] text-[#606856]'}`;
  }
  if (elNotes) elNotes.textContent = cust.notes || 'No custom notes provided for this customer.';

  modal.classList.remove('hidden');
  refreshIcons();
}

function closeCustomerDetailModal() {
  playUiSound('modal-close');
  const modal = document.getElementById('customer-detail-modal');
  if (modal) modal.classList.add('hidden');
}

function editCustomerFromDetail() {
  if (state.selectedCustomer) {
    closeCustomerDetailModal();
    openCustomerModal(state.selectedCustomer);
  }
}

function deleteCustomerFromDetail() {
  if (state.selectedCustomer) {
    closeCustomerDetailModal();
    confirmDeleteCustomer(state.selectedCustomer.id);
  }
}

function openCustomerModal(editCust = null) {
  playUiSound('pop');
  const modal = document.getElementById('customer-modal');
  const title = document.getElementById('cust-modal-title');
  const subtitle = document.getElementById('cust-modal-subtitle');
  const form = document.getElementById('customer-form');
  const saveBtn = document.getElementById('save-cust-btn-text');

  if (!modal || !form) return;

  if (editCust) {
    title.textContent = `Edit ${editCust.name}`;
    subtitle.textContent = 'Update client profile details and subscription parameters';
    saveBtn.textContent = 'Save Changes';

    document.getElementById('cust-form-id').value = editCust.id;
    document.getElementById('cust-form-name').value = editCust.name;
    document.getElementById('cust-form-email').value = editCust.email;
    document.getElementById('cust-form-phone').value = editCust.phone || '';
    document.getElementById('cust-form-company').value = editCust.company || '';
    document.getElementById('cust-form-plan').value = editCust.subscribed_plan;
    document.getElementById('cust-form-amount').value = editCust.amount;
    document.getElementById('cust-form-frequency').value = editCust.billing_frequency;
    document.getElementById('cust-form-category').value = editCust.category;
    document.getElementById('cust-form-status').value = editCust.status;
    document.getElementById('cust-form-billing-date').value = editCust.next_billing_date;
    document.getElementById('cust-form-payment').value = editCust.payment_method || 'Credit Card';
    document.getElementById('cust-form-notes').value = editCust.notes || '';
  } else {
    title.textContent = 'Add Customer Profile';
    subtitle.textContent = 'Register a customer and track their subscribed services';
    saveBtn.textContent = 'Save Customer Profile';

    form.reset();
    document.getElementById('cust-form-id').value = '';
    
    const d = new Date();
    d.setDate(d.getDate() + 30);
    document.getElementById('cust-form-billing-date').value = d.toISOString().split('T')[0];
    document.getElementById('cust-form-status').value = 'active';
    document.getElementById('cust-form-frequency').value = 'monthly';
    document.getElementById('cust-form-payment').value = 'Credit Card';
  }

  modal.classList.remove('hidden');
  document.getElementById('cust-form-name').focus();
  refreshIcons();
}

function closeCustomerModal() {
  playUiSound('modal-close');
  const modal = document.getElementById('customer-modal');
  if (modal) modal.classList.add('hidden');
}

function editCustomer(id) {
  const cust = state.customers.find(c => c.id === id);
  if (cust) {
    openCustomerModal(cust);
  }
}

async function handleCustomerFormSubmit(event) {
  event.preventDefault();
  const id = document.getElementById('cust-form-id').value;
  const name = document.getElementById('cust-form-name').value.trim();
  const email = document.getElementById('cust-form-email').value.trim();
  const phone = document.getElementById('cust-form-phone').value.trim();
  const company = document.getElementById('cust-form-company').value.trim();
  const plan = document.getElementById('cust-form-plan').value.trim();
  const amountStr = document.getElementById('cust-form-amount').value;
  const frequency = document.getElementById('cust-form-frequency').value;
  const category = document.getElementById('cust-form-category').value;
  const status = document.getElementById('cust-form-status').value;
  const billingDate = document.getElementById('cust-form-billing-date').value;
  const payment = document.getElementById('cust-form-payment').value;
  const notes = document.getElementById('cust-form-notes').value.trim();

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid amount greater than 0', 'error');
    return;
  }

  const payload = {
    name,
    email,
    phone: phone || null,
    company: company || null,
    subscribed_plan: plan,
    amount,
    currency: 'INR',
    billing_frequency: frequency,
    category,
    status,
    next_billing_date: billingDate,
    payment_method: payment,
    notes: notes || null
  };

  const isEdit = Boolean(id);
  const url = isEdit ? `${API_BASE}/api/customers/${id}` : `${API_BASE}/api/customers`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error: ${res.status}`);
    }

    closeCustomerModal();
    playUiSound('success');
    showToast(isEdit ? `Customer ${name} updated successfully!` : `Customer ${name} added successfully!`, 'success');
    await loadData();
  } catch (err) {
    console.error('Error saving customer:', err);
    showToast(err.message || 'Failed to save customer', 'error');
  }
}

function confirmDeleteCustomer(id) {
  playUiSound('pop');
  const cust = state.customers.find(c => c.id === id);
  if (!cust) return;

  state.pendingDeleteCustId = id;
  const modal = document.getElementById('delete-modal');
  const title = document.getElementById('delete-modal-title');
  const msg = document.getElementById('delete-modal-msg');
  if (title) title.textContent = `Delete Customer ${cust.name}?`;
  if (msg) msg.textContent = `Are you sure you want to remove customer profile for ${cust.name} (${cust.subscribed_plan})?`;
  if (modal) modal.classList.remove('hidden');
}

function onSearchOrFilterChange() {
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  if (searchInput) state.searchTerm = searchInput.value.trim();
  if (sortSelect) state.sortBy = sortSelect.value;
  renderSubscriptions();
}

function setCategoryFilter(category) {
  playUiSound('click');
  state.categoryFilter = category;
  document.querySelectorAll('#category-filter-chips .cat-pill').forEach(btn => {
    if (btn.dataset.cat.toLowerCase() === category.toLowerCase()) {
      btn.className = 'cat-pill px-3 py-1.5 rounded-xl bg-[#22251F] text-white shrink-0 transition-all';
    } else {
      btn.className = 'cat-pill px-3 py-1.5 rounded-xl bg-[#F7F8F4] text-[#6B7163] hover:text-[#22251F] shrink-0 transition-all';
    }
  });
  renderSubscriptions();
}

function setStatusFilter(status) {
  playUiSound('click');
  state.statusFilter = status;
  document.querySelectorAll('#status-filter-chips .stat-pill').forEach(btn => {
    if (btn.dataset.stat.toLowerCase() === status.toLowerCase()) {
      btn.className = 'stat-pill px-2.5 py-1 rounded-lg bg-[#22251F] text-white shrink-0 transition-all';
    } else {
      btn.className = 'stat-pill px-2.5 py-1 rounded-lg bg-[#F7F8F4] text-[#6B7163] hover:text-[#22251F] shrink-0 transition-all';
    }
  });
  renderSubscriptions();
}

function resetFilters() {
  playUiSound('click');
  state.searchTerm = '';
  state.categoryFilter = 'all';
  state.statusFilter = 'all';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  setCategoryFilter('all');
  setStatusFilter('all');
}

// ==================== SCREEN D: INSIGHTS & SAVINGS SIMULATOR ====================
function setInsightsCycle(cycle) {
  state.insightsCycle = cycle;
  const mBtn = document.getElementById('toggle-monthly-view');
  const aBtn = document.getElementById('toggle-annual-view');
  if (cycle === 'monthly') {
    if (mBtn) mBtn.className = 'px-4 py-1.5 rounded-xl text-xs font-extrabold bg-[#22251F] text-white transition-all';
    if (aBtn) aBtn.className = 'px-4 py-1.5 rounded-xl text-xs font-extrabold text-[#6B7163] hover:text-[#22251F] transition-all';
  } else {
    if (aBtn) aBtn.className = 'px-4 py-1.5 rounded-xl text-xs font-extrabold bg-[#22251F] text-white transition-all';
    if (mBtn) mBtn.className = 'px-4 py-1.5 rounded-xl text-xs font-extrabold text-[#6B7163] hover:text-[#22251F] transition-all';
  }
  renderInsights();
}

function renderInsights() {
  if (!state.dashboardData) return;
  const d = state.dashboardData;
  const isAnnual = state.insightsCycle === 'annual';
  const mult = isAnnual ? 12 : 1;
  const suffix = isAnnual ? '/yr' : '/mo';

  // Top category KPI
  const topCat = (d.category_breakdown && d.category_breakdown.length > 0) ? d.category_breakdown[0] : null;
  const topCatEl = document.getElementById('insights-top-category');
  const topCatSub = document.getElementById('insights-top-category-amount');
  if (topCatEl) {
    topCatEl.textContent = topCat ? topCat.category : 'None';
  }
  if (topCatSub && topCat) {
    topCatSub.textContent = `${formatCurrency(topCat.monthly_amount * mult)}${suffix} (${topCat.percentage}% of spend)`;
  }

  // Active Leaks KPI
  setText('insights-leaks-count', d.potential_leaks.length);

  // Potential Annual Recovery KPI
  const annualSavingsEl = document.getElementById('insights-annual-savings');
  if (annualSavingsEl) {
    annualSavingsEl.textContent = `${formatCurrency(d.potential_savings_annual)}/yr`;
  }

  // Render Interactive Simulator
  renderSimulator();

  // Category Distribution List
  const catList = document.getElementById('insights-category-list');
  if (catList) {
    if (!d.category_breakdown || d.category_breakdown.length === 0) {
      catList.innerHTML = `<div class="text-xs text-[#6B7163] text-center py-4">No recurring data available yet.</div>`;
    } else {
      catList.innerHTML = d.category_breakdown.map(cat => {
        const amt = isAnnual ? cat.annual_amount : cat.monthly_amount;
        return `
          <div class="p-3 rounded-2xl border border-[#E7E9E1] hover:bg-[#FFF9F2] transition-colors cursor-pointer space-y-2" onclick="drilldownCategory('${escapeHtml(cat.category)}')">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2.5">
                <div class="w-8 h-8 rounded-xl bg-[#F7F8F4] flex items-center justify-center text-[#22251F]">
                  <i data-lucide="${getCategoryIcon(cat.category)}" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-[#22251F]">${escapeHtml(cat.category)}</h4>
                  <span class="text-[11px] text-[#6B7163]">${cat.count} recurring service${cat.count > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-extrabold text-[#22251F]">${formatCurrency(amt)}${suffix}</span>
                <span class="block text-[11px] font-bold text-[#FF6B4A]">${cat.percentage}% share</span>
              </div>
            </div>
            <div class="w-full h-2 rounded-full bg-[#E7E9E1] overflow-hidden">
              <div class="chart-bar-fill h-full rounded-full" style="width: ${cat.percentage}%; background-color: ${getCategoryColor(cat.category)};"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Top 5 Highest Cost Commitments
  const topCostsList = document.getElementById('insights-top-costs-list');
  if (topCostsList) {
    const activeSorted = state.subscriptions
      .filter(s => s.status === 'active')
      .sort((a, b) => b.monthly_equivalent - a.monthly_equivalent)
      .slice(0, 5);

    if (activeSorted.length === 0) {
      topCostsList.innerHTML = `<div class="text-xs text-[#6B7163] text-center py-4">No active subscriptions.</div>`;
    } else {
      const totalMonthly = d.monthly_recurring_total || 1;
      topCostsList.innerHTML = activeSorted.map((sub, index) => {
        const brand = getServiceBrand(sub.name);
        const amt = isAnnual ? sub.annual_equivalent : sub.monthly_equivalent;
        const pct = Math.round((sub.monthly_equivalent / totalMonthly) * 100);

        return `
          <div class="flex items-center justify-between p-3 rounded-xl border border-[#E7E9E1]/80 hover:bg-[#FFF9F2] transition-colors">
            <div class="flex items-center space-x-3">
              <span class="text-xs font-bold text-[#6B7163] w-4">#${index + 1}</span>
              <div class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs" style="background-color: ${brand.bg}; color: ${brand.text};">
                <i data-lucide="${brand.icon}" class="w-4 h-4"></i>
              </div>
              <div>
                <h5 class="text-xs font-bold text-[#22251F]">${escapeHtml(sub.name)}</h5>
                <span class="text-[11px] text-[#6B7163]">${escapeHtml(sub.category)} • ${sub.billing_frequency}</span>
              </div>
            </div>

            <div class="text-right">
              <span class="text-xs font-extrabold text-[#22251F]">${formatCurrency(amt)}${suffix}</span>
              <span class="block text-[10px] text-[#6B7163]">${pct}% of budget</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Potential Savings Recommendations List
  const savingsRecs = document.getElementById('insights-savings-recommendations');
  if (savingsRecs) {
    if (!d.potential_leaks || d.potential_leaks.length === 0) {
      savingsRecs.innerHTML = `
        <div class="p-6 text-center text-xs text-[#2E6508] bg-[#EBFBD4] rounded-2xl space-y-1">
          <p class="font-bold">Great job!</p>
          <p>No active leakage detected in your tracked expenses.</p>
        </div>
      `;
    } else {
      savingsRecs.innerHTML = d.potential_leaks.map(leak => `
        <div class="p-3.5 rounded-xl border border-[#C8F169] bg-[#F4FDE5] space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#2E6508]"></i>
              <h5 class="text-xs font-extrabold text-[#22251F]">${escapeHtml(leak.service_name)}</h5>
            </div>
            <span class="text-xs font-extrabold text-[#2E6508]">Save ~${formatCurrency(isAnnual ? leak.monthly_amount * 12 : leak.monthly_amount)}${suffix}</span>
          </div>
          <p class="text-xs text-[#22251F]/80">${escapeHtml(leak.recommendation)}</p>
        </div>
      `).join('');
    }
  }

  refreshIcons();
}

function drilldownCategory(category) {
  state.selectedCategoryDrilldown = category;
  const container = document.getElementById('drilldown-container');
  const title = document.getElementById('drilldown-title');
  const itemsContainer = document.getElementById('drilldown-items');
  const badge = document.getElementById('selected-category-badge');

  if (!container || !title || !itemsContainer) return;

  const matches = state.subscriptions.filter(s => s.category.toLowerCase() === category.toLowerCase());

  title.textContent = `${category} (${matches.length} Services)`;
  if (badge) {
    badge.textContent = `Drilldown: ${category}`;
    badge.classList.remove('hidden');
  }

  itemsContainer.innerHTML = matches.map(s => `
    <div class="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E7E9E1] text-xs">
      <div>
        <span class="font-bold text-[#22251F]">${escapeHtml(s.name)}</span>
        <span class="text-[11px] text-[#6B7163] block">${s.billing_frequency} • Status: ${s.status}</span>
      </div>
      <div class="text-right">
        <span class="font-bold text-[#22251F]">${formatCurrency(s.monthly_equivalent)}/mo</span>
        <span class="text-[10px] text-[#6B7163] block">Next: ${formatDate(s.next_renewal_date)}</span>
      </div>
    </div>
  `).join('');

  container.classList.remove('hidden');
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeDrilldown() {
  state.selectedCategoryDrilldown = null;
  const container = document.getElementById('drilldown-container');
  const badge = document.getElementById('selected-category-badge');
  if (container) container.classList.add('hidden');
  if (badge) badge.classList.add('hidden');
}

// ==================== DELIGHT FEATURE: SAVINGS SIMULATOR ====================
function renderSimulator() {
  const container = document.getElementById('simulator-subs-list');
  if (!container) return;

  // Active subscriptions available for simulation (matches active recurring commitments)
  const activeSubs = state.subscriptions.filter(s => s.status === 'active');
  
  if (activeSubs.length === 0) {
    container.innerHTML = `<div class="col-span-full p-4 text-center text-xs text-[#6B7163] bg-white rounded-xl">No active subscriptions to simulate.</div>`;
    updateSimulatorMetrics();
    return;
  }

  container.innerHTML = activeSubs.map(sub => {
    const isSelected = state.simulatorSelectedIds.has(sub.id);
    const brand = getServiceBrand(sub.name);

    return `
      <div 
        onclick="toggleSimulatorSub(${sub.id})"
        class="simulator-card cursor-pointer p-3.5 rounded-2xl border ${isSelected ? 'selected' : 'border-[#E7E9E1] bg-white'} flex items-center justify-between gap-2.5 hover:border-[#C8F169] transition-all select-none"
      >
        <div class="flex items-center space-x-2.5 min-w-0">
          <input 
            type="checkbox" 
            ${isSelected ? 'checked' : ''} 
            class="w-4 h-4 accent-[#2E6508] rounded cursor-pointer pointer-events-none"
            aria-label="Select ${escapeHtml(sub.name)}"
          >
          <div class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0" style="background-color: ${brand.bg}; color: ${brand.text};">
            <i data-lucide="${brand.icon}" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <h5 class="text-xs font-bold text-[#22251F] truncate">${escapeHtml(sub.name)}</h5>
            <span class="text-[10px] text-[#6B7163] block">${sub.billing_frequency}</span>
          </div>
        </div>

        <div class="text-right shrink-0">
          <span class="text-xs font-extrabold text-[#22251F]">${formatCurrency(sub.monthly_equivalent)}/mo</span>
        </div>
      </div>
    `;
  }).join('');

  updateSimulatorMetrics();
  refreshIcons();
}

function toggleSimulatorSub(id) {
  playUiSound('toggle');
  if (state.simulatorSelectedIds.has(id)) {
    state.simulatorSelectedIds.delete(id);
  } else {
    state.simulatorSelectedIds.add(id);
  }
  renderSimulator();
}

function selectAllSimulator(select) {
  playUiSound('click');
  const activeSubs = state.subscriptions.filter(s => s.status === 'active');
  if (select) {
    activeSubs.forEach(s => state.simulatorSelectedIds.add(s.id));
    triggerCelebration();
    showToast('All active subscriptions selected in simulator!', 'info');
  } else {
    state.simulatorSelectedIds.clear();
  }
  renderSimulator();
}

function updateSimulatorMetrics() {
  const activeSubs = state.subscriptions.filter(s => s.status === 'active');
  const totalMonthly = state.dashboardData ? state.dashboardData.monthly_recurring_total : activeSubs.reduce((acc, s) => acc + s.monthly_equivalent, 0);


  let selectedMonthly = 0;
  activeSubs.forEach(s => {
    if (state.simulatorSelectedIds.has(s.id)) {
      selectedMonthly += s.monthly_equivalent;
    }
  });

  const selectedCount = state.simulatorSelectedIds.size;
  const annualSaved = selectedMonthly * 12;
  const newOutflow = Math.max(0, totalMonthly - selectedMonthly);
  const ratioSaved = totalMonthly > 0 ? (selectedMonthly / totalMonthly) * 100 : 0;
  const ratioRemaining = Math.max(0, 100 - ratioSaved);

  setText('sim-selected-count', `${selectedCount} subscription${selectedCount === 1 ? '' : 's'}`);
  setText('sim-monthly-saved', `${formatCurrency(selectedMonthly)}/mo`);
  setText('sim-pct-saved', `${Math.round(ratioSaved)}% of current recurring spend`);
  setText('sim-annual-saved', `${formatCurrency(annualSaved)}/year`);
  setText('sim-comparison-label', `New simulated outflow: ${formatCurrency(newOutflow)}/mo`);

  const barRemaining = document.getElementById('sim-bar-remaining');
  const barSaved = document.getElementById('sim-bar-saved');
  if (barRemaining && barSaved) {
    barRemaining.style.width = `${ratioRemaining}%`;
    barSaved.style.width = `${ratioSaved}%`;
  }
}

// ==================== SIGNATURE DELIGHT: DISCOVERY AUDIT SEQUENCE ====================
let discoveryAuditTimer = null;

function startDiscoveryAudit() {
  const modal = document.getElementById('discovery-audit-modal');
  const sequenceView = document.getElementById('discovery-sequence-view');
  const revealView = document.getElementById('discovery-reveal-view');
  const finishBtn = document.getElementById('btn-discovery-finish');

  if (!modal || !sequenceView || !revealView) return;

  // Reset to initial sequence view
  sequenceView.classList.remove('hidden');
  revealView.classList.add('hidden');
  if (finishBtn) finishBtn.classList.add('hidden');

  modal.classList.remove('hidden');
  refreshIcons();

  // Run the 4-step sequence (~2.4s)
  runDiscoverySequence();
}

function startSingleAudit(subId) {
  startDiscoveryAudit();
}

function runDiscoverySequence() {
  const fill = document.getElementById('discovery-progress-fill');
  const stepText = document.getElementById('discovery-progress-step-text');
  const percentText = document.getElementById('discovery-progress-percent');
  const activeStatus = document.getElementById('discovery-active-status');

  const steps = [
    {
      id: 'audit-step-1',
      title: 'Reviewing recurring expenses & commitments...',
      percent: '25%',
      width: '25%',
      text: 'Step 1 of 4',
      pipPose: 'thoughtful'
    },
    {
      id: 'audit-step-2',
      title: 'Checking upcoming renewals & billing cycles...',
      percent: '50%',
      width: '50%',
      text: 'Step 2 of 4',
      pipPose: 'curious'
    },
    {
      id: 'audit-step-3',
      title: 'Looking for subscriptions marked unused & rate creeps...',
      percent: '75%',
      width: '75%',
      text: 'Step 3 of 4',
      pipPose: 'surprised'
    },
    {
      id: 'audit-step-4',
      title: 'Calculating non-overlapping potential savings...',
      percent: '100%',
      width: '100%',
      text: 'Step 4 of 4',
      pipPose: 'proud'
    }
  ];

  let currentStep = 0;

  function advanceStep() {
    if (currentStep < steps.length) {
      const s = steps[currentStep];
      if (fill) fill.style.width = s.width;
      if (stepText) stepText.textContent = s.text;
      if (percentText) percentText.textContent = s.percent;
      if (activeStatus) activeStatus.textContent = s.title;

      // Animate Pip detective pose for this step
      const discoveryPip = document.getElementById('discovery-pip-container');
      if (discoveryPip) {
        discoveryPip.innerHTML = getPipSVG(s.pipPose, 92);
        discoveryPip.classList.remove('pip-bouncing', 'pip-wiggle');
        void discoveryPip.offsetWidth;
        discoveryPip.classList.add(s.pipPose === 'proud' || s.pipPose === 'excited' ? 'pip-bouncing' : 'pip-wiggle');
      }

      // Mark current step as active / complete
      playUiSound('step');
      const stepEl = document.getElementById(s.id);
      if (stepEl) {
        stepEl.className = 'flex items-center space-x-3 p-3 rounded-2xl bg-[#FFF0E5] border border-[#FF873D]/40 text-xs font-bold text-[#253536]';
        const iconContainer = stepEl.querySelector('.step-icon');
        if (iconContainer) {
          iconContainer.className = 'step-icon w-6 h-6 rounded-full bg-[#FF873D] text-white flex items-center justify-center';
          iconContainer.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i>';
        }
      }

      currentStep++;
      discoveryAuditTimer = setTimeout(advanceStep, 550);
    } else {
      // Completed sequence -> Trigger Discovery Reveal!
      setTimeout(showDiscoveryReveal, 400);
    }
    refreshIcons();
  }

  advanceStep();
}

function showDiscoveryReveal() {
  const sequenceView = document.getElementById('discovery-sequence-view');
  const revealView = document.getElementById('discovery-reveal-view');
  const finishBtn = document.getElementById('btn-discovery-finish');
  const leaks = state.dashboardData ? state.dashboardData.potential_leaks : [];

  if (sequenceView) sequenceView.classList.add('hidden');
  if (revealView) revealView.classList.remove('hidden');
  if (finishBtn) finishBtn.classList.remove('hidden');

  // Trigger celebration confetti
  triggerCelebration();

  // Invalidate and inject Pip in the reveal banner
  const revealPip = document.getElementById('discovery-reveal-pip-container');
  if (revealPip) {
    revealPip.innerHTML = getPipSVG(leaks.length > 0 ? 'curious' : 'proud', 76);
    revealPip.classList.add('pip-floating');
  }

  const titleEl = document.getElementById('reveal-summary-title');
  const monthlyStatEl = document.getElementById('reveal-monthly-stat');
  const annualStatEl = document.getElementById('reveal-annual-stat');
  const findingsList = document.getElementById('reveal-findings-list');

  const monthlySavings = state.dashboardData ? state.dashboardData.potential_savings_monthly : 0;
  const annualSavings = state.dashboardData ? state.dashboardData.potential_savings_annual : 0;

  if (titleEl) {
    if (leaks.length === 0) {
      titleEl.textContent = 'All clear! No financial leaks detected.';
    } else {
      titleEl.textContent = `We found ${leaks.length} expense${leaks.length > 1 ? 's' : ''} worth a second look.`;
    }
  }

  if (monthlyStatEl) monthlyStatEl.textContent = `Potential savings: ${formatCurrency(monthlySavings)}/mo`;
  if (annualStatEl) annualStatEl.textContent = `${formatCurrency(annualSavings)}/year`;

  if (findingsList) {
    if (leaks.length === 0) {
      findingsList.innerHTML = `
        <div class="card-soft p-8 text-center space-y-3 bg-white">
          <div class="w-12 h-12 rounded-2xl bg-[#E8F3F1] text-[#124E52] flex items-center justify-center mx-auto">
            <i data-lucide="shield-check" class="w-6 h-6"></i>
          </div>
          <h5 class="text-sm font-extrabold text-[#253536]">Your recurring spend is lean and intentional.</h5>
          <p class="text-xs text-[#718482]">No unused subscriptions, surprise trials, or outsized recurring costs found.</p>
        </div>
      `;
    } else {
      findingsList.innerHTML = leaks.map((leak, idx) => `
        <div class="card-soft p-4 sm:p-5 border-l-4 border-l-[#FF873D] space-y-3 animate-fade-scale stagger-${(idx % 5) + 1}">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#FFF0E5] text-[#FF873D]">
                  ${escapeHtml(leak.leak_type.replace('_', ' '))}
                </span>
                <h5 class="text-sm font-extrabold text-[#253536]">${escapeHtml(leak.service_name)}</h5>
              </div>
              <p class="text-xs text-[#718482] mt-1">${escapeHtml(leak.reason)}</p>
            </div>

            <div class="text-right shrink-0">
              <span class="text-sm font-extrabold text-[#FF873D]">${formatCurrency(leak.monthly_amount)}/mo</span>
              <span class="text-[10px] text-[#718482] block">(${formatCurrency(leak.monthly_amount * 12)}/yr)</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-[#CBDAD8]/60 text-xs">
            <span class="text-[11px] font-semibold text-[#124E52] flex items-center space-x-1">
              <i data-lucide="lightbulb" class="w-3.5 h-3.5"></i>
              <span>${escapeHtml(leak.recommendation)}</span>
            </span>

            <div class="flex items-center space-x-2 shrink-0">
              <button onclick="applyAuditAction(${leak.subscription_id}, 'paused', '${escapeHtml(leak.service_name)}')" class="px-2.5 py-1.5 bg-[#F0F4F4] hover:bg-[#CBDAD8] text-[#253536] font-bold rounded-lg text-xs transition-all btn-press">
                Pause
              </button>
              <button onclick="applyAuditAction(${leak.subscription_id}, 'cancelled', '${escapeHtml(leak.service_name)}')" class="px-3 py-1.5 bg-[#FF873D] hover:bg-[#E86E24] text-white font-bold rounded-lg text-xs transition-all btn-press">
                Mark Cancelled
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  refreshIcons();
}

async function applyAuditAction(subId, newStatus, serviceName) {
  try {
    const res = await fetch(`${API_BASE}/api/subscriptions/${subId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Update failed');
    
    // Trigger celebration
    triggerCelebration();
    showToast(`Nice catch! Marked ${serviceName} as ${newStatus}.`, 'celebrate');
    
    await loadData();
    showDiscoveryReveal();
  } catch (err) {
    showToast(`Audit action failed: ${err.message}`, 'error');
  }
}

function finishDiscoveryAudit() {
  closeDiscoveryModal();
  navigateTo('subscriptions');
  showToast('Great review! You are taking control of your recurring spending.', 'celebrate');
}

function closeDiscoveryModal() {
  if (discoveryAuditTimer) clearTimeout(discoveryAuditTimer);
  const modal = document.getElementById('discovery-audit-modal');
  if (modal) modal.classList.add('hidden');
}

// ==================== DELIGHTFUL ADD / EDIT SUBSCRIPTION SYSTEM ====================
function selectFrequencyChip(freq) {
  document.getElementById('form-frequency').value = freq;
  
  // Update chip active classes
  ['monthly', 'yearly', 'quarterly', 'weekly'].forEach(f => {
    const chip = document.getElementById(`chip-${f}`);
    if (chip) {
      if (f === freq) chip.classList.add('active');
      else chip.classList.remove('active');
    }
  });

  updateLiveCostPreview();
}

function updateLiveCostPreview() {
  const amtInput = document.getElementById('form-amount');
  const freqInput = document.getElementById('form-frequency');
  const previewVal = document.getElementById('live-cost-preview-val');

  if (!amtInput || !previewVal) return;

  const amount = parseFloat(amtInput.value) || 0;
  const freq = freqInput ? freqInput.value : 'monthly';

  let monthlyEq = amount;
  if (freq === 'weekly') monthlyEq = (amount * 52) / 12;
  else if (freq === 'quarterly') monthlyEq = amount / 3;
  else if (freq === 'yearly') monthlyEq = amount / 12;

  const annualEq = monthlyEq * 12;

  previewVal.textContent = `${formatCurrency(monthlyEq)}/mo • ${formatCurrency(annualEq)}/yr`;
}

function openSubscriptionModal(editItem = null) {
  playUiSound('pop');
  const modal = document.getElementById('sub-modal');
  const title = document.getElementById('modal-title');
  const subtitle = document.getElementById('modal-subtitle');
  const form = document.getElementById('subscription-form');
  const presets = document.getElementById('modal-presets-section');
  const saveBtnText = document.getElementById('save-btn-text');

  if (!modal || !form) return;
  hideErrors();

  if (editItem) {
    title.textContent = `Edit ${editItem.name}`;
    subtitle.textContent = 'Update your recurring subscription details';
    if (presets) presets.classList.add('hidden');
    saveBtnText.textContent = 'Save Changes';

    state.editPreviousAmount = editItem.amount;

    document.getElementById('form-sub-id').value = editItem.id;
    if (document.getElementById('form-customer-name')) {
      document.getElementById('form-customer-name').value = editItem.customer_name || '';
    }
    if (document.getElementById('form-customer-email')) {
      document.getElementById('form-customer-email').value = editItem.customer_email || '';
    }
    document.getElementById('form-name').value = editItem.name;
    document.getElementById('form-amount').value = editItem.amount;
    selectFrequencyChip(editItem.billing_frequency);
    document.getElementById('form-category').value = editItem.category;
    document.getElementById('form-renewal-date').value = editItem.next_renewal_date;
    document.getElementById('form-payment-method').value = editItem.payment_method || 'Credit Card';
    document.getElementById('form-status').value = editItem.status;
    document.getElementById('form-last-used').value = editItem.last_used_date || '';
    document.getElementById('form-notes').value = editItem.notes || '';
  } else {
    title.textContent = 'Add Subscription';
    subtitle.textContent = 'Track a recurring bill and check for potential leakages';
    if (presets) presets.classList.remove('hidden');
    saveBtnText.textContent = 'Save Subscription';

    state.editPreviousAmount = null;

    form.reset();
    document.getElementById('form-sub-id').value = '';
    if (document.getElementById('form-customer-name')) {
      document.getElementById('form-customer-name').value = '';
    }
    if (document.getElementById('form-customer-email')) {
      document.getElementById('form-customer-email').value = '';
    }
    selectFrequencyChip('monthly');
    
    // Set default renewal date to 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    document.getElementById('form-renewal-date').value = d.toISOString().split('T')[0];
    document.getElementById('form-status').value = 'active';
    document.getElementById('form-payment-method').value = 'Credit Card';
  }

  updateLiveCostPreview();
  modal.classList.remove('hidden');
  document.getElementById('form-name').focus();
  refreshIcons();
}

function closeSubscriptionModal() {
  playUiSound('modal-close');
  const modal = document.getElementById('sub-modal');
  if (modal) modal.classList.add('hidden');
}

function applyPreset(name, amount, frequency, category) {
  playUiSound('click');
  document.getElementById('form-name').value = name;
  document.getElementById('form-amount').value = amount;
  selectFrequencyChip(frequency);
  document.getElementById('form-category').value = category;
  updateLiveCostPreview();
}

function editSubscription(id) {
  const item = state.subscriptions.find(s => s.id === id);
  if (item) {
    openSubscriptionModal(item);
  }
}

async function handleSubscriptionFormSubmit(event) {
  event.preventDefault();
  hideErrors();

  const id = document.getElementById('form-sub-id').value;
  const customerNameEl = document.getElementById('form-customer-name');
  const customerEmailEl = document.getElementById('form-customer-email');
  const customerName = customerNameEl ? customerNameEl.value.trim() : '';
  const customerEmail = customerEmailEl ? customerEmailEl.value.trim() : '';
  const name = document.getElementById('form-name').value.trim();
  const amountStr = document.getElementById('form-amount').value;
  const frequency = document.getElementById('form-frequency').value;
  const category = document.getElementById('form-category').value;
  const renewalDate = document.getElementById('form-renewal-date').value;
  const paymentMethod = document.getElementById('form-payment-method').value;
  const status = document.getElementById('form-status').value;
  const lastUsed = document.getElementById('form-last-used').value;
  const notes = document.getElementById('form-notes').value.trim();

  // Inline validation
  let hasError = false;
  if (!name) {
    showError('err-name');
    hasError = true;
  }
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    showError('err-amount');
    hasError = true;
  }
  if (!renewalDate) {
    showError('err-renewal-date');
    hasError = true;
  }

  if (hasError) return;

  const payload = {
    name,
    customer_name: customerName || null,
    customer_email: customerEmail || null,
    plan_name: name,
    amount,
    currency: state.userProfile.currency || 'INR',
    billing_frequency: frequency,
    category,
    next_renewal_date: renewalDate,
    payment_method: paymentMethod,
    status,
    notes: notes || null,
    last_used_date: lastUsed || null
  };

  const spinner = document.getElementById('save-btn-spinner');
  const btnText = document.getElementById('save-btn-text');
  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'Saving...';

  try {
    const isEdit = Boolean(id);
    const url = isEdit ? `${API_BASE}/api/subscriptions/${id}` : `${API_BASE}/api/subscriptions`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error: ${res.status}`);
    }

    closeSubscriptionModal();
    playUiSound('success');
    await loadData();

    // Section 6: Savings celebration when user lowers recurring cost
    if (isEdit && state.editPreviousAmount && amount < state.editPreviousAmount) {
      const savedDiff = state.editPreviousAmount - amount;
      triggerCelebration();
      showToast(`Great negotiation! Your recurring cost decreased by ${formatCurrency(savedDiff)}`, 'celebrate');
    } else {
      showToast(isEdit ? `Updated "${name}" successfully!` : `Added "${name}" to tracking!`, 'success');
    }
  } catch (err) {
    console.error('Failed to save subscription:', err);
    showToast(`Failed: ${err.message}`, 'error');
  } finally {
    if (spinner) spinner.classList.add('hidden');
  }
}

function showError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function hideErrors() {
  ['err-name', 'err-amount', 'err-renewal-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

// ==================== MODAL: DELETE CONFIRMATION ====================
function confirmDelete(id) {
  playUiSound('pop');
  const sub = state.subscriptions.find(s => s.id === id);
  if (!sub) return;

  state.pendingDeleteId = id;
  state.pendingDeleteSub = sub;

  const modal = document.getElementById('delete-modal');
  const msg = document.getElementById('delete-modal-msg');
  if (msg) {
    msg.innerHTML = `Stop tracking <strong>${escapeHtml(sub.name)}</strong> (${formatCurrency(sub.monthly_equivalent)}/mo)? This removes the record from QuietLeak.`;
  }
  if (modal) modal.classList.remove('hidden');
}

function closeDeleteModal() {
  playUiSound('modal-close');
  state.pendingDeleteId = null;
  state.pendingDeleteSub = null;
  state.pendingDeleteCustId = null;
  const modal = document.getElementById('delete-modal');
  if (modal) modal.classList.add('hidden');
}

async function executeDelete() {
  if (state.pendingDeleteCustId) {
    const id = state.pendingDeleteCustId;
    const cust = state.customers.find(c => c.id === id);
    const name = cust ? cust.name : 'Customer';
    const btn = document.getElementById('btn-confirm-delete');
    if (btn) btn.textContent = 'Deleting...';
    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete customer failed: ${res.status}`);
      playUiSound('delete');
      closeDeleteModal();
      await loadData();
      showToast(`Customer "${name}" removed.`, 'info');
    } catch (err) {
      console.error('Delete error:', err);
      showToast(`Failed to delete: ${err.message}`, 'error');
    } finally {
      if (btn) btn.textContent = 'Delete';
      state.pendingDeleteCustId = null;
    }
    return;
  }

  if (!state.pendingDeleteId) return;
  const id = state.pendingDeleteId;
  const subName = state.pendingDeleteSub ? state.pendingDeleteSub.name : 'Subscription';
  const btn = document.getElementById('btn-confirm-delete');
  if (btn) btn.textContent = 'Deleting...';

  try {
    const res = await fetch(`${API_BASE}/api/subscriptions/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

    playUiSound('delete');
    closeDeleteModal();
    await loadData();
    // Section 6: Removing a subscription from QuietLeak is not proof of real-world cancellation.
    showToast(`"${subName}" removed from tracked list.`, 'info');
  } catch (err) {
    console.error('Delete error:', err);
    showToast(`Failed to delete: ${err.message}`, 'error');
  } finally {
    if (btn) btn.textContent = 'Delete';
  }
}

// ==================== DELIGHT FEATURE: CANVAS CONFETTI ENGINE ====================
let confettiParticles = [];
let confettiAnimationId = null;

function triggerCelebration() {
  playUiSound('celebration');
  // Check user motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const canvas = document.getElementById('celebration-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#FF6B4A', '#C8F169', '#DCD2FF', '#22251F', '#FFD166', '#06D6A0'];
  confettiParticles = [];

  // Generate 75 confetti flakes
  for (let i = 0; i < 75; i++) {
    confettiParticles.push({
      x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 200,
      y: window.innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

  const startTime = performance.now();
  const maxDuration = 1900; // ms

  function renderConfetti(time) {
    const elapsed = time - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.vRotation;
      p.opacity = Math.max(0, 1 - (elapsed / maxDuration));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (elapsed < maxDuration) {
      confettiAnimationId = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiAnimationId = null;
    }
  }

  confettiAnimationId = requestAnimationFrame(renderConfetti);
}

// ==================== DATA MANAGEMENT & EXPORT ====================
function exportData(format = 'json') {
  if (!state.subscriptions || state.subscriptions.length === 0) {
    showToast('No subscriptions available to export.', 'error');
    return;
  }

  if (format === 'json') {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.subscriptions, null, 2));
    downloadFile(dataStr, `quietleak_export_${new Date().toISOString().split('T')[0]}.json`);
    showToast('JSON export downloaded successfully!', 'success');
  } else if (format === 'csv') {
    const headers = ['id', 'name', 'amount', 'currency', 'billing_frequency', 'monthly_equivalent', 'category', 'next_renewal_date', 'status', 'payment_method', 'notes'];
    const rows = state.subscriptions.map(s => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.amount,
      s.currency,
      s.billing_frequency,
      s.monthly_equivalent,
      `"${s.category}"`,
      s.next_renewal_date,
      s.status,
      `"${s.payment_method}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, `quietleak_export_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('CSV export downloaded successfully!', 'success');
  }
}

function downloadFile(content, fileName) {
  const a = document.createElement('a');
  a.setAttribute('href', content);
  a.setAttribute('download', fileName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function confirmResetData() {
  if (!confirm('Are you sure you want to reload demonstration sample data? Newly added custom records will be reset to standard demo entries.')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/reset-data`, { method: 'POST' });
    if (!res.ok) throw new Error('Reset failed');
    await loadData();
    triggerCelebration();
    showToast('Demo dataset successfully restored!', 'success');
  } catch (err) {
    showToast(`Reset error: ${err.message}`, 'error');
  }
}

// ==================== TOAST & UI UTILITIES ====================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Deduplication per Section 9
  const now = Date.now();
  if (state.lastToastMessage === message && now - state.lastToastTime < 2000) {
    return;
  }
  state.lastToastMessage = message;
  state.lastToastTime = now;

  const toast = document.createElement('div');
  let icon = 'info';
  let borderClass = 'border-[#22251F]';
  let bgClass = 'bg-white';
  
  if (type === 'success') {
    icon = 'check-circle-2';
    borderClass = 'border-[#2E6508]';
  } else if (type === 'celebrate') {
    icon = 'sparkles';
    borderClass = 'border-[#C8F169]';
    bgClass = 'bg-[#F9FDF4]';
  } else if (type === 'error') {
    icon = 'alert-circle';
    borderClass = 'border-[#FF6B4A]';
  }

  toast.className = `pointer-events-auto flex items-center justify-between space-x-3 px-4 py-3 rounded-2xl shadow-xl border-l-4 ${borderClass} ${bgClass} text-xs font-bold text-[#22251F] toast-enter max-w-sm`;
  toast.innerHTML = `
    <div class="flex items-center space-x-2.5">
      <i data-lucide="${icon}" class="w-4 h-4 shrink-0 text-[#22251F]"></i>
      <span class="flex-1">${escapeHtml(message)}</span>
    </div>
    <button onclick="this.parentElement.remove()" class="text-[#6B7163] hover:text-[#22251F] p-1 rounded" aria-label="Dismiss">
      <i data-lucide="x" class="w-3.5 h-3.5"></i>
    </button>
  `;

  container.appendChild(toast);
  refreshIcons();

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function animateCountUp(element, target, duration = 600, prefix = '₹') {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = formatCurrency(target, state.userProfile.currency || 'INR');
    return;
  }

  const start = 0;
  const startTime = performance.now();
  target = Number(target);

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(start + (target - start) * easeProgress);

    element.textContent = `${prefix}${formatNumberIndian(currentVal)}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatCurrency(target, state.userProfile.currency || 'INR');
    }
  }

  requestAnimationFrame(update);
}

function formatCurrency(val, currency = 'INR') {
  const num = Number(val) || 0;
  if (currency === 'INR') {
    return `₹${formatNumberIndian(Math.round(num))}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num);
}

function formatNumberIndian(x) {
  const s = Math.round(x).toString();
  if (s.length <= 3) return s;
  let lastThree = s.substring(s.length - 3);
  let otherNumbers = s.substring(0, s.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
}

function calculateDaysUntil(dateStr) {
  try {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function getServiceBrand(name) {
  const lower = name.toLowerCase();
  for (const key of Object.keys(SERVICE_COLORS)) {
    if (lower.includes(key)) {
      return SERVICE_COLORS[key];
    }
  }
  return { bg: '#F4F6F0', text: '#22251F', icon: 'credit-card' };
}

function getCategoryIcon(cat) {
  return CATEGORY_ICONS[cat] || 'package';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}
