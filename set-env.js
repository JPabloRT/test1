const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || 'https://uuunmfghouakhtaxikhc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const content = `export const environment = {
  supabaseUrl: '${supabaseUrl}',
  supabaseAnonKey: '${supabaseAnonKey}',
};
`;

fs.writeFileSync('src/environments/environment.ts', content);
console.log('environment.ts generated successfully');
