# Configurar login e cadastro da Nexo

O projeto continua em HTML, CSS e JavaScript. A autenticação usa **Supabase Auth**, que gerencia senhas, sessões, confirmação de e-mail e recuperação de senha. Não há senha armazenada no navegador.

## 1. Criar o projeto Supabase
1. Acesse https://supabase.com e crie um projeto.
2. No painel, abra **Project Settings → API**.
3. Copie a **Project URL** e a chave **publishable** (ou a chave pública/anon legada).

## 2. Configurar o site
Abra `supabase-config.js` e substitua:
- `COLE_AQUI_A_SUPABASE_PROJECT_URL` pela Project URL.
- `COLE_AQUI_A_CHAVE_PUBLICAVEL` pela chave pública/publishable.

A chave pública é destinada ao navegador. **Nunca use a chave `service_role` no site.**

## 3. Ajustar URLs de autenticação
No Supabase, entre em **Authentication → URL Configuration**:
- Site URL: endereço principal publicado na Vercel.
- Redirect URLs: adicione o endereço publicado e o endereço de preview usado para testes, se houver.

## 4. Publicar e testar
Faça o deploy na Vercel. Teste:
- Cadastro com nome, e-mail e senha (mínimo de 6 caracteres).
- Confirmação de e-mail, caso esteja habilitada no Supabase.
- Login e persistência da sessão ao atualizar a página.
- Sair pelo botão no cabeçalho.
- Recuperação de senha.

## Arquivos adicionados
- `login.html` e `login.css`: tela de acesso responsiva.
- `auth.js`: login, cadastro, recuperação de senha, sessão e logout.
- `supabase-config.js`: configuração pública do projeto Supabase.

**Importante:** o código da interface já está preparado, mas o login só autentica usuários reais depois que as credenciais públicas do seu projeto Supabase forem configuradas e as URLs autorizadas. Não coloque credenciais privadas neste repositório.
