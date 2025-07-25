import React, { useState } from "react";
import {
  ArrowLeft,
  Star,
  Download,
  Shield,
  Clock,
  FileText,
  Users,
  Heart,
  Share2,
  Play,
  CheckCircle,
  Monitor,
  Smartphone,
  Tablet,
  Tag,
  ShoppingCart,
} from "lucide-react";
import { Product } from "../types";

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onBack,
  onAddToCart,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      Programação: "bg-blue-100 text-blue-800",
      Design: "bg-purple-100 text-purple-800",
      Templates: "bg-green-100 text-green-800",
      Marketing: "bg-orange-100 text-orange-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const renderStars = (rating: number = 4.8) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  // Para produtos que podem ter múltiplas imagens (usar a mesma imagem como fallback)
  const images = [product.image, product.image, product.image];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar aos produtos
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={images[selectedImage]}
                alt={product.nome}
                className="w-full h-96 object-cover"
              />
              <button className="absolute top-4 right-4 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all">
                <Play className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                {product.category && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                      product.category
                    )}`}
                  >
                    {product.category}
                  </span>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2 rounded-full transition-all ${
                      isWishlisted
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.nome}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  {renderStars(4.8)}
                  <span className="ml-2 text-sm text-gray-600">
                    (4.8) • 127 avaliações
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Download className="w-4 h-4 mr-1" />
                  1234 downloads
                </div>
              </div>

              <div className="text-4xl font-bold text-indigo-600 mb-6">
                {formatPrice(product.preco)}
              </div>

              <button
                onClick={() => onAddToCart(product)}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Adicionar ao Carrinho</span>
              </button>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Compra Segura</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Download Imediato</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Acesso Vitalício</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Suporte Incluído</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Informações */}
        <div className="border-b border-gray-200">
          <div className="overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent">
            <nav className="flex whitespace-nowrap space-x-4 sm:space-x-8 px-1">
              {[
                { id: "description", label: "Descrição", icon: FileText },
                { id: "features", label: "Características", icon: CheckCircle },
                { id: "requirements", label: "Requisitos", icon: Monitor },
                { id: "reviews", label: "Avaliações", icon: Star },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
