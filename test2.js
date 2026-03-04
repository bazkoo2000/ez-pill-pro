/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    EZ_Pill Farmadosis v2.0                   ║
 * ║              معالج الجرعات الذكي - نسخة محسنة               ║
 * ║                                                              ║
 * ║  ✓ بنية منظمة    ✓ أداء محسن    ✓ واجهة عصرية              ║
 * ║  ✓ كود أنظف      ✓ اختبارات     ✓ توثيق كامل               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

(function(global) {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     SECTION 1: POLYFILLS & HELPERS
     ═══════════════════════════════════════════════════════════════ */
  
  // Object.assign polyfill
  if (typeof Object.assign !== 'function') {
    Object.assign = function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  }

  // requestAnimationFrame polyfill
  var rAF = window.requestAnimationFrame || function(cb) { return setTimeout(cb, 16); };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 2: CONSTANTS & CONFIGURATION
     ═══════════════════════════════════════════════════════════════ */

  var APP_VERSION = '2.0.0';
  var APP_NAME = 'EZ_Pill Farmadosis';

  // CSS Variables & Theme
  var THEME = {
    colors: {
      primary: '#6366f1',
      primaryDark: '#4f46e5',
      primaryLight: '#818cf8',
      success: '#10b981',
      successDark: '#059669',
      warning: '#f59e0b',
      warningDark: '#d97706',
      danger: '#ef4444',
      dangerDark: '#dc2626',
      info: '#06b6d4',
      dark: '#1e1b4b',
      gray: '#64748b',
      grayLight: '#94a3b8',
      grayDark: '#475569',
      white: '#ffffff',
      background: '#f8fafc',
      ramadan: '#fbbf24',
      ramadanDark: '#f59e0b'
    },
    shadows: {
      sm: '0 2px 8px rgba(0,0,0,0.04)',
      md: '0 4px 16px rgba(0,0,0,0.08)',
      lg: '0 10px 40px rgba(0,0,0,0.12)',
      xl: '0 20px 60px rgba(0,0,0,0.15)',
      glow: '0 0 20px rgba(99,102,241,0.3)'
    },
    radius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      full: '9999px'
    },
    transitions: {
      fast: '0.15s ease',
      normal: '0.25s ease',
      slow: '0.4s ease',
      bounce: '0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  };

  // Column Aliases for resilient detection
  var COLUMN_ALIASES = {
    qty: ['qty', 'quantity', 'كمية', 'الكمية', 'qnty', 'عدد'],
    size: ['size', 'حجم', 'الحجم', 'sz', 'pack size', 'pack'],
    note: ['note', 'notes', 'ملاحظة', 'ملاحظات', 'remark', 'prescription note'],
    every: ['every', 'evry', 'كل', 'المدة', 'frequency', 'freq', 'interval'],
    time: ['start time', 'time', 'وقت', 'الوقت', 'timing'],
    dose: ['dose', 'جرعة', 'الجرعة', 'dosage', 'dos'],
    code: ['code', 'كود', 'الكود', 'item code', 'barcode', 'رمز'],
    startDate: ['start date', 'تاريخ البدء', 'بداية', 'from'],
    endDate: ['end date', 'end', 'تاريخ الانتهاء', 'نهاية', 'to'],
    expiry: ['expiry', 'exp', 'صلاحية', 'انتهاء الصلاحية'],
    name: ['name', 'item', 'اسم', 'الاسم', 'item name', 'drug name']
  };

  // Fixed Size Codes - Medications with fixed pack sizes
  var FIXED_SIZE_CODES = {
    '100009926': 24, '100009934': 48, '100010097': 20, '100010652': 30,
    '100011436': 20, '100011743': 30, '100013167': 20, '100013423': 10,
    '100013431': 15, '100014565': 6, '100015947': 24, '100015955': 24,
    '100015971': 24, '100015980': 24, '100016077': 15, '100016106': 10,
    '100017942': 20, '100023592': 30, '100023875': 20, '100027201': 20,
    '100030493': 40, '100633972': 20, '100634019': 20, '100684294': 30,
    '100726280': 24, '101284170': 30, '101826688': 20, '101859640': 20,
    '102073622': 10, '102073631': 10, '102077738': 10, '102371620': 24,
    '102988654': 48, '103169239': 21, '103243857': 30, '103437918': 30,
    '103683617': 30
  };

  // Weekly Injections
  var WEEKLY_INJECTIONS = ['102785890', '101133232', '101943745', '101049031', '101528656'];

  // Normal Times
  var NORMAL_TIMES = {
    empty: '07:00',
    beforeMeal: '08:00',
    beforeBreakfast: '08:00',
    afterBreakfast: '09:00',
    morning: '09:30',
    noon: '12:00',
    beforeLunch: '13:00',
    afterLunch: '14:00',
    afternoon: '15:00',
    maghrib: '18:00',
    beforeDinner: '20:00',
    afterDinner: '21:00',
    evening: '21:30',
    bed: '22:00',
    defaultTime: '09:00'
  };

  // Ramadan Times
  var RAMADAN_TIMES = {
    beforeIftar: '18:30',
    afterIftar: '19:00',
    beforeSuhoor: '03:00',
    afterSuhoor: '04:00',
    afterTarawih: '23:00'
  };

  // Code Start Times - Custom times for specific medication codes
  var CODE_START_TIMES = {
    '100005052': { time: '14:00', every: 24 },
    '100010652': { time: '21:00', every: 24 },
    '100010812': { time: '21:00', every: 24 },
    '100016077': { time: '21:00', every: 24 },
    '100016106': { time: '21:00', every: 24 },
    '100016851': { time: '21:00', every: 24 },
    '100022733': { time: '21:00', every: 24 },
    '100023875': { time: '21:00', every: 24 },
    '100027091': { time: '21:00', every: 24 },
    '100029564': { time: '21:00', every: 24 },
    '100030493': { time: '09:00', every: 12 },
    '100033601': { time: '21:00', every: 24 },
    '100033803': { time: '09:00', every: 12 },
    '100615256': { time: '21:00', every: 24 },
    '100633972': { time: '14:00', every: 24 },
    '100634019': { time: '14:00', every: 24 },
    '100726280': { time: '14:00', every: 24 },
    '100954004': { time: '21:00', every: 24 },
    '100957942': { time: '09:00', every: 12 },
    '101078974': { time: '21:00', every: 24 },
    '101148979': { time: '21:00', every: 24 },
    '101225081': { time: '21:00', every: 24 },
    '101281201': { time: '21:00', every: 24 },
    '101284188': { time: '21:00', every: 24 },
    '101859640': { time: '14:00', every: 24 },
    '102073622': { time: '21:00', every: 24 },
    '102073631': { time: '21:00', every: 24 },
    '102782795': { time: '21:00', every: 24 },
    '102792782': { time: '09:00', every: 12 },
    '102988654': { time: '09:00', every: 12 },
    '103008671': { time: '21:00', every: 24 },
    '103069617': { time: '21:00', every: 24 },
    '103079621': { time: '09:00', every: 12 },
    '103243857': { time: '14:00', every: 24 },
    '103340593': { time: '21:00', every: 24 },
    '103344851': { time: '21:00', every: 24 },
    '103344869': { time: '21:00', every: 24 },
    '103350804': { time: '09:00', every: 12 },
    '103483965': { time: '21:00', every: 24 },
    '103683617': { time: '21:00', every: 24 }
  };

  // Pack Sizes for detection
  var PACK_SIZES = [14, 28, 30, 42, 56, 60, 84, 90, 100, 120];

  /* ═══════════════════════════════════════════════════════════════
     SECTION 3: UTILITIES
     ═══════════════════════════════════════════════════════════════ */

  var Utils = {
    // Normalize text
    normalize: function(txt) {
      return (txt || '').toString().trim().replace(/\s+/g, ' ');
    },

    // Normalize Arabic text
    normalizeArabic: function(txt) {
      return this.normalize(txt).toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ئ/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ى/g, 'ي')
        .replace(/[٠١٢٣٤٥٦٧٨٩]/g, function(d) {
          return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);
        });
    },

    // Escape HTML
    escapeHtml: function(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str || ''));
      return div.innerHTML;
    },

    // Fire events
    fireEvent: function(el) {
      if (!el) return;
      try {
        el.focus();
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        if (typeof angular !== 'undefined') {
          angular.element(el).triggerHandler('change');
        }
        if (typeof jQuery !== 'undefined') {
          jQuery(el).trigger('change');
        }
      } catch (e) {}
    },

    // Debounce
    debounce: function(fn, delay) {
      var timeoutId;
      return function() {
        var args = arguments;
        var ctx = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
          fn.apply(ctx, args);
        }, delay);
      };
    },

    // Throttle
    throttle: function(fn, limit) {
      var inThrottle;
      return function() {
        var args = arguments;
        var ctx = this;
        if (!inThrottle) {
          fn.apply(ctx, args);
          inThrottle = true;
          setTimeout(function() {
            inThrottle = false;
          }, limit);
        }
      };
    },

    // Format date
    formatDate: function(d) {
      var y = d.getFullYear();
      var m = ('0' + (d.getMonth() + 1)).slice(-2);
      var da = ('0' + d.getDate()).slice(-2);
      return y + '-' + m + '-' + da;
    },

    // Add days to date
    addDays: function(dateStr, n) {
      var d = new Date(dateStr);
      d.setDate(d.getDate() + n);
      return this.formatDate(d);
    },

    // Deep clone object
    deepClone: function(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    // Generate unique ID
    generateId: function() {
      return 'ez_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 4: CACHE SYSTEM
     ═══════════════════════════════════════════════════════════════ */

  var Cache = {
    _data: {},
    _maxSize: 100,

    get: function(key, compute) {
      if (this._data[key] !== undefined) {
        return this._data[key];
      }
      var result = compute();
      if (Object.keys(this._data).length >= this._maxSize) {
        var firstKey = Object.keys(this._data)[0];
        delete this._data[firstKey];
      }
      this._data[key] = result;
      return result;
    },

    clear: function() {
      this._data = {};
    },

    has: function(key) {
      return this._data[key] !== undefined;
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 5: STATE MANAGEMENT
     ═══════════════════════════════════════════════════════════════ */

  var State = {
    // Settings
    months: 1,
    days: 30,
    autoDuration: true,
    showWarnings: true,
    darkMode: false,
    ramadanMode: false,
    ramadanDaysLeft: 0,

    // Processing state
    warnings: [],
    duplicates: [],
    processedCodes: {},

    // Original data
    originalStartDate: '',
    monthCounter: 0,

    // Reset
    reset: function() {
      this.warnings = [];
      this.duplicates = [];
      this.processedCodes = {};
      this.monthCounter = 0;
    },

    // Load from storage
    load: function() {
      try {
        var saved = localStorage.getItem('ezpill_settings');
        if (saved) {
          var data = JSON.parse(saved);
          this.months = data.months || 1;
          this.days = data.days || 30;
          this.autoDuration = data.autoDuration !== false;
          this.showWarnings = data.showWarnings !== false;
          this.darkMode = data.darkMode || false;
          this.ramadanMode = data.ramadanMode || false;
        }
      } catch (e) {}
    },

    // Save to storage
    save: function() {
      try {
        localStorage.setItem('ezpill_settings', JSON.stringify({
          months: this.months,
          days: this.days,
          autoDuration: this.autoDuration,
          showWarnings: this.showWarnings,
          darkMode: this.darkMode,
          ramadanMode: this.ramadanMode
        }));
      } catch (e) {}
    }
  };

  // Load saved settings
  State.load();

  /* ═══════════════════════════════════════════════════════════════
     SECTION 6: STORAGE MANAGER
     ═══════════════════════════════════════════════════════════════ */

  var Storage = {
    keys: {
      settings: 'ezpill_settings',
      custom: 'ezpill_custom',
      savedNotes: 'ezpill_saved_notes',
      savedNotesTime: 'ezpill_saved_notes_time',
      version: 'ezpill_version'
    },

    get: function(key) {
      try {
        var data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    },

    set: function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },

    remove: function(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },

    loadCustomConfig: function() {
      return this.get(this.keys.custom) || {};
    },

    saveCustomConfig: function(config) {
      this.set(this.keys.custom, config);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 7: HIJRI CALENDAR
     ═══════════════════════════════════════════════════════════════ */

  var HijriCalendar = {
    // Calculate Ramadan dates for a given year
    getRamadanDates: function(year) {
      // Kuwaiti Algorithm for Hijri to Gregorian conversion
      // Ramadan is the 9th month of Hijri calendar
      var hYear = year - 579; // Approximate Hijri year
      
      // This is a simplified calculation - for production, use a proper library
      // For 2025/2026, we'll use known dates
      var knownDates = {
        2025: { start: new Date(2025, 1, 28), end: new Date(2025, 2, 29) },
        2026: { start: new Date(2026, 1, 17), end: new Date(2026, 2, 18) },
        2027: { start: new Date(2027, 1, 7), end: new Date(2027, 2, 8) }
      };

      if (knownDates[year]) {
        return knownDates[year];
      }

      // Fallback: estimate based on 354/355 day lunar year
      var baseDate = new Date(2026, 1, 17); // Known start
      var daysDiff = (year - 2026) * 354;
      var start = new Date(baseDate);
      start.setDate(start.getDate() + daysDiff);
      
      return {
        start: start,
        end: new Date(start.getTime() + 29 * 24 * 60 * 60 * 1000)
      };
    },

    // Get current Ramadan info
    getCurrentRamadanInfo: function() {
      var now = new Date();
      var year = now.getFullYear();
      var ramadan = this.getRamadanDates(year);
      
      // Check if we're in Ramadan
      if (now >= ramadan.start && now <= ramadan.end) {
        var dayNum = Math.floor((now - ramadan.start) / (24 * 60 * 60 * 1000)) + 1;
        var daysLeft = 30 - dayNum;
        return {
          inRamadan: true,
          dayNum: dayNum,
          daysLeft: daysLeft,
          start: ramadan.start,
          end: ramadan.end
        };
      }

      // Check if Ramadan hasn't started yet
      if (now < ramadan.start) {
        return {
          inRamadan: false,
          dayNum: 0,
          daysLeft: 0,
          daysUntil: Math.ceil((ramadan.start - now) / (24 * 60 * 60 * 1000)),
          start: ramadan.start,
          end: ramadan.end
        };
      }

      // Ramadan has passed, check next year
      var nextRamadan = this.getRamadanDates(year + 1);
      return {
        inRamadan: false,
        dayNum: 0,
        daysLeft: 0,
        daysUntil: Math.ceil((nextRamadan.start - now) / (24 * 60 * 60 * 1000)),
        start: nextRamadan.start,
        end: nextRamadan.end
      };
    },

    // Calculate days left in Ramadan from a start date
    getDaysLeftFromStart: function(startDateStr) {
      var sd;
      if (startDateStr && /^\d{4}-\d{2}-\d{2}$/.test(startDateStr)) {
        var p = startDateStr.split('-');
        sd = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
      } else {
        sd = new Date();
        sd.setDate(sd.getDate() + 1);
      }
      sd.setHours(0, 0, 0, 0);

      var info = this.getCurrentRamadanInfo();
      if (!info.inRamadan) return 0;

      var rs = new Date(info.start);
      rs.setHours(0, 0, 0, 0);
      var re = new Date(info.end);
      re.setHours(0, 0, 0, 0);

      if (sd < rs || sd > re) return 0;

      var diff = re.getTime() - sd.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 8: PATTERN MATCHER ENGINE
     ═══════════════════════════════════════════════════════════════ */

  var PatternMatcher = {
    patterns: [],

    // Register a pattern
    register: function(pattern, handler, priority) {
      priority = priority || 0;
      this.patterns.push({
        pattern: pattern,
        handler: handler,
        priority: priority
      });
      this.patterns.sort(function(a, b) {
        return b.priority - a.priority;
      });
    },

    // Match text against patterns
    match: function(text) {
      for (var i = 0; i < this.patterns.length; i++) {
        var p = this.patterns[i];
        var result = p.pattern.exec(text);
        if (result) {
          return p.handler(result, text);
        }
      }
      return null;
    },

    // Clear all patterns
    clear: function() {
      this.patterns = [];
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 9: DOSE RECOGNIZER
     ═══════════════════════════════════════════════════════════════ */

  var DoseRecognizer = {
    // Initialize patterns
    init: function() {
      var self = this;

      // 4 times daily (QID)
      PatternMatcher.register(/\bqid\b|q\.i\.d|اربع مرات|4\s*مرات|four\s*times/i, function() {
        return { count: 4, frequency: 'QID' };
      }, 100);

      // 3 times daily (TID)
      PatternMatcher.register(/\btid\b|t\.i\.d|ثلاث مرات|تلات مرات|3\s*مرات|three\s*times|thrice/i, function() {
        return { count: 3, frequency: 'TID' };
      }, 99);

      // Twice daily (BID)
      PatternMatcher.register(/\bbid\b|b\.i\.d|مرتين|مرتان|twice|2\s*times/i, function() {
        return { count: 2, frequency: 'BID' };
      }, 98);

      // Once daily (OD)
      PatternMatcher.register(/\bod\b|o\.d|\bqd\b|q\.d|once|مره واحده|مرة واحدة|حبه يوميا/i, function() {
        return { count: 1, frequency: 'OD' };
      }, 97);

      // Q4H
      PatternMatcher.register(/كل\s*4\s*ساع|every\s*4\s*h|q4h/i, function() {
        return { count: 6, frequency: 'Q4H' };
      }, 96);

      // Q6H
      PatternMatcher.register(/كل\s*6\s*(?:ساع)?|every\s*6\s*h|q6h/i, function() {
        return { count: 4, frequency: 'Q6H' };
      }, 95);

      // Q8H
      PatternMatcher.register(/كل\s*8\s*(?:ساع)?|every\s*8\s*h|q8h/i, function() {
        return { count: 3, frequency: 'Q8H' };
      }, 94);

      // Q12H
      PatternMatcher.register(/كل\s*12\s*(?:ساع)?|every\s*12\s*h|q12h/i, function() {
        return { count: 2, frequency: 'Q12H' };
      }, 93);

      // Q24H
      PatternMatcher.register(/كل\s*24\s*(?:ساع)?|every\s*24\s*h|q24h/i, function() {
        return { count: 1, frequency: 'Q24H' };
      }, 92);
    },

    // Recognize dose from note
    recognize: function(note) {
      var self = this;
      
      return Cache.get('dose_' + note, function() {
        var s = Utils.normalizeArabic(note);
        
        var result = {
          count: 1,
          hasB: false,  // Breakfast
          hasL: false,  // Lunch
          hasD: false,  // Dinner
          hasM: false,  // Morning
          hasN: false,  // Noon
          hasA: false,  // Afternoon
          hasE: false,  // Evening
          hasBed: false, // Bedtime
          hasEmpty: false, // Empty stomach
          isBefore: false,
          language: 'arabic',
          frequency: null,
          raw: note
        };

        // Detect language
        var arabicCount = (note.match(/[\u0600-\u06FF]/g) || []).length;
        var englishCount = (note.match(/[a-zA-Z]/g) || []).length;
        result.language = arabicCount > englishCount ? 'arabic' : 'english';

        // Check patterns first
        var patternResult = PatternMatcher.match(s);
        if (patternResult) {
          result.count = patternResult.count;
          result.frequency = patternResult.frequency;
          return result;
        }

        // Detect meal keywords
        result.hasB = /\b(bre|breakfast|fatur|ftor|iftar)\b|فطر|فطار|فطور|افطار/i.test(s);
        result.hasL = /\b(lun|lunch|lau)\b|غدا|غداء|الغدا|الغداء|غذا|غذاء/i.test(s);
        result.hasD = /\b(din|dinner|sup|supper|asha|isha|suhoor|sahoor)\b|عشا|عشو|عشاء|سحور/i.test(s);
        result.hasM = /\b(morning|am|morn)\b|صباح|الصباح/i.test(s);
        result.hasN = /\b(noon|midday)\b|ظهر|الظهر/i.test(s);
        result.hasA = /\b(asr|afternoon|pm)\b|عصر|العصر/i.test(s);
        result.hasE = /\b(evening|eve)\b|مساء|مسا/i.test(s);
        result.hasBed = /\b(bed|bedtime|sleep|sle|hs)\b|نوم|النوم/i.test(s);
        result.hasEmpty = /\b(empty|fasting)\b|ريق|الريق/i.test(s);
        result.isBefore = /\b(before|bef|pre|ac)\b|قبل/i.test(s);

        // Count meals
        var mealCount = 0;
        if (result.hasB || result.hasM) mealCount++;
        if (result.hasL || result.hasN) mealCount++;
        if (result.hasD || result.hasE) mealCount++;
        if (result.hasA && mealCount < 3) mealCount++;

        if (mealCount >= 3) {
          result.count = 3;
        } else if (mealCount === 2) {
          result.count = 2;
        }

        // Special cases
        if (/(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i.test(s)) {
          result.count = 2;
        }

        return result;
      });
    },

    // Get pill count info
    getPillCountInfo: function(note) {
      var s = Utils.normalizeArabic(note);
      
      var twoP = ['2 حبه', '2 حبة', 'حبتين', 'حبتان', '2 حبوب', '2 قرص', 'قرصين', 
                  '2 pill', '2 pills', 'two pill', '2 tablet', '2 tablets'];
      
      for (var i = 0; i < twoP.length; i++) {
        if (s.indexOf(twoP[i].toLowerCase()) > -1) {
          var isTwice = /مرتين|twice|2\s*times|bid/i.test(note);
          return { dose: 2, multiplier: isTwice ? 4 : 2 };
        }
      }

      return { dose: 1, multiplier: 1 };
    }
  };

  // Initialize dose recognizer
  DoseRecognizer.init();

  /* ═══════════════════════════════════════════════════════════════
     SECTION 10: TIME EXTRACTOR
     ═══════════════════════════════════════════════════════════════ */

  var TimeExtractor = {
    // Get time from note text
    getTime: function(note, itemCode) {
      var s = Utils.normalizeArabic(note);
      
      // If note is empty, check code-specific time
      if (!s || s.length < 3) {
        if (itemCode && CODE_START_TIMES[itemCode]) {
          return {
            time: CODE_START_TIMES[itemCode].time,
            every: CODE_START_TIMES[itemCode].every || 24,
            isCodeTime: true,
            isEmpty: true
          };
        }
        return { time: NORMAL_TIMES.defaultTime, isEmpty: true };
      }

      // Time patterns with priorities
      var rules = [
        { test: /مع\s*(ال)?(فطار|فطور|افطار)/i, time: '09:00' },
        { test: /مع\s*(ال)?(غدا|غداء|غذا|غذاء)/i, time: '14:00' },
        { test: /مع\s*(ال)?(عشا|عشاء|سحور|سحر)/i, time: '21:00' },
        { test: /مع\s*(ال)?(اكل|أكل|وجب)/i, time: '09:00' },
        { test: /empty|stomach|ريق|الريق|على الريق|fasting/i, time: NORMAL_TIMES.empty },
        { test: /قبل\s*(الاكل|الأكل|meal)|before\s*(meal|food)|ac\b/i, time: NORMAL_TIMES.beforeMeal },
        { test: /قبل.*فطر|قبل.*فطار|قبل.*فطور|before.*breakfast|before.*iftar/i, time: NORMAL_TIMES.beforeBreakfast },
        { test: /بعد.*فطر|بعد.*فطار|بعد.*فطور|after.*breakfast|after.*iftar/i, time: NORMAL_TIMES.afterBreakfast },
        { test: /\b(morning|am)\b|صباح|الصباح/i, time: NORMAL_TIMES.morning },
        { test: /\b(noon|midday)\b|ظهر|الظهر/i, time: NORMAL_TIMES.noon },
        { test: /قبل.*غدا|قبل.*غداء|before.*lunch/i, time: NORMAL_TIMES.beforeLunch },
        { test: /بعد.*غدا|بعد.*غداء|after.*lunch/i, time: NORMAL_TIMES.afterLunch },
        { test: /\b(asr|afternoon|pm)\b|عصر|العصر/i, time: NORMAL_TIMES.afternoon },
        { test: /maghrib|مغرب/i, time: NORMAL_TIMES.maghrib },
        { test: /قبل.*عشا|قبل.*عشاء|before.*dinner/i, time: NORMAL_TIMES.beforeDinner },
        { test: /بعد.*عشا|بعد.*عشاء|after.*dinner/i, time: NORMAL_TIMES.afterDinner },
        { test: /bed|sleep|نوم|النوم|hs\b/i, time: NORMAL_TIMES.bed },
        { test: /مساء|مسا|evening|eve/i, time: NORMAL_TIMES.evening }
      ];

      for (var i = 0; i < rules.length; i++) {
        if (rules[i].test.test(s)) {
          return { time: rules[i].time };
        }
      }

      // Check code-specific time
      if (itemCode && CODE_START_TIMES[itemCode]) {
        return {
          time: CODE_START_TIMES[itemCode].time,
          every: CODE_START_TIMES[itemCode].every || 24,
          isCodeTime: true
        };
      }

      return { time: NORMAL_TIMES.defaultTime, isUnrecognized: true };
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 11: RAMADAN MAPPER
     ═══════════════════════════════════════════════════════════════ */

  var RamadanMapper = {
    rules: [
      // Both iftar and suhoor
      {
        match: function(note) {
          return (/فطار|فطور|فطر|افطار|iftar/i.test(note)) && 
                 (/سحور|سحر|suhoor|sahoor/i.test(note));
        },
        result: { meal: 'both', label: { ar: 'فطار + سحور', en: 'Iftar + Suhoor' }, isBoth: true }
      },
      // After Suhoor
      {
        match: /بعد.*سحور|بعد.*سحر|after.*suhoor|after.*sahoor/i,
        result: { meal: 'afterSuhoor', label: { ar: 'بعد السحور', en: 'After Suhoor' } }
      },
      // Before Suhoor
      {
        match: /قبل.*سحور|قبل.*سحر|before.*suhoor|before.*sahoor/i,
        result: { meal: 'beforeSuhoor', label: { ar: 'قبل السحور', en: 'Before Suhoor' } }
      },
      // After Iftar
      {
        match: /بعد.*فطار|بعد.*فطور|بعد.*افطار|after.*iftar|after.*breakfast/i,
        result: { meal: 'afterIftar', label: { ar: 'بعد الفطار', en: 'After Iftar' } }
      },
      // Before Iftar
      {
        match: /قبل.*فطار|قبل.*فطور|قبل.*افطار|before.*iftar|before.*breakfast/i,
        result: { meal: 'beforeIftar', label: { ar: 'قبل الفطار', en: 'Before Iftar' } }
      },
      // After Tarawih
      {
        match: /بعد.*تراويح|بعد.*التراويح|after.*tarawih/i,
        result: { meal: 'afterTarawih', label: { ar: 'بعد التراويح', en: 'After Tarawih' } }
      },
      // Dinner → Suhoor (in Ramadan)
      {
        match: /بعد.*عشا|بعد.*عشاء|after.*dinner/i,
        result: { meal: 'afterSuhoor', label: { ar: 'بعد السحور', en: 'After Suhoor' } }
      },
      // Before dinner → Before suhoor
      {
        match: /قبل.*عشا|قبل.*عشاء|before.*dinner/i,
        result: { meal: 'beforeSuhoor', label: { ar: 'قبل السحور', en: 'Before Suhoor' } }
      },
      // Morning → After Suhoor
      {
        match: /صباح|الصباح|morning|am\b/i,
        result: { meal: 'afterSuhoor', label: { ar: 'بعد السحور', en: 'After Suhoor' } }
      },
      // Lunch → Before Iftar
      {
        match: /غدا|غداء|الغدا|الغداء|lunch/i,
        result: { meal: 'beforeIftar', label: { ar: 'قبل الفطار', en: 'Before Iftar' } }
      },
      // After lunch → After Tarawih
      {
        match: /بعد.*غدا|بعد.*غداء|after.*lunch/i,
        result: { meal: 'afterTarawih', label: { ar: 'بعد التراويح', en: 'After Tarawih' } }
      },
      // Evening/Bed → After Suhoor
      {
        match: /مساء|مسا|evening|eve|bed|sleep|نوم/i,
        result: { meal: 'afterSuhoor', label: { ar: 'بعد السحور', en: 'After Suhoor' } }
      },
      // Empty stomach → Before Suhoor
      {
        match: /ريق|الريق|empty|fasting/i,
        result: { meal: 'beforeSuhoor', label: { ar: 'قبل السحور', en: 'Before Suhoor' } }
      },
      // Before meal → Before Iftar
      {
        match: /قبل\s*(الاكل|الأكل)|before\s*meal|ac\b/i,
        result: { meal: 'beforeIftar', label: { ar: 'قبل الفطار', en: 'Before Iftar' } }
      },
      // After meal → After Iftar
      {
        match: /بعد\s*(الاكل|الأكل)|after\s*meal|pc\b/i,
        result: { meal: 'afterIftar', label: { ar: 'بعد الفطار', en: 'After Iftar' } }
      }
    ],

    // Map note to Ramadan time
    map: function(note) {
      var s = Utils.normalizeArabic(note);
      
      for (var i = 0; i < this.rules.length; i++) {
        var rule = this.rules[i];
        var matched = false;
        
        if (typeof rule.match === 'function') {
          matched = rule.match(s);
        } else if (rule.match.test) {
          matched = rule.match.test(s);
        }
        
        if (matched) {
          var result = Object.assign({}, rule.result);
          result.time = RAMADAN_TIMES[result.meal] || RAMADAN_TIMES.afterIftar;
          return result;
        }
      }
      
      return null;
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 12: DUPLICATE ENGINE
     ═══════════════════════════════════════════════════════════════ */

  var DuplicateEngine = {
    // Check if row needs duplication
    needsDuplication: function(note) {
      var doseInfo = DoseRecognizer.recognize(note);
      var s = Utils.normalizeArabic(note);

      // Q6H - 4 times daily
      if (/كل\s*6|every\s*6|q6h/i.test(s)) {
        return { type: 'q6h', count: 2, doseInfo: doseInfo };
      }

      // Q8H - 3 times daily
      if (/كل\s*8|every\s*8|q8h/i.test(s) || doseInfo.count === 3) {
        return { type: 'three', count: 3, doseInfo: doseInfo };
      }

      // Check time irregularity
      var mealTimes = this.getMealTimes(note);
      if (mealTimes.length >= 2 && this.hasIrregularGap(mealTimes)) {
        return { 
          type: mealTimes.length >= 3 ? 'three' : 'two', 
          count: Math.min(mealTimes.length, 3),
          doseInfo: doseInfo 
        };
      }

      // Regular twice patterns
      var isRegularTwice = /12|twice|bid|مرتين/.test(s) ||
                           /(صباح|الصباح|morning).*(مسا|المسا|مساء|المساء|evening)/i.test(s);

      if (doseInfo.count === 2 && !isRegularTwice && mealTimes.length === 0) {
        return { type: 'two', count: 2, doseInfo: doseInfo };
      }

      // Multiple meals detected
      if (doseInfo.count >= 2 && !isRegularTwice) {
        return { type: doseInfo.count >= 3 ? 'three' : 'two', count: doseInfo.count, doseInfo: doseInfo };
      }

      return null;
    },

    // Get meal times from note
    getMealTimes: function(note) {
      var s = Utils.normalizeArabic(note);
      var isBefore = /قبل/i.test(s);
      var times = [];

      if (/فطر|فطار|فطور|افطار/i.test(s)) times.push(isBefore ? 8 : 9);
      if (/غدا|غداء/i.test(s)) times.push(isBefore ? 13 : 14);
      if (/عشا|عشاء|سحور/i.test(s)) times.push(isBefore ? 20 : 21);

      times.sort(function(a, b) { return a - b; });
      return times;
    },

    // Check if times have irregular gaps
    hasIrregularGap: function(times) {
      if (times.length < 2) return false;

      var gaps = [];
      for (var i = 1; i < times.length; i++) {
        gaps.push(times[i] - times[i - 1]);
      }

      // For twice daily: regular only if gap = 12h
      if (times.length === 2) {
        return Math.abs(gaps[0] - 12) > 0.5;
      }

      // For 3+ times: regular only if all gaps equal
      var minG = Math.min.apply(null, gaps);
      var maxG = Math.max.apply(null, gaps);
      return (maxG - minG) > 0.5;
    },

    // Create duplicate rows
    create: function(row, config) {
      var clones = [];
      var count = config.count || 2;
      var times = config.times || ['09:00', '21:00'];
      var labels = config.labels || ['بعد الفطار', 'بعد العشاء'];
      var sizes = config.sizes || [];
      var isRamadan = config.isRamadan || false;
      var isBefore = config.doseInfo ? config.doseInfo.isBefore : false;

      for (var i = 0; i < count; i++) {
        var clone = row.cloneNode(true);
        this.applyTime(clone, times[i]);
        this.applyLabel(clone, labels[i], isRamadan);
        if (sizes[i]) {
          this.applySize(clone, sizes[i]);
        }
        clones.push(clone);
      }

      return clones;
    },

    // Apply time to row
    applyTime: function(row, time) {
      var timeInput = row.querySelector("input[type='time']");
      if (timeInput) {
        timeInput.value = time;
        Utils.fireEvent(timeInput);
      }
    },

    // Apply label to row
    applyLabel: function(row, label, isRamadan) {
      var noteCell = row.querySelector('td:nth-child(6) input, td:nth-child(6) textarea');
      if (!noteCell) {
        var tds = row.querySelectorAll('td');
        for (var i = 0; i < tds.length; i++) {
          var inp = tds[i].querySelector('input, textarea');
          if (inp && inp.value && inp.value.length > 3) {
            noteCell = inp;
            break;
          }
        }
      }
      if (noteCell) {
        noteCell.value = (isRamadan ? '' : '⚡ ') + label;
        Utils.fireEvent(noteCell);
      }
    },

    // Apply size to row
    applySize: function(row, size) {
      var sizeInput = row.querySelector('input[name*="size" i], td:nth-child(3) input');
      if (sizeInput) {
        sizeInput.value = size;
        Utils.fireEvent(sizeInput);
      }
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 13: WARNING SYSTEM
     ═══════════════════════════════════════════════════════════════ */

  var WarningSystem = {
    types: {
      DAYS_MISMATCH: 'days',
      DOUBLE_DOSE: 'dose2',
      DUPLICATE_ITEM: 'duplicate',
      UNRECOGNIZED: 'unrecognized_dose',
      RAMADAN_UNCLEAR: 'ramadan_unclear',
      SMALL_SPLIT: 'smallsplit'
    },

    // Create a warning
    create: function(type, data) {
      return Object.assign({
        type: type,
        level: 'warning',
        resolved: false
      }, data);
    },

    // Add warning to queue
    add: function(warning) {
      State.warnings.push(warning);
    },

    // Get all unresolved warnings
    getUnresolved: function() {
      return State.warnings.filter(function(w) {
        return !w.resolved;
      });
    },

    // Clear all warnings
    clear: function() {
      State.warnings = [];
    },

    // Resolve warning
    resolve: function(index) {
      if (State.warnings[index]) {
        State.warnings[index].resolved = true;
      }
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 14: DOM HELPERS
     ═══════════════════════════════════════════════════════════════ */

  var DOM = {
    // Find main data table
    findTable: function() {
      var tables = document.querySelectorAll('table');
      for (var i = 0; i < tables.length; i++) {
        var ths = tables[i].querySelectorAll('th');
        var hasQty = this.findColumnIndex(ths, 'qty') >= 0;
        var hasNote = this.findColumnIndex(ths, 'note') >= 0;
        if (hasQty && hasNote) return tables[i];
      }
      // Fallback: largest table
      var best = null, bestCols = 0;
      for (var j = 0; j < tables.length; j++) {
        var cols = tables[j].querySelectorAll('th').length;
        if (cols > bestCols) {
          bestCols = cols;
          best = tables[j];
        }
      }
      return best;
    },

    // Find column index by name
    findColumnIndex: function(ths, name) {
      var key = name.toLowerCase().trim();
      var aliases = COLUMN_ALIASES[key] || [key];
      
      for (var i = 0; i < ths.length; i++) {
        var txt = Utils.normalizeArabic(ths[i].textContent);
        for (var a = 0; a < aliases.length; a++) {
          if (txt === aliases[a] || txt.indexOf(aliases[a]) > -1) {
            return i;
          }
        }
      }
      return -1;
    },

    // Get cell value
    getValue: function(td) {
      if (!td) return '';
      var input = td.querySelector('input, textarea, select');
      if (input) {
        if (input.tagName === 'SELECT') {
          var opt = input.options[input.selectedIndex];
          return Utils.normalize(opt ? opt.textContent : input.value);
        }
        return Utils.normalize(input.value);
      }
      return Utils.normalize(td.innerText || td.textContent);
    },

    // Set cell value
    setValue: function(td, value) {
      if (!td) return;
      var select = td.querySelector('select');
      if (select) {
        select.value = String(value);
        Utils.fireEvent(select);
        return;
      }
      var input = td.querySelector('input, textarea');
      if (input) {
        input.value = value;
        Utils.fireEvent(input);
      } else {
        td.textContent = value;
      }
    },

    // Get clean code from cell
    getCode: function(td) {
      var text = this.getValue(td);
      var match = text.match(/\d+/);
      return match ? match[0] : '';
    },

    // Create element with attributes
    createElement: function(tag, attrs, children) {
      var el = document.createElement(tag);
      
      for (var key in attrs) {
        if (key === 'class') {
          el.className = attrs[key];
        } else if (key === 'style' && typeof attrs[key] === 'object') {
          Object.assign(el.style, attrs[key]);
        } else if (key.startsWith('on')) {
          el.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
        } else {
          el.setAttribute(key, attrs[key]);
        }
      }

      if (children) {
        if (!Array.isArray(children)) children = [children];
        children.forEach(function(child) {
          if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
          } else if (child) {
            el.appendChild(child);
          }
        });
      }

      return el;
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 15: AUDIO MANAGER
     ═══════════════════════════════════════════════════════════════ */

  var Audio = {
    // Play beep sound
    beep: function(type) {
      try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.value = 0.06;

        var freq = 550;
        if (type === 'success') freq = 880;
        else if (type === 'warning') freq = 440;
        else if (type === 'error') freq = 280;
        else if (type === 'info') freq = 660;

        osc.frequency.value = freq;
        osc.type = type === 'error' ? 'sawtooth' : 'sine';

        osc.start();

        if (type === 'warning') {
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.setValueAtTime(0, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.stop(ctx.currentTime + 0.4);
        } else {
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch (e) {}
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 16: TOAST NOTIFICATIONS
     ═══════════════════════════════════════════════════════════════ */

  var Toast = {
    show: function(message, type) {
      type = type || 'info';
      var icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };

      var toast = DOM.createElement('div', {
        class: 'ez-toast ez-toast-' + type,
        style: {
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          padding: '12px 18px',
          borderRadius: THEME.radius.lg,
          boxShadow: THEME.shadows.lg,
          zIndex: '999999',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'Cairo, sans-serif',
          transform: 'translateX(400px)',
          opacity: '0',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(99,102,241,0.1)',
          borderRight: '4px solid ' + THEME.colors[type] || THEME.colors.info
        }
      }, [
        DOM.createElement('span', { style: { fontSize: '18px' } }, icons[type] || icons.info),
        DOM.createElement('span', {
          style: { fontSize: '13px', fontWeight: '700', color: THEME.colors.dark }
        }, message)
      ]);

      document.body.appendChild(toast);

      rAF(function() {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });

      setTimeout(function() {
        toast.style.transform = 'translateX(400px)';
        toast.style.opacity = '0';
        setTimeout(function() {
          toast.remove();
        }, 400);
      }, 3000);

      if (type === 'warning' || type === 'error') {
        Audio.beep(type);
      }
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 17: STYLES
     ═══════════════════════════════════════════════════════════════ */

  var Styles = {
    inject: function() {
      if (document.getElementById('ezpill-styles')) return;

      var style = document.createElement('style');
      style.id = 'ezpill-styles';
      style.textContent = `
        /* ═══════════════════════════════════════════════════════════
           EZ_Pill v2.0 - Modern Styles
           ═══════════════════════════════════════════════════════════ */

        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

        /* CSS Variables */
        :root {
          --ez-primary: ${THEME.colors.primary};
          --ez-primary-dark: ${THEME.colors.primaryDark};
          --ez-primary-light: ${THEME.colors.primaryLight};
          --ez-success: ${THEME.colors.success};
          --ez-warning: ${THEME.colors.warning};
          --ez-danger: ${THEME.colors.danger};
          --ez-info: ${THEME.colors.info};
          --ez-dark: ${THEME.colors.dark};
          --ez-gray: ${THEME.colors.gray};
          --ez-gray-light: ${THEME.colors.grayLight};
          --ez-white: ${THEME.colors.white};
          --ez-bg: ${THEME.colors.background};
          --ez-ramadan: ${THEME.colors.ramadan};
          
          --ez-radius-sm: ${THEME.radius.sm};
          --ez-radius-md: ${THEME.radius.md};
          --ez-radius-lg: ${THEME.radius.lg};
          --ez-radius-xl: ${THEME.radius.xl};
          
          --ez-shadow-sm: ${THEME.shadows.sm};
          --ez-shadow-md: ${THEME.shadows.md};
          --ez-shadow-lg: ${THEME.shadows.lg};
          --ez-shadow-xl: ${THEME.shadows.xl};
          --ez-shadow-glow: ${THEME.shadows.glow};
          
          --ez-transition-fast: ${THEME.transitions.fast};
          --ez-transition-normal: ${THEME.transitions.normal};
          --ez-transition-slow: ${THEME.transitions.slow};
          --ez-transition-bounce: ${THEME.transitions.bounce};
        }

        /* Animations */
        @keyframes ezFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ezSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes ezSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ezPulse {
          0%, 100% { box-shadow: var(--ez-shadow-glow); }
          50% { box-shadow: 0 0 30px rgba(99,102,241,0.5); }
        }

        @keyframes ezShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes ezSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes ezBarShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Dialog Base */
        .ez-dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 460px;
          max-width: 96vw;
          max-height: 90vh;
          background: linear-gradient(160deg, #fafbff 0%, #f0f4ff 100%);
          border-radius: var(--ez-radius-xl);
          box-shadow: var(--ez-shadow-xl);
          z-index: 999999;
          font-family: 'Cairo', sans-serif;
          overflow: hidden;
          animation: ezSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          border: 2px solid rgba(99,102,241,0.08);
        }

        .ez-dialog * {
          font-family: 'Cairo', sans-serif;
        }

        /* Dialog Header */
        .ez-dialog__header {
          padding: 20px 24px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(180deg, rgba(99,102,241,0.04) 0%, transparent 100%);
          border-bottom: 1px solid rgba(99,102,241,0.06);
          cursor: move;
        }

        .ez-dialog__logo-group {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ez-dialog__logo {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: linear-gradient(145deg, var(--ez-primary-light), var(--ez-primary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: var(--ez-shadow-md), inset 0 1px 0 rgba(255,255,255,0.2);
          position: relative;
          overflow: hidden;
        }

        .ez-dialog__logo::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%);
        }

        .ez-dialog__title-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ez-dialog__title {
          font-size: 18px;
          font-weight: 900;
          color: var(--ez-dark);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ez-dialog__title span {
          color: var(--ez-primary);
        }

        .ez-dialog__subtitle {
          font-size: 11px;
          font-weight: 600;
          color: var(--ez-gray-light);
        }

        .ez-dialog__header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ez-btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: none;
          background: rgba(255,255,255,0.8);
          color: var(--ez-gray);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--ez-transition-normal);
          font-size: 16px;
        }

        .ez-btn-icon:hover {
          background: rgba(99,102,241,0.1);
          color: var(--ez-primary);
          transform: scale(1.05);
        }

        /* Dialog Content */
        .ez-dialog__content {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .ez-dialog__content::-webkit-scrollbar {
          width: 5px;
        }

        .ez-dialog__content::-webkit-scrollbar-track {
          background: transparent;
        }

        .ez-dialog__content::-webkit-scrollbar-thumb {
          background: rgba(99,102,241,0.2);
          border-radius: 10px;
        }

        /* Duration Card */
        .ez-card {
          background: white;
          border-radius: var(--ez-radius-lg);
          padding: 16px 20px;
          box-shadow: var(--ez-shadow-sm);
          border: 1px solid rgba(99,102,241,0.05);
          animation: ezFadeIn 0.4s ease backwards;
        }

        .ez-card:nth-child(1) { animation-delay: 0.05s; }
        .ez-card:nth-child(2) { animation-delay: 0.1s; }
        .ez-card:nth-child(3) { animation-delay: 0.15s; }
        .ez-card:nth-child(4) { animation-delay: 0.2s; }

        .ez-card__row {
          display: flex;
          gap: 20px;
          align-items: stretch;
        }

        .ez-card__col {
          flex: 1;
        }

        .ez-card__divider {
          width: 1px;
          background: linear-gradient(180deg, transparent, #e2e8f0, transparent);
        }

        .ez-card__label {
          font-size: 11px;
          font-weight: 800;
          color: var(--ez-gray-light);
          margin-bottom: 10px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* Segment Buttons */
        .ez-seg-group {
          display: flex;
          gap: 4px;
          background: rgba(99,102,241,0.04);
          border-radius: var(--ez-radius-md);
          padding: 4px;
          border: 1px solid rgba(99,102,241,0.06);
        }

        .ez-seg {
          flex: 1;
          height: 42px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: var(--ez-gray);
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: var(--ez-transition-fast);
        }

        .ez-seg:hover {
          background: rgba(99,102,241,0.08);
          color: var(--ez-primary);
        }

        .ez-seg.active {
          background: var(--ez-primary);
          color: white;
          box-shadow: var(--ez-shadow-sm);
        }

        /* Toggle Grid */
        .ez-tog-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          direction: rtl;
        }

        .ez-tog-btn {
          padding: 12px 14px;
          border-radius: var(--ez-radius-md);
          border: 2px solid transparent;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: var(--ez-transition-normal);
          text-align: right;
        }

        .ez-tog-btn:hover {
          background: rgba(99,102,241,0.04);
        }

        .ez-tog-btn.on {
          border-color: var(--ez-primary);
          background: rgba(99,102,241,0.04);
        }

        .ez-tog-btn__icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .ez-tog-btn__label {
          flex: 1;
          font-size: 12px;
          font-weight: 700;
          color: var(--ez-gray);
          transition: var(--ez-transition-fast);
        }

        .ez-tog-btn.on .ez-tog-btn__label {
          color: var(--ez-primary);
        }

        .ez-tog-btn__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #d1d5db;
          transition: var(--ez-transition-fast);
          flex-shrink: 0;
        }

        .ez-tog-btn.on .ez-tog-btn__dot {
          background: var(--ez-primary);
          box-shadow: 0 0 8px rgba(99,102,241,0.4);
        }

        /* Ramadan Card */
        .ez-ramadan-card {
          border-radius: var(--ez-radius-lg);
          padding: 14px 18px;
          direction: rtl;
          transition: var(--ez-transition-normal);
          background: white;
          border: 2px solid transparent;
          display: none;
        }

        .ez-ramadan-card.on {
          display: block;
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border-color: rgba(251,191,36,0.25);
          box-shadow: 0 4px 16px rgba(251,191,36,0.1);
        }

        .ez-ramadan-card__header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .ez-ramadan-card__icon {
          font-size: 22px;
        }

        .ez-ramadan-card__title {
          flex: 1;
          font-size: 14px;
          font-weight: 800;
          color: var(--ez-gray);
        }

        .ez-ramadan-card.on .ez-ramadan-card__title {
          color: #92400e;
        }

        .ez-ramadan-card__input-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ez-ramadan-card__input-group span {
          font-size: 12px;
          font-weight: 700;
          color: #92400e;
        }

        .ez-ramadan-card__input {
          flex: 1;
          padding: 8px 12px;
          border: 2px solid rgba(251,191,36,0.2);
          border-radius: var(--ez-radius-md);
          font-size: 18px;
          font-weight: 900;
          text-align: center;
          color: #92400e;
          background: rgba(255,255,255,0.7);
          outline: none;
          max-width: 80px;
        }

        .ez-ramadan-card__input:focus {
          border-color: var(--ez-ramadan);
          box-shadow: 0 0 0 3px rgba(251,191,36,0.15);
        }

        .ez-ramadan-card__info {
          margin-top: 10px;
          padding: 8px 12px;
          background: rgba(5,150,105,0.06);
          border: 1px solid rgba(5,150,105,0.12);
          border-radius: var(--ez-radius-md);
          font-size: 11px;
          font-weight: 800;
          color: #059669;
          text-align: center;
          cursor: pointer;
        }

        /* Pack Warning */
        .ez-pack-warning {
          display: none;
          padding: 14px 18px;
          background: linear-gradient(135deg, #fef2f2, #fff1f2);
          border: 2px solid #fca5a5;
          border-radius: var(--ez-radius-lg);
          direction: rtl;
          animation: ezSlideUp 0.4s ease;
        }

        .ez-pack-warning.visible {
          display: block;
        }

        /* Dialog Footer */
        .ez-dialog__footer {
          padding: 12px 20px 16px;
          border-top: 1px solid rgba(99,102,241,0.06);
          display: flex;
          gap: 8px;
          background: rgba(241,245,249,0.4);
        }

        /* Buttons */
        .ez-btn {
          border: none;
          border-radius: var(--ez-radius-md);
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: var(--ez-transition-normal);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          position: relative;
          overflow: hidden;
        }

        .ez-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: 0.5s;
        }

        .ez-btn:hover::after {
          left: 100%;
        }

        .ez-btn--primary {
          flex: 1;
          height: 50px;
          background: linear-gradient(145deg, var(--ez-primary-light), var(--ez-primary));
          color: white;
          box-shadow: var(--ez-shadow-md), inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .ez-btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--ez-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .ez-btn--primary:active {
          transform: translateY(0);
        }

        .ez-btn--pulse {
          animation: ezPulse 2s ease-in-out infinite;
        }

        .ez-btn--square {
          width: 50px;
          height: 50px;
          padding: 0;
        }

        .ez-btn--ghost {
          background: white;
          color: var(--ez-gray);
          border: 2px solid rgba(99,102,241,0.12);
        }

        .ez-btn--ghost:hover {
          background: rgba(99,102,241,0.06);
          color: var(--ez-primary);
          border-color: var(--ez-primary-light);
        }

        .ez-btn--danger {
          background: #fef2f2;
          color: var(--ez-danger);
          border: 2px solid #fecaca;
        }

        .ez-btn--danger:hover {
          background: #fee2e2;
        }

        /* Dialog Badge */
        .ez-dialog__badge {
          padding: 6px 20px;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          color: var(--ez-gray-light);
          letter-spacing: 1.5px;
          border-top: 1px solid rgba(99,102,241,0.06);
          background: rgba(241,245,249,0.4);
          text-transform: uppercase;
        }

        /* Progress Bar */
        .ez-progress-bar {
          height: 3px;
          background: linear-gradient(90deg, var(--ez-primary), var(--ez-primary-light), var(--ez-primary));
          background-size: 200% 100%;
          animation: ezBarShift 2s ease infinite;
        }

        /* Toast */
        .ez-toast {
          border-right: 4px solid var(--ez-primary);
        }

        .ez-toast-success { border-right-color: var(--ez-success); }
        .ez-toast-error { border-right-color: var(--ez-danger); }
        .ez-toast-warning { border-right-color: var(--ez-warning); }

        /* Table Styling */
        .ez-data-table {
          border-collapse: collapse !important;
          border: 1px solid #d1d5db !important;
        }

        .ez-data-table th,
        .ez-data-table td {
          border: 1px solid #d1d5db !important;
          padding: 8px !important;
        }

        /* Dark Mode */
        body.ez-dark-mode {
          background: #0f172a !important;
        }

        body.ez-dark-mode .ez-dialog {
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border-color: rgba(99,102,241,0.2);
        }

        body.ez-dark-mode .ez-dialog__title {
          color: #e2e8f0;
        }

        body.ez-dark-mode .ez-card {
          background: #1e293b;
          border-color: rgba(99,102,241,0.1);
        }

        body.ez-dark-mode .ez-seg {
          color: #94a3b8;
        }

        body.ez-dark-mode .ez-seg:hover {
          background: rgba(99,102,241,0.15);
          color: #c7d2fe;
        }

        body.ez-dark-mode .ez-tog-btn {
          background: #1e293b;
        }

        body.ez-dark-mode .ez-tog-btn__label {
          color: #94a3b8;
        }

        body.ez-dark-mode .ez-tog-btn.on .ez-tog-btn__label {
          color: #c7d2fe;
        }

        body.ez-dark-mode .ez-btn--ghost {
          background: #1e293b;
          border-color: rgba(99,102,241,0.2);
          color: #94a3b8;
        }

        body.ez-dark-mode .ez-btn--ghost:hover {
          background: rgba(99,102,241,0.1);
        }

        body.ez-dark-mode .ez-btn--danger {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.3);
        }

        body.ez-dark-mode input,
        body.ez-dark-mode textarea,
        body.ez-dark-mode select {
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border-color: rgba(99,102,241,0.2) !important;
        }
      `;

      document.head.appendChild(style);
    }
  };

  // Inject styles immediately
  Styles.inject();

  /* ═══════════════════════════════════════════════════════════════
     SECTION 18: DIALOG COMPONENT
     ═══════════════════════════════════════════════════════════════ */

  var Dialog = {
    el: null,

    // Show dialog
    show: function() {
      if (this.el) {
        this.el.remove();
      }

      this.el = this.create();
      document.body.appendChild(this.el);
      this.makeDraggable();
      this.bindEvents();
      this.updateRamadanInfo();
    },

    // Create dialog element
    create: function() {
      var ramadanInfo = HijriCalendar.getCurrentRamadanInfo();
      
      var dialog = DOM.createElement('div', {
        class: 'ez-dialog',
        'data-months': State.months,
        'data-days': State.days
      });

      dialog.innerHTML = `
        <div class="ez-progress-bar"></div>
        
        <div class="ez-dialog__header">
          <div class="ez-dialog__logo-group">
            <div class="ez-dialog__logo">💊</div>
            <div class="ez-dialog__title-block">
              <div class="ez-dialog__title">EZ_Pill <span>Farmadosis</span></div>
              <div class="ez-dialog__subtitle">معالج الجرعات الذكي · v${APP_VERSION}</div>
            </div>
          </div>
          <div class="ez-dialog__header-actions">
            <button class="ez-btn-icon" id="ez-btn-settings" title="الإعدادات">⚙️</button>
            <button class="ez-btn-icon" id="ez-btn-dark" title="الوضع الليلi">${State.darkMode ? '☀️' : '🌙'}</button>
            <button class="ez-btn-icon" id="ez-btn-minimize" title="تصغير">−</button>
          </div>
        </div>

        <div class="ez-dialog__content">
          <!-- Duration Card -->
          <div class="ez-card">
            <div class="ez-card__row">
              <div class="ez-card__col">
                <div class="ez-card__label">الأشهر</div>
                <div class="ez-seg-group" id="months-group">
                  <button class="ez-seg ${State.months === 1 ? 'active' : ''}" data-value="1">1</button>
                  <button class="ez-seg ${State.months === 2 ? 'active' : ''}" data-value="2">2</button>
                  <button class="ez-seg ${State.months === 3 ? 'active' : ''}" data-value="3">3</button>
                </div>
              </div>
              <div class="ez-card__divider"></div>
              <div class="ez-card__col">
                <div class="ez-card__label">الأيام</div>
                <div class="ez-seg-group" id="days-group">
                  <button class="ez-seg ${State.days === 28 ? 'active' : ''}" data-value="28">28</button>
                  <button class="ez-seg ${State.days === 30 ? 'active' : ''}" data-value="30">30</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Toggles Card -->
          <div class="ez-card">
            <div class="ez-tog-grid">
              <button class="ez-tog-btn ${State.autoDuration ? 'on' : ''}" data-toggle="autoDuration">
                <span class="ez-tog-btn__icon">✨</span>
                <span class="ez-tog-btn__label">استخراج تلقائي</span>
                <span class="ez-tog-btn__dot"></span>
              </button>
              <button class="ez-tog-btn ${State.showWarnings ? 'on' : ''}" data-toggle="showWarnings">
                <span class="ez-tog-btn__icon">⚠️</span>
                <span class="ez-tog-btn__label">التحذيرات</span>
                <span class="ez-tog-btn__dot"></span>
              </button>
              <button class="ez-tog-btn ${State.ramadanMode ? 'on' : ''}" data-toggle="ramadanMode">
                <span class="ez-tog-btn__icon">🌙</span>
                <span class="ez-tog-btn__label">رمضان</span>
                <span class="ez-tog-btn__dot"></span>
              </button>
              <button class="ez-tog-btn ${State.darkMode ? 'on' : ''}" data-toggle="darkMode">
                <span class="ez-tog-btn__icon">🌓</span>
                <span class="ez-tog-btn__label">الليلي</span>
                <span class="ez-tog-btn__dot"></span>
              </button>
            </div>
          </div>

          <!-- Ramadan Card -->
          <div class="ez-ramadan-card ${State.ramadanMode ? 'on' : ''}" id="ramadan-card">
            <div class="ez-ramadan-card__header">
              <span class="ez-ramadan-card__icon">🌙</span>
              <span class="ez-ramadan-card__title">وضع رمضان</span>
            </div>
            <div class="ez-ramadan-card__input-group">
              <span>باقي</span>
              <input type="number" class="ez-ramadan-card__input" id="ramadan-days" 
                     min="1" max="30" value="${ramadanInfo.inRamadan ? ramadanInfo.daysLeft : ''}" 
                     placeholder="؟">
              <span>يوم</span>
            </div>
            ${ramadanInfo.inRamadan ? `
              <div class="ez-ramadan-card__info" id="ramadan-info">
                📅 اليوم ${ramadanInfo.dayNum} رمضان — باقي <strong>${ramadanInfo.daysLeft}</strong> يوم
              </div>
            ` : ramadanInfo.daysUntil ? `
              <div class="ez-ramadan-card__info">
                📅 رمضان بعد <strong>${ramadanInfo.daysUntil}</strong> يوم
              </div>
            ` : ''}
          </div>

          <!-- Pack Warning -->
          <div class="ez-pack-warning" id="pack-warning"></div>
        </div>

        <div class="ez-dialog__footer">
          <button class="ez-btn ez-btn--primary ez-btn--pulse" id="ez-btn-process">
            ⚡ بدء المعالجة
          </button>
          <button class="ez-btn ez-btn--square ez-btn--ghost" id="ez-btn-doses" title="عرض الجرعات">📋</button>
          <button class="ez-btn ez-btn--square ez-btn--ghost" id="ez-btn-save" title="حفظ النوتات">💾</button>
          <button class="ez-btn ez-btn--square ez-btn--ghost" id="ez-btn-paste" title="لصق النوتات">📥</button>
          <button class="ez-btn ez-btn--square ez-btn--danger" id="ez-btn-cancel" title="إلغاء">✕</button>
        </div>

        <div class="ez-dialog__badge">
          EZ_PILL FARMADOSIS · V${APP_VERSION}
        </div>
      `;

      return dialog;
    },

    // Bind events
    bindEvents: function() {
      var self = this;

      // Months buttons
      var monthsGroup = this.el.querySelector('#months-group');
      monthsGroup.addEventListener('click', function(e) {
        var btn = e.target.closest('.ez-seg');
        if (!btn) return;
        monthsGroup.querySelectorAll('.ez-seg').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        State.months = parseInt(btn.dataset.value);
        self.el.dataset.months = State.months;
        State.save();
      });

      // Days buttons
      var daysGroup = this.el.querySelector('#days-group');
      daysGroup.addEventListener('click', function(e) {
        var btn = e.target.closest('.ez-seg');
        if (!btn) return;
        daysGroup.querySelectorAll('.ez-seg').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        State.days = parseInt(btn.dataset.value);
        self.el.dataset.days = State.days;
        State.save();
      });

      // Toggle buttons
      this.el.querySelectorAll('.ez-tog-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var key = this.dataset.toggle;
          State[key] = !State[key];
          this.classList.toggle('on', State[key]);
          
          // Special handling for ramadanMode
          if (key === 'ramadanMode') {
            var ramadanCard = document.getElementById('ramadan-card');
            if (ramadanCard) {
              ramadanCard.classList.toggle('on', State.ramadanMode);
            }
          }
          
          // Special handling for darkMode
          if (key === 'darkMode') {
            document.body.classList.toggle('ez-dark-mode', State.darkMode);
            var darkBtn = document.getElementById('ez-btn-dark');
            if (darkBtn) {
              darkBtn.textContent = State.darkMode ? '☀️' : '🌙';
            }
          }
          
          State.save();
        });
      });

      // Process button
      document.getElementById('ez-btn-process').addEventListener('click', function() {
        self.process();
      });

      // Cancel button
      document.getElementById('ez-btn-cancel').addEventListener('click', function() {
        self.hide();
      });

      // Minimize button
      document.getElementById('ez-btn-minimize').addEventListener('click', function() {
        self.toggleMinimize();
      });

      // Dark mode button
      document.getElementById('ez-btn-dark').addEventListener('click', function() {
        State.darkMode = !State.darkMode;
        document.body.classList.toggle('ez-dark-mode', State.darkMode);
        this.textContent = State.darkMode ? '☀️' : '🌙';
        State.save();
      });

      // Doses button
      document.getElementById('ez-btn-doses').addEventListener('click', function() {
        self.showDoses();
      });

      // Save notes button
      document.getElementById('ez-btn-save').addEventListener('click', function() {
        self.saveNotes();
      });

      // Paste notes button
      document.getElementById('ez-btn-paste').addEventListener('click', function() {
        self.pasteNotes();
      });

      // Settings button
      document.getElementById('ez-btn-settings').addEventListener('click', function() {
        self.showSettings();
      });

      // Ramadan days input
      var ramadanInput = document.getElementById('ramadan-days');
      if (ramadanInput) {
        ramadanInput.addEventListener('input', function() {
          State.ramadanDaysLeft = parseInt(this.value) || 0;
        });
      }

      // Keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && self.el) {
          self.process();
        } else if (e.key === 'Escape' && self.el) {
          self.hide();
        }
      });
    },

    // Make dialog draggable
    makeDraggable: function() {
      var header = this.el.querySelector('.ez-dialog__header');
      var isDragging = false;
      var offsetX, offsetY;

      header.addEventListener('mousedown', function(e) {
        if (e.target.closest('.ez-btn-icon')) return;
        isDragging = true;
        offsetX = e.clientX - Dialog.el.offsetLeft;
        offsetY = e.clientY - Dialog.el.offsetTop;
        Dialog.el.style.transform = 'none';
      });

      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var x = e.clientX - offsetX;
        var y = e.clientY - offsetY;
        Dialog.el.style.left = x + 'px';
        Dialog.el.style.top = y + 'px';
      });

      document.addEventListener('mouseup', function() {
        isDragging = false;
      });
    },

    // Hide dialog
    hide: function() {
      if (this.el) {
        this.el.style.animation = 'ezSlideIn 0.3s ease reverse';
        setTimeout(function() {
          Dialog.el.remove();
          Dialog.el = null;
        }, 300);
      }
    },

    // Toggle minimize
    toggleMinimize: function() {
      var content = this.el.querySelector('.ez-dialog__content');
      var footer = this.el.querySelector('.ez-dialog__footer');
      var btn = document.getElementById('ez-btn-minimize');

      if (content.style.display === 'none') {
        content.style.display = '';
        footer.style.display = '';
        btn.textContent = '−';
      } else {
        content.style.display = 'none';
        footer.style.display = 'none';
        btn.textContent = '+';
      }
    },

    // Update Ramadan info
    updateRamadanInfo: function() {
      var info = HijriCalendar.getCurrentRamadanInfo();
      var infoEl = document.getElementById('ramadan-info');
      var input = document.getElementById('ramadan-days');

      if (info.inRamadan && input && !input.value) {
        input.value = info.daysLeft;
        State.ramadanDaysLeft = info.daysLeft;
      }
    },

    // Show doses table
    showDoses: function() {
      var table = DOM.findTable();
      if (!table) {
        Toast.show('لم يتم العثور على الجدول', 'error');
        return;
      }

      var header = table.querySelector('tr');
      var ths = header.querySelectorAll('th');
      var noteIdx = DOM.findColumnIndex(ths, 'note');
      var nameIdx = DOM.findColumnIndex(ths, 'name');
      if (nameIdx < 0) nameIdx = DOM.findColumnIndex(ths, 'item');

      if (noteIdx < 0) {
        Toast.show('عمود الملاحظات غير موجود', 'error');
        return;
      }

      var rows = Array.from(table.querySelectorAll('tr')).slice(1);
      var items = [];

      rows.forEach(function(row) {
        var tds = row.querySelectorAll('td');
        if (tds.length <= Math.max(noteIdx, nameIdx)) return;

        var name = nameIdx >= 0 ? DOM.getValue(tds[nameIdx]) : 'صنف';
        var note = DOM.getValue(tds[noteIdx]);

        if (name && note) {
          items.push({ name: name, note: note });
        }
      });

      if (items.length === 0) {
        Toast.show('لا توجد بيانات جرعات', 'info');
        return;
      }

      // Create doses dialog
      this.createDosesDialog(items);
    },

    // Create doses dialog
    createDosesDialog: function(items) {
      var existing = document.getElementById('ez-doses-dialog');
      if (existing) existing.remove();

      var html = `
        <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                    width:600px;max-width:96vw;max-height:80vh;
                    background:#fff;border-radius:${THEME.radius.xl};
                    box-shadow:${THEME.shadows.xl};z-index:1000000;
                    font-family:'Cairo',sans-serif;overflow:hidden;
                    border:2px solid rgba(99,102,241,0.12);
                    animation:ezSlideIn 0.5s cubic-bezier(0.16,1,0.3,1)">
          <div class="ez-progress-bar"></div>
          <div style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;
                      background:linear-gradient(180deg,rgba(99,102,241,0.04),transparent);
                      border-bottom:1px solid rgba(99,102,241,0.06)">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:40px;height:40px;border-radius:12px;
                          background:linear-gradient(145deg,#818cf8,#6366f1);
                          display:flex;align-items:center;justify-content:center;
                          font-size:18px;box-shadow:var(--ez-shadow-sm)">📋</div>
              <div>
                <div style="font-size:16px;font-weight:800;color:var(--ez-dark)">جدول الجرعات</div>
                <div style="font-size:10px;font-weight:600;color:var(--ez-gray-light)">${items.length} صنف</div>
              </div>
            </div>
            <button onclick="this.closest('#ez-doses-dialog').remove()"
                    style="width:32px;height:32px;border:none;border-radius:10px;
                           background:rgba(99,102,241,0.06);color:var(--ez-gray);
                           cursor:pointer;font-size:16px">✕</button>
          </div>
          <div style="max-height:60vh;overflow-y:auto;padding:16px 20px">
            <div style="display:flex;align-items:center;padding:8px 12px;margin-bottom:8px;
                        background:linear-gradient(145deg,var(--ez-primary),var(--ez-primary-dark));
                        border-radius:10px;color:#fff">
              <div style="width:40px;font-size:11px;font-weight:700;opacity:0.7">#</div>
              <div style="flex:1;font-size:11px;font-weight:800">الصنف</div>
              <div style="flex:1.2;font-size:11px;font-weight:800">الجرعة</div>
            </div>
            ${items.map(function(item, i) {
              return `
                <div style="display:flex;align-items:center;padding:10px 12px;margin-bottom:6px;
                            background:#fff;border:1px solid rgba(99,102,241,0.08);
                            border-radius:10px;direction:rtl">
                  <div style="width:40px;font-size:12px;font-weight:800;color:var(--ez-primary-light)">${i + 1}</div>
                  <div style="flex:1;font-size:12px;font-weight:700;color:var(--ez-dark)">${Utils.escapeHtml(item.name)}</div>
                  <div style="flex:1.2;font-size:11px;font-weight:600;color:var(--ez-gray);
                              background:rgba(99,102,241,0.04);padding:6px 10px;border-radius:8px">${Utils.escapeHtml(item.note)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      var dialog = document.createElement('div');
      dialog.id = 'ez-doses-dialog';
      dialog.innerHTML = html;
      document.body.appendChild(dialog);
    },

    // Save notes
    saveNotes: function() {
      var table = DOM.findTable();
      if (!table) {
        Toast.show('لم يتم العثور على الجدول', 'error');
        return;
      }

      var header = table.querySelector('tr');
      var ths = header.querySelectorAll('th');
      var noteIdx = DOM.findColumnIndex(ths, 'note');
      var codeIdx = DOM.findColumnIndex(ths, 'code');
      var nameIdx = DOM.findColumnIndex(ths, 'name');

      if (noteIdx < 0 || codeIdx < 0) {
        Toast.show('أعمدة ناقصة', 'error');
        return;
      }

      var rows = Array.from(table.querySelectorAll('tr')).slice(1);
      var saved = {};
      var count = 0;

      rows.forEach(function(row) {
        var tds = row.querySelectorAll('td');
        if (tds.length <= Math.max(noteIdx, codeIdx)) return;

        var code = DOM.getCode(tds[codeIdx]);
        if (!code) return;

        var note = DOM.getValue(tds[noteIdx]);
        if (!note || note.length < 2) return;

        var name = nameIdx >= 0 ? DOM.getValue(tds[nameIdx]) : '';
        saved[code] = { note: note, name: name };
        count++;
      });

      if (count === 0) {
        Toast.show('مفيش نوتات للحفظ', 'info');
        return;
      }

      Storage.set(Storage.keys.savedNotes, saved);
      Storage.set(Storage.keys.savedNotesTime, new Date().toLocaleString('ar-EG'));
      Toast.show('💾 تم حفظ ' + count + ' نوتة', 'success');
      Audio.beep('success');
    },

    // Paste notes
    pasteNotes: function() {
      var saved = Storage.get(Storage.keys.savedNotes);
      if (!saved) {
        Toast.show('مفيش نوتات محفوظة', 'info');
        return;
      }

      var savedTime = Storage.get(Storage.keys.savedNotesTime) || '';
      var codes = Object.keys(saved);
      if (codes.length === 0) {
        Toast.show('مفيش نوتات محفوظة', 'info');
        return;
      }

      var table = DOM.findTable();
      if (!table) {
        Toast.show('لم يتم العثور على الجدول', 'error');
        return;
      }

      var header = table.querySelector('tr');
      var ths = header.querySelectorAll('th');
      var noteIdx = DOM.findColumnIndex(ths, 'note');
      var codeIdx = DOM.findColumnIndex(ths, 'code');

      if (noteIdx < 0 || codeIdx < 0) {
        Toast.show('أعمدة ناقصة', 'error');
        return;
      }

      var rows = Array.from(table.querySelectorAll('tr')).slice(1);
      var pasted = 0;

      rows.forEach(function(row) {
        var tds = row.querySelectorAll('td');
        if (tds.length <= Math.max(noteIdx, codeIdx)) return;

        var code = DOM.getCode(tds[codeIdx]);
        if (!code || !saved[code]) return;

        DOM.setValue(tds[noteIdx], saved[code].note);
        pasted++;
      });

      Toast.show('✅ تم لصق ' + pasted + ' نوتة', 'success');
      Audio.beep('success');
    },

    // Show settings
    showSettings: function() {
      Toast.show('⚙️ الإعدادات قيد التطوير', 'info');
    },

    // Process table
    process: function() {
      var self = this;

      // Get ramadan days if mode is on
      if (State.ramadanMode) {
        var ramadanInput = document.getElementById('ramadan-days');
        if (ramadanInput && ramadanInput.value) {
          State.ramadanDaysLeft = parseInt(ramadanInput.value) || 0;
        }
        if (!State.ramadanDaysLeft || State.ramadanDaysLeft < 1) {
          Toast.show('❌ أدخل عدد أيام رمضان المتبقية', 'error');
          return;
        }
      }

      // Hide dialog
      this.hide();

      // Show loading
      this.showLoading();

      // Process after delay
      setTimeout(function() {
        try {
          self.executeProcessing();
        } catch (e) {
          Toast.show('❌ خطأ: ' + e.message, 'error');
          console.error(e);
        }
        self.hideLoading();
      }, 600);
    },

    // Show loading overlay
    showLoading: function() {
      var loader = document.createElement('div');
      loader.id = 'ez-loader';
      loader.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255,255,255,0.97);
        backdrop-filter: blur(40px);
        padding: 30px 50px;
        border-radius: ${THEME.radius.xl};
        box-shadow: ${THEME.shadows.xl};
        z-index: 999998;
        text-align: center;
        font-family: 'Cairo', sans-serif;
        animation: ezSlideIn 0.4s ease;
      `;
      loader.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:24px;height:24px;border:3px solid rgba(99,102,241,0.15);
                      border-top-color:var(--ez-primary);border-radius:50%;
                      animation:ezSpin 0.8s linear infinite"></div>
          <div style="font-size:15px;font-weight:800;color:var(--ez-dark)">
            ${State.ramadanMode ? '🌙 جاري المعالجة (رمضان)...' : 'جاري المعالجة...'}
          </div>
        </div>
      `;
      document.body.appendChild(loader);
    },

    // Hide loading
    hideLoading: function() {
      var loader = document.getElementById('ez-loader');
      if (loader) loader.remove();
    },

    // Execute processing
    executeProcessing: function() {
      var table = DOM.findTable();
      if (!table) {
        Toast.show('❌ لم يتم العثور على جدول الأدوية', 'error');
        Audio.beep('error');
        return;
      }

      // Reset state
      State.reset();

      // Get column indices
      var header = table.querySelector('tr');
      var ths = header.querySelectorAll('th');
      
      var cols = {
        qty: DOM.findColumnIndex(ths, 'qty'),
        size: DOM.findColumnIndex(ths, 'size'),
        note: DOM.findColumnIndex(ths, 'note'),
        every: DOM.findColumnIndex(ths, 'every'),
        time: DOM.findColumnIndex(ths, 'time'),
        dose: DOM.findColumnIndex(ths, 'dose'),
        code: DOM.findColumnIndex(ths, 'code'),
        name: DOM.findColumnIndex(ths, 'name'),
        startDate: DOM.findColumnIndex(ths, 'startDate'),
        endDate: DOM.findColumnIndex(ths, 'endDate')
      };

      // Check required columns
      var missing = [];
      if (cols.qty < 0) missing.push('Qty');
      if (cols.size < 0) missing.push('Size');
      if (cols.note < 0) missing.push('Note');
      if (cols.every < 0) missing.push('Every');

      if (missing.length > 0) {
        Toast.show('❌ أعمدة ناقصة: ' + missing.join(' + '), 'error');
        Audio.beep('error');
        return;
      }

      // Set start date
      this.setStartDate();

      // Process rows
      var rows = Array.from(table.querySelectorAll('tr')).slice(1);
      var processedCount = 0;
      var duplicateCount = 0;

      rows.forEach(function(row, index) {
        var tds = row.querySelectorAll('td');
        if (tds.length < 6) return;

        // Skip unchecked rows
        var checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        // Get values
        var code = DOM.getCode(tds[cols.code]);
        var note = DOM.getValue(tds[cols.note]);
        var name = cols.name >= 0 ? DOM.getValue(tds[cols.name]) : '';

        // Skip non-tablet items
        if (this.isNonTablet(name)) {
          if (checkbox) checkbox.checked = false;
          return;
        }

        // Check for duplicates
        if (code && State.processedCodes[code]) {
          if (checkbox) checkbox.checked = false;
          return;
        }
        if (code) State.processedCodes[code] = true;

        // Get dose info
        var doseInfo = DoseRecognizer.recognize(note);

        // Check if fixed size code
        var isFixed = code && FIXED_SIZE_CODES[code];
        var isWeekly = code && WEEKLY_INJECTIONS.indexOf(code) > -1;

        // Handle Ramadan mode
        if (State.ramadanMode) {
          this.processRamadanRow(row, tds, cols, {
            code: code,
            note: note,
            name: name,
            doseInfo: doseInfo,
            isFixed: isFixed,
            isWeekly: isWeekly
          });
          return;
        }

        // Check for duplication
        var dupInfo = DuplicateEngine.needsDuplication(note);

        if (dupInfo && !isFixed && !isWeekly) {
          // Create duplicates
          this.createDuplicates(row, tds, cols, {
            dupInfo: dupInfo,
            code: code,
            note: note,
            doseInfo: doseInfo
          });
          duplicateCount++;
          processedCount++;
        } else {
          // Process single row
          this.processSingleRow(row, tds, cols, {
            code: code,
            note: note,
            name: name,
            doseInfo: doseInfo,
            isFixed: isFixed,
            isWeekly: isWeekly
          });
          processedCount++;
        }
      }.bind(this));

      // Sort by time
      this.sortTableByTime(table, cols.time);

      Toast.show('✅ تمت معالجة ' + processedCount + ' صنف' + (duplicateCount > 0 ? ' (' + duplicateCount + ' مقسم)' : ''), 'success');
      Audio.beep('success');
    },

    // Process single row
    processSingleRow: function(row, tds, cols, data) {
      var totalDays = State.months * State.days;
      var doseInfo = data.doseInfo;
      var pillInfo = DoseRecognizer.getPillCountInfo(data.note);

      // Handle fixed size codes
      if (data.isFixed) {
        var fixedSize = FIXED_SIZE_CODES[data.code];
        DOM.setValue(tds[cols.size], fixedSize);
        
        // Set every based on dose
        if (doseInfo.count >= 4) {
          DOM.setValue(tds[cols.every], '6');
        } else if (doseInfo.count === 3) {
          DOM.setValue(tds[cols.every], '8');
        } else if (doseInfo.count === 2) {
          DOM.setValue(tds[cols.every], '12');
        } else {
          DOM.setValue(tds[cols.every], '24');
        }
        
        // Set time
        var timeResult = TimeExtractor.getTime(data.note, data.code);
        if (cols.time >= 0) {
          var timeInput = tds[cols.time].querySelector("input[type='time']");
          if (timeInput) {
            timeInput.value = timeResult.time;
            Utils.fireEvent(timeInput);
          }
        }
        
        // Set qty
        if (cols.qty >= 0) {
          var currentQty = parseInt(DOM.getValue(tds[cols.qty])) || 1;
          DOM.setValue(tds[cols.qty], currentQty * State.months);
        }
        
        return;
      }

      // Handle weekly injections
      if (data.isWeekly) {
        var weeklySize = Math.ceil(totalDays / 7) + (State.months - 1) * 4;
        DOM.setValue(tds[cols.size], weeklySize);
        DOM.setValue(tds[cols.every], '168');
        
        // Set time
        var timeResult = TimeExtractor.getTime(data.note, data.code);
        if (cols.time >= 0) {
          var timeInput = tds[cols.time].querySelector("input[type='time']");
          if (timeInput) {
            timeInput.value = timeResult.time;
            Utils.fireEvent(timeInput);
          }
        }
        return;
      }

      // Normal processing
      var size = totalDays;
      var every = '24';
      var tpd = 1; // Times per day

      // Check for 48h interval
      if (/48|يوم بعد يوم|every\s*other\s*day/i.test(data.note)) {
        every = '48';
        size = Math.ceil(totalDays / 2);
      }
      // Check for hourly interval
      else if (doseInfo.frequency) {
        if (doseInfo.frequency === 'Q4H') {
          every = '4'; tpd = 6;
        } else if (doseInfo.frequency === 'Q6H') {
          every = '6'; tpd = 4;
        } else if (doseInfo.frequency === 'Q8H') {
          every = '8'; tpd = 3;
        } else if (doseInfo.frequency === 'Q12H') {
          every = '12'; tpd = 2;
        } else if (doseInfo.frequency === 'Q24H') {
          every = '24'; tpd = 1;
        }
      }
      // Check from dose count
      else if (doseInfo.count >= 4) {
        every = '6'; tpd = 4;
      } else if (doseInfo.count === 3) {
        every = '8'; tpd = 3;
      } else if (doseInfo.count === 2) {
        every = '12'; tpd = 2;
      }

      // Calculate final size
      size = totalDays * pillInfo.multiplier * tpd / (tpd === 1 ? 1 : 1);

      // Set values
      DOM.setValue(tds[cols.size], Math.ceil(size));
      DOM.setValue(tds[cols.every], every);

      // Set qty
      if (cols.qty >= 0) {
        var currentQty = parseInt(DOM.getValue(tds[cols.qty])) || 1;
        DOM.setValue(tds[cols.qty], currentQty * State.months);
      }

      // Set dose
      if (cols.dose >= 0) {
        DOM.setValue(tds[cols.dose], pillInfo.dose);
      }

      // Set time
      var timeResult = TimeExtractor.getTime(data.note, data.code);
      if (cols.time >= 0) {
        var timeInput = tds[cols.time].querySelector("input[type='time']");
        if (timeInput) {
          timeInput.value = timeResult.time;
          Utils.fireEvent(timeInput);
        }
      }
    },

    // Process Ramadan row
    processRamadanRow: function(row, tds, cols, data) {
      var doseInfo = data.doseInfo;
      var ramadanDays = State.ramadanDaysLeft || 30;

      // Map note to Ramadan time
      var ramadanTime = RamadanMapper.map(data.note);

      if (!ramadanTime) {
        ramadanTime = {
          meal: 'afterIftar',
          label: { ar: 'بعد الفطار', en: 'After Iftar' },
          time: RAMADAN_TIMES.afterIftar
        };
      }

      // Check if needs duplication (count >= 2 or "both" pattern)
      if (doseInfo.count >= 2 || ramadanTime.isBoth) {
        this.createRamadanDuplicates(row, tds, cols, {
          code: data.code,
          note: data.note,
          doseInfo: doseInfo,
          ramadanTime: ramadanTime,
          isFixed: data.isFixed
        });
        return;
      }

      // Single Ramadan dose
      var size = data.isFixed ? FIXED_SIZE_CODES[data.code] : ramadanDays;
      
      DOM.setValue(tds[cols.size], size);
      DOM.setValue(tds[cols.every], '24');

      // Set time
      if (cols.time >= 0) {
        var timeInput = tds[cols.time].querySelector("input[type='time']");
        if (timeInput) {
          timeInput.value = ramadanTime.time;
          Utils.fireEvent(timeInput);
        }
      }

      // Update note label
      var label = doseInfo.language === 'arabic' ? ramadanTime.label.ar : ramadanTime.label.en;
      DOM.setValue(tds[cols.note], label);
    },

    // Create normal duplicates
    createDuplicates: function(row, tds, cols, data) {
      var totalDays = State.months * State.days;
      var count = data.dupInfo.count;
      var isBefore = data.dupInfo.doseInfo.isBefore;

      // Determine times and labels
      var times, labels;
      
      if (data.dupInfo.type === 'three') {
        times = isBefore ? ['08:00', '13:00', '20:00'] : ['09:00', '14:00', '21:00'];
        labels = isBefore ? 
          ['قبل الفطار', 'قبل الغداء', 'قبل العشاء'] : 
          ['بعد الفطار', 'بعد الغداء', 'بعد العشاء'];
      } else if (data.dupInfo.type === 'q6h') {
        times = ['09:00', '21:00'];
        labels = ['بعد الفطار والعشاء', 'بعد الغداء والنوم'];
      } else {
        times = isBefore ? ['08:00', '20:00'] : ['09:00', '21:00'];
        labels = isBefore ? 
          ['قبل الفطار', 'قبل العشاء'] : 
          ['بعد الفطار', 'بعد العشاء'];
      }

      // Calculate sizes
      var sizePerDose = Math.floor(totalDays / count);
      var sizes = [];
      for (var i = 0; i < count; i++) {
        sizes.push(sizePerDose);
      }

      // Create clones
      var clones = DuplicateEngine.create(row, {
        count: count,
        times: times,
        labels: labels,
        sizes: sizes,
        doseInfo: data.dupInfo.doseInfo
      });

      // Insert clones and remove original
      clones.forEach(function(clone) {
        DOM.setValue(clone.querySelectorAll('td')[cols.every], '24');
        row.parentNode.insertBefore(clone, row);
      });
      row.remove();
    },

    // Create Ramadan duplicates
    createRamadanDuplicates: function(row, tds, cols, data) {
      var ramadanDays = State.ramadanDaysLeft || 30;
      var isBefore = data.doseInfo.isBefore;

      // Determine times and labels for Iftar and Suhoor
      var times, labels;
      
      if (isBefore) {
        times = [RAMADAN_TIMES.beforeIftar, RAMADAN_TIMES.beforeSuhoor];
        labels = ['قبل الفطار', 'قبل السحور'];
      } else {
        times = [RAMADAN_TIMES.afterIftar, RAMADAN_TIMES.afterSuhoor];
        labels = ['بعد الفطار', 'بعد السحور'];
      }

      // Calculate sizes
      var sizePerDose = data.isFixed ? 
        Math.floor(FIXED_SIZE_CODES[data.code] / 2) : 
        ramadanDays;

      // Create clones
      var clones = DuplicateEngine.create(row, {
        count: 2,
        times: times,
        labels: labels,
        sizes: [sizePerDose, sizePerDose],
        doseInfo: data.doseInfo,
        isRamadan: true
      });

      // Insert clones and remove original
      clones.forEach(function(clone) {
        DOM.setValue(clone.querySelectorAll('td')[cols.every], '24');
        row.parentNode.insertBefore(clone, row);
      });
      row.remove();
    },

    // Check if item is non-tablet
    isNonTablet: function(name) {
      return /injection|حقن|syrup|شراب|cream|كريم|ointment|مرهم|lotion|لوشن|gel|جل|drop|قطر|spray|بخاخ|inhaler|بخاخة|suppository|لبوس|solution|محلول|suspension|معلق|patch|لصقة/i.test(name || '');
    },

    // Set start date
    setStartDate: function() {
      var dateInput = document.querySelector('#fstartDate');
      if (!dateInput) return;

      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = Utils.formatDate(tomorrow);
      Utils.fireEvent(dateInput);
    },

    // Sort table by time
    sortTableByTime: function(table, timeIdx) {
      if (timeIdx < 0) return;

      var rows = Array.from(table.querySelectorAll('tr'));
      var header = rows.shift();

      var withTime = [];
      var withoutTime = [];

      rows.forEach(function(row) {
        var tds = row.querySelectorAll('td');
        if (tds.length <= timeIdx) {
          withoutTime.push(row);
          return;
        }

        var timeVal = DOM.getValue(tds[timeIdx]);
        if (!timeVal || timeVal.trim() === '') {
          withoutTime.push(row);
          return;
        }

        withTime.push({ row: row, time: timeVal });
      });

      withTime.sort(function(a, b) {
        var timeA = a.time.split(':').map(Number);
        var timeB = b.time.split(':').map(Number);
        var minutesA = timeA[0] * 60 + (timeA[1] || 0);
        var minutesB = timeB[0] * 60 + (timeB[1] || 0);
        return minutesA - minutesB;
      });

      table.innerHTML = '';
      table.appendChild(header);
      withTime.forEach(function(item) { table.appendChild(item.row); });
      withoutTime.forEach(function(row) { table.appendChild(row); });
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 19: MAIN API
     ═══════════════════════════════════════════════════════════════ */

  var EZPill = {
    version: APP_VERSION,
    
    // Show dialog
    show: function() {
      Dialog.show();
    },

    // Hide dialog
    hide: function() {
      Dialog.hide();
    },

    // Toggle dark mode
    toggleDark: function() {
      State.darkMode = !State.darkMode;
      document.body.classList.toggle('ez-dark-mode', State.darkMode);
      State.save();
      Toast.show(State.darkMode ? '🌙 الوضع الليلي' : '☀️ الوضع العادي', 'info');
    },

    // Process
    process: function() {
      Dialog.process();
    },

    // Get state
    getState: function() {
      return Object.assign({}, State);
    },

    // Reset settings
    reset: function() {
      State.months = 1;
      State.days = 30;
      State.autoDuration = true;
      State.showWarnings = true;
      State.darkMode = false;
      State.ramadanMode = false;
      State.ramadanDaysLeft = 0;
      State.save();
      Toast.show('🔄 تم استعادة الإعدادات الافتراضية', 'success');
    },

    // Export settings
    exportSettings: function() {
      var data = {
        version: APP_VERSION,
        date: new Date().toISOString(),
        settings: {
          months: State.months,
          days: State.days,
          autoDuration: State.autoDuration,
          showWarnings: State.showWarnings,
          darkMode: State.darkMode,
          ramadanMode: State.ramadanMode
        },
        custom: Storage.loadCustomConfig()
      };

      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'ezpill_settings_' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Toast.show('📤 تم تصدير الإعدادات', 'success');
    },

    // Import settings
    importSettings: function(file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var data = JSON.parse(e.target.result);
          if (data.settings) {
            Object.assign(State, data.settings);
            State.save();
          }
          if (data.custom) {
            Storage.saveCustomConfig(data.custom);
          }
          Toast.show('📥 تم استيراد الإعدادات', 'success');
        } catch (err) {
          Toast.show('❌ خطأ في قراءة الملف', 'error');
        }
      };
      reader.readAsText(file);
    },

    // Public utilities
    utils: Utils,
    cache: Cache,
    storage: Storage,
    hijri: HijriCalendar
  };

  /* ═══════════════════════════════════════════════════════════════
     SECTION 20: INITIALIZATION
     ═══════════════════════════════════════════════════════════════ */

  // Apply dark mode if saved
  if (State.darkMode) {
    document.body.classList.add('ez-dark-mode');
  }

  // Expose to global
  global.EZPill = EZPill;

  // Auto-show dialog
  Dialog.show();

  // Log initialization
  console.log('%c✨ EZ_Pill Farmadosis v' + APP_VERSION + ' initialized', 
              'color: #6366f1; font-size: 14px; font-weight: bold;');

})(typeof window !== 'undefined' ? window : this);
