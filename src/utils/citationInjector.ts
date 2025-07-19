
interface Citation {
  name: string;
  url: string;
  type?: string;
}

export const injectCitationsIntoContent = (content: string, citations: Citation[]): string => {
  if (!citations || citations.length === 0 || !content) {
    return content;
  }

  console.log('🔗 Injecting citations into content:', {
    contentLength: content.length,
    citationsCount: citations.length
  });

  // Split content into paragraphs for better citation placement
  const paragraphs = content.split('\n\n');
  const totalParagraphs = paragraphs.length;
  
  // Calculate how many citations per paragraph (distribute evenly)
  const citationsPerParagraph = Math.ceil(citations.length / Math.max(totalParagraphs, 1));
  
  let citationIndex = 0;
  const processedParagraphs = paragraphs.map((paragraph, paragraphIndex) => {
    if (!paragraph.trim() || citationIndex >= citations.length) {
      return paragraph;
    }

    // For each paragraph, add citations at the end
    const citationsToAdd = Math.min(
      citationsPerParagraph,
      citations.length - citationIndex
    );

    if (citationsToAdd > 0) {
      const citationNumbers = [];
      for (let i = 0; i < citationsToAdd; i++) {
        citationNumbers.push(`[${citationIndex + 1}]`);
        citationIndex++;
      }
      
      // Add citations at the end of the paragraph
      return `${paragraph} ${citationNumbers.join(' ')}`;
    }

    return paragraph;
  });

  // If we still have remaining citations, add them to the last paragraph
  if (citationIndex < citations.length) {
    const remainingCitations = [];
    for (let i = citationIndex; i < citations.length; i++) {
      remainingCitations.push(`[${i + 1}]`);
    }
    
    if (processedParagraphs.length > 0) {
      const lastIndex = processedParagraphs.length - 1;
      processedParagraphs[lastIndex] += ` ${remainingCitations.join(' ')}`;
    }
  }

  const result = processedParagraphs.join('\n\n');
  
  console.log('🔗 Citations injected successfully:', {
    originalLength: content.length,
    processedLength: result.length,
    citationsAdded: citations.length
  });

  return result;
};
