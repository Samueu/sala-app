import { createClient } from '@supabase/supabase-js';

// Fallback só pra não quebrar o build/SSR quando .env.local ainda não foi
// configurado (createClient lança exceção síncrona com URL vazia). Sem as
// variáveis reais, as chamadas de auth falham normalmente em tempo de uso
// (erro de rede/DNS), não na inicialização do módulo.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, publishableKey);
