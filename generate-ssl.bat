@echo off
echo Gerando certificado SSL para desenvolvimento PWA...

REM Verificar se OpenSSL está disponível
where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo OpenSSL não encontrado. Instalando via chocolatey...
    choco install openssl -y
)

REM Criar diretório para certificados se não existir
if not exist "ssl" mkdir ssl

REM Gerar chave privada
openssl genrsa -out ssl/localhost.key 2048

REM Gerar certificado
openssl req -new -x509 -key ssl/localhost.key -out ssl/localhost.cert -days 365 -subj "/C=BR/ST=SP/L=Sao Paulo/O=Dev/CN=localhost"

echo.
echo Certificados SSL gerados em ssl/
echo.
echo Para usar HTTPS com Next.js, execute:
echo npm install --save-dev https-localhost
echo.
echo Ou use o script start-https.js
echo.
pause
