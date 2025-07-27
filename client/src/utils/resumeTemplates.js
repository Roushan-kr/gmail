export const generateModernResumePDF = async (resumeData) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = 30;

  // Colors
  const primaryColor = [52, 73, 94]; // Dark blue
  const secondaryColor = [149, 165, 166]; // Light gray
  const accentColor = [41, 128, 185]; // Blue

  // Header Section
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 70, 'F');

  // Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(resumeData.fullName || 'Your Name', margin, 35);

  // Contact Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const contactInfo = [resumeData.email, resumeData.phone, resumeData.address]
    .filter(Boolean)
    .join(' | ');
  doc.text(contactInfo, margin, 50);

  yPosition = 90;

  // Helper functions
  const addSectionHeader = (title) => {
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin, yPosition);

    // Underline
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1);
    doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);

    yPosition += 15;
  };

  const addContent = (content, isSubheading = false) => {
    if (!content) return;

    doc.setTextColor(60, 60, 60);

    if (isSubheading) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
    }

    const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);

    // Check if we need a new page
    if (yPosition + lines.length * 5 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    doc.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + (isSubheading ? 5 : 10);
  };

  // Professional Summary (if provided)
  if (resumeData.summary) {
    addSectionHeader('Professional Summary');
    addContent(resumeData.summary);
  }

  // Education
  if (resumeData.education) {
    addSectionHeader('Education');
    addContent(resumeData.education);
  }

  // Technical Skills
  if (resumeData.skills) {
    addSectionHeader('Technical Skills');
    addContent(resumeData.skills);
  }

  // Professional Experience
  if (resumeData.experience) {
    addSectionHeader('Professional Experience');
    addContent(resumeData.experience);
  }

  // Projects
  if (resumeData.projects) {
    addSectionHeader('Projects');
    addContent(resumeData.projects);
  }

  // Certifications
  if (resumeData.certifications) {
    addSectionHeader('Certifications');
    addContent(resumeData.certifications);
  }

  return doc;
};

export const generateMinimalResumePDF = async (resumeData) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const margin = 25;
  let yPosition = 40;

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(resumeData.fullName || 'Your Name', margin, yPosition);

  yPosition += 15;

  // Contact
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const contact = [resumeData.email, resumeData.phone, resumeData.address]
    .filter(Boolean)
    .join(' • ');
  doc.text(contact, margin, yPosition);

  yPosition += 25;

  const addSection = (title, content) => {
    if (!content) return;

    // Section title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(title, margin, yPosition);

    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(
      margin + doc.getTextWidth(title) + 5,
      yPosition - 2,
      185,
      yPosition - 2
    );

    yPosition += 10;

    // Content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(content, 160);
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + 15;
  };

  addSection('EDUCATION', resumeData.education);
  addSection('SKILLS', resumeData.skills);
  addSection('EXPERIENCE', resumeData.experience);
  addSection('PROJECTS', resumeData.projects);
  addSection('CERTIFICATIONS', resumeData.certifications);

  return doc;
};

export const generateCreativeResumePDF = async (resumeData) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 30;

  // Sidebar
  doc.setFillColor(52, 73, 94);
  doc.rect(0, 0, 70, doc.internal.pageSize.height, 'F');

  // Main content area
  doc.setFillColor(248, 249, 250);
  doc.rect(70, 0, pageWidth - 70, doc.internal.pageSize.height, 'F');

  // Name in sidebar
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const nameLines = doc.splitTextToSize(resumeData.fullName || 'Your Name', 60);
  doc.text(nameLines, 10, 40);

  // Contact in sidebar
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  yPosition = 60 + nameLines.length * 10;

  if (resumeData.email) {
    doc.text('EMAIL', 10, yPosition);
    yPosition += 8;
    doc.text(resumeData.email, 10, yPosition);
    yPosition += 15;
  }

  if (resumeData.phone) {
    doc.text('PHONE', 10, yPosition);
    yPosition += 8;
    doc.text(resumeData.phone, 10, yPosition);
    yPosition += 15;
  }

  // Skills in sidebar
  if (resumeData.skills) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SKILLS', 10, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const skillsLines = doc.splitTextToSize(resumeData.skills, 60);
    doc.text(skillsLines, 10, yPosition);
  }

  // Main content
  yPosition = 30;
  const mainX = 80;

  const addMainSection = (title, content) => {
    if (!content) return;

    doc.setTextColor(52, 73, 94);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, mainX, yPosition);
    yPosition += 15;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(content, 110);
    doc.text(lines, mainX, yPosition);
    yPosition += lines.length * 5 + 20;
  };

  addMainSection('EDUCATION', resumeData.education);
  addMainSection('EXPERIENCE', resumeData.experience);
  addMainSection('PROJECTS', resumeData.projects);
  addMainSection('CERTIFICATIONS', resumeData.certifications);

  return doc;
};

export const resumeTemplates = {
  modern: {
    name: 'Modern Professional',
    description: 'Clean design with blue header and professional formatting',
    generator: generateModernResumePDF,
  },
  minimal: {
    name: 'Minimal Clean',
    description: 'Simple, elegant design focusing on content',
    generator: generateMinimalResumePDF,
  },
  creative: {
    name: 'Creative Sidebar',
    description: 'Two-column layout with sidebar for contact and skills',
    generator: generateCreativeResumePDF,
  },
};
