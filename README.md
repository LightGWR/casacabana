# Casa Cabana — site público + painel administrativo

O site público exibe localização, cardápio, imagens e locais para comer sem exigir login. Cada informação abre pelo seu próprio ícone na tela inicial. Somente o painel administrativo exige e-mail e senha.

## Estrutura de acesso

- `index.html`: página pública para qualquer visitante;
- `login.html`: login exclusivo de administradores;
- `admin.html`: painel protegido para editar o conteúdo;
- `assets/`: CSS e JavaScript;
- `supabase/setup.sql`: tabelas, armazenamento de imagens e regras de segurança.

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute `supabase/setup.sql`.
3. Em **Authentication → Users**, crie o usuário administrador.
4. Execute no SQL Editor, trocando o e-mail:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'SEU_EMAIL');
```

5. Preencha `assets/config.js` com a URL e a chave pública do Supabase. Nunca publique a chave `service_role`.

## Publicar no GitHub Pages

Envie todos os arquivos e pastas para a raiz do repositório. O `index.html` deve ficar no mesmo nível de `assets`. Em **Settings → Pages**, escolha **Deploy from a branch**, `main` e `/ (root)`.
