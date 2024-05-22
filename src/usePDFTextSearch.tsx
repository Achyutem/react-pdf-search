import { useState, useEffect } from "react";
import { pdfjs } from "react-pdf";

export const usePdfTextSearch = (file: string, searchString: string) => {
    const [pages, setPages] = useState<string[]>([]);
    const [resultsList, setResultsList] = useState<number[]>([]);

    useEffect(() => {
        pdfjs.getDocument(file).promise.then((docData: any) => {
            const pageCount: number = docData._pdfInfo.numPages;

            const pagePromises = Array.from(
                { length: pageCount },
                (_, pageNumber) => {
                    return docData.getPage(pageNumber + 1).then((pageData: any) => {
                        return pageData.getTextContent().then((textContent: any) => {
                            return textContent.items.map(({ str }: any) => str).join(" ");
                        });
                    });
                }
            );

            return Promise.all(pagePromises).then((pages) => {
                setPages(pages);
            });
        });
    }, [file]);

    useEffect(() => {
        if (!searchString || !searchString.length) {
            setResultsList([]);
            return;
        }

        const regex = new RegExp(`${searchString}*`, "i");
        const updatedResults: number[] = [];

        pages.forEach((text, index) => {
            if (regex.test(text)) {
                updatedResults.push(index + 1);
            }
        });

        setResultsList(updatedResults);
    }, [pages, searchString]);

    return resultsList;
};
