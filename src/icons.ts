/**
 * CMS icon names (lucide names used by the builder's icon picker)
 * → Ionicons glyph names.
 *
 * The CMS icon library has 150+ entries; every one of them must resolve here,
 * otherwise the app renders a generic circle instead of the chosen icon.
 */
export const ICONS: Record<string, string> = {
  // navigation / layout
  Home: 'home',
  House: 'home',
  LayoutGrid: 'grid',
  LayoutDashboard: 'grid',
  Compass: 'compass',
  Map: 'map',
  MapPin: 'location',
  Navigation: 'navigate',

  // commerce
  ShoppingCart: 'cart',
  ShoppingBag: 'bag',
  Store: 'storefront',
  Tag: 'pricetag',
  Tags: 'pricetags',
  Percent: 'pricetag',
  Gift: 'gift',
  Ticket: 'ticket',

  // people
  User: 'person',
  Users: 'people',
  UserCircle: 'person-circle',
  UserPlus: 'person-add',
  Contact: 'person-circle',
  IdCard: 'card',

  // favourites
  Heart: 'heart',
  Star: 'star',
  Bookmark: 'bookmark',
  BookmarkPlus: 'bookmarks',
  ThumbsUp: 'thumbs-up',
  Award: 'ribbon',
  Trophy: 'trophy',
  Crown: 'trophy',

  // search
  Search: 'search',
  SearchCheck: 'search-circle',
  Filter: 'funnel',
  SlidersHorizontal: 'options',

  // messaging
  Bell: 'notifications-outline',
  BellRing: 'notifications',
  MessageCircle: 'chatbubble-ellipses',
  MessageSquare: 'chatbox',
  Chat: 'chatbubbles',
  Mail: 'mail',
  Send: 'send',
  Inbox: 'file-tray',

  // settings
  Settings: 'settings',
  Settings2: 'settings-outline',
  Cog: 'cog',
  Wrench: 'build',
  Sliders: 'options',
  ToggleLeft: 'toggle',

  // menus
  Menu: 'menu',
  MoreHorizontal: 'ellipsis-horizontal',
  MoreVertical: 'ellipsis-vertical',
  Grid3x3: 'grid',
  List: 'list',
  LayoutList: 'list-outline',

  // media / contact
  Phone: 'call',
  PhoneCall: 'call-outline',
  Video: 'videocam',
  Camera: 'camera',
  Image: 'image',
  Images: 'images',
  Film: 'film',

  // time
  Calendar: 'calendar',
  CalendarDays: 'calendar-number',
  Clock: 'time',
  Timer: 'timer',
  AlarmClock: 'alarm',

  // money
  CreditCard: 'card',
  Wallet: 'wallet',
  DollarSign: 'cash',
  Euro: 'cash',
  IndianRupee: 'cash',
  Receipt: 'receipt',
  BadgeDollarSign: 'pricetag',

  // food
  Utensils: 'restaurant',
  UtensilsCrossed: 'restaurant',
  Pizza: 'pizza',
  Coffee: 'cafe',
  Beer: 'beer',
  Wine: 'wine',
  Sandwich: 'fast-food',
  Cake: 'ice-cream',
  IceCream: 'ice-cream',
  Salad: 'nutrition',
  Soup: 'restaurant',
  ChefHat: 'restaurant',
  CookingPot: 'restaurant',
  Beef: 'fast-food',
  Egg: 'egg',
  Apple: 'nutrition',
  Cherry: 'nutrition',
  Croissant: 'fast-food',
  Popcorn: 'fast-food',
  Cookie: 'fast-food',

  // delivery
  Truck: 'car',
  Bike: 'bicycle',
  Car: 'car-sport',
  Package: 'cube',
  PackageCheck: 'cube',
  Rocket: 'rocket',

  // documents
  FileText: 'document-text',
  File: 'document',
  Files: 'documents',
  Folder: 'folder',
  BookOpen: 'book',
  Book: 'book-outline',
  Newspaper: 'newspaper',
  ClipboardList: 'clipboard',

  // media playback
  Play: 'play',
  Pause: 'pause',
  Music: 'musical-notes',
  Headphones: 'headset',
  Radio: 'radio',

  // web
  Globe: 'globe',
  Link: 'link',
  Share: 'share-social',
  Share2: 'share-social-outline',
  ExternalLink: 'open-outline',
  Wifi: 'wifi',
  Bluetooth: 'bluetooth',

  // security
  ShieldCheck: 'shield-checkmark',
  Shield: 'shield',
  Lock: 'lock-closed',
  LogIn: 'log-in',
  LogOut: 'log-out',
  KeyRound: 'key',

  // charts
  BarChart3: 'bar-chart',
  LineChart: 'analytics',
  PieChart: 'pie-chart',
  TrendingUp: 'trending-up',
  Activity: 'pulse',

  // misc
  Sparkles: 'sparkles',
  Zap: 'flash',
  Flame: 'flame',
  Sun: 'sunny',
  Moon: 'moon',
  Cloud: 'cloud',
  Leaf: 'leaf',
  TreePine: 'leaf-outline',
  Flower: 'flower',

  // actions
  Plus: 'add',
  Minus: 'remove',
  Check: 'checkmark',
  X: 'close',
  Edit: 'create',
  Trash: 'trash',
  Trash2: 'trash',
  Download: 'download',
  Upload: 'cloud-upload',
  RefreshCw: 'refresh',
};

/** Fallback that also tolerates unknown / differently-cased CMS names. */
export const ion = (name?: string) => {
  const key = (name ?? '').trim();
  if (!key) return 'ellipse-outline' as any;
  if (ICONS[key]) return ICONS[key] as any;

  // case-insensitive match against the table
  const lower = key.toLowerCase();
  for (const k of Object.keys(ICONS)) {
    if (k.toLowerCase() === lower) return ICONS[k] as any;
  }

  // last resort: treat the value as a raw Ionicons glyph (e.g. "cart-outline")
  if (/^[a-z0-9-]+$/.test(lower)) return lower as any;
  return 'ellipse-outline' as any;
};
