import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create necessary directories
const DATA_DIR = path.join(__dirname, '../data');
const PUBLIC_DIR = path.join(__dirname, '../public/data');
const LAWS_DIR = path.join(PUBLIC_DIR, 'laws');

// Create directories if they don't exist
[PUBLIC_DIR, LAWS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Load the current laws.json file
const lawsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'laws.json'), 'utf8'));

// Function to process a single law and extract its content to separate files
function processLaw(law, categoryId) {
  // Deep clone the law to avoid modifying the original
  const lawCopy = JSON.parse(JSON.stringify(law));
  const lawId = law.id;
  
  // Create a directory for this law's content files
  const lawDir = path.join(LAWS_DIR, lawId);
  if (!fs.existsSync(lawDir)) {
    fs.mkdirSync(lawDir, { recursive: true });
  }
  
  // Process each structure type differently
  if (law.structure === "books") {
    for (const book of lawCopy.books || []) {
      for (const section of book.sections || []) {
        for (const title of section.titles || []) {
          for (const paragraph of title.paragraphs || []) {
            // Write current content to a file
            const currentFileName = `${lawId}_${paragraph.number}_current.json`;
            fs.writeFileSync(
              path.join(lawDir, currentFileName),
              JSON.stringify(paragraph.content, null, 2)
            );
            
            // Write each historical version to a file
            if (paragraph.history) {
              for (const version of paragraph.history) {
                const histFileName = `${lawId}_${paragraph.number}_${version.date.replace(/\./g, '-')}.json`;
                fs.writeFileSync(
                  path.join(lawDir, histFileName),
                  JSON.stringify(version.content, null, 2)
                );
                // Remove content from history object
                delete version.content;
              }
            }
            
            // Process annotations if any
            if (paragraph.annotations && paragraph.annotations.length > 0) {
              const annotationsFileName = `${lawId}_${paragraph.number}_annotations.json`;
              fs.writeFileSync(
                path.join(lawDir, annotationsFileName),
                JSON.stringify(paragraph.annotations, null, 2)
              );
              paragraph.annotationsFile = `laws/${lawId}/${annotationsFileName}`;
            }
            
            // Replace content with file references
            paragraph.contentFile = `laws/${lawId}/${currentFileName}`;
            delete paragraph.content;
            
            if (paragraph.history) {
              paragraph.history = paragraph.history.map(version => {
                const histFileName = `${lawId}_${paragraph.number}_${version.date.replace(/\./g, '-')}.json`;
                return {
                  date: version.date,
                  contentFile: `laws/${lawId}/${histFileName}`
                };
              });
            }
          }
        }
      }
    }
  } else if (law.structure === "parts") {
    for (const part of lawCopy.parts || []) {
      for (const chapter of part.chapters || []) {
        for (const paragraph of chapter.paragraphs || []) {
          const currentFileName = `${lawId}_${paragraph.number}_current.json`;
          fs.writeFileSync(
            path.join(lawDir, currentFileName),
            JSON.stringify(paragraph.content, null, 2)
          );
          
          if (paragraph.history) {
            for (const version of paragraph.history) {
              const histFileName = `${lawId}_${paragraph.number}_${version.date.replace(/\./g, '-')}.json`;
              fs.writeFileSync(
                path.join(lawDir, histFileName),
                JSON.stringify(version.content, null, 2)
              );
              // Remove content from history object
              delete version.content;
            }
          }
          
          // Process annotations if any
          if (paragraph.annotations && paragraph.annotations.length > 0) {
            const annotationsFileName = `${lawId}_${paragraph.number}_annotations.json`;
            fs.writeFileSync(
              path.join(lawDir, annotationsFileName),
              JSON.stringify(paragraph.annotations, null, 2)
            );
            paragraph.annotationsFile = `laws/${lawId}/${annotationsFileName}`;
          }
          
          paragraph.contentFile = `laws/${lawId}/${currentFileName}`;
          delete paragraph.content;
          
          if (paragraph.history) {
            paragraph.history = paragraph.history.map(version => {
              const histFileName = `${lawId}_${paragraph.number}_${version.date.replace(/\./g, '-')}.json`;
              return {
                date: version.date,
                contentFile: `laws/${lawId}/${histFileName}`
              };
            });
          }
        }
      }
    }
  } else if (law.structure === "articles" || law.structure === "paragraphs") {
    const articlesSections = law.structure === "articles" ? lawCopy.articles : lawCopy.paragraphs;
    
    for (const articleSection of articlesSections || []) {
      const items = articleSection.items || [];
      
      for (const item of items) {
        const currentFileName = `${lawId}_${item.number}_current.json`;
        fs.writeFileSync(
          path.join(lawDir, currentFileName),
          JSON.stringify(item.content, null, 2)
        );
        
        if (item.history) {
          for (const version of item.history) {
            const histFileName = `${lawId}_${item.number}_${version.date.replace(/\./g, '-')}.json`;
            fs.writeFileSync(
              path.join(lawDir, histFileName),
              JSON.stringify(version.content, null, 2)
            );
            // Remove content from history object
            delete version.content;
          }
        }
        
        // Process annotations if any
        if (item.annotations && item.annotations.length > 0) {
          const annotationsFileName = `${lawId}_${item.number}_annotations.json`;
          fs.writeFileSync(
            path.join(lawDir, annotationsFileName),
            JSON.stringify(item.annotations, null, 2)
          );
          item.annotationsFile = `laws/${lawId}/${annotationsFileName}`;
        }
        
        item.contentFile = `laws/${lawId}/${currentFileName}`;
        delete item.content;
        
        if (item.history) {
          item.history = item.history.map(version => {
            const histFileName = `${lawId}_${item.number}_${version.date.replace(/\./g, '-')}.json`;
            return {
              date: version.date,
              contentFile: `laws/${lawId}/${histFileName}`
            };
          });
        }
      }
    }
  }
  
  // If the law has a preamble, extract it too
  if (lawCopy.praeambel) {
    const praeambelFileName = `${lawId}_praeambel.json`;
    fs.writeFileSync(
      path.join(lawDir, praeambelFileName),
      JSON.stringify({
        content: [{
          number: "",
          text: lawCopy.praeambel,
          sentences: lawCopy.praeambel.split(/\.\s+/).filter(s => s.trim()).map(s => s + ".")
        }]
      }, null, 2)
    );
    
    lawCopy.praeambelFile = `laws/${lawId}/${praeambelFileName}`;
    // Keep the praeambel attribute for backwards compatibility
    // but in a future version, consider removing it
  }
  
  console.log(`Processed law: ${lawCopy.title} (${lawCopy.id})`);
  return lawCopy;
}

// Process each law in each category
const processedData = {
  categories: lawsData.categories.map(category => {
    return {
      ...category,
      laws: category.laws.map(law => processLaw(law, category.id))
    };
  })
};

// Write the updated metadata-only laws.json file
fs.writeFileSync(
  path.join(PUBLIC_DIR, 'laws.json'),
  JSON.stringify(processedData, null, 2)
);

console.log('Completed splitting laws.json into separate files');
console.log(`Main laws.json now contains only metadata, content is in ${LAWS_DIR}`);
