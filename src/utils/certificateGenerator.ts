/**
 * Helper to generate and download official high-resolution Certificate PNG
 * using HTML5 Canvas with gold borders, authentic seal, and school typography.
 */

export interface CertificateOptions {
  title: string;
  recipientName: string;
  schoolOrOrg: string;
  roleLabel?: string;
  citationText: string;
  certificateId: string;
  dateStr: string;
  badgeText?: string;
}

export function drawCertificateToCanvas(options: CertificateOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 850;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;

  // 1. Parchment background
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#fefdf9');
  bgGrad.addColorStop(0.5, '#fffbf0');
  bgGrad.addColorStop(1, '#fef9e7');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle security pattern / guilloche lines
  ctx.save();
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 40) {
    ctx.beginPath();
    ctx.arc(i, h / 2, 350, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Outer & Inner Gold Borders
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 10;
  ctx.strokeRect(30, 30, w - 60, h - 60);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, w - 88, h - 88);

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.strokeRect(52, 52, w - 104, h - 104);

  // Corner Ornaments
  const drawCorner = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 0);
    ctx.restore();
  };

  drawCorner(52, 52, 0);
  drawCorner(w - 52, 52, 0);
  drawCorner(52, h - 52, 0);
  drawCorner(w - 52, h - 52, 0);

  // 3. Header Emblem & School Branding
  ctx.textAlign = 'center';
  ctx.fillStyle = '#065f46'; // emerald 800
  ctx.font = '900 18px "Segoe UI", Arial, sans-serif';
  ctx.fillText('🛡️ HỆ THỐNG TRƯỜNG HỌC XANH VIỆT NAM — LÁ CHẮN HỌC ĐƯỜNG', w / 2, 105);

  ctx.fillStyle = '#047857';
  ctx.font = '600 13px "Segoe UI", Arial, sans-serif';
  ctx.fillText('HỌC ĐƯỜNG AN TOÀN • NÓI KHÔNG VỚI MA TÚY • THUỐC LÁ ĐIỆN TỬ • BẠO LỰC', w / 2, 130);

  // Horizontal divider with star
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 250, 148);
  ctx.lineTo(w / 2 - 25, 148);
  ctx.moveTo(w / 2 + 25, 148);
  ctx.lineTo(w / 2 + 250, 148);
  ctx.stroke();

  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 18px serif';
  ctx.fillText('★', w / 2, 153);

  // 4. Main Certificate Title
  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
  ctx.fillText(options.badgeText || 'GIẤY CHỨNG NHẬN DANH DỰ', w / 2, 185);

  ctx.fillStyle = '#1e3a8a'; // Deep blue
  ctx.font = '900 38px "Times New Roman", Georgia, serif';
  ctx.fillText(options.title, w / 2, 235);

  // 5. Present to section
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 16px "Times New Roman", Georgia, serif';
  ctx.fillText('Trân trọng trao tặng cho:', w / 2, 280);

  // Recipient Name
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 44px "Times New Roman", Georgia, serif';
  ctx.fillText(options.recipientName || 'Đại Sứ Học Đường', w / 2, 340);

  // School & Role Line
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  const roleText = options.roleLabel ? `${options.roleLabel} • ` : '';
  ctx.fillText(`${roleText}${options.schoolOrOrg || 'Trường THCS/THPT'}`, w / 2, 385);

  // Underline beneath recipient
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 320, 405);
  ctx.lineTo(w / 2 + 320, 405);
  ctx.stroke();

  // 6. Citation text (auto-wrapped)
  ctx.fillStyle = '#334155';
  ctx.font = '16px/26px "Times New Roman", Georgia, serif';
  const maxWidth = 860;
  const citation = options.citationText;

  // Simple wrap
  const words = citation.split(' ');
  let line = '';
  let y = 450;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, w / 2, y);
      line = words[i] + ' ';
      y += 28;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, w / 2, y);

  // 7. Official Seal & Signatures
  // Red & Gold Official Seal on Left
  const sealX = 230;
  const sealY = 690;
  ctx.save();
  ctx.beginPath();
  ctx.arc(sealX, sealY, 68, 0, Math.PI * 2);
  ctx.fillStyle = '#b91c1c'; // Red seal
  ctx.fill();

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 3]);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sealX, sealY, 56, 0, Math.PI * 2);
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ BAN ĐIỀU HÀNH DỰ ÁN ★', sealX, sealY - 32);
  ctx.font = '900 13px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ĐÃ XÁC THỰC', sealX, sealY - 8);
  ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
  ctx.fillText('LÁ CHẮN HỌC ĐƯỜNG', sealX, sealY + 12);
  ctx.font = 'bold 12px serif';
  ctx.fillText('★★★★★', sealX, sealY + 30);
  ctx.restore();

  // Right signature block
  const sigX = w - 240;
  const sigY = 660;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 14px "Times New Roman", Georgia, serif';
  ctx.fillText(`Hà Nội, ${options.dateStr}`, sigX, sigY);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TM. BAN CHỈ ĐẠO CHƯƠNG TRÌNH', sigX, sigY + 24);

  // Simulated digital signature calligraphy
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'italic bold 26px "Brush Script MT", cursive, "Times New Roman"';
  ctx.fillText('Lá Chắn Học Đường', sigX, sigY + 65);

  ctx.fillStyle = '#64748b';
  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Hệ thống Xác thực Điện tử Toàn diện', sigX, sigY + 92);

  // Footer metadata
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`MÃ SỐ: ${options.certificateId}`, 70, h - 70);

  ctx.textAlign = 'right';
  ctx.fillText(`XÁC THỰC: TRUONGHOCXANH.EDU.VN`, w - 70, h - 70);

  return canvas;
}

export function downloadCertificateImage(options: CertificateOptions, fileName?: string): boolean {
  try {
    const canvas = drawCertificateToCanvas(options);
    const dataUrl = canvas.toDataURL('image/png');
    const safeName = (options.recipientName || 'Chung_Nhan')
      .replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_')
      .slice(0, 30);
    const finalName = fileName || `Chung_Nhan_La_Chan_Hoc_Duong_${safeName}.png`;

    const link = document.createElement('a');
    link.download = finalName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to download certificate image:', err);
    return false;
  }
}
