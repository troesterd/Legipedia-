import React, { useState, useEffect } from 'react';
import { Search, Book, History, Columns, Menu, ChevronDown, ChevronRight, Home, Globe, Building, MapPin, FileText, AlignJustify, ArrowLeft, ArrowRight } from 'lucide-react';

// Hauptkomponente
const LegiPedia = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLaw, setSelectedLaw] = useState("");
  const [selectedParagraph, setSelectedParagraph] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [historicalDate, setHistoricalDate] = useState(null);
  const [synopticView, setSynopticView] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("paragraph"); // "paragraph" or "fulltext"
  const [contentCache, setContentCache] = useState({});

  // Laden der Gesetzesdaten aus der JSON-Datei
  useEffect(() => {
    const fetchLaws = async () => {
      try {
        const response = await fetch('/data/laws.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data.categories || []);
        
        if (data.categories && data.categories.length > 0) {
          // Sortiere Kategorien nach Order
          const sortedCategories = [...data.categories].sort((a, b) => a.order - b.order);
          const firstCategory = sortedCategories[0];
          setSelectedCategory(firstCategory.id);
          
          if (firstCategory.laws && firstCategory.laws.length > 0) {
            const firstLaw = firstCategory.laws[0];
            setSelectedLaw(firstLaw.id);
            
            // Setze den ersten Paragraphen/Artikel als Standard
            const firstParagraph = getDefaultParagraphForLaw(firstLaw);
            setSelectedParagraph(firstParagraph);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Fehler beim Laden der Gesetzesdaten:", error);
        setError("Daten konnten nicht geladen werden: " + error.message);
        setLoading(false);
      }
    };
    
    fetchLaws();
  }, []);

  // Prüfen der Bildschirmgröße
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setNavigationOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hilfsfunktionen zum Abrufen von Daten
  const getSelectedCategory = () => {
    return categories.find(c => c.id === selectedCategory);
  };

  const getSelectedLaw = () => {
    const category = getSelectedCategory();
    return category?.laws.find(l => l.id === selectedLaw);
  };

  // Hilfsfunktion für den Standard-Paragraphen eines Gesetzes
  const getDefaultParagraphForLaw = (law) => {
    if (!law) return "";
    
    if (law.structure === "books") {
      for (const book of law.books || []) {
        for (const section of book.sections || []) {
          for (const title of section.titles || []) {
            if (title.paragraphs?.length > 0) {
              return title.paragraphs[0].number;
            }
          }
        }
      }
    } else if (law.structure === "parts") {
      for (const part of law.parts || []) {
        for (const chapter of part.chapters || []) {
          if (chapter.paragraphs?.length > 0) {
            return chapter.paragraphs[0].number;
          }
        }
      }
    } else if (law.structure === "articles") {
      for (const article of law.articles || []) {
        if (article.items?.length > 0) {
          return article.items[0].number;
        }
      }
    } else if (law.structure === "paragraphs") {
      for (const section of law.paragraphs || []) {
        if (section.items?.length > 0) {
          return section.items[0].number;
        }
      }
    }
    return "";
  };

  // Helper function to fetch content from external file
  const fetchContentFromFile = async (contentFile) => {
    if (!contentFile) return null;
    
    // Check if content is already in cache
    if (contentCache[contentFile]) {
      return contentCache[contentFile];
    }
    
    try {
      const response = await fetch(`/data/${contentFile}`);
      if (!response.ok) {
        throw new Error(`Failed to load content file: ${contentFile}`);
      }
      
      const data = await response.json();
      
      // Store in cache
      setContentCache(prevCache => ({
        ...prevCache,
        [contentFile]: data
      }));
      
      return data;
    } catch (error) {
      console.error("Error loading content file:", error);
      return null;
    }
  };

  // Modified findParagraph to load content from external file if needed
  const findParagraph = async (law, paragraphNumber) => {
    if (!law) return null;
    
    // Spezialbehandlung für Präambel
    if (paragraphNumber === "praeambel" && (law.praeambel || law.praeambelFile)) {
      if (law.praeambelFile) {
        const content = await fetchContentFromFile(law.praeambelFile);
        return {
          number: "praeambel",
          title: "Präambel",
          content: content?.content || []
        };
      } else {
        return {
          number: "praeambel",
          title: "Präambel",
          content: [
            {
              number: "",
              text: law.praeambel,
              sentences: law.praeambel.split(/\.\s+/).filter(s => s.trim()).map(s => s + ".")
            }
          ]
        };
      }
    }

    // Find the paragraph metadata first
    let paragraphMeta = null;
    
    if (law.structure === "books") {
      for (const book of law.books || []) {
        for (const section of book.sections || []) {
          for (const title of section.titles || []) {
            for (const paragraph of title.paragraphs || []) {
              if (paragraph.number === paragraphNumber) {
                paragraphMeta = paragraph;
                break;
              }
            }
          }
        }
      }
    } else if (law.structure === "parts") {
      for (const part of law.parts || []) {
        for (const chapter of part.chapters || []) {
          for (const paragraph of chapter.paragraphs || []) {
            if (paragraph.number === paragraphNumber) {
              paragraphMeta = paragraph;
              break;
            }
          }
        }
      }
    } else if (law.structure === "articles") {
      for (const article of law.articles || []) {
        for (const item of article.items || []) {
          if (item.number === paragraphNumber) {
            paragraphMeta = item;
            break;
          }
        }
      }
    } else if (law.structure === "paragraphs") {
      for (const section of law.paragraphs || []) {
        for (const item of section.items || []) {
          if (item.number === paragraphNumber) {
            paragraphMeta = item;
            break;
          }
        }
      }
    }
    
    if (!paragraphMeta) return null;
    
    // Create a deep copy to avoid modifying the original
    const paragraph = JSON.parse(JSON.stringify(paragraphMeta));
    
    // Load the content if it's specified by file
    if (paragraph.contentFile) {
      paragraph.content = await fetchContentFromFile(paragraph.contentFile);
    }
    
    return paragraph;
  };

  const currentLaw = getSelectedLaw();
  const [paragraphContent, setParagraphContent] = useState(null);

  // Effect to load paragraph content when paragraph changes
  useEffect(() => {
    const loadParagraphContent = async () => {
      if (!currentLaw || !selectedParagraph) return;
      
      const paragraph = await findParagraph(currentLaw, selectedParagraph);
      setParagraphContent(paragraph);
    };
    
    loadParagraphContent();
  }, [currentLaw, selectedParagraph]);

  // Funktion um den nächsten oder vorherigen Paragraphen zu finden
  const findAdjacentParagraph = (direction) => {
    if (!currentLaw) return null;
    
    let allParagraphs = [];
    
    // Sammle alle Paragraphen/Artikel basierend auf der Struktur
    if (currentLaw.structure === "books") {
      for (const book of currentLaw.books || []) {
        for (const section of book.sections || []) {
          for (const title of section.titles || []) {
            allParagraphs = [...allParagraphs, ...title.paragraphs];
          }
        }
      }
    } else if (currentLaw.structure === "parts") {
      for (const part of currentLaw.parts || []) {
        for (const chapter of part.chapters || []) {
          allParagraphs = [...allParagraphs, ...chapter.paragraphs];
        }
      }
    } else if (currentLaw.structure === "articles") {
      for (const article of currentLaw.articles || []) {
        allParagraphs = [...allParagraphs, ...article.items];
      }
    } else if (currentLaw.structure === "paragraphs") {
      for (const section of currentLaw.paragraphs || []) {
        allParagraphs = [...allParagraphs, ...section.items];
      }
    }
    
    // Finde den aktuellen Index
    const currentIndex = allParagraphs.findIndex(p => p.number === selectedParagraph);
    if (currentIndex === -1) return null;
    
    // Berechne den neuen Index
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1;
      if (newIndex >= allParagraphs.length) {
        // Optional: Zum ersten Paragraphen zurückkehren
        newIndex = 0;
      }
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        // Optional: Zum letzten Paragraphen gehen
        newIndex = allParagraphs.length - 1;
      }
    }
    
    return allParagraphs[newIndex];
  };

  // Navigation zum nächsten oder vorherigen Paragraphen
  const navigateToParagraph = (direction) => {
    const adjacentParagraph = findAdjacentParagraph(direction);
    if (adjacentParagraph) {
      setSelectedParagraph(adjacentParagraph.number);
    }
  };

  // Kategorie-Icon basierend auf der Kategorie-ID
  const getCategoryIcon = (categoryId) => {
    switch(categoryId) {
      case 'eu':
        return <Globe className="h-5 w-5" />;
      case 'federal':
        return <Book className="h-5 w-5" />;
      case 'state':
        return <Building className="h-5 w-5" />;
      case 'municipal':
        return <MapPin className="h-5 w-5" />;
      default:
        return <Book className="h-5 w-5" />;
    }
  };

  // Rendere die Navigationsleiste basierend auf der Struktur des Gesetzes
  const renderNavigation = () => {
    if (!currentLaw) return null;

    return (
      <div className="p-4 h-full overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">{currentLaw.title} ({currentLaw.abbreviation})</h2>
        
        {/* Präambel anzeigen wenn vorhanden */}
        {currentLaw.praeambel && (
          <div className="mb-4">
            <div 
              className={`ml-1 text-sm p-1 rounded cursor-pointer ${selectedParagraph === "praeambel" ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedParagraph("praeambel")}
            >
              Präambel
            </div>
          </div>
        )}
        
        {currentLaw.structure === "books" && currentLaw.books?.map((book, bookIndex) => (
          <div key={bookIndex} className="mb-2">
            <div className="flex items-center text-sm font-medium hover:bg-gray-100 p-1 rounded">
              <ChevronRight className="h-4 w-4 mr-1" />
              {book.title}
            </div>
            {book.sections?.map((section, sectionIndex) => (
              <div key={sectionIndex} className="ml-4 mb-1">
                <div className="flex items-center text-sm hover:bg-gray-100 p-1 rounded">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  {section.title}
                </div>
                {section.titles?.map((title, titleIndex) => (
                  <div key={titleIndex} className="ml-4">
                    <div className="flex items-center text-sm hover:bg-gray-100 p-1 rounded">
                      <ChevronRight className="h-4 w-4 mr-1" />
                      {title.title}
                    </div>
                    {title.paragraphs?.map((para) => (
                      <div
                        key={para.number}
                        className={`ml-6 text-sm p-1 rounded cursor-pointer ${selectedParagraph === para.number ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}
                        onClick={() => setSelectedParagraph(para.number)}
                      >
                        § {para.number} {para.title}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
        
        {currentLaw.structure === "parts" && currentLaw.parts?.map((part, partIndex) => (
          <div key={partIndex} className="mb-2">
            <div className="flex items-center text-sm font-medium hover:bg-gray-100 p-1 rounded">
              <ChevronRight className="h-4 w-4 mr-1" />
              {part.title}
            </div>
            {part.chapters?.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="ml-4">
                <div className="flex items-center text-sm hover:bg-gray-100 p-1 rounded">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  {chapter.title}
                </div>
                {chapter.paragraphs?.map((para) => (
                  <div
                    key={para.number}
                    className={`ml-6 text-sm p-1 rounded cursor-pointer ${selectedParagraph === para.number ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedParagraph(para.number)}
                  >
                    § {para.number} {para.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
        
        {currentLaw.structure === "articles" && currentLaw.articles?.map((article, articleIndex) => (
          <div key={articleIndex} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{article.title}</h2>
            
            {article.items?.map((item) => (
              <div key={item.number} className="mb-6 ml-4" id={`art-${item.number}`}>
                <h3 className="font-medium mb-2">Art. {item.number} {item.title}</h3>
                <div className="paragraph-content">
                  {item.content.map((contentItem, index) => (
                    <div key={index} className="mb-4">
                      {contentItem.number && (
                        <p className="mb-1">
                          <span className="paragraph-number mr-2">({contentItem.number})</span>
                          <span className="law-text">{contentItem.text}</span>
                        </p>
                      )}
                      {!contentItem.number && (
                        <p className="mb-1 law-text">{contentItem.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {currentLaw.structure === "paragraphs" && currentLaw.paragraphs?.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-2">
            <div className="flex items-center text-sm font-medium hover:bg-gray-100 p-1 rounded">
              <ChevronRight className="h-4 w-4 mr-1" />
              {section.title}
            </div>
            {section.items?.map((item) => (
              <div
                key={item.number}
                className={`ml-6 text-sm p-1 rounded cursor-pointer ${selectedParagraph === item.number ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedParagraph(item.number)}
              >
                § {item.number} {item.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Rendere den Paragrapheninhalt mit nummerierten Sätzen und Navigationsbuttons
  const renderParagraphContent = (paragraph, isHistorical = false) => {
    if (!paragraph) return <div className="p-4">Paragraph nicht gefunden</div>;

    const content = isHistorical && historicalDate
      ? paragraph.history?.find(h => h.date === historicalDate)?.content
      : paragraph.content;

    if (!content) return <div className="p-4">Keine Inhalte für diesen Zeitpunkt verfügbar</div>;

    const prefix = paragraph.number === "praeambel" ? "" : 
      (currentLaw?.structure === "articles" ? "Art." : "§");
    const title = paragraph.number === "praeambel" ? "Präambel" : 
      `${prefix} ${paragraph.number} ${paragraph.title || ""}`;

    return (
      <div className={`p-4 ${isHistorical ? 'bg-gray-50' : ''}`}>
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigateToParagraph('prev')}
            className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Vorheriger</span>
          </button>
          
          <h2 className="text-xl font-bold">{title}</h2>
          
          <button
            onClick={() => navigateToParagraph('next')}
            className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          >
            <span>Nächster</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="paragraph-content">
          {content.map((item, index) => {
            // Prüfen ob das Item Sätze enthält, sonst den Text direkt anzeigen
            const hasSentences = item.sentences && item.sentences.length > 0;
            
            return (
              <div key={index} className="mb-4">
                {item.number && (
                  <p className="mb-1">
                    <span className="paragraph-number mr-2">({item.number})</span>
                    {!hasSentences && <span className="law-text">{item.text}</span>}
                  </p>
                )}
                
                {!item.number && !hasSentences && (
                  <p className="mb-1 law-text">{item.text}</p>
                )}
                
                {hasSentences && (
                  <div className={`${item.number ? "pl-6" : ""} law-text`}>
                    {item.sentences.map((sentence, sentIdx) => (
                      <span 
                        key={sentIdx} 
                        className="inline-block mr-1"
                      >
                        <span className="text-xs align-super text-gray-500 mr-1">{sentIdx+1}</span>
                        {sentence}{' '}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Rendere den gesamten Text eines Gesetzes
  const renderFullLawText = () => {
    if (!currentLaw) return <div className="p-4">Gesetz nicht gefunden</div>;
    
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">{currentLaw.title} ({currentLaw.abbreviation})</h1>
        
        {/* Präambel anzeigen wenn vorhanden */}
        {currentLaw.praeambel && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Präambel</h2>
            <div className="paragraph-content law-text mb-6">
              {currentLaw.praeambel}
            </div>
          </div>
        )}
        
        {/* Gesetzestext basierend auf der Struktur anzeigen */}
        {currentLaw.structure === "books" && currentLaw.books?.map((book, bookIndex) => (
          <div key={bookIndex} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{book.title}</h2>
            
            {book.sections?.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6 ml-4">
                <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                
                {section.titles?.map((title, titleIndex) => (
                  <div key={titleIndex} className="mb-4 ml-4">
                    <h4 className="text-md font-medium mb-2">{title.title}</h4>
                    
                    {title.paragraphs?.map((para) => (
                      <div key={para.number} className="mb-6 ml-4" id={`para-${para.number}`}>
                        <h5 className="font-medium mb-2">§ {para.number} {para.title}</h5>
                        <div className="paragraph-content">
                          {para.content.map((item, index) => (
                            <div key={index} className="mb-4">
                              {item.number && (
                                <p className="mb-1">
                                  <span className="paragraph-number mr-2">({item.number})</span>
                                  <span className="law-text">{item.text}</span>
                                </p>
                              )}
                              {!item.number && (
                                <p className="mb-1 law-text">{item.text}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
        
        {currentLaw.structure === "parts" && currentLaw.parts?.map((part, partIndex) => (
          <div key={partIndex} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{part.title}</h2>
            
            {part.chapters?.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="mb-6 ml-4">
                <h3 className="text-lg font-semibold mb-3">{chapter.title}</h3>
                
                {chapter.paragraphs?.map((para) => (
                  <div key={para.number} className="mb-6 ml-4" id={`para-${para.number}`}>
                    <h4 className="font-medium mb-2">§ {para.number} {para.title}</h4>
                    <div className="paragraph-content">
                      {para.content.map((item, index) => (
                        <div key={index} className="mb-4">
                          {item.number && (
                            <p className="mb-1">
                              <span className="paragraph-number mr-2">({item.number})</span>
                              <span className="law-text">{item.text}</span>
                            </p>
                          )}
                          {!item.number && (
                            <p className="mb-1 law-text">{item.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
        
        {currentLaw.structure === "articles" && currentLaw.articles?.map((article, articleIndex) => (
          <div key={articleIndex} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{article.title}</h2>
            
            {article.items?.map((item) => (
              <div key={item.number} className="mb-6 ml-4" id={`art-${item.number}`}>
                <h3 className="font-medium mb-2">Art. {item.number} {item.title}</h3>
                <div className="paragraph-content">
                  {item.content.map((contentItem, index) => (
                    <div key={index} className="mb-4">
                      {contentItem.number && (
                        <p className="mb-1">
                          <span className="paragraph-number mr-2">({contentItem.number})</span>
                          <span className="law-text">{contentItem.text}</span>
                        </p>
                      )}
                      {!contentItem.number && (
                        <p className="mb-1 law-text">{contentItem.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {currentLaw.structure === "paragraphs" && currentLaw.paragraphs?.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{section.title}</h2>
            
            {section.items?.map((item) => (
              <div key={item.number} className="mb-6 ml-4" id={`para-${item.number}`}>
                <h3 className="font-medium mb-2">§ {item.number} {item.title}</h3>
                <div className="paragraph-content">
                  {item.content.map((contentItem, index) => (
                    <div key={index} className="mb-4">
                      {contentItem.number && (
                        <p className="mb-1">
                          <span className="paragraph-number mr-2">({contentItem.number})</span>
                          <span className="law-text">{contentItem.text}</span>
                        </p>
                      )}
                      {!contentItem.number && (
                        <p className="mb-1 law-text">{contentItem.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Rendere die Rechtsprechungsverweise
  const renderCitations = (paragraph) => {
    if (!paragraph || !paragraph.citations || paragraph.citations.length === 0) {
      return null;
    }

    return (
      <div className="p-4 mt-4 border-t">
        <h3 className="text-lg font-medium mb-2">Rechtsprechungsverweise</h3>
        <div className="space-y-2">
          {paragraph.citations.map((citation, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded">
              <p className="font-medium">{citation.court} - {citation.reference} vom {citation.date}</p>
              <p className="text-sm text-gray-700">{citation.summary}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendere die historischen Fassungen mit Timeline
  const renderHistory = (paragraph) => {
    if (!paragraph || !paragraph.history || paragraph.history.length === 0) {
      return null;
    }

    // Sortiere Versionen chronologisch
    const sortedVersions = [...paragraph.history].sort((a, b) => {
      const dateA = new Date(a.date.split('.').reverse().join('-'));
      const dateB = new Date(b.date.split('.').reverse().join('-'));
      return dateA - dateB;
    });

    // Füge die aktuelle Version am Ende hinzu
    const allVersions = [
      ...sortedVersions,
      { date: 'Aktuell', content: paragraph.content }
    ];

    return (
      <div className="p-4 mt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Historische Fassungen</h3>
        
        {/* Timeline für historische Versionen */}
        <div className="timeline overflow-x-auto">
          <div className="whitespace-nowrap">
            {allVersions.map((version, index) => (
              <div key={index} className="timeline-item">
                <div 
                  className={`timeline-marker ${
                    (version.date === historicalDate) || 
                    (version.date === 'Aktuell' && historicalDate === null) ? 
                    'active' : ''
                  }`}
                  onClick={() => setHistoricalDate(version.date === 'Aktuell' ? null : version.date)}
                  title={version.date}
                ></div>
                <span className={`timeline-date ${
                  (version.date === historicalDate) || 
                  (version.date === 'Aktuell' && historicalDate === null) ? 
                  'active' : ''
                }`}>
                  {version.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ausgewählte Version anzeigen */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">
            {historicalDate ? `Fassung vom ${historicalDate}` : 'Aktuelle Fassung'}
          </p>
        </div>
        
        {synopticView && historicalDate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Historische Fassung ({historicalDate})</h4>
              {/* Ohne Navigationsbuttons in der Vergleichsansicht */}
              <div className={`p-4 bg-gray-50`}>
                <h2 className="text-xl font-bold mb-2">{paragraph.number === "praeambel" ? "Präambel" : `${currentLaw?.structure === "articles" ? "Art." : "§"} ${paragraph.number} ${paragraph.title || ""}`}</h2>
                {/* Content rendering without navigation buttons */}
                <div className="paragraph-content">
                  {paragraph.history?.find(h => h.date === historicalDate)?.content.map((item, index) => {
                    const hasSentences = item.sentences && item.sentences.length > 0;
                    return (
                      <div key={index} className="mb-4">
                        {item.number && (
                          <p className="mb-1">
                            <span className="paragraph-number mr-2">({item.number})</span>
                            {!hasSentences && <span className="law-text">{item.text}</span>}
                          </p>
                        )}
                        {!item.number && !hasSentences && (
                          <p className="mb-1 law-text">{item.text}</p>
                        )}
                        {hasSentences && (
                          <div className={`${item.number ? "pl-6" : ""} law-text`}>
                            {item.sentences.map((sentence, sentIdx) => (
                              <span key={sentIdx} className="inline-block mr-1">
                                <span className="text-xs align-super text-gray-500 mr-1">{sentIdx+1}</span>
                                {sentence}{' '}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium mb-2">Aktuelle Fassung</h4>
              {/* Ohne Navigationsbuttons in der Vergleichsansicht */}
              <div className={`p-4`}>
                <h2 className="text-xl font-bold mb-2">{paragraph.number === "praeambel" ? "Präambel" : `${currentLaw?.structure === "articles" ? "Art." : "§"} ${paragraph.number} ${paragraph.title || ""}`}</h2>
                {/* Content rendering without navigation buttons */}
                <div className="paragraph-content">
                  {paragraph.content.map((item, index) => {
                    const hasSentences = item.sentences && item.sentences.length > 0;
                    return (
                      <div key={index} className="mb-4">
                        {item.number && (
                          <p className="mb-1">
                            <span className="paragraph-number mr-2">({item.number})</span>
                            {!hasSentences && <span className="law-text">{item.text}</span>}
                          </p>
                        )}
                        {!item.number && !hasSentences && (
                          <p className="mb-1 law-text">{item.text}</p>
                        )}
                        {hasSentences && (
                          <div className={`${item.number ? "pl-6" : ""} law-text`}>
                            {item.sentences.map((sentence, sentIdx) => (
                              <span key={sentIdx} className="inline-block mr-1">
                                <span className="text-xs align-super text-gray-500 mr-1">{sentIdx+1}</span>
                                {sentence}{' '}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Lade-Indikator anzeigen, während Daten geladen werden
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3">Lade Gesetzesdaten...</p>
        </div>
      </div>
    );
  }

  // Fehlerbehandlung
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-red-500 p-4">
          <h2 className="text-xl font-bold mb-2">Fehler</h2>
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Neu laden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Book className="h-6 w-6" />
              <h1 className="text-xl font-bold">LegiPedia</h1>
            </div>
           
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Suche nach §..."
                  className="w-64 px-4 py-2 rounded-full bg-blue-700 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-blue-200" />
              </div>
             
              <button
                className="p-2 rounded-full hover:bg-blue-700 md:hidden"
                onClick={() => setNavigationOpen(!navigationOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Kategorien-Tabs */}
          <div className="mt-4 flex space-x-2 flex-wrap">
            {categories
              .sort((a, b) => a.order - b.order)
              .map(category => (
                <button
                  key={category.id}
                  className={`px-3 py-1 mb-1 text-sm rounded-full flex items-center space-x-1 ${
                    selectedCategory === category.id ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'
                  }`}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    if (category.laws && category.laws.length > 0) {
                      const firstLaw = category.laws[0];
                      setSelectedLaw(firstLaw.id);
                      const firstParagraph = getDefaultParagraphForLaw(firstLaw);
                      setSelectedParagraph(firstParagraph);
                    }
                    setHistoricalDate(null);
                  }}
                >
                  {getCategoryIcon(category.id)}
                  <span>{category.name}</span>
                </button>
              ))
            }
          </div>
          
          {/* Gesetzes-Tabs für die ausgewählte Kategorie */}
          <div className="mt-2 flex space-x-2 overflow-x-auto pb-1">
            {getSelectedCategory()?.laws
              .sort((a, b) => a.menuOrder - b.menuOrder)
              .map(law => (
                <button
                  key={law.id}
                  className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                    selectedLaw === law.id ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'
                  }`}
                  onClick={() => {
                    setSelectedLaw(law.id);
                    const firstParagraph = getDefaultParagraphForLaw(law);
                    setSelectedParagraph(firstParagraph);
                    setHistoricalDate(null);
                  }}
                >
                  {law.abbreviation}
                </button>
              ))
            }
          </div>
        </div>
      </header>

      {/* Mobile Suche */}
      <div className="bg-white p-2 md:hidden">
        <div className="relative">
          <input
            type="text"
            placeholder="Suche nach §..."
            className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Hauptinhalt */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation */}
        <aside
          className={`${navigationOpen ? 'block' : 'hidden'} ${isMobile ? 'absolute inset-0 z-10 bg-white' : 'w-64'} border-r overflow-y-auto`}
        >
          {isMobile && (
            <div className="flex justify-end p-2">
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => setNavigationOpen(false)}
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          )}
          {renderNavigation()}
        </aside>

        {/* Inhalt */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto">
            <div className="p-2 bg-gray-100 flex justify-between items-center">
              <div className="flex space-x-2 text-sm">
                <button
                  className={`px-3 py-1 rounded ${showHistory ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <div className="flex items-center">
                    <History className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Historische Fassungen</span>
                  </div>
                </button>
               
                {showHistory && (
                  <button
                    className={`px-3 py-1 rounded ${synopticView ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSynopticView(!synopticView)}
                  >
                    <div className="flex items-center">
                      <Columns className="h-4 w-4 mr-1" />
                      <span className="hidden md:inline">Synoptische Ansicht</span>
                    </div>
                  </button>
                )}
                
                {/* Toggle für Volltext-Ansicht */}
                <button
                  className={`px-3 py-1 rounded ${viewMode === "fulltext" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setViewMode(viewMode === "paragraph" ? "fulltext" : "paragraph")}
                  title={viewMode === "paragraph" ? "Gesamttext anzeigen" : "Paragraphenweise anzeigen"}
                >
                  <div className="flex items-center">
                    {viewMode === "paragraph" ? (
                      <>
                        <FileText className="h-4 w-4 mr-1" />
                        <span className="hidden md:inline">Volltext</span>
                      </>
                    ) : (
                      <>
                        <AlignJustify className="h-4 w-4 mr-1" />
                        <span className="hidden md:inline">Einzelansicht</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
             
              <div className="text-sm text-gray-600">
                {currentLaw?.abbreviation} {viewMode === "paragraph" && selectedParagraph === "praeambel" 
                  ? "Präambel" 
                  : (viewMode === "paragraph" 
                    ? `${currentLaw?.structure === "articles" ? "Art." : "§"} ${selectedParagraph}` 
                    : "Volltext")}
              </div>
            </div>

            {/* Paragrapheninhalt oder Volltext */}
            <div className="bg-white shadow rounded my-2 mx-auto max-w-4xl">
              {viewMode === "paragraph" ? (
                <>
                  {!synopticView || !historicalDate ? renderParagraphContent(paragraphContent) : null}
                  {renderCitations(paragraphContent)}
                  {showHistory && renderHistory(paragraphContent)}
                </>
              ) : (
                // Volltext-Ansicht
                renderFullLawText()
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LegiPedia;