import React from "react";
import { ArrowRight, Play, Star } from "lucide-react";
import imgInicial from "../style/imgs/imageminicial.webp";

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              <span>Produtos Digitais Premium</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 leading-tight">
              Acelere seu
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}
                aprendizado{" "}
              </span>
              com conteúdo de qualidade
            </h1>

            <p className="text-lg text-gray-600 max-w-lg">
              Descubra cursos, e-books e templates criados por especialistas
              para impulsionar sua carreira e projetos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                <span>Explorar Produtos</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <button className="flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                <Play className="h-5 w-5" />
                <span>Ver Demo</span>
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">1000+</div>
                <div className="text-sm text-gray-600">Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">50k+</div>
                <div className="text-sm text-gray-600">Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">4.9</div>
                <div className="text-sm text-gray-600">Avaliação</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 w-[453px] h-[384px]">
              <img
                src={imgInicial}
                alt="Aprendizado Online"
                className="w-full h-full object-cover rounded-2xl " //shadow-2xl//
              />
            </div>
            <div className="absolute -top-4 -right-4 w-[400px] h-[384px] bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
