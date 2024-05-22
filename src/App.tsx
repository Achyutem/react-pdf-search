import React, { useState, useMemo } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { useDebounce } from "use-debounce";
import { usePdfTextSearch } from "./usePDFTextSearch";


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type CustomTextRenderer = (textItem: any) => string;

const PdfFileViewer: React.FC = () => {
  const defaultSearchString = "";
  const [searchString, setSearchString] = useState<string>(defaultSearchString);
  const [debouncedSearchString] = useDebounce(searchString, 250);

  const file: string =
    "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
  const searchResults: number[] = usePdfTextSearch(file, debouncedSearchString);

  const textRenderer: CustomTextRenderer = useMemo(
    () => (textItem: any) => {
      if (!textItem) return "";
      return highlightPattern(textItem.str, debouncedSearchString);
    },
    [debouncedSearchString]
  );
  
  let resultText: string =
    searchResults.length === 1
      ? "Results found on 1 page"
      : `Results found on ${searchResults.length} pages`;

  if (searchResults.length === 0 && !debouncedSearchString) {
    resultText = "";
  } else if (searchResults.length === 0) {
    resultText = "";
  }

  return (
    <>
      <input
        placeholder="search your query"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        type="text"
      />
      <p>{resultText}</p>
      <Document file={file}>
        {debouncedSearchString ? (
          searchResults.map((searchResultPageNumber: number) => (
            <Page
              key={searchResultPageNumber}
              pageNumber={searchResultPageNumber}
              customTextRenderer={textRenderer}
            />
          ))
        ) : (
          Array.from(new Array(14), (val, index) => index + 1).map((pageNumber: number) => (
            <Page
              key={pageNumber}
              pageNumber={pageNumber}
            />
          ))
        )}
      </Document>
    </>
  );
};

export default function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <PdfFileViewer />
    </div>
  );
}

function highlightPattern(text: string, pattern: string): string {
  const parts = text.split(new RegExp(`(${pattern})`, 'gi'));
  return parts
    .map((part, index) =>
      part.match(new RegExp(pattern, 'i')) ? `<mark key=${index}>${part}</mark>` : part
    )
    .join('');
}
