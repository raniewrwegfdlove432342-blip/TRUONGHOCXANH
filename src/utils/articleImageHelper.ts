/**
 * Helper constants and utilities for Article card imagery,
 * theme matching, og:image fallbacks, and category badge styling.
 */

export const THEME_FALLBACK_IMAGES = {
  // Rác thải & Phân loại rác tại nguồn - Học sinh tiểu học bảo vệ môi trường
  'rac-thai': '/images/eco_garden_kids.jpg',
  // Năng lượng & Tiết kiệm điện
  'nang-luong': '/images/eco_garden_kids.jpg',
  // Cây xanh & Vườn trường sinh thái
  'cay-xanh': '/images/eco_garden_kids.jpg',
  // Nước sạch & Vệ sinh môi trường
  'nuoc-sach': '/images/healthy_lifestyle_kids.jpg',
  // Sức khỏe học đường & Đẩy lùi khói thuốc
  'thuoc-la': '/images/healthy_lifestyle_kids.jpg',
  // Tri thức học đường & Vui chơi an toàn
  'ma-tuy': '/images/learning_games_kids.jpg',
  // Tình bạn đẹp & Phòng chống bạo lực học đường
  'bao-luc': '/images/safety_shield_kids.jpg',
  // Kỹ năng sống & Tự bảo vệ bản thân
  'ky-nang': '/images/safety_shield_kids.jpg',
  // Mặc định: Nụ cười học sinh tiểu học dưới mái trường xanh
  'default': '/images/hero_primary_students.jpg',
};

/**
 * Returns a high-quality fallback image based on content keywords or category
 */
export function getThemeFallbackImage(category?: string, title?: string): string {
  const text = `${category || ''} ${title || ''}`.toLowerCase();

  if (
    text.includes('rác') ||
    text.includes('nhựa') ||
    text.includes('tái chế') ||
    text.includes('chất thải') ||
    text.includes('waste') ||
    text.includes('plastic') ||
    text.includes('thu gom')
  ) {
    return THEME_FALLBACK_IMAGES['rac-thai'];
  }
  if (
    text.includes('năng lượng') ||
    text.includes('tiết kiệm điện') ||
    text.includes('điện mặt trời') ||
    text.includes('điện') ||
    text.includes('energy') ||
    text.includes('solar')
  ) {
    return THEME_FALLBACK_IMAGES['nang-luong'];
  }
  if (
    text.includes('cây') ||
    text.includes('trồng cây') ||
    text.includes('vườn trường') ||
    text.includes('vườn') ||
    text.includes('rừng') ||
    text.includes('mầm') ||
    text.includes('green') ||
    text.includes('sinh thái')
  ) {
    return THEME_FALLBACK_IMAGES['cay-xanh'];
  }
  if (
    text.includes('nước') ||
    text.includes('nước sạch') ||
    text.includes('uống') ||
    text.includes('vệ sinh') ||
    text.includes('thủy') ||
    text.includes('water')
  ) {
    return THEME_FALLBACK_IMAGES['nuoc-sach'];
  }
  if (text.includes('pod') || text.includes('vape') || text.includes('thuốc lá') || text.includes('khói') || text.includes('nicotine')) {
    return THEME_FALLBACK_IMAGES['thuoc-la'];
  }
  if (text.includes('ma túy') || text.includes('nước vui') || text.includes('chất cấm') || text.includes('cỏ mỹ')) {
    return THEME_FALLBACK_IMAGES['ma-tuy'];
  }
  if (text.includes('bạo lực') || text.includes('bắt nạt') || text.includes('mạng') || text.includes('cyber') || text.includes('111')) {
    return THEME_FALLBACK_IMAGES['bao-luc'];
  }

  const catKey = (category || 'default') as keyof typeof THEME_FALLBACK_IMAGES;
  return THEME_FALLBACK_IMAGES[catKey] || THEME_FALLBACK_IMAGES['default'];
}

/**
 * Returns colored badge styles and icons for each topic
 */
export function getCategoryBadgeStyle(category?: string, categoryLabel?: string): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconEmoji: string;
} {
  const text = `${category || ''} ${categoryLabel || ''}`.toLowerCase();

  if (text.includes('rác') || text.includes('nhựa') || text.includes('tái chế')) {
    return {
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-900',
      badgeBorder: 'border-amber-300',
      iconEmoji: '♻️',
    };
  }
  if (text.includes('năng lượng') || text.includes('điện') || text.includes('mặt trời')) {
    return {
      badgeBg: 'bg-yellow-100',
      badgeText: 'text-yellow-950',
      badgeBorder: 'border-yellow-300',
      iconEmoji: '⚡',
    };
  }
  if (text.includes('cây') || text.includes('vườn') || text.includes('mầm') || text.includes('xanh')) {
    return {
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-900',
      badgeBorder: 'border-emerald-300',
      iconEmoji: '🌱',
    };
  }
  if (text.includes('nước') || text.includes('uống') || text.includes('vệ sinh')) {
    return {
      badgeBg: 'bg-cyan-100',
      badgeText: 'text-cyan-900',
      badgeBorder: 'border-cyan-300',
      iconEmoji: '💧',
    };
  }
  if (text.includes('pod') || text.includes('vape') || text.includes('thuốc lá')) {
    return {
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-900',
      badgeBorder: 'border-rose-300',
      iconEmoji: '🚭',
    };
  }
  if (text.includes('ma túy') || text.includes('nước vui')) {
    return {
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-950',
      badgeBorder: 'border-red-300',
      iconEmoji: '🚨',
    };
  }
  if (text.includes('bạo lực') || text.includes('bắt nạt') || text.includes('an toàn')) {
    return {
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-900',
      badgeBorder: 'border-indigo-300',
      iconEmoji: '🛡️',
    };
  }

  return {
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-900',
    badgeBorder: 'border-teal-300',
    iconEmoji: '📰',
  };
}
