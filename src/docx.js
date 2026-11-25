const DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const RELATIONSHIP_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PACKAGE_RELATIONSHIP_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const DEFAULT_ACCENT = '176755';
const A4_WIDTH = 11906;
const A4_HEIGHT = 16838;
const PAGE_MARGIN = 960;
const COLUMN_GAP = 460;
const TEXT_WIDTH = A4_WIDTH - 2 * PAGE_MARGIN;
const encoder = new TextEncoder();

function xml(text = '') {
  const symbols = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
  return String(text ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/[&<>"']/g, character => symbols[character]);
}

function inlineText(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

function paragraph(text, style, extra = '') {
  const properties = style ? `<w:pStyle w:val="${style}"/>${extra}` : extra;
  return `<w:p>${properties ? `<w:pPr>${properties}</w:pPr>` : ''}<w:r><w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`;
}

function textParagraphs(sections) {
  return sections.flatMap(section => {
    const text = String(section.text ?? '').trim();
    if (!text) return [];
    const heading = inlineText(section.heading);
    const paragraphs = text.split(/\r\n|\r|\n/).filter(line => line.trim());
    return [
      heading ? paragraph(heading, 'Heading1') : '',
      ...paragraphs.map(line => paragraph(line, 'BodyText'))
    ];
  }).join('');
}

function sectionProperties() {
  return `<w:sectPr><w:pgSz w:w="${A4_WIDTH}" w:h="${A4_HEIGHT}"/><w:pgMar w:top="${PAGE_MARGIN}" w:right="${PAGE_MARGIN}" w:bottom="${PAGE_MARGIN}" w:left="${PAGE_MARGIN}" w:header="450" w:footer="450" w:gutter="0"/></w:sectPr>`;
}

function table(columns) {
  const widths = [Math.floor(TEXT_WIDTH / 2), Math.ceil(TEXT_WIDTH / 2)];
  const margin = COLUMN_GAP / 2;
  const cell = (contents, index) => {
    const side = index === 0 ? 'right' : 'left';
    return `<w:tc><w:tcPr><w:tcW w:w="${widths[index]}" w:type="dxa"/><w:tcMar><w:${side} w:w="${margin}" w:type="dxa"/></w:tcMar><w:vAlign w:val="top"/></w:tcPr>${contents || '<w:p/>'}</w:tc>`;
  };
  return `<w:tbl><w:tblPr><w:tblW w:w="${TEXT_WIDTH}" w:type="dxa"/><w:tblBorders><w:insideV w:val="single" w:sz="5" w:color="DAE2DF"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map(width => `<w:gridCol w:w="${width}"/>`).join('')}</w:tblGrid><w:tr>${columns.map(cell).join('')}</w:tr></w:tbl>`;
}

function readPhoto(photo, index) {
  const match = /^data:image\/(png|jpe?g);base64,([a-z\d+/=\s]+)$/i.exec(photo.src ?? '');
  if (!match) throw new Error('照片格式須為 JPEG 或 PNG。');
  const extension = match[1].toLowerCase() === 'png' ? 'png' : 'jpeg';
  const data = Uint8Array.from(atob(match[2]), character => character.charCodeAt(0));
  const id = index + 1;
  const width = Number(photo.width);
  const height = Number(photo.height);
  return {
    ...photo,
    id,
    path: `media/photo-${id}.${extension}`,
    data,
    ratio: Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0 ? width / height : 4 / 3
  };
}

function photoParagraph(photo) {
  const maxWidth = Math.floor((TEXT_WIDTH / 2 - COLUMN_GAP / 2 - 80) * 635);
  const maxHeight = 2070000;
  const width = Math.max(1, Math.round(Math.min(maxWidth, maxHeight * photo.ratio)));
  const height = Math.max(1, Math.round(width / photo.ratio));
  const caption = String(photo.caption ?? '').trim();
  const description = xml(inlineText(caption) || `成果照片 ${photo.id}`);
  const attachment = `<w:p><w:pPr><w:pStyle w:val="Photo"/>${caption ? '<w:keepNext/>' : ''}</w:pPr><w:r><w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0">
      <wp:extent cx="${width}" cy="${height}"/>
      <wp:docPr id="${photo.id}" name="Photo ${photo.id}" descr="${description}"/>
      <wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>
      <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
        <pic:pic>
          <pic:nvPicPr><pic:cNvPr id="0" name="Photo ${photo.id}"/><pic:cNvPicPr/></pic:nvPicPr>
          <pic:blipFill><a:blip r:embed="rIdPhoto${photo.id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
          <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${width}" cy="${height}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
        </pic:pic>
      </a:graphicData></a:graphic>
    </wp:inline></w:drawing></w:r></w:p>`;
  const captions = caption.split(/\r\n|\r|\n/).filter(line => line.trim());
  return attachment + captions.map(line => paragraph(line, 'Caption')).join('');
}

function documentXml(report, photos) {
  const type = inlineText(report.typeLabel || report.type);
  const title = inlineText(report.title) || '多元學習成果';
  const school = inlineText(report.department);
  const name = inlineText(report.name);
  const date = inlineText(report.date);
  const metadata = [school, name, date].filter(Boolean).join('　·　');
  const header = (type ? paragraph(type, 'ReportType') : '') + paragraph(title, 'Title')
    + (metadata ? paragraph(metadata, 'ReportMeta') : '');
  const sections = (report.sections ?? []).filter(section => String(section.text ?? '').trim());
  let content = '';
  if (photos.length) {
    const photosLeft = report.layout === 'photo-first';
    const writtenWork = textParagraphs(sections);
    const photosMarkup = paragraph('成果照片', 'Heading1') + photos.map(photoParagraph).join('');
    content = table(photosLeft ? [photosMarkup, writtenWork] : [writtenWork, photosMarkup]);
  } else if (sections.length) {
    const midpoint = Math.ceil(sections.length / 2);
    content = table([textParagraphs(sections.slice(0, midpoint)), textParagraphs(sections.slice(midpoint))]);
  }
  return `${XML_HEADER}<w:document xmlns:w="${WORD_NS}" xmlns:r="${RELATIONSHIP_NS}"
    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
    xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
    xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
    <w:body>${header}${content}${sectionProperties()}</w:body></w:document>`;
}

function stylesXml(theme) {
  const color = String(theme?.accent ?? '').replace(/^#/, '');
  const accent = /^[0-9a-f]{6}$/i.test(color) ? color.toUpperCase() : DEFAULT_ACCENT;
  const style = (id, label, properties, font, other = '') =>
    `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${label}"/><w:basedOn w:val="Normal"/>${other}<w:pPr>${properties}</w:pPr><w:rPr>${font}</w:rPr></w:style>`;
  return `${XML_HEADER}<w:styles xmlns:w="${WORD_NS}">
    <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos" w:eastAsia="Microsoft JhengHei" w:cs="Aptos"/><w:color w:val="263436"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:lang w:val="zh-TW" w:eastAsia="zh-TW"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="150" w:line="340" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
    <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
    ${style('ReportType', 'Report Type', '<w:keepNext/><w:spacing w:after="85"/>', `<w:b/><w:color w:val="${accent}"/><w:sz w:val="20"/>`)}
    ${style('Title', 'Title', '<w:keepLines/><w:spacing w:before="20" w:after="180" w:line="270" w:lineRule="auto"/>', '<w:b/><w:color w:val="172D2A"/><w:sz w:val="46"/>', '<w:qFormat/>')}
    ${style('ReportMeta', 'Report Metadata', '<w:spacing w:after="305"/>', '<w:color w:val="536360"/><w:sz w:val="20"/>')}
    ${style('Heading1', 'heading 1', '<w:keepNext/><w:keepLines/><w:spacing w:before="115" w:after="80"/><w:outlineLvl w:val="0"/>', `<w:b/><w:color w:val="${accent}"/><w:sz w:val="27"/>`, '<w:next w:val="BodyText"/><w:qFormat/>')}
    ${style('BodyText', 'Body Text', '<w:widowControl/><w:spacing w:after="150" w:line="345" w:lineRule="auto"/>', '<w:sz w:val="23"/>', '<w:qFormat/>')}
    ${style('Photo', 'Photo', '<w:keepLines/><w:spacing w:before="130" w:after="65"/><w:jc w:val="center"/>', '')}
    ${style('Caption', 'Caption', '<w:keepLines/><w:spacing w:after="150"/><w:jc w:val="center"/>', '<w:color w:val="536360"/><w:sz w:val="20"/>')}
    </w:styles>`;
}

const CONTENT_TYPES = `${XML_HEADER}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  </Types>`;
const ROOT_RELATIONSHIPS = `${XML_HEADER}<Relationships xmlns="${PACKAGE_RELATIONSHIP_NS}">
  <Relationship Id="rId1" Type="${RELATIONSHIP_NS}/officeDocument" Target="word/document.xml"/></Relationships>`;

function wordRelationships(photos) {
  const attachments = photos.map(photo => `<Relationship Id="rIdPhoto${photo.id}" Type="${RELATIONSHIP_NS}/image" Target="${photo.path}"/>`).join('');
  return `${XML_HEADER}<Relationships xmlns="${PACKAGE_RELATIONSHIP_NS}"><Relationship Id="rIdStyles" Type="${RELATIONSHIP_NS}/styles" Target="styles.xml"/>${attachments}</Relationships>`;
}

const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) {
    crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
  }
  return crc;
});

function crc32(bytes) {
  let crc = 0xFFFFFFFF;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function zipBlob(entries) {
  const localParts = [];
  const centralParts = [];
  let localSize = 0;
  let centralSize = 0;
  for (const [path, contents] of entries) {
    const name = encoder.encode(path);
    const bytes = typeof contents === 'string' ? encoder.encode(contents) : contents;
    const checksum = crc32(bytes);
    const local = new Uint8Array(30);
    const localHeader = new DataView(local.buffer);
    localHeader.setUint32(0, 0x04034B50, true);
    localHeader.setUint16(4, 20, true);
    localHeader.setUint16(12, 33, true);
    localHeader.setUint32(14, checksum, true);
    localHeader.setUint32(18, bytes.length, true);
    localHeader.setUint32(22, bytes.length, true);
    localHeader.setUint16(26, name.length, true);
    localParts.push(local, name, bytes);

    const central = new Uint8Array(46);
    const centralHeader = new DataView(central.buffer);
    centralHeader.setUint32(0, 0x02014B50, true);
    centralHeader.setUint16(4, 20, true);
    centralHeader.setUint16(6, 20, true);
    centralHeader.setUint16(14, 33, true);
    centralHeader.setUint32(16, checksum, true);
    centralHeader.setUint32(20, bytes.length, true);
    centralHeader.setUint32(24, bytes.length, true);
    centralHeader.setUint16(28, name.length, true);
    centralHeader.setUint32(42, localSize, true);
    centralParts.push(central, name);
    localSize += local.length + name.length + bytes.length;
    centralSize += central.length + name.length;
  }

  const end = new Uint8Array(22);
  const endHeader = new DataView(end.buffer);
  endHeader.setUint32(0, 0x06054B50, true);
  endHeader.setUint16(8, entries.length, true);
  endHeader.setUint16(10, entries.length, true);
  endHeader.setUint32(12, centralSize, true);
  endHeader.setUint32(16, localSize, true);
  return new Blob([...localParts, ...centralParts, end], { type: DOCX_TYPE });
}

export function buildDocx(report) {
  const photos = (report.photos ?? []).map(readPhoto);
  return zipBlob([
    ['[Content_Types].xml', CONTENT_TYPES],
    ['_rels/.rels', ROOT_RELATIONSHIPS],
    ['word/document.xml', documentXml(report, photos)],
    ['word/styles.xml', stylesXml(report.theme)],
    ['word/_rels/document.xml.rels', wordRelationships(photos)],
    ...photos.map(photo => [`word/${photo.path}`, photo.data])
  ]);
}

export async function downloadDocx(report) {
  const blob = buildDocx(report);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = Array.from(inlineText(report.title).replace(/[<>:"/\\|?*]/g, '').replace(/^[. ]+|[. ]+$/g, '')).slice(0, 80).join('');
  link.download = `${filename || '多元學習成果'}.docx`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
