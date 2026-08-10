import { jsPDF } from 'jspdf';

interface StudyNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ComparisonMetrics {
  jaccardWord: number;
  jaccardBigram: number;
  jaccardTrigram: number;
  cosineSimilarity: number;
  diceSorensen: number;
  overlapCoefficient: number;
  commonWords: string[];
  uniqueText1: string[];
  uniqueText2: string[];
  commonBigrams: string[];
  commonTrigrams: string[];
  lengthRatio: number;
  vocabularyOverlap: number;
}

export function exportStudyNotesToPdf(notes: StudyNote[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(210, 119, 6); // Primary color
  doc.text('Yajurveda Study Notes', margin, yPosition);
  yPosition += 15;

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Exported on ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 20;

  // Notes
  doc.setTextColor(30);
  notes.forEach((note, index) => {
    // Check if we need a new page
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    // Note title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${note.title}`, margin, yPosition);
    yPosition += 8;

    // Note date
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;

    // Note content
    doc.setFontSize(11);
    doc.setTextColor(30);
    const splitContent = doc.splitTextToSize(note.content, pageWidth - margin * 2);
    splitContent.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });

    yPosition += 10;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | Yajurveda Explorer`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );
  }

  doc.save('yajurveda-study-notes.pdf');
}

export function exportComparisonToPdf(
  text1: string,
  text2: string,
  metrics: ComparisonMetrics
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(210, 119, 6);
  doc.text('Text Comparison Report', margin, yPosition);
  yPosition += 15;

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 20;

  // Similarity Scores Section
  doc.setFontSize(16);
  doc.setTextColor(30);
  doc.setFont('helvetica', 'bold');
  doc.text('Similarity Scores', margin, yPosition);
  yPosition += 12;

  const scores = [
    { label: 'Cosine Similarity', value: metrics.cosineSimilarity },
    { label: 'Jaccard (Words)', value: metrics.jaccardWord },
    { label: 'Jaccard (Bi-grams)', value: metrics.jaccardBigram },
    { label: 'Jaccard (Tri-grams)', value: metrics.jaccardTrigram },
    { label: 'Dice-Sørensen', value: metrics.diceSorensen },
    { label: 'Overlap Coefficient', value: metrics.overlapCoefficient },
    { label: 'Length Ratio', value: metrics.lengthRatio },
    { label: 'Vocabulary Overlap', value: metrics.vocabularyOverlap },
  ];

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  scores.forEach((score) => {
    doc.text(`${score.label}: ${(score.value * 100).toFixed(1)}%`, margin, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Common Words
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Common Words (${metrics.commonWords.length})`, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const commonWordsText = metrics.commonWords.join(', ');
  const splitCommon = doc.splitTextToSize(commonWordsText, pageWidth - margin * 2);
  splitCommon.forEach((line: string) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Unique to Text 1
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Unique to Text 1 (${metrics.uniqueText1.length})`, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const uniqueText1Str = metrics.uniqueText1.join(', ');
  const splitUnique1 = doc.splitTextToSize(uniqueText1Str, pageWidth - margin * 2);
  splitUnique1.forEach((line: string) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Unique to Text 2
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Unique to Text 2 (${metrics.uniqueText2.length})`, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const uniqueText2Str = metrics.uniqueText2.join(', ');
  const splitUnique2 = doc.splitTextToSize(uniqueText2Str, pageWidth - margin * 2);
  splitUnique2.forEach((line: string) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, margin, yPosition);
    yPosition += 6;
  });

  // Add text excerpts on new page
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Text 1 (Excerpt)', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const text1Excerpt = text1.substring(0, 500) + (text1.length > 500 ? '...' : '');
  const splitText1 = doc.splitTextToSize(text1Excerpt, pageWidth - margin * 2);
  splitText1.forEach((line: string) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 15;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Text 2 (Excerpt)', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const text2Excerpt = text2.substring(0, 500) + (text2.length > 500 ? '...' : '');
  const splitText2 = doc.splitTextToSize(text2Excerpt, pageWidth - margin * 2);
  splitText2.forEach((line: string) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, margin, yPosition);
    yPosition += 6;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | Yajurveda Explorer - Text Comparison`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );
  }

  doc.save('yajurveda-comparison-report.pdf');
}
