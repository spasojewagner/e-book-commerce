// src/config/catalog.ts
// The books for sale. Prices and files live only on the server: the browser sends product ids and
// quantities, never a price or a file path.
import path from 'path';

export interface CatalogItem {
  id: number;
  title: string;
  price: number; // USD
  file: string; // file name inside EBOOKS_DIR
  downloadName: string; // file name the buyer sees
}

// Outside every static folder, so the files can only be reached with a paid download token.
export const EBOOKS_DIR = path.resolve(__dirname, '../../ebooks');

export const CATALOG: CatalogItem[] = [
  { id: 1, title: 'Ancient Mysteries Revealed', price: 29.99, file: 'sample-ebook.pdf', downloadName: 'Ancient_Mysteries_Revealed.pdf' },
  { id: 2, title: 'The Forbidden Arts', price: 39.99, file: 'sample-ebook.pdf', downloadName: 'The_Forbidden_Arts.pdf' },
  { id: 3, title: 'Sacred Geometry Decoded', price: 24.99, file: 'sample-ebook.pdf', downloadName: 'Sacred_Geometry_Decoded.pdf' },
  { id: 4, title: 'Conspiracy Chronicles', price: 34.99, file: 'sample-ebook.pdf', downloadName: 'Conspiracy_Chronicles.pdf' },
  { id: 5, title: 'Hidden History Chronicles', price: 27.99, file: 'sample-ebook.pdf', downloadName: 'Hidden_History_Chronicles.pdf' },
  { id: 6, title: 'Quantum Consciousness', price: 32.99, file: 'sample-ebook.pdf', downloadName: 'Quantum_Consciousness.pdf' },
];

export const findProduct = (id: number): CatalogItem | undefined => CATALOG.find((p) => p.id === id);

/** Absolute path of a product's file. Only names from the catalog are ever joined, never user input. */
export const ebookPath = (product: CatalogItem): string => path.join(EBOOKS_DIR, path.basename(product.file));
