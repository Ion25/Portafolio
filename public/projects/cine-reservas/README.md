# 🎬 Cinema Reservations System

Un sistema completo de reservas de cine construido como **demo técnico** que demuestra habilidades de desarrollo full-stack con arquitectura moderna y funcionalidades avanzadas.

![Cinema Reservations](https://img.shields.io/badge/Status-Demo%20Ready-brightgreen)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED)

## 🚀 Características Principales

### 🔐 **Sistema de Autenticación Temporal**
- Registro e inicio de sesión con **cuentas que expiran automáticamente en 10 minutos**
- Límite máximo de **12 usuarios simultáneos** para simular capacidad limitada
- Contraseñas hasheadas con **bcrypt** y autenticación **JWT**
- Limpieza automática de sesiones expiradas cada 2 minutos

### 🎭 **Gestión de Asientos Inteligente**
- **Mapa interactivo de asientos** con grilla de 8x12 (96 asientos totales)
- Estados visuales: **Libre** (verde), **Premium** (dorado), **Reservado** (azul), **Ocupado** (rojo)
- **Asientos premium** en las mejores ubicaciones (filas centrales D-E)
- Selección múltiple con máximo de 6 asientos por usuario

### 👑 **Sistema Premium**
- **Upgrade automático** con selección inteligente de mejores asientos
- **15% de descuento** en todas las reservas
- **Combos exclusivos** VIP y Ejecutivo
- Auto-cancelación de reservas anteriores al hacer upgrade

### 🍿 **Gestión de Combos**
- **Combos regulares**: Clásico, Familiar, Dulce, individuales
- **Combos premium**: VIP, Ejecutivo, Todo incluido
- Integración de precios en cálculo total con descuentos

### 🤖 **Simulación de Concurrencia**
- **Bot automático** que simula usuarios reservando asientos al azar
- Endpoint `/bot-simulation` para demostrar manejo de concurrencia
- Logs detallados de todas las acciones del sistema

### 📊 **Monitoreo y Logging**
- Dashboard con **estadísticas en tiempo real**
- **Logging detallado** de todas las operaciones (perfecto para demos)
- Health check endpoints y métricas del sistema

## 🏗️ Arquitectura del Sistema

```
📁 cine-reservas/
├── 🐳 docker-compose.yml          # Orquestación de servicios
├── 📚 README.md                   # Documentación completa
│
├── 📁 backend/                    # API FastAPI
│   ├── 🐍 main.py                # Aplicación principal
│   ├── 🗄️  models.py             # Modelos SQLAlchemy
│   ├── 🔐 auth.py                # Autenticación JWT
│   ├── 🗃️  database.py           # Configuración BD
│   ├── 📋 schemas.py             # Schemas Pydantic
│   ├── ⚙️  services.py           # Lógica de negocio
│   ├── 🐳 Dockerfile             # Container backend
│   ├── 📦 requirements.txt       # Dependencias Python
│   └── 📁 routers/               # Endpoints organizados
│       ├── 🔑 auth.py            # Rutas de autenticación
│       └── 🎫 reservations.py    # Rutas de reservas
│
├── 📁 frontend/                   # App React
│   ├── ⚛️  src/
│   │   ├── 📱 App.js             # Componente principal
│   │   ├── 🎨 App.css            # Estilos Tailwind
│   │   ├── 📁 components/        # Componentes reutilizables
│   │   │   ├── 💺 SeatButton.js  # Asiento individual
│   │   │   ├── 🗺️  SeatsMap.js   # Mapa de asientos
│   │   │   ├── 🍿 ComboSelector.js # Selector de combos
│   │   │   └── 🔒 ProtectedRoute.js # Rutas protegidas
│   │   ├── 📁 pages/             # Páginas principales
│   │   │   ├── 🔐 AuthPage.js    # Login/Registro
│   │   │   └── 🎭 CinemaPage.js  # Página principal
│   │   ├── 📁 context/           # Context API
│   │   │   └── 👤 AuthContext.js # Estado autenticación
│   │   ├── 📁 hooks/             # Hooks personalizados
│   │   │   └── 🎫 useReservations.js # Hook de reservas
│   │   └── 📁 services/          # Servicios API
│   │       └── 🌐 api.js         # Cliente HTTP
│   ├── 🐳 Dockerfile             # Container frontend
│   ├── 📦 package.json           # Dependencias Node
│   └── ⚙️  tailwind.config.js    # Configuración CSS
│
└── 📁 db/                         # Base de datos
    └── 🗄️  init.sql              # Schema e inicialización
```

## 🛠️ Stack Tecnológico

### **Backend**
- **FastAPI** - Framework web moderno y rápido
- **PostgreSQL** - Base de datos relacional robusta
- **SQLAlchemy** - ORM avanzado con relaciones
- **JWT + bcrypt** - Autenticación segura
- **APScheduler** - Tareas programadas en background
- **Uvicorn** - Servidor ASGI de alto rendimiento

### **Frontend**
- **React 18** - Biblioteca UI con hooks modernos
- **TailwindCSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP con interceptors
- **React Router** - Navegación SPA
- **React Hot Toast** - Notificaciones elegantes
- **Lucide React** - Iconos SVG optimizados

### **DevOps**
- **Docker Compose** - Orquestación multi-container
- **PostgreSQL 15** - BD containerizada
- **Nginx** (opcional) - Proxy reverso
- **Health Checks** - Monitoreo de servicios

## 🚀 Instalación y Ejecución

### **Opción 1: Con Docker (Recomendado)**

```bash
# 1. Clonar el repositorio
git clone [tu-repo]/cine-reservas.git
cd cine-reservas

# 2. Levantar todos los servicios
docker compose up --build

# 3. Esperar a que todos los servicios estén listos
# ✅ Backend: http://localhost:8000
# ✅ Frontend: http://localhost:3000
# ✅ PostgreSQL: localhost:5432

# 4. Abrir en el navegador
open http://localhost:3000
```

### **Opción 2: Desarrollo Local**

```bash
# Backend
cd backend
pip install -r requirements.txt
export DATABASE_URL="postgresql://cinema_user:cinema_pass@localhost:5432/cine_reservas"
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (en otra terminal)
cd frontend
npm install
npm start

# PostgreSQL (usando Docker)
docker run --name cinema-postgres -e POSTGRES_DB=cine_reservas -e POSTGRES_USER=cinema_user -e POSTGRES_PASSWORD=cinema_pass -p 5432:5432 -d postgres:15
```

## 🎯 Guía de Uso

### **1. Registro/Login**
1. Accede a http://localhost:3000
2. Haz clic en "Crear Cuenta" 
3. Ingresa un username único (ej: `demo_user_1`)
4. Define una contraseña (ej: `1234`)
5. ¡Tu cuenta expirará automáticamente en 10 minutos! ⏰

### **2. Reservar Asientos**
1. **Explora el mapa**: Ve los asientos disponibles (verde) y premium (dorado)
2. **Selecciona asientos**: Haz clic en hasta 6 asientos
3. **Elige un combo**: Opcional - selecciona tu combo favorito
4. **Confirma reserva**: Revisa el total y confirma

### **3. Funcionalidades Premium** 👑
1. **Haz clic en "Actualizar a Premium"**
2. **Beneficios inmediatos**:
   - 15% de descuento automático
   - Auto-selección de mejores asientos
   - Acceso a combos VIP exclusivos
   - Badge dorado en la interfaz

### **4. Simulación de Concurrencia** 🤖
- Haz clic en el botón **"Bot"** para simular otro usuario reservando
- Observa en tiempo real cómo cambian los asientos
- Perfecto para demostrar manejo de concurrencia

### **5. Monitoreo**
- **Panel de estadísticas** en tiempo real
- **Logs detallados** en la consola del backend
- **Health check**: http://localhost:8000/health

## 🎨 Capturas de Pantalla

### Login/Registro
- ✅ Diseño moderno con fondo degradado
- ✅ Validación en tiempo real
- ✅ Indicadores de límites y expiración

### Mapa de Asientos
- ✅ Grilla interactiva 8x12 con pasillos
- ✅ Estados visuales claros por colores
- ✅ Tooltips informativos
- ✅ Leyenda completa

### Panel Premium
- ✅ Efectos visuales dorados
- ✅ Beneficios claramente destacados
- ✅ Botón prominente de upgrade

### Dashboard Móvil
- ✅ Responsive design completo
- ✅ Panel deslizable en móviles
- ✅ Touch-friendly para tablets

## 🧪 Testing y Desarrollo

### **Datos de Prueba**
```sql
-- El sistema inicializa automáticamente:
-- ✅ 96 asientos (A1-H12)
-- ✅ 40 asientos premium en mejores ubicaciones
-- ✅ Usuario bot para simulaciones
-- ✅ Combos predefinidos
```

### **Endpoints de API**

```bash
# Salud del sistema
GET /health

# Autenticación
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

# Reservas
GET /api/reservations/seats
POST /api/reservations/book
DELETE /api/reservations/cancel/{seat_id}
POST /api/reservations/premium

# Simulación
POST /api/reservations/bot-simulation

# Documentación automática
GET /docs (Swagger UI)
```

### **Variables de Entorno**
```env
# Backend
DATABASE_URL=postgresql://cinema_user:cinema_pass@db:5432/cine_reservas
SECRET_KEY=tu_clave_secreta_jwt_aqui_cambiar_en_produccion
ACCESS_TOKEN_EXPIRE_MINUTES=10

# Frontend  
REACT_APP_API_URL=http://localhost:8000
```

## 🔧 Configuración Avanzada

### **Personalizar Límites**
```python
# backend/auth.py - Línea 145
MAX_USERS = 12  # Cambiar límite de usuarios

# backend/main.py - Línea 85  
CLEANUP_INTERVAL = 2  # Minutos entre limpiezas

# backend/auth.py - Línea 12
ACCESS_TOKEN_EXPIRE_MINUTES = 10  # Expiración de sesión
```

### **Configurar Asientos**
```sql
-- db/init.sql
-- Personalizar layout de asientos, precios, combos
UPDATE seats SET is_premium = true WHERE row_letter IN ('D', 'E');
```

## 🚨 Limitaciones por Diseño

1. **⏰ Sesiones temporales**: Máximo 10 minutos por usuario
2. **👥 Usuarios limitados**: Solo 12 simultáneos
3. **🎫 Reservas limitadas**: Máximo 6 asientos por usuario  
4. **🗄️ Datos en memoria**: La BD se resetea al reiniciar containers
5. **🔄 Demo purposes**: No optimizado para producción real

> ⚠️ **Nota**: Estas limitaciones son **intencionales** para demostrar capacidades de manejo de recursos limitados y lógica de negocio compleja.

## 🎯 Casos de Uso Demo

### **Para Reclutadores**
```bash
# 1. Levantar sistema
docker compose up --build

# 2. Crear 2-3 usuarios simultáneos
# Usuario 1: demo_reclutador (Premium)
# Usuario 2: demo_usuario (Regular)
# Usuario 3: Simulación de bot

# 3. Demostrar funcionalidades
- Reservas concurrentes ✅
- Sistema premium ✅  
- Bot simulation ✅
- Expiración automática ✅
- Logs en tiempo real ✅
```

### **Para Presentaciones**
1. **Abrir múltiples pestañas** con usuarios diferentes
2. **Activar bot simulation** para mostrar concurrencia  
3. **Mostrar logs del backend** en terminal
4. **Explicar arquitectura** con el diagrama
5. **Destacar decisiones técnicas** (JWT, cleanup, limits)

## 🎓 Decisiones Técnicas

### **¿Por qué FastAPI?**
- **Documentación automática** con OpenAPI/Swagger
- **Validación automática** con Pydantic schemas
- **Performance excepcional** comparable a Node.js
- **Type hints** nativos de Python
- **Async/await** para operaciones concurrentes

### **¿Por qué React con Hooks?**
- **Código más limpio** que class components
- **useContext** para estado global sin Redux
- **Custom hooks** para lógica reutilizable
- **Functional programming** approach

### **¿Por qué PostgreSQL?**
- **ACID compliance** para transacciones críticas
- **Relaciones complejas** entre users/seats/reservations
- **Stored procedures** para limpieza automática
- **Escalabilidad** superior a SQLite

### **¿Por qué Tailwind CSS?**
- **Utility-first** para desarrollo rápido  
- **Purging automático** para bundles pequeños
- **Responsive design** built-in
- **Consistency** visual sin esfuerzo extra

## 🔮 Posibles Extensiones

### **Funcionalidades**
- [ ] **Múltiples salas** de cine
- [ ] **Horarios de funciones** dinámicos
- [ ] **Pagos simulados** con Stripe/PayPal
- [ ] **Notificaciones push** de expiración
- [ ] **QR codes** para tickets
- [ ] **Analytics dashboard** avanzado

### **Tecnológicas**
- [ ] **Redis** para cache y sessiones
- [ ] **WebSockets** para updates en tiempo real
- [ ] **Kubernetes** deployment
- [ ] **CI/CD** con GitHub Actions
- [ ] **Monitoring** con Prometheus/Grafana
- [ ] **Testing** automatizado (Jest + Pytest)

## 📞 Contacto y Soporte

**Desarrollado como demo técnico por**: [Tu Nombre]

- 📧 **Email**: tu.email@ejemplo.com
- 💼 **LinkedIn**: linkedin.com/in/tu-perfil
- 🐱 **GitHub**: github.com/tu-usuario
- 🌐 **Portfolio**: tu-portfolio.com

---

## 📜 Licencia

Este proyecto está bajo la **MIT License** - ver [LICENSE](LICENSE) para detalles.

```
MIT License - Uso libre para fines educativos y de demostración
```

## ⭐ ¿Te gustó el proyecto?

Si este sistema de reservas te resultó útil o interesante:

1. **Dale una estrella** ⭐ al repositorio
2. **Compártelo** con otros developers
3. **Fork it** para tus propios experimentos
4. **Contáctame** para feedback o colaboraciones

---

*Este README fue diseñado para impresionar a reclutadores técnicos y demostrar habilidades de documentación profesional. El sistema está optimizado para demos en vivo y explicaciones técnicas detalladas.*

**🎬 ¡Que disfrutes explorando el Cinema Reservations System! 🍿**