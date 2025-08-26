const { app, BrowserWindow } = require('electron')
const path = require('path')

console.log('🚀 Iniciando Electron Debug...')
console.log('Diretório atual:', __dirname)
console.log('App path:', app.getAppPath())

let mainWindow

function createWindow() {
  console.log('📱 Criando janela...')
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Temporariamente para debug
    },
    show: true, // Mostrar imediatamente para debug
    backgroundColor: '#ffffff'
  })

  // Abrir DevTools imediatamente
  mainWindow.webContents.openDevTools()

  // Testar diferentes URLs
  const urls = [
    'https://www.google.com', // Teste de conectividade
    'http://localhost:3007',   // Dev server
    'http://localhost:3008',   // Prod server
    `file://${path.join(__dirname, '../out/index.html')}`, // Static file
    `file://${path.join(__dirname, '../public/logo.png')}`, // Test file access
  ]

  console.log('🔍 Testando URLs...')
  
  let currentIndex = 0
  
  function tryNextUrl() {
    if (currentIndex >= urls.length) {
      console.log('❌ Todas as URLs falharam')
      return
    }
    
    const url = urls[currentIndex]
    console.log(`🌐 Tentando carregar: ${url}`)
    
    mainWindow.loadURL(url)
    currentIndex++
  }

  // Eventos de debug
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('⏳ Iniciando carregamento...')
  })

  mainWindow.webContents.on('did-stop-loading', () => {
    console.log('✅ Carregamento parou')
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('🎉 Página carregada com sucesso!')
  })

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`❌ Falha ao carregar ${validatedURL}:`, errorCode, errorDescription)
    
    // Tentar próxima URL após 2 segundos
    setTimeout(tryNextUrl, 2000)
  })

  mainWindow.webContents.on('crashed', () => {
    console.error('💥 Renderer process crashed!')
  })

  mainWindow.on('unresponsive', () => {
    console.error('⏰ Janela não está respondendo')
  })

  // Começar teste
  tryNextUrl()
}

app.whenReady().then(() => {
  console.log('✅ App pronto')
  createWindow()
})

app.on('window-all-closed', () => {
  console.log('👋 Todas as janelas fechadas')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

console.log('📋 Informações do sistema:')
console.log('- Plataforma:', process.platform)
console.log('- Arquitetura:', process.arch)
console.log('- Versão Electron:', process.versions.electron)
console.log('- Versão Node:', process.versions.node)