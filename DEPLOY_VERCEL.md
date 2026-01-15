# 🚀 Guía de Despliegue en Vercel - Apolo Academy

Esta guía te ayudará a desplegar tu aplicación Apolo Academy en Vercel de manera exitosa.

## 📋 Pre-requisitos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Supabase](https://supabase.com) con tu proyecto configurado
- Cuenta en [Google AI Studio](https://makersuite.google.com/app/apikey) para la API de Gemini
- Repositorio en GitHub (recomendado)

## 🔧 Configuración Inicial

### 1. Preparar Variables de Entorno

Antes de desplegar, asegúrate de tener tus credenciales listas:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
VITE_GEMINI_API_KEY=tu-api-key-de-gemini
```

### 2. Verificar Configuración Local

Ejecuta estos comandos para verificar que todo funciona correctamente:

```bash
# Instalar dependencias
npm install

# Probar el build
npm run build

# Previsualizar el build
npm run preview
```

## 🌐 Despliegue en Vercel

### Opción A: Despliegue desde GitHub (Recomendado)

1. **Subir tu código a GitHub:**
   ```bash
   git add .
   git commit -m "Preparar para despliegue en Vercel"
   git push origin main
   ```

2. **Importar en Vercel:**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Selecciona "Import Git Repository"
   - Autoriza a Vercel para acceder a tu repositorio
   - Selecciona el repositorio `ApoloAcademy`

3. **Configurar el Proyecto:**
   - **Framework Preset:** Vite (se detecta automáticamente)
   - **Root Directory:** `./` (por defecto)
   - **Build Command:** `npm run build` (ya configurado en vercel.json)
   - **Output Directory:** `dist` (ya configurado en vercel.json)

4. **Agregar Variables de Entorno:**
   - En la sección "Environment Variables", agrega:
     ```
     VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
     VITE_SUPABASE_ANON_KEY = tu-clave-anonima
     VITE_GEMINI_API_KEY = tu-api-key-gemini
     ```
   - Asegúrate de agregar estas variables para todos los entornos (Production, Preview, Development)

5. **Desplegar:**
   - Haz clic en "Deploy"
   - Espera a que termine el proceso (1-3 minutos)

### Opción B: Despliegue con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Desplegar (modo preview)
vercel

# Para producción
vercel --prod
```

## ⚙️ Configuración Post-Despliegue

### 1. Configurar Supabase para Vercel

En tu proyecto de Supabase:

1. Ve a **Authentication > URL Configuration**
2. Agrega tu URL de Vercel a las **Site URL** y **Redirect URLs**:
   ```
   https://tu-app.vercel.app
   https://tu-app.vercel.app/**
   ```

### 2. Verificar Service Worker (PWA)

El service worker funciona automáticamente en Vercel gracias a la configuración en `vercel.json`. Verifica que:

- El archivo `service-worker.js` se carga correctamente
- El `manifest.json` es accesible
- La PWA se puede instalar en dispositivos móviles

### 3. Verificar Rutas

Todas las rutas de React Router funcionan correctamente gracias a la configuración de `rewrites` en `vercel.json`:

```json
"rewrites": [
    {
        "source": "/(.*)",
        "destination": "/index.html"
    }
]
```

Esto asegura que todas las rutas (como `/admin`, `/student/my-courses`, etc.) funcionen correctamente al recargar la página.

## 🔄 Actualizaciones Automáticas

Con GitHub conectado, cada `git push` a la rama `main` desplegará automáticamente:

```bash
# Hacer cambios
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Vercel automáticamente:
- Detectará el push
- Ejecutará el build
- Desplegará la nueva versión
- Te enviará una notificación

## 🐛 Solución de Problemas

### Error: "Module not found" o dependencias faltantes

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: Variables de entorno no encontradas

1. Verifica que las variables empiecen con `VITE_`
2. Asegúrate de que estén configuradas en Vercel Dashboard
3. Recuerda que necesitas **re-desplegar** después de agregar variables

### Error: Rutas no funcionan (404)

- Verifica que el archivo `vercel.json` esté en la raíz del proyecto
- La configuración de rewrites debe estar presente

### Error: Service Worker no funciona

- El service worker solo funciona en HTTPS (Vercel usa HTTPS por defecto)
- Verifica los headers en `vercel.json`
- Revisa la consola del navegador para errores específicos

### Error de autenticación de Supabase

1. Verifica las URLs permitidas en Supabase
2. Asegúrate de que las variables de entorno sean correctas
3. Revisa que las claves no tengan espacios al inicio/final

## 📊 Monitoreo

### Ver Logs en Tiempo Real

1. Ve a tu proyecto en Vercel Dashboard
2. Selecciona la pestaña "Deployments"
3. Haz clic en el despliegue activo
4. Ve a "Runtime Logs" para ver logs en tiempo real

### Analytics

Vercel proporciona analytics gratuitos:
- Ve a tu proyecto > Analytics
- Revisa métricas de rendimiento
- Identifica páginas lentas

## 🔒 Seguridad

### Variables de Entorno

✅ **Correcto:** Variables en Vercel Dashboard  
❌ **Incorrecto:** Variables en el código fuente

### Claves API

- Nunca subas archivos `.env` a GitHub
- Usa `.gitignore` para excluir archivos sensibles
- Las variables `VITE_*` son públicas (van al cliente)
- Para secretos del servidor, usa funciones serverless de Vercel

## 🎯 Optimizaciones Adicionales (Opcional)

### 1. Configurar Dominio Personalizado

En Vercel Dashboard:
1. Ve a Settings > Domains
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones

### 2. Configurar Cache

Ya configurado en `vercel.json` para:
- Service Worker: `max-age=0, must-revalidate`
- Assets estáticos: Cacheados automáticamente por Vercel

### 3. Optimizar Build (Opcional)

Si deseas optimizar el tamaño del bundle, puedes agregar esto a `vite.config.js`:

```javascript
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'supabase': ['@supabase/supabase-js'],
                    'ui-vendor': ['framer-motion', 'lucide-react']
                }
            }
        }
    },
    server: {
        port: 3000
    }
})
```

## 📱 PWA en Producción

Tu aplicación funciona como PWA en Vercel:

1. **Instalación:** Los usuarios pueden instalar la app desde el navegador
2. **Offline:** Service worker cachea recursos para uso offline
3. **Actualizaciones:** El service worker se actualiza automáticamente

Para probar:
1. Abre tu app en Chrome/Edge en móvil
2. Verás el banner "Agregar a pantalla de inicio"
3. Instala y prueba funcionalidad offline

## 📝 Archivos de Configuración Incluidos

Tu proyecto ya incluye los siguientes archivos necesarios para Vercel:

- ✅ **vercel.json** - Configuración de build, rewrites y headers
- ✅ **.vercelignore** - Archivos que no se deben subir a Vercel
- ✅ **.gitignore** - Actualizado para excluir archivos de Vercel
- ✅ **vite.config.js** - Configuración de Vite para producción

## 🔗 URLs Útiles

- **Dashboard de Vercel:** https://vercel.com/dashboard
- **Documentación Vercel:** https://vercel.com/docs
- **Supabase Dashboard:** https://app.supabase.com
- **Google AI Studio:** https://makersuite.google.com

## ✅ Checklist de Despliegue

- [ ] Código subido a GitHub
- [ ] Variables de entorno configuradas en Vercel
- [ ] URLs de Vercel agregadas a Supabase
- [ ] Build local exitoso (`npm run build`)
- [ ] Deploy completado sin errores
- [ ] Rutas funcionando correctamente
- [ ] Autenticación funcionando
- [ ] Service Worker activo
- [ ] PWA instalable
- [ ] Pruebas en dispositivos móviles

## 🎉 ¡Listo!

Tu aplicación Apolo Academy ahora está lista para desplegarse en Vercel.

**Características incluidas:**
- ✅ Configuración completa para Vercel
- ✅ Soporte para todas las rutas (SPA)
- ✅ PWA con Service Worker
- ✅ Headers de seguridad
- ✅ Optimización de cache
- ✅ Variables de entorno configuradas

---

**Nota:** Vercel proporciona:
- SSL gratuito (HTTPS)
- CDN global
- Despliegues ilimitados
- Preview deployments para cada PR
- Analytics básico gratuito
- 100GB de ancho de banda por mes (plan gratuito)
