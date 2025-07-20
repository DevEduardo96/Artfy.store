import React from "react";
import { Users, Globe, Lightbulb, Code } from "lucide-react";

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sobre a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Nectix</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Somos uma agência criativa especializada em desenvolvimento de
            sites, landing pages e produtos digitais prontos para alavancar
            ideias e negócios.
          </p>
        </div>

        {/* Seções */}
        <div className="space-y-10">
          {/* Missão */}
          <div className="bg-white shadow-sm rounded-lg p-6 flex space-x-4 items-start">
            <div className="bg-blue-100 p-3 rounded-full">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Nossa Missão
              </h2>
              <p className="text-gray-600">
                Ajudar pessoas e negócios a crescerem no mundo digital por meio
                de soluções acessíveis, criativas e eficientes.
              </p>
            </div>
          </div>

          {/* O que fazemos */}
          <div className="bg-white shadow-sm rounded-lg p-6 flex space-x-4 items-start">
            <div className="bg-blue-100 p-3 rounded-full">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                O que fazemos
              </h2>
              <p className="text-gray-600">
                Desenvolvemos sites, landing pages, e-commerces, além de vender
                e-books, templates e recursos digitais criados por
                especialistas.
              </p>
            </div>
          </div>

          {/* Alcance */}
          <div className="bg-white shadow-sm rounded-lg p-6 flex space-x-4 items-start">
            <div className="bg-blue-100 p-3 rounded-full">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Nosso Alcance
              </h2>
              <p className="text-gray-600">
                Com mais de 50 mil clientes impactados, nossos produtos digitais
                já chegaram em diversos estados do Brasil, com foco em qualidade
                e inovação.
              </p>
            </div>
          </div>

          {/* Equipe */}
          <div className="bg-white shadow-sm rounded-lg p-6 flex space-x-4 items-start">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Nossa Equipe
              </h2>
              <p className="text-gray-600">
                Somos um time apaixonado por design, tecnologia e educação
                digital. Trabalhamos juntos para transformar ideias em
                resultados reais.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          © {new Date().getFullYear()} Eduardo Araujo. Todos os direitos
          reservados.
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
