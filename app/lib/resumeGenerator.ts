import jsPDF from 'jspdf';

export interface OptimizedResumeData {
  optimizedContent: string;
  originalName: string;
}

// Helper function to strip markdown formatting
const stripMarkdown = (text: string): string => {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links [text](url) -> text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text** -> text
    .replace(/\*(.*?)\*/g, '$1') // Remove italic *text* -> text
    .replace(/#{1,6}\s/g, '') // Remove # headers
    .replace(/`([^`]+)`/g, '$1') // Remove code blocks
    .trim();
};

export const generateResumePDF = async (data: OptimizedResumeData): Promise<void> => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const lines = data.optimizedContent.split('\n');

    for (const line of lines) {
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }

      const trimmedLine = line.trim();

      // Skip unwanted lines
      if (trimmedLine.includes('OPTIMIZED RESUME') ||
        trimmedLine.includes('Optimized for:') ||
        trimmedLine.startsWith('Page ') ||
        trimmedLine.match(/^\d+ of \d+$/)) {
        continue;
      }

      // Handle headers starting with #
      if (trimmedLine.startsWith('#')) {
        const headerText = stripMarkdown(trimmedLine);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        yPosition += 4;
        doc.text(headerText, margin, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        continue;
      }

      // Handle lines with • bullet character (from Claude output)
      if (trimmedLine.includes('•')) {
        // Check if it's a job title/company line (has • between position and company)
        if (trimmedLine.match(/^[^•]+•[^•]+\|/)) {
          const cleanLine = stripMarkdown(trimmedLine.replace(/•/g, ''));
          doc.setFont('helvetica', 'bold');
          doc.text(cleanLine, margin, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          continue;
        }
        // Regular bullet point starting with •
        else if (trimmedLine.startsWith('•')) {
          const bulletText = stripMarkdown(trimmedLine.replace(/^[\s]*•\s*/, ''));
          const wrappedText = doc.splitTextToSize('• ' + bulletText, maxWidth - 5);
          doc.text(wrappedText, margin + 3, yPosition);
          yPosition += (wrappedText.length * 4.5) + 1;
          continue;
        }
      }

      // Handle bold text with **
      if (trimmedLine.includes('**')) {
        const cleanLine = stripMarkdown(trimmedLine);
        doc.setFont('helvetica', 'bold');
        doc.text(cleanLine, margin, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        continue;
      }

      // Handle bullet points (markdown style)
      if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
        const bulletText = stripMarkdown(trimmedLine.replace(/^[\s]*[*\-]\s*/, ''));
        const wrappedText = doc.splitTextToSize('• ' + bulletText, maxWidth - 5);
        doc.text(wrappedText, margin + 3, yPosition);
        yPosition += (wrappedText.length * 4.5) + 1;
        continue;
      }

      // Empty lines
      if (!trimmedLine) {
        yPosition += 2;
        continue;
      }

      // Regular text
      const cleanText = stripMarkdown(trimmedLine);
      const wrappedText = doc.splitTextToSize(cleanText, maxWidth);
      doc.text(wrappedText, margin, yPosition);
      yPosition += (wrappedText.length * 4.5) + 1;
    }

    const fileName = data.originalName.replace(/\.[^/.]+$/, '') + '_optimized.pdf';
    doc.save(fileName);

  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error}`);
  }
};

// Professional styled resume PDF
export const generateStyledResumePDF = async (
  optimizedContent: string,
  originalName: string,
  metadata?: {
    jobTitle?: string;
    companyName?: string;
  }
): Promise<void> => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const lines = optimizedContent.split('\n');
    let personName = '';
    let inContactSection = false;

    for (const line of lines) {
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }

      const trimmedLine = line.trim();

      // Skip unwanted lines
      if (trimmedLine.includes('OPTIMIZED RESUME') ||
        trimmedLine.includes('Optimized for:') ||
        trimmedLine.startsWith('Page ') ||
        trimmedLine.match(/^\d+ of \d+$/)) {
        continue;
      }

      // Detect name (first line with # or uppercase text)
      if (!personName && trimmedLine.startsWith('#')) {
        personName = stripMarkdown(trimmedLine);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(personName, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;
        inContactSection = true;
        continue;
      }

      // Handle contact info line (contains | or multiple contacts)
      if (inContactSection && (trimmedLine.includes('|') || trimmedLine.includes('@') || trimmedLine.includes('+'))) {
        const cleanContact = stripMarkdown(trimmedLine);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(cleanContact, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 4;
        continue;
      }

      // Section headers (##, or lines ending with specific keywords)
      if (trimmedLine.match(/^#{1,6}\s/) ||
        ['EXPERIENCE', 'EDUCATION', 'SKILLS', 'SUMMARY', 'PROJECTS', 'ACHIEVEMENTS'].some(keyword =>
          trimmedLine.toUpperCase().includes(keyword) && trimmedLine.length < 50
        )) {
        inContactSection = false;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0, 51, 102);

        yPosition += 3;
        const headerText = stripMarkdown(trimmedLine);
        doc.text(headerText.toUpperCase(), margin, yPosition);
        yPosition += 5;

        // Underline
        doc.setDrawColor(0, 51, 102);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
        yPosition += 1;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        continue;
      }

      // Handle lines with • bullet character
      if (trimmedLine.includes('•')) {
        // Check if it's job title/company line (has • between items)
        if (trimmedLine.match(/^[^•]+•[^•]+\|/)) {
          const cleanLine = stripMarkdown(trimmedLine.replace(/•/g, ''));
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.text(cleanLine, margin, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          continue;
        }
        // Regular bullet starting with •
        else if (trimmedLine.startsWith('•')) {
          inContactSection = false;
          const bulletText = stripMarkdown(trimmedLine.replace(/^[\s]*•\s*/, ''));
          const wrappedText = doc.splitTextToSize('• ' + bulletText, maxWidth - 5);
          doc.setFontSize(9.5);
          doc.text(wrappedText, margin + 4, yPosition);
          yPosition += (wrappedText.length * 4) + 1;
          doc.setFontSize(10);
          continue;
        }
      }

      // Bold lines (job titles, etc. - lines with **)
      if (trimmedLine.includes('**')) {
        inContactSection = false;
        const cleanLine = stripMarkdown(trimmedLine);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(cleanLine, margin, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        continue;
      }

      // Bullet points (markdown style)
      if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
        inContactSection = false;
        const bulletText = stripMarkdown(trimmedLine.replace(/^[\s]*[*\-]\s*/, ''));
        const wrappedText = doc.splitTextToSize('• ' + bulletText, maxWidth - 5);
        doc.setFontSize(9.5);
        doc.text(wrappedText, margin + 4, yPosition);
        yPosition += (wrappedText.length * 4) + 1;
        doc.setFontSize(10);
        continue;
      }

      // Empty lines
      if (!trimmedLine) {
        inContactSection = false;
        yPosition += 2;
        continue;
      }

      // Regular text
      inContactSection = false;
      const cleanText = stripMarkdown(trimmedLine);
      const wrappedText = doc.splitTextToSize(cleanText, maxWidth);
      doc.text(wrappedText, margin, yPosition);
      yPosition += (wrappedText.length * 4.5) + 1;
    }

    const fileName = originalName.replace(/\.[^/.]+$/, '') + '_optimized.pdf';
    doc.save(fileName);

  } catch (error) {
    throw new Error(`Failed to generate styled PDF: ${error}`);
  }
};