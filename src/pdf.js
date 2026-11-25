const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const GUTTER = 24;
const COLUMN_WIDTH = (PAGE_WIDTH - 2 * MARGIN - GUTTER) / 2;
const BODY_BOTTOM = PAGE_HEIGHT - MARGIN;
const PRINT_SCALE = 2.8;

const FONT = '"Noto Sans TC", "Noto Sans CJK TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
const INK = '#172d2a';
const MUTED = '#475e56';
const LINE = '#dce5df';
const BODY_SIZE = 11.5;
const BODY_LINE = 18;
const HEADING_HEIGHT = 24;
const CAPTION_SIZE = 9.5;
const CAPTION_LINE = 15;
const ITEM_GAP = 15;

const wordSegmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('zh-Hant', { granularity: 'word' })
  : null;
const characterSegmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('zh-Hant', { granularity: 'grapheme' })
  : null;

function font(size, weight = 400) {
  return `${weight} ${size}px ${FONT}`;
}

function wrapText(context, text, width, typeface) {
  context.font = typeface;
  return String(text).replace(/\r\n?/g, '\n').split('\n').flatMap(paragraph => {
    const tokens = wordSegmenter
      ? Array.from(wordSegmenter.segment(paragraph.trim()), part => part.segment)
      : paragraph.trim().match(/[\p{Script=Latin}\d]+|./gu) ?? [];
    const lines = [];
    let current = '';

    for (const token of tokens) {
      const candidate = (current + token).trimStart();
      const overhang = /^[，。！？：；、）】」』》…]$/u.test(token) ? 8 : 0;
      if (context.measureText(candidate).width <= width + overhang) {
        current = candidate;
        continue;
      }
      if (current) lines.push(current.trimEnd());
      current = token.trimStart();
      if (context.measureText(current).width <= width) continue;

      const characters = characterSegmenter
        ? Array.from(characterSegmenter.segment(current), part => part.segment)
        : Array.from(current);
      current = '';
      for (const character of characters) {
        if (current && context.measureText(current + character).width > width) {
          lines.push(current.trimEnd());
          current = '';
        }
        current += character;
      }
    }
    lines.push(current.trimEnd());
    return lines;
  });
}

function drawLines(context, lines, x, y, lineHeight, typeface, color = INK) {
  context.font = typeface;
  context.fillStyle = color;
  context.textBaseline = 'top';
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function loadImage(photo) {
  return new Promise((resolve, reject) => {
    if (!/^data:image\/(?:jpeg|png|webp);base64,/i.test(photo.src ?? '')) {
      reject(new Error('有一張照片無法匯出。請刪除後重新加入。'));
      return;
    }
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('有一張照片無法讀取。請刪除後重新加入。'));
    image.src = photo.src;
  });
}

async function photoItems(context, photos) {
  const images = await Promise.all(photos.map(loadImage));
  return images.map((image, index) => {
    const scale = Math.min(COLUMN_WIDTH / image.naturalWidth, 185 / image.naturalHeight);
    const caption = String(photos[index].caption ?? '').trim();
    return {
      image,
      width: image.naturalWidth * scale,
      height: image.naturalHeight * scale,
      heading: index === 0 ? '成果照片' : '',
      lines: caption ? wrapText(context, caption, COLUMN_WIDTH, font(CAPTION_SIZE)) : [],
      position: 0,
    };
  });
}

function splitTextItems(items) {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
}

function drawColumn(context, items, x, top, accent) {
  let y = top;
  while (items.length) {
    const item = items[0];
    const heading = !item.position && item.heading;
    const headingHeight = heading ? HEADING_HEIGHT : 0;
    const imageHeight = item.image ? item.height + (item.lines.length ? 6 : 0) : 0;
    const lineHeight = item.image || item.captionContinued ? CAPTION_LINE : BODY_LINE;
    const hasText = item.position < item.lines.length;
    if (y + headingHeight + imageHeight + (hasText ? lineHeight : 0) > BODY_BOTTOM) break;

    if (heading) {
      drawLines(context, [heading], x, y, HEADING_HEIGHT, font(13.5, 700), accent);
      y += HEADING_HEIGHT;
      item.heading = '';
    }
    if (item.image) {
      context.drawImage(item.image, x, y, item.width, item.height);
      y += imageHeight;
      item.image = null;
      item.captionContinued = true;
    }

    const count = Math.floor((BODY_BOTTOM - y) / lineHeight);
    const lines = item.lines.slice(item.position, item.position + count);
    const typeface = item.captionContinued ? font(CAPTION_SIZE) : font(BODY_SIZE);
    y = drawLines(context, lines, x, y, lineHeight, typeface, item.captionContinued ? MUTED : INK);
    item.position += lines.length;
    if (item.position < item.lines.length) break;

    items.shift();
    y += ITEM_GAP;
  }
  return y;
}

function drawHeader(context, report, accent, pageNumber) {
  let y = MARGIN;
  const width = PAGE_WIDTH - 2 * MARGIN;
  context.fillStyle = accent;
  context.fillRect(MARGIN, y, 35, 3);
  y += 12;

  const title = String(report.title || '多元學習成果').trim() || '多元學習成果';
  const typeLabel = String(report.typeLabel ?? '').trim();
  if (pageNumber === 1 && typeLabel && typeLabel !== title) {
    y = drawLines(context, wrapText(context, typeLabel, width, font(10, 700)), MARGIN, y, 17, font(10, 700), accent);
  }

  const titleSize = pageNumber === 1 ? 23 : 14;
  const titleFont = font(titleSize, 700);
  y = drawLines(context, wrapText(context, title, width, titleFont), MARGIN, y, titleSize * 1.35, titleFont);

  if (pageNumber === 1) {
    const meta = [report.name, report.department, report.date]
      .map(value => String(value ?? '').trim()).filter(Boolean).join('　·　');
    if (meta) {
      y += 4;
      y = drawLines(context, wrapText(context, meta, width, font(10)), MARGIN, y, 15, font(10), MUTED);
    }
  }

  context.fillStyle = LINE;
  context.fillRect(MARGIN, y + 12, width, 0.8);
  return y + 27;
}

function canvasJpeg(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('無法產生 PDF。請重新開啟頁面後再試。'));
    }, 'image/jpeg', 0.9);
  });
}

async function renderPages(report) {
  await document.fonts?.ready;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(PAGE_WIDTH * PRINT_SCALE);
  canvas.height = Math.round(PAGE_HEIGHT * PRINT_SCALE);
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('這個瀏覽器無法產生 PDF。');

  context.scale(canvas.width / PAGE_WIDTH, canvas.height / PAGE_HEIGHT);
  const accent = /^#[0-9a-f]{6}$/i.test(report.theme?.accent) ? report.theme.accent : '#216149';
  const text = (report.sections ?? []).filter(section => String(section.text ?? '').trim()).map(section => ({
    heading: String(section.heading ?? ''),
    lines: wrapText(context, String(section.text).trim(), COLUMN_WIDTH, font(BODY_SIZE)),
    position: 0,
  }));
  const photos = await photoItems(context, report.photos ?? []);
  const [left, right] = photos.length
    ? report.layout === 'photo-first' ? [photos, text] : [text, photos]
    : splitTextItems(text);

  const pages = [];
  do {
    const pageNumber = pages.length + 1;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    const top = drawHeader(context, report, accent, pageNumber);
    const leftEnd = drawColumn(context, left, MARGIN, top, accent);
    const rightEnd = drawColumn(context, right, MARGIN + COLUMN_WIDTH + GUTTER, top, accent);
    const bottom = Math.max(leftEnd, rightEnd);
    if (bottom === top && (left.length || right.length)) {
      throw new Error('標題或基本資料太長，請縮短後再下載 PDF。');
    }

    if (bottom > top) {
      context.fillStyle = LINE;
      context.fillRect(PAGE_WIDTH / 2, top, 0.8, Math.min(BODY_BOTTOM, bottom) - top);
    }

    drawLines(context, [String(pageNumber)], MARGIN, PAGE_HEIGHT - 30, 13, font(9), MUTED);
    pages.push(await canvasJpeg(canvas));
  } while (left.length || right.length);

  return { pages, width: canvas.width, height: canvas.height };
}

function packPdf({ pages, width, height }) {
  const encoder = new TextEncoder();
  const chunks = [new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 226, 227, 207, 211, 10])];
  const offsets = [0];
  let position = chunks[0].length;

  const append = value => {
    const chunk = typeof value === 'string' ? encoder.encode(value) : value;
    chunks.push(chunk);
    position += chunk instanceof Blob ? chunk.size : chunk.byteLength;
  };

  function writeObject(number, content, stream) {
    offsets[number] = position;
    append(`${number} 0 obj\n${content}`);
    if (stream != null) {
      append('\nstream\n');
      append(stream);
      append('\nendstream');
    }
    append('\nendobj\n');
  }

  const pageReferences = pages.map((_, index) => `${3 + index * 3} 0 R`).join(' ');
  writeObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  writeObject(2, `<< /Type /Pages /Count ${pages.length} /Kids [${pageReferences}] >>`);

  pages.forEach((page, index) => {
    const pageNumber = 3 + index * 3;
    const imageNumber = pageNumber + 1;
    const drawNumber = pageNumber + 2;
    const draw = `q\n${PAGE_WIDTH} 0 0 ${PAGE_HEIGHT} 0 0 cm\n/PageImage Do\nQ\n`;

    writeObject(pageNumber, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /XObject << /PageImage ${imageNumber} 0 R >> >> /Contents ${drawNumber} 0 R >>`);
    writeObject(imageNumber, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.size} >>`, page);
    writeObject(drawNumber, `<< /Length ${draw.length} >>`, draw);
  });

  const xref = position;
  append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach(offset => append(`${String(offset).padStart(10, '0')} 00000 n \n`));
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  return new Blob(chunks, { type: 'application/pdf' });
}

export async function buildPdf(report) {
  return packPdf(await renderPages(report));
}

export async function downloadPdf(report) {
  const blob = await buildPdf(report);
  const safeTitle = String(report.title ?? '').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim().replace(/\.+$/, '');
  const filename = Array.from(safeTitle).slice(0, 90).join('') || '多元學習成果';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
