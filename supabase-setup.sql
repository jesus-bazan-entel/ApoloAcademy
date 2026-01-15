-- =====================================================
-- SCRIPT DE CONFIGURACIÓN SUPABASE - APOLO ACADEMY
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. CREAR TABLAS PRINCIPALES
-- =====================================================

-- Tabla de perfiles (estudiantes y administradores)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    dni TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'author', 'student')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    student_level TEXT,
    student_section TEXT,
    qr_code_hash TEXT UNIQUE,
    avatar_url TEXT,
    password TEXT,
    specialization TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FORZAR ACTUALIZACIÓN DE LA COLUMNA active SI YA EXISTE LA TABLA
ALTER TABLE profiles ALTER COLUMN active SET DEFAULT TRUE;

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),
    lessons_count INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de secciones (módulos dentro de cursos)
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de lecciones
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'pdf', 'word', 'quiz', 'text')),
    video_url TEXT,
    pdf_url TEXT,
    word_url TEXT,
    content_html TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    questions JSONB NOT NULL DEFAULT '[]',
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de matrículas (estudiantes en cursos)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, course_id)
);

-- Tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    quiz_score INTEGER,
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, lesson_id)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    notes TEXT,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 ELIMINAR FOREIGN KEY A AUTH.USERS (si existe)
-- =====================================================

-- Eliminar la restricción FK que vincula profiles.id a auth.users
DO $$
BEGIN
    -- Intentar eliminar la FK constraint si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'profiles_id_fkey'
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
END $$;

-- 1.6 AGREGAR COLUMNAS FALTANTES Y CORREGIR DEFAULTS (si la tabla ya existe)
-- =====================================================

-- Asegurar que el ID tenga valor por defecto
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE courses ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE sections ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE lessons ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE quizzes ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE enrollments ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE lesson_progress ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE payments ALTER COLUMN id SET DEFAULT gen_random_uuid();

DO $$
BEGIN
    -- Columnas para profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dni') THEN
        ALTER TABLE profiles ADD COLUMN dni TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'student_level') THEN
        ALTER TABLE profiles ADD COLUMN student_level TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'student_section') THEN
        ALTER TABLE profiles ADD COLUMN student_section TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'qr_code_hash') THEN
        ALTER TABLE profiles ADD COLUMN qr_code_hash TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payment_status') THEN
        ALTER TABLE profiles ADD COLUMN payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'password') THEN
        ALTER TABLE profiles ADD COLUMN password TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'specialization') THEN
        ALTER TABLE profiles ADD COLUMN specialization TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'active') THEN
        ALTER TABLE profiles ADD COLUMN active BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'password') THEN
        ALTER TABLE profiles ADD COLUMN password TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'specialization') THEN
        ALTER TABLE profiles ADD COLUMN specialization TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'active') THEN
        ALTER TABLE profiles ADD COLUMN active BOOLEAN DEFAULT TRUE;
    END IF;

    -- Columnas para courses
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'description') THEN
        ALTER TABLE courses ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'image_url') THEN
        ALTER TABLE courses ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
        ALTER TABLE courses ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'lessons_count') THEN
        ALTER TABLE courses ADD COLUMN lessons_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'rating') THEN
        ALTER TABLE courses ADD COLUMN rating DECIMAL(2,1) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'price') THEN
        ALTER TABLE courses ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'updated_at') THEN
        ALTER TABLE courses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'created_at') THEN
        ALTER TABLE courses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'teacher_id') THEN
        ALTER TABLE courses ADD COLUMN teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;

    -- Columnas para profiles (adicionales)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'author', 'student'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Columnas para sections
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sections' AND column_name = 'description') THEN
        ALTER TABLE sections ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sections' AND column_name = 'order_index') THEN
        ALTER TABLE sections ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;

    -- Columnas para lessons
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'description') THEN
        ALTER TABLE lessons ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'content_type') THEN
        ALTER TABLE lessons ADD COLUMN content_type TEXT DEFAULT 'video';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'video_url') THEN
        ALTER TABLE lessons ADD COLUMN video_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'pdf_url') THEN
        ALTER TABLE lessons ADD COLUMN pdf_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'word_url') THEN
        ALTER TABLE lessons ADD COLUMN word_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'content_html') THEN
        ALTER TABLE lessons ADD COLUMN content_html TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'duration_minutes') THEN
        ALTER TABLE lessons ADD COLUMN duration_minutes INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'order_index') THEN
        ALTER TABLE lessons ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_payment_status ON profiles(payment_status);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_sections_course ON sections(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section ON lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- 3. ELIMINAR POLÍTICAS RLS EXISTENTES Y DESHABILITAR RLS
-- =====================================================

-- Eliminar todas las políticas existentes de cada tabla
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'courses', 'sections', 'lessons', 'quizzes', 'enrollments', 'lesson_progress', 'payments')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Deshabilitar RLS en todas las tablas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- 4. FUNCIÓN PARA ACTUALIZAR CONTADOR DE LECCIONES
-- =====================================================

CREATE OR REPLACE FUNCTION update_lessons_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses
    SET lessons_count = (
        SELECT COUNT(*)
        FROM lessons l
        JOIN sections s ON l.section_id = s.id
        WHERE s.course_id = (
            SELECT course_id FROM sections WHERE id = COALESCE(NEW.section_id, OLD.section_id)
        )
    ),
    updated_at = NOW()
    WHERE id = (
        SELECT course_id FROM sections WHERE id = COALESCE(NEW.section_id, OLD.section_id)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contador
DROP TRIGGER IF EXISTS trigger_update_lessons_count ON lessons;
CREATE TRIGGER trigger_update_lessons_count
AFTER INSERT OR DELETE ON lessons
FOR EACH ROW EXECUTE FUNCTION update_lessons_count();

-- 5. FUNCIÓN PARA GENERAR QR CODE HASH AUTOMÁTICO
-- =====================================================

CREATE OR REPLACE FUNCTION generate_qr_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.qr_code_hash IS NULL AND NEW.role = 'student' THEN
        NEW.qr_code_hash := 'APOLO-STU-' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_qr_hash ON profiles;
CREATE TRIGGER trigger_generate_qr_hash
BEFORE INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION generate_qr_hash();

-- 6. FUNCIÓN PARA ACTUALIZAR TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated ON profiles;
CREATE TRIGGER trigger_profiles_updated
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_courses_updated ON courses;
CREATE TRIGGER trigger_courses_updated
BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. INSERTAR DATOS DE EJEMPLO
-- =====================================================

-- Insertar administrador (solo si no existe)
INSERT INTO profiles (full_name, email, role, payment_status)
SELECT 'Administrador', 'admin@apoloacademy.com', 'admin', 'paid'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@apoloacademy.com');

-- Insertar estudiantes de ejemplo (solo si no existen)
INSERT INTO profiles (full_name, email, dni, phone, role, payment_status, student_level, student_section)
SELECT 'Juan Pérez García', 'juan.perez@email.com', '12345678', '987654321', 'student', 'paid', 'Ciclo I', 'A'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'juan.perez@email.com');

INSERT INTO profiles (full_name, email, dni, phone, role, payment_status, student_level, student_section)
SELECT 'María López Torres', 'maria.lopez@email.com', '87654321', '912345678', 'student', 'paid', 'Ciclo I', 'B'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'maria.lopez@email.com');

INSERT INTO profiles (full_name, email, dni, phone, role, payment_status, student_level, student_section)
SELECT 'Carlos Ruiz Mendoza', 'carlos.ruiz@email.com', '11223344', '945678123', 'student', 'unpaid', 'Ciclo II', 'A'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'carlos.ruiz@email.com');

INSERT INTO profiles (full_name, email, dni, phone, role, payment_status, student_level, student_section)
SELECT 'Ana García Silva', 'ana.garcia@email.com', '44332211', '978123456', 'student', 'partial', 'Ciclo I', 'A'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'ana.garcia@email.com');

INSERT INTO profiles (full_name, email, dni, phone, role, payment_status, student_level, student_section)
SELECT 'Pedro Martínez Vega', 'pedro.martinez@email.com', '55667788', '956789012', 'student', 'paid', 'Ciclo II', 'B'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'pedro.martinez@email.com');

-- Insertar profesores de ejemplo (solo si no existen)
INSERT INTO profiles (full_name, email, dni, phone, role, password, specialization, active)
SELECT 'Lic. Carlos Méndez', 'carlos.mendez@profesor.com', '99887766', '912345670', 'author', 'Profesor.2026', 'Matemáticas y Física', TRUE
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'carlos.mendez@profesor.com');

INSERT INTO profiles (full_name, email, dni, phone, role, password, specialization, active)
SELECT 'Lic. Ana Rodríguez', 'ana.rodriguez@profesor.com', '88776655', '923456781', 'author', 'Profesor.2026', 'Razonamiento Verbal', TRUE
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'ana.rodriguez@profesor.com');

INSERT INTO profiles (full_name, email, dni, phone, role, password, specialization, active)
SELECT 'Lic. Luis García', 'luis.garcia@profesor.com', '77665544', '934567892', 'author', 'Profesor.2026', 'Historia y Geografía', TRUE
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'luis.garcia@profesor.com');

-- Insertar cursos de ejemplo (solo si no existen)
INSERT INTO courses (name, description, status, price)
SELECT 'Matemática Básica', 'Fundamentos de aritmética, álgebra y geometría para el examen de admisión', 'live', 150.00
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Matemática Básica');

INSERT INTO courses (name, description, status, price)
SELECT 'Razonamiento Verbal', 'Comprensión lectora, analogías y oraciones incompletas', 'live', 150.00
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Razonamiento Verbal');

INSERT INTO courses (name, description, status, price)
SELECT 'Razonamiento Matemático', 'Lógica, series y problemas de ingenio', 'live', 150.00
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Razonamiento Matemático');

INSERT INTO courses (name, description, status, price)
SELECT 'Historia del Perú', 'Desde las culturas preincas hasta la historia republicana', 'draft', 120.00
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Historia del Perú');

INSERT INTO courses (name, description, status, price)
SELECT 'Geografía', 'Geografía física y humana del Perú y el mundo', 'draft', 120.00
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Geografía');

-- 8. VISTA PARA ESTADÍSTICAS DEL DASHBOARD
-- =====================================================

CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM profiles WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM profiles WHERE role = 'student' AND payment_status = 'paid') as paid_students,
    (SELECT COUNT(*) FROM profiles WHERE role = 'student' AND payment_status = 'unpaid') as unpaid_students,
    (SELECT COUNT(*) FROM courses WHERE status = 'live') as active_courses,
    (SELECT COUNT(*) FROM courses) as total_courses,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND payment_date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_revenue;

-- 9. CONFIGURACIÓN DE STORAGE PARA MATERIALES EDUCATIVOS
-- =====================================================
-- IMPORTANTE: Ejecutar esto en SQL Editor NO funcionará para Storage.
-- Debe configurarse manualmente en Supabase Dashboard > Storage

-- Instrucciones para configurar Storage:
-- 1. Ir a Supabase Dashboard > Storage
-- 2. Crear un nuevo bucket llamado "course-materials"
-- 3. Marcar como "Public bucket" para permitir acceso a URLs públicas
-- 4. En Policies, crear las siguientes políticas:

-- Política para INSERT (subir archivos):
-- - Policy name: "Allow authenticated uploads"
-- - Allowed operation: INSERT
-- - Target roles: authenticated
-- - Policy definition: true

-- Política para SELECT (ver archivos):
-- - Policy name: "Allow public read access"
-- - Allowed operation: SELECT
-- - Target roles: anon, authenticated
-- - Policy definition: true

-- Política para DELETE (eliminar archivos):
-- - Policy name: "Allow authenticated deletes"
-- - Allowed operation: DELETE
-- - Target roles: authenticated
-- - Policy definition: true

-- Alternativa: Ejecutar este SQL para crear el bucket programáticamente
-- (Nota: Esto requiere permisos de service_role)
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Política para subir archivos (usuarios autenticados)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-materials');

-- Política para ver archivos (público)
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'course-materials');

-- Política para eliminar archivos (usuarios autenticados)
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'course-materials');
*/

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Para ejecutar: Copiar todo el contenido y pegarlo en
-- Supabase Dashboard > SQL Editor > New Query > Run
--
-- IMPORTANTE: Después de ejecutar el SQL, configurar
-- manualmente el Storage bucket siguiendo las instrucciones
-- de la sección 9.
-- =====================================================
