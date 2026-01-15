-- =====================================================
-- MATRICULAR ESTUDIANTES EN CURSOS (DE PRUEBA)
-- Ejecutar esto para crear enrollments de ejemplo
-- =====================================================

-- Obtener IDs de estudiantes y cursos existentes
-- Ejecuta primero esta consulta para ver los IDs:
SELECT id, full_name, role FROM profiles WHERE role = 'student' LIMIT 5;
SELECT id, name FROM courses LIMIT 5;

-- Ejemplo de matrícula (reemplaza los UUIDs con los reales)
INSERT INTO enrollments (student_id, course_id, progress, status)
VALUES
    ('UUID_DEL_ESTUDIANTE_1', 'UUID_DEL_CURSO_1', 0, 'active'),
    ('UUID_DEL_ESTUDIANTE_2', 'UUID_DEL_CURSO_1', 50, 'active'),
    ('UUID_DEL_ESTUDIANTE_3', 'UUID_DEL_CURSO_2', 100, 'completed')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Verificar matrículas creadas
SELECT
    e.*,
    p.full_name as student_name,
    c.name as course_name
FROM enrollments e
JOIN profiles p ON e.student_id = p.id
JOIN courses c ON e.course_id = c.id
ORDER BY e.enrolled_at DESC;
