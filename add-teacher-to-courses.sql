-- =====================================================
-- AGREGAR COLUMNA teacher_id A LA TABLA courses
-- Ejecutar esto si necesitas asignar profesores a cursos
-- =====================================================

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

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position;
