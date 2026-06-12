-- SQL para configurar la tabla del Catálogo de Cuentas (PCGE) en Supabase
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase

-- 1. Crear la tabla
CREATE TABLE public.pcge_catalogo (
    codigo TEXT PRIMARY KEY,
    descripcion TEXT NOT NULL,
    nivel INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.pcge_catalogo ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Acceso (Lectura y Escritura para la API/cliente)
CREATE POLICY "Permitir lectura pública" 
ON public.pcge_catalogo 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserción pública" 
ON public.pcge_catalogo 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir actualización pública" 
ON public.pcge_catalogo 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminación pública" 
ON public.pcge_catalogo 
FOR DELETE 
USING (true);
