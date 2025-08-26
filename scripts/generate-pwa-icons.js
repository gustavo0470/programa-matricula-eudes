const fs = require('fs')
const path = require('path')

console.log('📱 Gerando ícones PWA...')

// Tamanhos necessários para PWA
const iconSizes = [32, 72, 96, 128, 144, 152, 180, 192, 384, 512]

const publicDir = path.join(__dirname, '..', 'public')
const logoPath = path.join(publicDir, 'logo.png')

// Verificar se logo existe
if (!fs.existsSync(logoPath)) {
  console.log('⚠️ Logo não encontrado. Criando ícones placeholder...')
  createPlaceholderIcons()
} else {
  console.log('✅ Logo encontrado. Use uma ferramenta online para redimensionar:')
  console.log('1. Acesse: https://www.pwabuilder.com/imageGenerator')
  console.log('2. Faça upload do logo.png')
  console.log('3. Baixe e coloque os ícones na pasta public/')
  createPlaceholderInfo()
}

function createPlaceholderIcons() {
  // Criar um SVG simples como placeholder
  const svgContent = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#667eea"/>
      <stop offset="100%" stop-color="#764ba2"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad1)" rx="64"/>
  <text x="256" y="280" font-family="Arial" font-size="200" fill="white" text-anchor="middle">📚</text>
  <text x="256" y="400" font-family="Arial" font-size="32" fill="white" text-anchor="middle" opacity="0.9">SISTEMA</text>
  <text x="256" y="440" font-family="Arial" font-size="32" fill="white" text-anchor="middle" opacity="0.9">MATRÍCULA</text>
</svg>`

  // Salvar SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent.trim())
  console.log('✅ Ícone SVG criado como placeholder')
  
  // Criar lista de arquivos necessários
  createPlaceholderInfo()
}

function createPlaceholderInfo() {
  const instructions = `
# 📱 Ícones PWA - Instruções

## Ícones necessários:
${iconSizes.map(size => `- icon-${size}x${size}.png`).join('\n')}

## Como gerar:

### Opção 1 - Online (Recomendado):
1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload do seu logo.png
3. Baixe o ZIP e extraia na pasta public/

### Opção 2 - Usando Photoshop/GIMP:
1. Abra logo.png
2. Redimensione para cada tamanho necessário
3. Salve como PNG na pasta public/

### Opção 3 - Usando ImageMagick:
\`\`\`bash
cd public
${iconSizes.map(size => 
  `magick logo.png -resize ${size}x${size} icon-${size}x${size}.png`
).join('\n')}
\`\`\`

## Screenshots (opcionais):
- screenshot-wide.png (1280x720) - Desktop
- screenshot-narrow.png (720x1280) - Mobile

## Após gerar os ícones:
\`\`\`bash
npm run build:pwa
\`\`\`
`

  fs.writeFileSync(path.join(__dirname, '..', 'ICONES-PWA.md'), instructions.trim())
  console.log('✅ Instruções salvas em ICONES-PWA.md')
  
  // Criar arquivo browserconfig.xml para Windows
  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/icon-144x144.png"/>
            <TileColor>#667eea</TileColor>
        </tile>
    </msapplication>
</browserconfig>`

  fs.writeFileSync(path.join(publicDir, 'browserconfig.xml'), browserConfig.trim())
  console.log('✅ browserconfig.xml criado')
}

console.log('📋 Próximos passos:')
console.log('1. Gerar ícones (ver ICONES-PWA.md)')
console.log('2. npm run dev (testar PWA)')
console.log('3. npm run build:pwa (build para produção)')