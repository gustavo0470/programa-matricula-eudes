export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 animate-slide-in">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4 animate-fade-in">
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center animate-bounce-in">
              <img 
                src="/logo.png" 
                alt="Ação Solidária Logo" 
                className="w-full h-full object-contain hover-scale transition-all duration-300"
              />
            </div>
            <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-lg md:text-2xl font-bold gradient-text">
                Sistema de Matrículas
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                ONG Grupo Ação Solidária de Indiaporã
              </p>
            </div>
          </div>
          
          <div className="hidden md:block text-right text-sm text-gray-600 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="font-medium hover:text-primary-600 transition-colors">CNPJ: 05.902.921/0001-63</p>
            <p className="hover:text-primary-600 transition-colors">Rua Manoel Urquiza Nogueira - Quadra Dois, 08</p>
            <p className="hover:text-primary-600 transition-colors">Centro - CEP 15690-134 - Indiaporã/SP</p>
          </div>
          
          {/* Mobile Contact Info */}
          <div className="md:hidden text-right text-xs text-gray-600 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="font-medium hover:text-primary-600 transition-colors">CNPJ: 05.902.921/0001-63</p>
            <p className="hover:text-primary-600 transition-colors">Centro - Indiaporã/SP</p>
          </div>
        </div>
      </div>
    </header>
  )
}