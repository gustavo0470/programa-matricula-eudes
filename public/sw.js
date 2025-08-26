// Service Worker para PWA - Sistema de Matrícula (Versão Simplificada)
const CACHE_NAME = 'sistema-matricula-v2';

// Cache mínimo - apenas recursos essenciais
const ESSENTIAL_ASSETS = [
  '/',
  '/manifest.json'
];

// Instalar o service worker - versão otimizada
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ESSENTIAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativar o service worker - limpeza rápida
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch otimizado - mínimo processamento
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Apenas cache para navegação e recursos estáticos críticos
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
  } else if (request.destination === 'manifest') {
    event.respondWith(
      caches.match(request) || fetch(request)
    );
  }
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativando...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE) {
              console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Ativado e assumindo controle')
        return self.clients.claim()
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro durante ativação:', error)
      })
  )
})

// Interceptar requisições (versão simplificada)
self.addEventListener('fetch', (event) => {
  // Só lidar com requests GET
  if (event.request.method !== 'GET') {
    return
  }

  // Ignorar extensões do navegador
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.startsWith('moz-extension://')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar do cache se encontrado
        if (response) {
          console.log('📦 Cache hit:', event.request.url)
          return response
        }
        
        // Caso contrário, buscar da rede
        return fetch(event.request)
          .then((response) => {
            // Não cachear se não for uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // Cachear assets estáticos
            if (event.request.url.includes('.js') || 
                event.request.url.includes('.css') || 
                event.request.url.includes('.png') || 
                event.request.url.includes('.jpg')) {
              
              const responseToCache = response.clone()
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache)
                })
                .catch((error) => {
                  console.warn('⚠️ Erro ao cachear:', error)
                })
            }
            
            return response
          })
          .catch(() => {
            // Fallback offline
            if (event.request.destination === 'document') {
              return caches.match('/offline.html')
            }
            return new Response('Offline', { status: 503 })
          })
      })
  )
})

// Listener para mensagens
self.addEventListener('message', (event) => {
  console.log('📩 Service Worker: Mensagem recebida:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('✅ Service Worker: Script carregado completamente')