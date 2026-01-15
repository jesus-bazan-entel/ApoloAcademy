# Configuración de la Base de Datos - Apolo Academy

## ⚠️ SOLUCIÓN INMEDIATA - Ejecuta estos scripts en orden

### PASO 1 - Agregar columnas faltantes a profiles

Si estás recibiendo el error `column "active" of relation "profiles" does not exist`:

1. **Abrir Supabase Dashboard** → https://supabase.com/dashboard → Tu proyecto

2. **Ve a SQL Editor** → "New Query"

3. **Copia y pega el contenido de `add-profile-columns.sql`** y haz clic en "Run"

Deberías ver:
```
NOTICE: Columna password agregada
NOTICE: Columna specialization agregada
NOTICE: Columna active agregada
```

### PASO 2 - Agregar columna word_url a lessons (para documentos Word)

1. En el mismo SQL Editor, crea un nuevo query
2. **Copia y pega el contenido de `add-word-url-to-lessons.sql`**
3. Haz clic en "Run"

Deberías ver:
```
NOTICE: Columna word_url agregada a lessons
```

### PASO 3 - Agregar columna teacher_id a courses (opcional, para asignar profesores)

### PASO 1: Agregar las columnas faltantes

1. **Abrir Supabase Dashboard**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Abrir SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New Query"

3. **Ejecutar el script de columnas faltantes**
   - Abre el archivo `add-profile-columns.sql` en tu proyecto
   - Copia TODO el contenido
   - Pégalo en el editor SQL de Supabase
   - Haz clic en "Run"

4. **Verificar que se agregaron las columnas**
   Deberías ver mensajes como:
   ```
   NOTICE:  Columna password agregada
   NOTICE:  Columna specialization agregada
   NOTICE:  Columna active agregada
   ```

   Y al final una tabla con todas las columnas de profiles.

### PASO 2: Agregar columna teacher_id a courses

Si también necesitas la columna para asignar profesores a cursos, ejecuta:

```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'teacher_id'
    ) THEN
        ALTER TABLE courses ADD COLUMN teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
        RAISE NOTICE 'Columna teacher_id agregada a courses';
    ELSE
        RAISE NOTICE 'Columna teacher_id ya existe en courses';
    END IF;
END $$;
```

---

## Instrucciones completas (opcional si necesitas recrear todo)

Si necesitas ejecutar el script completo desde cero:

### Pasos para ejecutar el script completo:

1. **Abrir Supabase Dashboard**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Abrir SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New Query"

3. **Ejecutar el SQL completo**
   - Copia todo el contenido del archivo `supabase-setup.sql`
   - Pégalo en el editor SQL
   - Haz clic en "Run"

### Verificar la tabla profiles

Después de ejecutar, puedes verificar ejecutando:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

   Deberías ver las siguientes columnas:
   - `id` (UUID)
   - `full_name` (TEXT)
   - `email` (TEXT)
   - `dni` (TEXT)
   - `phone` (TEXT)
   - `role` (TEXT)
   - `payment_status` (TEXT)
   - `student_level` (TEXT)
   - `student_section` (TEXT)
   - `qr_code_hash` (TEXT)
   - `avatar_url` (TEXT)
   - `password` (TEXT) ← NUEVA
   - `specialization` (TEXT) ← NUEVA
   - `active` (BOOLEAN) ← NUEVA
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

## Configuración de Storage Bucket

Para que la subida de archivos funcione, necesitas configurar manualmente el Storage bucket:

1. En Supabase Dashboard, ve a **Storage**
2. Haz clic en **Create a new bucket**
3. Nombre: `course-materials`
4. Marca **Public bucket**
5. Haz clic en **Create bucket**

### Configurar Políticas del Bucket

En la pestaña **Policies** del bucket `course-materials`, crea estas políticas:

**Política para subir archivos:**
- Nombre: `Allow authenticated uploads`
- Operación: `INSERT`
- Roles: `authenticated`
- Definición: `true`

**Política para ver archivos:**
- Nombre: `Allow public read access`
- Operación: `SELECT`
- Roles: `anon`, `authenticated`
- Definición: `true`

**Política para eliminar archivos:**
- Nombre: `Allow authenticated deletes`
- Operación: `DELETE`
- Roles: `authenticated`
- Definición: `true`

## Configuración de Variables de Entorno

Para enviar correos de invitación a profesores, necesitas agregar tu API key de Resend:

1. Ve a `https://resend.com/api-keys`
2. Crea una nueva API key
3. Agrega al archivo `.env`:
   ```
   VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

## Datos de Prueba

El script SQL incluye usuarios de prueba:

**Admin:**
- Usuario: `admin`
- Contraseña: `Gilda.2026`

**Profesores (ejemplo):**
- carlos.mendez@profesor.com / Profesor.2026
- ana.rodriguez@profesor.com / Profesor.2026
- luis.garcia@profesor.com / Profesor.2026

**Estudiantes (ejemplo):**
- juan.perez@email.com (Ciclo I, Sección A)
- maria.lopez@email.com (Ciclo I, Sección B)
- carlos.ruiz@email.com (Ciclo II, Sección A)
- ana.garcia@email.com (Ciclo I, Sección A)
- pedro.martinez@email.com (Ciclo II, Sección B)

## Estructura de Roles

- **admin**: Acceso completo a todas las funcionalidades
- **author** (profesor): Puede crear y editar contenido de cursos asignados
- **student**: Acceso a cursos inscritos (pendiente implementación)
