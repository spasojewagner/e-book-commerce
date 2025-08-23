import type { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Ancient Mysteries Revealed",
    description: "Discover the hidden secrets of ancient civilizations and their forgotten knowledge. This comprehensive guide explores mysterious artifacts, lost technologies, and esoteric wisdom that has been suppressed for centuries.",
    price: 29.99,
    image: "/api/placeholder/300/400",
    tags: ["ancient", "mystery", "archaeology"],
    rating: 4.8,
    pages: 342,
    format: "PDF",
    category: "History",
    filePath: "uploads/Marko Spasojevic final.pdf", // UKLONIO "public/"
    fileName: "Ancient_Mysteries_Revealed.pdf"
  },
  {
    id: 2,
    title: "The Forbidden Arts",
    description: "A complete manual of forgotten practices and hidden knowledge. Learn about the esoteric arts that were once banned and discover the truth behind ancient wisdom traditions.",
    price: 39.99,
    image: "/api/placeholder/300/400",
    tags: ["esoteric", "occult", "wisdom"],
    rating: 4.9,
    pages: 428,
    format: "PDF",
    category: "Occult",
    filePath: "uploads/Marko Spasojevic final.pdf", // UKLONIO "public/"
    fileName: "The_Forbidden_Arts.pdf"
  },
  {
    id: 3,
    title: "Sacred Geometry Decoded",
    description: "Unlock the mathematical secrets of the universe through sacred geometry. This book reveals the hidden patterns that govern reality and how ancient builders used these principles.",
    price: 24.99,
    image: "/api/placeholder/300/400",
    tags: ["geometry", "mathematics", "sacred"],
    rating: 4.7,
    pages: 256,
    format: "PDF",
    category: "Mathematics",
    filePath: "uploads/Marko Spasojevic final.pdf", // UKLONIO "public/"
    fileName: "Sacred_Geometry_Decoded.pdf"
  },
  {
    id: 4,
    title: "Conspiracy Chronicles",
    description: "An in-depth investigation into the world's most significant conspiracies. Separate fact from fiction with documented evidence and insider testimonies.",
    price: 34.99,
    image: "/api/placeholder/300/400",
    tags: ["conspiracy", "truth", "investigation"],
    rating: 4.6,
    pages: 389,
    format: "PDF",
    category: "Conspiracy",
    filePath: "uploads/Marko Spasojevic final.pdf", // UKLONIO "public/"
    fileName: "Conspiracy_Chronicles.pdf"
  },
  {
    id: 5,
    title: "Hidden History Chronicles",
    description: "The untold stories of history that were deliberately hidden from the masses. Discover the truth behind major historical events and the forces that shaped our world.",
    price: 27.99,
    image: "/api/placeholder/300/400",
    tags: ["history", "hidden", "truth"],
    rating: 4.5,
    pages: 312,
    format: "PDF",
    category: "History",
    filePath: "uploads/Marko Spasojevic final.pdf", // UKLONIO "public/"
    fileName: "Hidden_History_Chronicles.pdf"
  },
  {
    id: 6,
    title: "Quantum Consciousness",
    description: "Explore the intersection of quantum physics and consciousness. This groundbreaking work reveals how quantum mechanics might explain the nature of awareness and reality itself.",
    price: 32.99,
    image: "/api/placeholder/300/400",
    tags: ["quantum", "consciousness", "physics"],
    rating: 4.9,
    pages: 367,
    format: "PDF",
    category: "Science",
    filePath: "uploads/Marko Spasojevic final.pdf", // UKLONIO "public/"
    fileName: "Quantum_Consciousness.pdf"
  }
];