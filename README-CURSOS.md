# Sistema de Gestión de Cursos - LA PRE GILDA

## 🎓 Funcionalidades Implementadas

### 1. Gestión de Usuarios

**Roles del sistema:**
- **Admin**: Acceso completo a todas las funcionalidades
- **Author (Profesor)**: Puede crear y editar contenido de cursos asignados
- **Student**: Acceso a cursos inscritos y contenido educativo

**Usuarios de prueba:**
```
Admin: admin / Gilda.2026

Profesores:
- carlos.mendez@profesor.com / Profesor.2026
- ana.rodriguez@profesor.com / Profesor.2026
- luis.garcia@profesor.com / Profesor.2026

Estudiantes (ejemplo):
- juan.perez@email.com (DNI: 12345678)
- maria.lopez@email.com (DNI: 87654321)
```

### 2. Gestión de Cursos

**Admin puede:**
- Crear, editar y eliminar cursos
- Asignar profesores a cursos
- Publicar/despublicar cursos
- Ver estadísticas de cursos

**Profesor puede:**
- Ver todos los cursos
- Editar el contenido de sus cursos asignados
- Crear secciones y lecciones

**Tipos de contenido en lecciones:**
- 🎥 **Videos**: YouTube, Vimeo, o archivos MP4 subidos
- 📄 **PDF**: Documentos PDF subidos al Storage
- 📝 **Word**: Documentos .doc y .docx subidos al Storage
- 📖 **Texto/HTML**: Contenido con formato enriquecido
- ❓ **Quiz**: Exámenes interactivos

### 3. Curriculum Builder

**Permite:**
- Crear secciones (módulos) en cada curso
- Agregar diferentes tipos de lecciones
- Subir videos, PDFs y documentos Word
- Generar contenido con IA (integración con Gemini)
- Reordenar contenido

### 4. Visualización de Contenido (Estudiantes)

**Página /courses:**
- Ver lista de cursos inscritos
- Ver progreso de cada curso
- Acceder al contenido de cada curso

**Página /courses/:id:**
- Ver estructura del curso por secciones
- Reproducir videos (YouTube, Vimeo, MP4)
- Ver/Descargar documentos PDF y Word
- Leer contenido de texto formateado
- Marcar lecciones como completadas
- Ver progreso general del curso

### 5. Gestión de Profesores

**Admin puede:**
- Crear cuentas de profesores
- Generar contraseñas temporales
- Enviar correos de invitación (configurar VITE_RESEND_API_KEY)
- Activar/Desactivar cuentas
- Editar información de profesores
- Eliminar profesores

### 6. Sistema de Notificaciones

**Características:**
- Banners flotantes en la esquina superior derecha
- Tipos: success, error, warning, info
- Auto-dismiss después de 4 segundos
- Botón para cerrar manualmente
- Animaciones suaves

## 🚀 Configuración Inicial

### 1. Base de Datos

Ejecutar estos scripts en Supabase Dashboard > SQL Editor:

1. **`add-profile-columns.sql`** - Agrega columnas a profiles
2. **`add-teacher-to-courses.sql`** - Agrega teacher_id a courses
3. **`add-word-url-to-lessons.sql`** - Agrega word_url a lessons
4. **`enroll-students.sql`** - Matricula estudiantes en cursos (opcional)

### 2. Storage Bucket

Configurar manualmente en Supabase Dashboard > Storage:

1. Crear bucket llamado `course-materials`
2. Marcar como **Public bucket**
3. Configurar políticas:
   - INSERT (upload): usuarios autenticados
   - SELECT (read): público
   - DELETE: usuarios autenticados

### 3. Variables de Entorno

```env
VITE_SUPABASE_URL=tu-proyecto-url
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_GEMINI_API_KEY=tu-gemini-key
VITE_RESEND_API_KEY=tu-resend-key (opcional, para correos)
```

## 📱 Uso del Sistema

### Como Admin:

1. **Login**: `admin` / `Gilda.2026`
2. **Dashboard**: Ver estadísticas generales
3. **Gestión de Estudiantes** (/admin/users):
   - Crear, editar, eliminar estudiantes
   - Ver estado de pagos
   - Generar códigos QR

4. **Gestión de Profesores** (/admin/teachers):
   - Crear cuentas de profesores
   - Asignar especialidades
   - Enviar correos de invitación
   - Activar/desactivar cuentas

5. **Gestión de Cursos** (/admin/courses):
   - Crear nuevos cursos
   - Asignar profesores
   - Publicar cursos

6. **Curriculum Builder** (/admin/courses/:id):
   - Crear secciones y lecciones
   - Subir materiales
   - Generar contenido con IA

### Como Profesor:

1. **Login**: Email o DNI + contraseña
2. **Mis Cursos** (/courses): Ver cursos asignados
3. **Editar Contenido** (/admin/courses/:id): Crear y editar lecciones

### Como Estudiante:

1. **Login**: Email o DNI (pendiente implementación de contraseña)
2. **Mis Cursos** (/courses): Ver cursos inscritos
3. **Ver Contenido** (/courses/:id):
   - Ver videos
   - Descargar documentos
   - Completar lecciones

## 🔧 Solución de Problemas

### Error: "column 'active' does not exist"

**Solución:**
```bash
# Ejecutar en Supabase SQL Editor
# Copiar y pegar add-profile-columns.sql
```

### Error: "No puedo subir archivos"

**Solución:**
- Verificar que el bucket `course-materials` existe en Storage
- Verificar que las políticas de RLS están configuradas correctamente
- El bucket debe ser público para que los archivos sean accesibles

### Error: "Los videos no se reproducen"

**Solución:**
- YouTube/Vimeo: Verificar que las URLs sean correctas
- MP4: Verificar que el archivo se subió correctamente
- Verificar que la URL pública del archivo sea accesible

## 📁 Estructura de Archivos

```
src/
├── pages/
│   ├── admin/
│   │   ├── Dashboard.jsx
│   │   ├── CourseManagement.jsx
│   │   ├── CurriculumBuilder.jsx
│   │   ├── UserManagement.jsx
│   │   └── TeacherManagement.jsx
│   ├── CourseContent.jsx          # Visualización de contenido (estudiantes)
│   ├── MyCourses.jsx              # Lista de cursos (estudiantes)
│   └── Login.jsx
├── hooks/
│   └── useNotification.jsx       # Sistema de notificaciones
├── lib/
│   ├── supabase.js
│   └── gemini.js
└── components/shared/
    └── Sidebar.jsx
```

## 🎨 Características de UX

- ✅ Diseño responsivo (mobile-first)
- ✅ Animaciones suaves
- ✅ Feedback visual inmediato
- ✅ Notificaciones tipo toast
- ✅ Modales intuitivos
- ✅ Drag & drop (pendiente implementación)
- ✅ Loading states
- ✅ Error handling

## 🔄 Próximas Mejoras

- [ ] Sistema de contraseñas para estudiantes
- [ ] Quiz interactivo con puntuación
- [ ] Certificados de finalización
- [ ] Sistema de mensajes entre estudiantes y profesores
- [ ] Foros de discusión por curso
- [ ] Análisis de progreso detallado
- [ ] Exportación de reportes
- [ ] Sistema de comentarios en lecciones
