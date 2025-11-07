import { useState } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { CountrySelect } from './components/ui/country-select'
import { Phone, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'



const COUNTRIES = [
  { code: '+54', flag: '🇦🇷', label: 'Argentina' },
  { code: '+1',  flag: '🇺🇸', label: 'Estados Unidos' },
  { code: '+34', flag: '🇪🇸', label: 'España' },
  { code: '+52', flag: '🇲🇽', label: 'México' },
  { code: '+55', flag: '🇧🇷', label: 'Brasil' },
]

type VerificationResult = {
  decision: 'APROBADO' | 'REVISIÓN' | 'BLOQUEADO' | null
  score: number
  message: string
  type: 'success' | 'warning' | 'danger'
}

function App() {
  const [screen, setScreen] = useState<'input' | 'result'>('input')
  const [countryCode, setCountryCode] = useState('+54')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [result, setResult] = useState<VerificationResult>({
    decision: null,
    score: 0,
    message: '',
    type: 'success'
  })

  // Validación de número telefónico
  const validatePhoneNumber = (number: string): boolean => {
    const cleaned = number.replace(/[\s-]/g, '')
    return /^\d{8,15}$/.test(cleaned)
  }

  const isValid = validatePhoneNumber(phoneNumber)


  // Función para llamar al orquestador
  const callOrchestrator = async (fullNumber: string) => {
    console.log(`Llamando al orquestador con número: ${fullNumber}`)
    
    // Simulación de delay de red
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Lógica de simulación de respuesta
    const mockResponses = [
      { decision: 'APROBADO' as const, score: 95, type: 'success' as const, message: 'Acceso seguro concedido.' },
      { decision: 'REVISIÓN' as const, score: 40, type: 'warning' as const, message: 'Se requiere verificación adicional. Posible cambio de SIM.' },
      { decision: 'BLOQUEADO' as const, score: 5, type: 'danger' as const, message: 'Acceso denegado por alto riesgo de fraude.' }
    ]

    let mockResult
    if (fullNumber.includes('111')) {
      mockResult = mockResponses[2]
      console.log("tiene 111")
    } else if (fullNumber.includes('222')) {
      mockResult = mockResponses[1]
    } else if (fullNumber.includes('333')) {
      mockResult = mockResponses[0]
        console.log("tiene 333")
    } else {
      mockResult = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    }

    return mockResult
  }

  // Manejar autenticación
  const handleAuthenticate = async () => {
    if (!isValid) return

    setIsLoading(true)
    const fullNumber = `${countryCode}${phoneNumber}`

    try {
      const response = await callOrchestrator(fullNumber)
      setResult(response)
      setScreen('result')
    } catch (error) {
      console.error('Error en autenticación:', error)
      setResult({
        decision: 'BLOQUEADO',
        score: 0,
        message: 'Error al procesar la solicitud. Por favor, intente nuevamente.',
        type: 'danger'
      })
      setScreen('result')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar reset
  const handleReset = () => {
    setScreen('input')
    setPhoneNumber('')
    setResult({
      decision: null,
      score: 0,
      message: '',
      type: 'success'
    })
  }

  // Función para formatear el número de forma segura
  const maskPhoneNumber = (number: string, code: string): string => {
    const cleaned = number.replace(/[\s-]/g, '')
    if (cleaned.length < 4) return `${code} ${number}`
    const visible = cleaned.slice(-2)
    const masked = '*'.repeat(Math.min(cleaned.length - 2, 6))
    return `${code} ${masked}${visible}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-full max-w-md animate-fade-in">
        {screen === 'input' ? (
          <Card className="glass-effect border-white/10">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  CheckPoint
                </CardTitle>
                <CardDescription className="text-base text-gray-400">
                  Acceso seguro asegurado
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300 text-base">
                  Ingresá tu número para acceder
                </Label>
                <div className="flex gap-2">
                    <div className="relative group">

                    
                    <CountrySelect
                      value={countryCode}
                      onChange={(code) => setCountryCode(code)}
                      countries={COUNTRIES}
                      className="w-28"
                      aria-label="Código de país"
                      showFlagInTrigger={false}
                      dropdownWidthClass="w-28"
                    />
                    

                    </div>
                  <div className="flex-1 relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="11 2345 6789"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && isValid && !isLoading && handleAuthenticate()}
                      className={`pr-10 ${isValid && phoneNumber ? 'border-green-500 ring-green-500/20' : ''}`}
                      aria-label="Número de teléfono"
                      disabled={isLoading}
                    />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  </div>
                </div>
                {phoneNumber && !isValid && (
                  <p className="text-xs text-red-400 mt-1">
                    Por favor, ingresá un número válido (8-15 dígitos)
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="consent"
                  checked
                  disabled
                  className="mt-0.5 accent-primary"
                  aria-label="Consentimiento de validación"
                />
                <label htmlFor="consent" className="text-xs text-gray-400 leading-relaxed">
                  Al continuar, aceptás la validación de tu dispositivo y línea para garantizar tu seguridad.
                </label>
              </div>

              <Button
                onClick={handleAuthenticate}
                disabled={!isValid || isLoading}
                className="w-full text-base font-semibold h-12"
                aria-label="Autenticar número"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  'Autenticar de forma segura'
                )}
              </Button>

              <p className="text-center text-xs text-gray-500">
                Protegido por tecnología de verificación invisible
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className={`glass-effect border-white/10 animate-scale-in ${
            result.type === 'success' ? 'border-green-500/30' : 
            result.type === 'warning' ? 'border-yellow-500/30' : 
            'border-red-500/30'
          }`}>
            <CardHeader className="text-center space-y-4 pb-6">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center animate-scale-in ${
                result.type === 'success' ? 'bg-green-500/10' : 
                result.type === 'warning' ? 'bg-yellow-500/10' : 
                'bg-red-500/10'
              }`}>
                {result.type === 'success' ? (
                  <CheckCircle2 className={`w-10 h-10 text-green-500`} />
                ) : (
                  <AlertCircle className={`w-10 h-10 ${
                    result.type === 'warning' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  {result.decision === 'APROBADO' ? 'Verificación Exitosa' : 
                   result.decision === 'REVISIÓN' ? 'Verificación Pendiente' : 
                   'Verificación Fallida'}
                </CardTitle>
                <CardDescription className="text-base text-gray-400">
                  {result.message}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Número verificado</span>
                  <span className="text-sm font-mono text-white">
                    {maskPhoneNumber(phoneNumber, countryCode)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Score de confianza</span>
                  <span className={`text-lg font-bold ${
                    result.type === 'success' ? 'text-green-500' : 
                    result.type === 'warning' ? 'text-yellow-500' : 
                    'text-red-500'
                  }`}>
                    {result.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      result.type === 'success' ? 'bg-green-500' : 
                      result.type === 'warning' ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleReset}
                  className="w-full text-base font-semibold h-12"
                  variant={result.type === 'success' ? 'default' : 'outline'}
                >
                  {result.type === 'success' ? 'Continuar' : 'Intentar nuevamente'}
                </Button>
                
                <button
                  onClick={handleReset}
                  className="w-full text-sm text-gray-400 hover:text-primary transition-colors duration-300"
                >
                  Cambiar número
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        <footer className="text-center mt-8">
          <p className="text-sm text-gray-500">
            &copy; 2025 CheckPoint Hackathon
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
