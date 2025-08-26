interface ReportHeaderProps {
  title: string
}

export default function ReportHeader({ title }: ReportHeaderProps) {
  return (
    <div className="text-center mb-8 p-6 border-b-2 border-gray-200">
      <div className="flex items-center justify-center mb-4">
        <img 
          src="/logo.png" 
          alt="Ação Solidária Logo" 
          className="w-20 h-20 object-contain mr-4"
        />
        <div className="text-left">
          <h1 className="text-2xl font-bold text-gray-900">
            ONG Grupo Ação Solidária de Indiaporã
          </h1>
          <p className="text-sm text-gray-600">
            CNPJ: 05.902.921/0001-63
          </p>
          <p className="text-sm text-gray-600">
            Rua Manoel Urquiza Nogueira - Quadra Dois, 08
          </p>
          <p className="text-sm text-gray-600">
            Centro - CEP 15690-134 - Indiaporã/SP
          </p>
        </div>
      </div>
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-500 mt-2">
        Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
      </p>
    </div>
  )
}