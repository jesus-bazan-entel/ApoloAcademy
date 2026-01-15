// Script para crear el usuario admin por defecto en Supabase
// Ejecuta este script una sola vez para crear el usuario admin

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltan las variables de entorno de Supabase.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  const email = 'admin@apoloacademy.com';
  const password = 'ApoloNext.2026';
  const full_name = 'Administrador';

  // Crear usuario en auth
  const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name }
  });

  if (signUpError) {
    console.error('Error creando usuario:', signUpError.message);
    return;
  }

  // Insertar perfil con rol admin
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.user.id,
    email,
    full_name,
    role: 'admin',
    payment_status: 'paid'
  });

  if (profileError) {
    console.error('Error creando perfil:', profileError.message);
    return;
  }

  console.log('Usuario admin creado correctamente.');
}

createAdminUser();
