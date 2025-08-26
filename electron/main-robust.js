const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'
const { autoUpdater } = require('electron-updater')
const { spawn } = require('child_process')

let serverProcess = null

// Configuração de segurança
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let mainWindow

function createWindow() {
  // Criar a janela principal
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/logo.png'),
    show: false, // Não mostrar até estar pronto
    titleBarStyle: 'default'
  })

  // Iniciar servidor Next.js embarcado em produção
  if (!isDev) {
    startEmbeddedServer()
  }

  // URL da aplicação
  const startUrl = isDev 
    ? 'http://localhost:3007' 
    : 'http://localhost:3008'  // Porta do servidor embarcado

  console.log('Loading URL:', startUrl)
  
  // Carregar com fallback robusto
  loadWithFallback()

  function loadWithFallback() {
    console.log('🔄 Tentando carregar aplicação...')
    
    if (isDev) {
      // Em desenvolvimento, tentar diretamente
      mainWindow.loadURL(startUrl)
    } else {
      // Em produção, aguardar servidor e tentar com fallback
      setTimeout(() => {
        console.log('🌐 Tentando servidor embarcado:', startUrl)
        mainWindow.loadURL(startUrl)
      }, 3000)
    }
  }

  // Eventos de debug detalhados
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('⏳ Iniciando carregamento...')
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Página carregada com sucesso!')
  })

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`❌ Falha ao carregar ${validatedURL}:`, errorCode, errorDescription)
    
    // Fallback para página local
    const fallbackPath = path.join(__dirname, 'fallback.html')
    console.log('🔄 Tentando fallback:', fallbackPath)
    
    setTimeout(() => {
      mainWindow.loadFile(fallbackPath)
    }, 1000)
  })

  mainWindow.webContents.on('crashed', () => {
    console.error('💥 Renderer process crashed!')
  })

  // Mostrar quando estiver pronto
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  // Configurar links externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Configuração do auto-updater
if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify()
  
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Atualização disponível',
      message: 'Uma nova versão está disponível. Será baixada automaticamente.',
      buttons: ['OK']
    })
  })

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Atualização pronta',
      message: 'A atualização foi baixada. O aplicativo será reiniciado.',
      buttons: ['Reiniciar', 'Mais tarde']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })
}

// Eventos do app
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handlers IPC para comunicação com o renderer
ipcMain.handle('app-version', () => {
  return app.getVersion()
})

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options)
  return result
})

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options)
  return result
})

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options)
  return result
})

// Função para iniciar servidor Next.js embarcado
function startEmbeddedServer() {
  try {
    const appPath = path.join(__dirname, '..')
    
    console.log('🚀 Iniciando servidor Next.js embarcado...')
    console.log('App path:', appPath)
    
    // Tentar diferentes formas de iniciar o servidor
    const commands = [
      { cmd: 'npm', args: ['start'] },
      { cmd: 'npx', args: ['next', 'start', '-p', '3008'] },
      { cmd: 'node', args: ['node_modules/.bin/next', 'start', '-p', '3008'] }
    ]
    
    let currentCmd = 0
    
    function tryNextCommand() {
      if (currentCmd >= commands.length) {
        console.error('❌ Todas as tentativas de servidor falharam')
        return
      }
      
      const { cmd, args } = commands[currentCmd]
      console.log(`Tentando: ${cmd} ${args.join(' ')}`)
      
      serverProcess = spawn(cmd, args, {
        cwd: appPath,
        env: { ...process.env, NODE_ENV: 'production', PORT: '3008' },
        shell: true
      })
      
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString()
        console.log('Server:', output)
        
        // Verificar se servidor está pronto
        if (output.includes('Ready') || output.includes('started')) {
          console.log('✅ Servidor está pronto!')
        }
      })
      
      serverProcess.stderr.on('data', (data) => {
        const error = data.toString()
        console.error('Server Error:', error)
      })
      
      serverProcess.on('error', (error) => {
        console.error(`❌ Erro com ${cmd}:`, error)
        currentCmd++
        setTimeout(tryNextCommand, 1000)
      })
      
      serverProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ Servidor ${cmd} finalizou com código:`, code)
          currentCmd++
          setTimeout(tryNextCommand, 1000)
        }
      })
      
      currentCmd++
    }
    
    tryNextCommand()
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error)
  }
}

// Cleanup do servidor ao fechar
app.on('before-quit', () => {
  if (serverProcess) {
    console.log('🛑 Parando servidor embarcado...')
    serverProcess.kill()
  }
})

// Tratamento de erros não capturadas
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason)
})