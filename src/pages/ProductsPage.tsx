import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  description: string;
  popularity: number;
  fileSize: string;
  format: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "Curso Completo de Marketing Digital",
    category: "cursos",
    price: 297,
    originalPrice: 497,
    rating: 4.9,
    reviews: 1234,
    image:
      "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop",
    badge: "Mais Vendido",
    description:
      "Aprenda estratégias avançadas de marketing digital do zero ao avançado",
    popularity: 10,
    fileSize: "2.5GB",
    format: "MP4",
  },
  {
    id: "2",
    name: "E-book: Copywriting Persuasivo",
    category: "ebooks",
    price: 49,
    originalPrice: 89,
    rating: 4.8,
    reviews: 856,
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
    badge: "Novo",
    description: "Técnicas comprovadas para escrever textos que convertem",
    popularity: 8,
    fileSize: "15MB",
    format: "PDF",
  },
  {
    id: "3",
    name: "Templates de Instagram para Negócios",
    category: "templates",
    price: 67,
    originalPrice: null,
    rating: 4.7,
    reviews: 432,
    image:
      "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=300&fit=crop",
    badge: null,
    description: "Pack com 100+ templates editáveis para Instagram",
    popularity: 6,
    fileSize: "150MB",
    format: "PSD",
  },
  {
    id: "4",
    name: "Curso de React e TypeScript",
    category: "cursos",
    price: 397,
    originalPrice: 597,
    rating: 5.0,
    reviews: 678,
    image:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
    badge: "Premium",
    description:
      "Domine o desenvolvimento frontend moderno com React e TypeScript",
    popularity: 9,
    fileSize: "3.2GB",
    format: "MP4",
  },
  {
    id: "5",
    name: "E-book: Gestão Financeira Pessoal",
    category: "ebooks",
    price: 29,
    originalPrice: 59,
    rating: 4.6,
    reviews: 945,
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
    badge: null,
    description: "Guia completo para organizar suas finanças pessoais",
    popularity: 7,
    fileSize: "8MB",
    format: "PDF",
  },
  {
    id: "6",
    name: "Templates de Landing Pages",
    category: "templates",
    price: 89,
    originalPrice: 149,
    rating: 4.8,
    reviews: 321,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    badge: "Oferta",
    description: "10 templates profissionais de landing pages responsivas",
    popularity: 5,
    fileSize: "45MB",
    format: "HTML",
  },
];

const ProductsPageContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  const categories = [
    { id: "todos", name: "Todos" },
    { id: "cursos", name: "Cursos" },
    { id: "ebooks", name: "E-books" },
    { id: "templates", name: "Templates" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "todos" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Nossos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Produtos
              </span>
            </h1>
            <p className="text-gray-600">
              Descubra conteúdos premium para acelerar seu crescimento
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Produtos */}
      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-2 mb-6">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Categorias
              </h3>
            </div>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex justify-between items-center ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="mt-12 text-center text-gray-500">
              Nenhum produto encontrado com os filtros aplicados.
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

const ProdutosPage: React.FC = () => <ProductsPageContent />;

export default ProdutosPage;
