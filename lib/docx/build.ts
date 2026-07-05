import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { TailoredResume } from '../../types/tailored';

export async function buildDocx(r: TailoredResume): Promise<Buffer> {
  const children: any[] = [];

  // Name (centered, bold, 16pt / 32 size)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: r.name,
          bold: true,
          size: 32,
        }),
      ],
    })
  );

  // Contact line (centered, 10pt / 20 size)
  const contactParts: string[] = [];
  if (r.contact.email) contactParts.push(r.contact.email);
  if (r.contact.phone) contactParts.push(r.contact.phone);
  if (r.contact.github) contactParts.push(`github.com/${r.contact.github}`);
  if (r.contact.linkedin) contactParts.push(`linkedin.com/in/${r.contact.linkedin}`);
  if (r.contact.website) contactParts.push(r.contact.website);
  if (r.contact.location) contactParts.push(r.contact.location);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: contactParts.join(' | '),
            size: 20,
            color: '555555',
          }),
        ],
      })
    );
  }

  // Section heading generator (12pt / 24 size, bold, spaced)
  const addSectionHeader = (title: string) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 24,
            color: '111111',
          }),
        ],
      })
    );
  };

  // Summary section
  if (r.summary) {
    addSectionHeader('Summary');
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: r.summary,
            size: 22,
          }),
        ],
      })
    );
  }

  // Skills section
  if (r.skills && r.skills.length > 0) {
    addSectionHeader('Skills');
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: r.skills.join(', '),
            size: 22,
          }),
        ],
      })
    );
  }

  // Education section
  if (r.education && r.education.length > 0) {
    addSectionHeader('Education');
    for (const edu of r.education) {
      let eduText = `${edu.degree} - ${edu.school}`;
      if (edu.dates) {
        eduText += ` (${edu.dates})`;
      }
      children.push(
        new Paragraph({
          spacing: { before: 50, after: 50 },
          children: [
            new TextRun({
              text: eduText,
              bold: true,
              size: 22,
            }),
          ],
        })
      );
      if (edu.details) {
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: edu.details,
                size: 22,
              }),
            ],
          })
        );
      }
    }
  }

  // Experience section
  if (r.experience && r.experience.length > 0) {
    addSectionHeader('Experience');
    for (const exp of r.experience) {
      let expHeader = `${exp.title} at ${exp.company}`;
      if (exp.dates) {
        expHeader += ` (${exp.dates})`;
      }
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 50 },
          children: [
            new TextRun({
              text: expHeader,
              bold: true,
              size: 22,
            }),
          ],
        })
      );

      for (const bullet of exp.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 50 },
            children: [
              new TextRun({
                text: bullet,
                size: 22,
              }),
            ],
          })
        );
      }
    }
  }

  // Projects section
  if (r.projects && r.projects.length > 0) {
    addSectionHeader('Projects');
    for (const proj of r.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 50 },
          children: [
            new TextRun({
              text: proj.title,
              bold: true,
              size: 22,
            }),
          ],
        })
      );

      for (const bullet of proj.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 50 },
            children: [
              new TextRun({
                text: bullet,
                size: 22,
              }),
            ],
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
