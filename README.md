# LAPREGILDA - Centro de Preparación Académica

Sistema de gestión de aprendizaje (LMS) para el **Centro de Preparación Académica LAPREGILDA**, especializado en la preparación para el examen de admisión del **IESTP Gilda Ballivián Rosado**.

## Características
- **Módulo Administrativo**: Gestión de cursos, currículum, estudiantes y analíticas.
- **Módulo de Estudiantes**: App móvil-friendly para ver clases, materiales y rendir exámenes.
- **Integración de IA (Gemini)**: Generación automática de lecciones y cuestionarios.
- **Identificación QR**: Códigos QR únicos para la validación de estudiantes.
- **Backend Serverless**: Powered by Supabase.

## Requisitos Previos
1. Una cuenta en [Supabase](https://supabase.com).
2. Una cuenta en [Google AI Studio](https://aistudio.google.com) para la API de Gemini.
3. Node.js instalado (para desarrollo local).

## Configuración de Supabase

Crea las siguientes tablas en tu base de datos de Supabase:

### 1. Perfiles de Usuario (`profiles`)
- `id`: uuid (Primary Key, vinculada a auth.users)
- `full_name`: text
- `email`: text
- `role`: text ('admin', 'author', 'student')
- `qr_code_hash`: text
- `payment_status`: text ('paid', 'unpaid')
- `student_level`: text
- `student_section`: text

### 2. Cursos (`courses`)
- `id`: uuid (Primary Key)
- `name`: text
- `status`: text ('draft', 'live')
- `image_url`: text
- `lessons_count`: int
- `rating`: double

### 3. Secciones (`sections`)
- `id`: uuid (Primary Key)
- `course_id`: uuid (Foreign Key -> courses.id)
- `name`: text
- `order_index`: int

### 4. Lecciones (`lessons`)
- `id`: uuid (Primary Key)
- `section_id`: uuid (Foreign Key -> sections.id)
- `name`: text
- `content_type`: text ('video', 'pdf', 'quiz')
- `video_url`: text
- `pdf_url`: text
- `order_index`: int

### 5. Cuestionarios (`quizzes`)
- `id`: uuid (Primary Key)
- `lesson_id`: uuid (Foreign Key -> lessons.id)
- `questions`: jsonb

## Despliegue en Vercel

1. Sube este código a un repositorio de GitHub.
2. Ve a [Vercel](https://vercel.com) y conecta tu repositorio.
3. Configura las siguientes variables de entorno en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
4. ¡Despliega! Vercel detectará automáticamente que es un proyecto de Vite.

## Desarrollo Local
```bash
npm install
npm run dev
```

---

**LAPREGILDA** - Preparándote para tu futuro en el IESTP Gilda Ballivián Rosado
