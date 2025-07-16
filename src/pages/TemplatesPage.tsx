import React, { useState, useMemo } from "react";
import { Layout, Search, Filter, Star, ChevronDown } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";

interface TemplatesPageProps {
  products: Product[];
}

const TemplatesPage: React.FC<TemplatesPageProps> = ({ products }) => {
  const { dispatch } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const templates = useMemo(() => {
    return products.filter((product) => product.category === "Templates");
  }, [products]);

  // Usando category porque subcategory pode não existir
  const categories = useMemo(() => {
    return ["Todos", ...new Set(templates.map((p) => p.category))];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "Todos" || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        filtered.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
    }

    return filtered;
  }, [templates, searchTerm, selectedCategory, sortBy]);

  const addToCart = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
    dispatch({ type: "OPEN_CART" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const TemplateCard: React.FC<{
    template: Product;
    viewMode: "grid" | "list";
  }> = ({ template, viewMode }) => {
    return (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-4">
        <img
          src={template.image}
          alt={template.name}
          className="w-full h-40 object-cover rounded mb-4"
        />
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {template.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-800">
            {formatPrice(template.price)}
          </span>
          <button
            onClick={() => addToCart(template)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Comprar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Layout className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Templates Criativos</h1>
          </div>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Escolha entre centenas de templates prontos para usar em seus
            projetos.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 border px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="popularity">Mais Popular</option>
                  <option value="price-low">Menor Preço</option>
                  <option value="price-high">Maior Preço</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div
          className={
            viewMode === "grid"
              ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-6"
          }
        >
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TemplatesPage;
