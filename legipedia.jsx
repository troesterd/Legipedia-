import React, { useState, useEffect } from 'react';
import { Search, Book, History, Columns, Menu, ChevronDown, ChevronRight, Home } from 'lucide-react';

// Beispieldaten für die Demonstration
const SAMPLE_LAWS = {
  "bgb": {
    "title": "Bürgerliches Gesetzbuch",
    "abbreviation": "BGB",
    "books": [
      {
        "title": "Buch 2: Recht der Schuldverhältnisse",
        "sections": [
          {
            "title": "Abschnitt 8: Einzelne Schuldverhältnisse",
            "titles": [
              {
                "title": "Titel 27: Unerlaubte Handlungen",
                "paragraphs": [
                  {
                    "number": "823",
                    "title": "Schadensersatzpflicht",
                    "content": [
                      {
                        "number": "1",
                        "text": "Wer vorsätzlich oder fahrlässig das Leben, den Körper, die Gesundheit, die Freiheit, das Eigentum oder ein sonstiges Recht eines anderen widerrechtlich verletzt, ist dem anderen zum Ersatz des daraus entstehenden Schadens verpflichtet.",
                        "sentences": [
                          "Wer vorsätzlich oder fahrlässig das Leben, den Körper, die Gesundheit, die Freiheit, das Eigentum oder ein sonstiges Recht eines anderen widerrechtlich verletzt, ist dem anderen zum Ersatz des daraus entstehenden Schadens verpflichtet."
                        ]
                      },
                      {
                        "number": "2",
                        "text": "Die gleiche Verpflichtung trifft denjenigen, welcher gegen ein den Schutz eines anderen bezweckendes Gesetz verstößt. Ist nach dem Inhalt des Gesetzes ein Verstoß gegen dieses auch ohne Verschulden möglich, so tritt die Ersatzpflicht nur im Falle des Verschuldens ein.",
                        "sentences": [
                          "Die gleiche Verpflichtung trifft denjenigen, welcher gegen ein den Schutz eines anderen bezweckendes Gesetz verstößt.",
                          "Ist nach dem Inhalt des Gesetzes ein Verstoß gegen dieses auch ohne Verschulden möglich, so tritt die Ersatzpflicht nur im Falle des Verschuldens ein."
                        ]
                      }
                    ],
                    "history": [
                      {
                        "date": "01.01.1900",
                        "content": [
                          {
                            "number": "1",
                            "text": "Wer vorsätzlich oder fahrlässig das Leben, den Körper, die Gesundheit, die Freiheit, das Eigentum oder ein sonstiges Recht eines anderen widerrechtlich verletzt, ist dem anderen zum Ersatz des daraus entstehenden Schadens verpflichtet.",
                            "sentences": [
                              "Wer vorsätzlich oder fahrlässig das Leben, den Körper, die Gesundheit, die Freiheit, das Eigentum oder ein sonstiges Recht eines anderen widerrechtlich verletzt, ist dem anderen zum Ersatz des daraus entstehenden Schadens verpflichtet."
                            ]
                          },
                          {
                            "number": "2",
                            "text": "Die gleiche Verpflichtung trifft denjenigen, welcher gegen ein den Schutz eines anderen bezweckendes Gesetz verstößt. Ist nach dem Inhalt des Gesetzes ein Verstoß gegen dieses auch ohne Verschulden möglich, so tritt die Ersatzpflicht nur im Falle des Verschuldens ein.",
                            "sentences": [
                              "Die gleiche Verpflichtung trifft denjenigen, welcher gegen ein den Schutz eines anderen bezweckendes Gesetz verstößt.",
                              "Ist nach dem Inhalt des Gesetzes ein Verstoß gegen dieses auch ohne Verschulden möglich, so tritt die Ersatzpflicht nur im Falle des Verschuldens ein."
                            ]
                          }
                        ]
                      },
                      {
                        "date": "01.01.2002",
                        "content": [
                          {
                            "number": "1",
                            "text": "Wer vorsätzlich oder fahrlässig das Leben, den Körper, die Gesundheit, die Freiheit, das Eigentum oder ein sonstiges Recht eines anderen widerrechtlich verletzt, ist dem anderen zum Ersatz des daraus entstehenden Schadens verpflichtet.",
                            "sentences": [
                              "Wer vorsätzlich oder fahrlässig das Leben, den Körper, die Gesundheit, die Freiheit, das Eigentum oder ein sonstiges Recht eines anderen widerrechtlich verletzt, ist dem anderen zum Ersatz des daraus entstehenden Schadens verpflichtet."
                            ]
                          },
                          {
                            "number": "2",
                            "text": "Die gleiche Verpflichtung trifft denjenigen, welcher gegen ein den Schutz eines anderen bezweckendes Gesetz verstößt. Ist nach dem Inhalt des Gesetzes ein Verstoß gegen dieses auch ohne Verschulden möglich, so tritt die Ersatzpflicht nur im Falle des Verschuldens ein.",
                            "sentences": [
                              "Die gleiche Verpflichtung trifft denjenigen, welcher gegen ein den Schutz eines anderen bezweckendes Gesetz verstößt.",
                              "Ist nach dem Inhalt des Gesetzes ein Verstoß gegen dieses auch ohne Verschulden möglich, so tritt die Ersatzpflicht nur im Falle des Verschuldens ein."
                            ]
                          }
                        ]
                      }
                    ],
                    "citations": [
                      {
                        "court": "BGH",
                        "reference": "VI ZR 280/18",
                        "date": "11.06.2019",
                        "summary": "Zur Haftung des Herstellers bei Implantaten"
                      },
                      {
                        "court": "BGH",
                        "reference": "VI ZR 189/17",
                        "date": "27.02.2018",
                        "summary": "Schadensersatzansprüche bei Verletzung des allgemeinen Persönlichkeitsrechts"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "vwvfg": {
    "title": "Verwaltungsverfahrensgesetz",
    "abbreviation": "VwVfG",
    "parts": [
      {
        "title": "Teil II: Allgemeine Vorschriften über das Verwaltungsverfahren",
        "chapters": [
          {
            "title": "Abschnitt 2: Bestandskraft des Verwaltungsaktes",
            "paragraphs": [
              {
                "number": "35",
                "title": "Begriff des Verwaltungsaktes",
                "content": [
                  {
                    "number": "1",
                    "text": "Verwaltungsakt ist jede Verfügung, Entscheidung oder andere hoheitliche Maßnahme, die eine Behörde zur Regelung eines Einzelfalls auf dem Gebiet des öffentlichen Rechts trifft und die auf unmittelbare Rechtswirkung nach außen gerichtet ist. Allgemeinverfügung ist ein Verwaltungsakt, der sich an einen nach allgemeinen Merkmalen bestimmten oder bestimmbaren Personenkreis richtet oder die öffentlich-rechtliche Eigenschaft einer Sache oder ihre Benutzung durch die Allgemeinheit betrifft."
                  }
                ],
                "history": [
                  {
                    "date": "25.05.1976",
                    "content": [
                      {
                        "number": "1",
                        "text": "Verwaltungsakt ist jede Verfügung, Entscheidung oder andere hoheitliche Maßnahme, die eine Behörde zur Regelung eines Einzelfalls auf dem Gebiet des öffentlichen Rechts trifft und die auf unmittelbare Rechtswirkung nach außen gerichtet ist."
                      }
                    ]
                  },
                  {
                    "date": "12.09.1996",
                    "content": [
                      {
                        "number": "1",
                        "text": "Verwaltungsakt ist jede Verfügung, Entscheidung oder andere hoheitliche Maßnahme, die eine Behörde zur Regelung eines Einzelfalls auf dem Gebiet des öffentlichen Rechts trifft und die auf unmittelbare Rechtswirkung nach außen gerichtet ist. Allgemeinverfügung ist ein Verwaltungsakt, der sich an einen nach allgemeinen Merkmalen bestimmten oder bestimmbaren Personenkreis richtet oder die öffentlich-rechtliche Eigenschaft einer Sache oder ihre Benutzung durch die Allgemeinheit betrifft."
                      }
                    ]
                  }
                ],
                "citations": [
                  {
                    "court": "BVerwG",
                    "reference": "7 C 7.13",
                    "date": "22.10.2014",
                    "summary": "Zur Definition des Verwaltungsakts"
                  },
                  {
                    "court": "BVerwG",
                    "reference": "6 C 3.19",
                    "date": "18.12.2019",
                    "summary": "Zur Allgemeinverfügung"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

// Hauptkomponente
const LegiPedia = () => {
  const [selectedLaw, setSelectedLaw] = useState("bgb");
  const [selectedParagraph, setSelectedParagraph] = useState("823");
  const [showHistory, setShowHistory] = useState(false);
  const [historicalDate, setHistoricalDate] = useState(null);
  const [synopticView, setSynopticView] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  // Finde den aktuellen Paragraphen in den Beispieldaten
  const findParagraph = (lawKey, paragraphNumber) => {
    const law = SAMPLE_LAWS[lawKey];
    if (!law) return null;

    if (lawKey === "bgb") {
      for (const book of law.books || []) {
        for (const section of book.sections || []) {
          for (const title of section.titles || []) {
            for (const paragraph of title.paragraphs || []) {
              if (paragraph.number === paragraphNumber) {
                return paragraph;
              }
            }
          }
        }
      }
    } else if (lawKey === "vwvfg") {
      for (const part of law.parts || []) {
        for (const chapter of part.chapters || []) {
          for (const paragraph of chapter.paragraphs || []) {
            if (paragraph.number === paragraphNumber) {
              return paragraph;
            }
          }
        }
      }
    }
    return null;
  };

  const currentParagraph = findParagraph(selectedLaw, selectedParagraph);

  // Rendere die Navigationsleiste
  const renderNavigation = () => {
    const law = SAMPLE_LAWS[selectedLaw];
    if (!law) return null;

    if (selectedLaw === "bgb") {
      return (
        <div className="p-4 h-full overflow-y-auto">
          <h2 className="text-lg font-bold mb-2">{law.title} ({law.abbreviation})</h2>
          {law.books.map((book, bookIndex) => (
            <div key={bookIndex} className="mb-2">
              <div className="flex items-center text-sm font-medium hover:bg-gray-100 p-1 rounded">
                <ChevronRight className="h-4 w-4 mr-1" />
                {book.title}
              </div>
              {book.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="ml-4 mb-1">
                  <div className="flex items-center text-sm hover:bg-gray-100 p-1 rounded">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    {section.title}
                  </div>
                  {section.titles.map((title, titleIndex) => (
                    <div key={titleIndex} className="ml-4">
                      <div className="flex items-center text-sm hover:bg-gray-100 p-1 rounded">
                        <ChevronRight className="h-4 w-4 mr-1" />
                        {title.title}
                      </div>
                      {title.paragraphs.map((para) => (
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
        </div>
      );
    } else if (selectedLaw === "vwvfg") {
      return (
        <div className="p-4 h-full overflow-y-auto">
          <h2 className="text-lg font-bold mb-2">{law.title} ({law.abbreviation})</h2>
          {law.parts.map((part, partIndex) => (
            <div key={partIndex} className="mb-2">
              <div className="flex items-center text-sm font-medium hover:bg-gray-100 p-1 rounded">
                <ChevronRight className="h-4 w-4 mr-1" />
                {part.title}
              </div>
              {part.chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex} className="ml-4">
                  <div className="flex items-center text-sm hover:bg-gray-100 p-1 rounded">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    {chapter.title}
                  </div>
                  {chapter.paragraphs.map((para) => (
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
      );
    }
  };

  // Rendere den Paragrapheninhalt
  const renderParagraphContent = (paragraph, isHistorical = false) => {
    if (!paragraph) return <div>Paragraph nicht gefunden</div>;

    const content = isHistorical && historicalDate
      ? paragraph.history.find(h => h.date === historicalDate)?.content
      : paragraph.content;

    if (!content) return <div>Keine Inhalte für diesen Zeitpunkt verfügbar</div>;

    return (
      <div className={`p-4 ${isHistorical ? 'bg-gray-50' : ''}`}>
        <h2 className="text-xl font-bold mb-2">§ {paragraph.number} {paragraph.title}</h2>
        {content.map((item, index) => (
          <div key={index} className="mb-2">
            <p>
              <span className="font-medium mr-2">({item.number})</span>
              {item.text}
            </p>
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

  // Rendere die historischen Fassungen
  const renderHistory = (paragraph) => {
    if (!paragraph || !paragraph.history || paragraph.history.length === 0) {
      return null;
    }

    return (
      <div className="p-4 mt-4 border-t">
        <h3 className="text-lg font-medium mb-2">Historische Fassungen</h3>
        <div className="flex space-x-2 mb-4">
          {paragraph.history.map((version, index) => (
            <button
              key={index}
              className={`px-3 py-1 text-sm rounded-full ${historicalDate === version.date ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setHistoricalDate(version.date)}
            >
              {version.date}
            </button>
          ))}
          <button
            className={`px-3 py-1 text-sm rounded-full ${!historicalDate ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setHistoricalDate(null)}
          >
            Aktuelle Fassung
          </button>
        </div>
       
        {synopticView && historicalDate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Historische Fassung ({historicalDate})</h4>
              {renderParagraphContent(paragraph, true)}
            </div>
            <div>
              <h4 className="text-md font-medium mb-2">Aktuelle Fassung</h4>
              {renderParagraphContent(paragraph, false)}
            </div>
          </div>
        )}
      </div>
    );
  };

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
         
          <div className="flex mt-4 space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded-full ${selectedLaw === "bgb" ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'}`}
              onClick={() => {
                setSelectedLaw("bgb");
                setSelectedParagraph("823");
                setHistoricalDate(null);
              }}
            >
              BGB
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full ${selectedLaw === "vwvfg" ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'}`}
              onClick={() => {
                setSelectedLaw("vwvfg");
                setSelectedParagraph("35");
                setHistoricalDate(null);
              }}
            >
              VwVfG
            </button>
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
              </div>
             
              <div className="text-sm text-gray-600">
                {SAMPLE_LAWS[selectedLaw]?.abbreviation} § {selectedParagraph}
              </div>
            </div>

            {/* Paragrapheninhalt */}
            <div className="bg-white shadow rounded">
              {!synopticView || !historicalDate ? renderParagraphContent(currentParagraph) : null}
              {renderCitations(currentParagraph)}
              {showHistory && renderHistory(currentParagraph)}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LegiPedia;