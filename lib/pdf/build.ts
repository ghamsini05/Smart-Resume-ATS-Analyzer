import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { TailoredResume } from '../../types/tailored';
import { toLatin1Safe } from '../text/sanitize';

export async function buildPdf(r: TailoredResume): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 54;
  const pageWidth = 612;
  const pageHeight = 792;
  const contentWidth = pageWidth - 2 * margin;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Custom text wrapping with word boundary checking and hard-breaks for overly wide tokens
  function wrapText(text: string, fontObj: any, fontSize: number, maxWidth: number): string[] {
    const paragraphs = text.split('\n');
    const lines: string[] = [];

    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        lines.push('');
        continue;
      }

      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = fontObj.widthOfTextAtSize(testLine, fontSize);

        if (width > maxWidth) {
          // If the word alone is wider than the line width, hard break it
          if (fontObj.widthOfTextAtSize(word, fontSize) > maxWidth) {
            let currentPart = '';
            for (let i = 0; i < word.length; i++) {
              const char = word[i];
              const testPart = currentPart + char;
              if (fontObj.widthOfTextAtSize(testPart, fontSize) > maxWidth) {
                if (currentLine) {
                  lines.push(currentLine);
                  currentLine = '';
                }
                lines.push(currentPart);
                currentPart = char;
              } else {
                currentPart = testPart;
              }
            }
            if (currentPart) {
              currentLine = currentPart;
            }
          } else {
            if (currentLine) {
              lines.push(currentLine);
            }
            currentLine = word;
          }
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }
    return lines;
  }

  // Draw line utility supporting page splits
  const drawLine = (text: string, fontObj: any, fontSize: number, options: { align?: 'center' | 'left'; leading?: number } = {}) => {
    const leading = options.leading ?? (fontSize * 1.25);
    if (currentY - leading < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
    }

    const safeText = toLatin1Safe(text);
    const x = options.align === 'center'
      ? margin + (contentWidth - fontObj.widthOfTextAtSize(safeText, fontSize)) / 2
      : margin;

    currentPage.drawText(safeText, {
      x,
      y: currentY - fontSize,
      size: fontSize,
      font: fontObj,
      color: rgb(0.1, 0.1, 0.1)
    });

    currentY -= leading;
  };

  // Draw paragraph utility
  const drawParagraph = (text: string, fontObj: any, fontSize: number, options: { align?: 'center' | 'left'; leading?: number; spaceAfter?: number } = {}) => {
    const safeText = toLatin1Safe(text);
    const wrapped = wrapText(safeText, fontObj, fontSize, contentWidth);
    for (const line of wrapped) {
      drawLine(line, fontObj, fontSize, { align: options.align, leading: options.leading });
    }
    if (options.spaceAfter) {
      currentY -= options.spaceAfter;
    }
  };

  // Draw bullets with indentation support
  const drawBullet = (bullet: string, fontObj: any, fontSize: number, options: { spaceAfter?: number } = {}) => {
    const safeBullet = toLatin1Safe(bullet);
    const indent = 15;
    const wrapped = wrapText(safeBullet, fontObj, fontSize, contentWidth - indent);
    const leading = fontSize * 1.25;

    if (currentY - leading < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
    }

    currentPage.drawText('-', {
      x: margin,
      y: currentY - fontSize,
      size: fontSize,
      font: fontObj,
      color: rgb(0.1, 0.1, 0.1)
    });

    for (const line of wrapped) {
      if (currentY - leading < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }

      currentPage.drawText(line, {
        x: margin + indent,
        y: currentY - fontSize,
        size: fontSize,
        font: fontObj,
        color: rgb(0.1, 0.1, 0.1)
      });

      currentY -= leading;
    }

    if (options.spaceAfter) {
      currentY -= options.spaceAfter;
    }
  };

  // Section divider layout
  const drawSectionHeader = (title: string) => {
    currentY -= 8;
    drawLine(title.toUpperCase(), fontBold, 11, { leading: 15 });
    
    if (currentY - 4 < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
    }

    currentPage.drawLine({
      start: { x: margin, y: currentY },
      end: { x: pageWidth - margin, y: currentY },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7)
    });
    currentY -= 8;
  };

  // 1. Draw Name Header
  drawLine(r.name, fontBold, 18, { align: 'center', leading: 22 });

  // 2. Draw Contact Info Bar
  const contactParts: string[] = [];
  if (r.contact.email) contactParts.push(r.contact.email);
  if (r.contact.phone) contactParts.push(r.contact.phone);
  if (r.contact.github) contactParts.push(`github.com/${r.contact.github}`);
  if (r.contact.linkedin) contactParts.push(`linkedin.com/in/${r.contact.linkedin}`);
  if (r.contact.website) contactParts.push(r.contact.website);
  if (r.contact.location) contactParts.push(r.contact.location);

  if (contactParts.length > 0) {
    drawLine(contactParts.join(' | '), font, 9, { align: 'center', leading: 14 });
  }
  currentY -= 10;

  // 3. Draw Summary
  if (r.summary) {
    drawSectionHeader('Summary');
    drawParagraph(r.summary, font, 10, { spaceAfter: 6 });
  }

  // 4. Draw Skills
  if (r.skills && r.skills.length > 0) {
    drawSectionHeader('Skills');
    drawParagraph(r.skills.join(', '), font, 10, { spaceAfter: 6 });
  }

  // 5. Draw Education
  if (r.education && r.education.length > 0) {
    drawSectionHeader('Education');
    for (const edu of r.education) {
      let eduHeader = `${edu.degree} - ${edu.school}`;
      if (edu.dates) {
        eduHeader += ` (${edu.dates})`;
      }
      drawLine(eduHeader, fontBold, 10, { leading: 14 });
      if (edu.details) {
        drawParagraph(edu.details, font, 10, { spaceAfter: 4 });
      }
      currentY -= 4;
    }
  }

  // 6. Draw Experience
  if (r.experience && r.experience.length > 0) {
    drawSectionHeader('Experience');
    for (const exp of r.experience) {
      let expHeader = `${exp.title} at ${exp.company}`;
      if (exp.dates) {
        expHeader += ` (${exp.dates})`;
      }
      drawLine(expHeader, fontBold, 10, { leading: 14 });
      for (const bullet of exp.bullets) {
        drawBullet(bullet, font, 10, { spaceAfter: 2 });
      }
      currentY -= 4;
    }
  }

  // 7. Draw Projects
  if (r.projects && r.projects.length > 0) {
    drawSectionHeader('Projects');
    for (const proj of r.projects) {
      drawLine(proj.title, fontBold, 10, { leading: 14 });
      for (const bullet of proj.bullets) {
        drawBullet(bullet, font, 10, { spaceAfter: 2 });
      }
      currentY -= 4;
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
