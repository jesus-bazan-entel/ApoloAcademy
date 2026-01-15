-- =====================================================
-- AGREGAR COLUMNAS FALTANTES A LA TABLA profiles
-- Ejecutar esto PRIMERO si la tabla ya existe
-- =====================================================

-- 1. Agregar columna password si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'password'
    ) THEN
        ALTER TABLE profiles ADD COLUMN password TEXT;
        RAISE NOTICE 'Columna password agregada';
    ELSE
        RAISE NOTICE 'Columna password ya existe';
    END IF;
END $$;

-- 2. Agregar columna specialization si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'specialization'
    ) THEN
        ALTER TABLE profiles ADD COLUMN specialization TEXT;
        RAISE NOTICE 'Columna specialization agregada';
    ELSE
        RAISE NOTICE 'Columna specialization ya existe';
    END IF;
END $$;

-- 3. Agregar columna active si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Columna active agregada';
    ELSE
        RAISE NOTICE 'Columna active ya existe';
    END IF;
END $$;

-- 4. Verificar todas las columnas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
