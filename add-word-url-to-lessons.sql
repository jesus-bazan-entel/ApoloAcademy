-- =====================================================
-- AGREGAR COLUMNA word_url A LA TABLA lessons
-- Ejecutar esto para soportar documentos Word en lecciones
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lessons' AND column_name = 'word_url'
    ) THEN
        ALTER TABLE lessons ADD COLUMN word_url TEXT;
        RAISE NOTICE 'Columna word_url agregada a lessons';
    ELSE
        RAISE NOTICE 'Columna word_url ya existe en lessons';
    END IF;
END $$;

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lessons'
ORDER BY ordinal_position;
