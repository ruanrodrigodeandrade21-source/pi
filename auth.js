(() => {
  const config = window.NEXO_SUPABASE_CONFIG || {};
  const configured = config.url && config.anonKey &&
    !config.url.startsWith("COLE_AQUI") && !config.anonKey.startsWith("COLE_AQUI");
  const supabaseLib = window.supabase;

  let client = null;
  if (configured && supabaseLib?.createClient) {
    client = supabaseLib.createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  const showMessage = (element, message, type = "error") => {
    if (!element) return;
    element.textContent = message;
    element.className = `auth-message visible ${type}`;
  };

  // Página de login/cadastro
  const form = document.getElementById("authForm");
  if (form) {
    const title = document.getElementById("authTitle");
    const description = document.getElementById("authDescription");
    const nameField = document.getElementById("nameField");
    const nameLabel = document.getElementById("nameLabel");
    const emailField = document.getElementById("emailField");
    const passwordField = document.getElementById("passwordField");
    const message = document.getElementById("authMessage");
    const submit = document.getElementById("submitButton");
    const loginTab = document.getElementById("loginTab");
    const signupTab = document.getElementById("signupTab");
    const forgot = document.getElementById("forgotButton");
    const passwordToggle = document.getElementById("passwordToggle");
    let mode = "login";

    const setMode = (nextMode) => {
      mode = nextMode;
      const signup = mode === "signup";
      title.textContent = signup ? "Crie sua conta." : "Boas-vindas de volta.";
      description.textContent = signup ? "Cadastre-se para acessar sua área." : "Entre na sua conta para continuar.";
      submit.innerHTML = signup ? 'Criar conta <span>↗</span>' : 'Entrar <span>↗</span>';
      nameField.hidden = !signup;
      nameLabel.hidden = !signup;
      nameField.required = signup;
      passwordField.autocomplete = signup ? "new-password" : "current-password";
      forgot.hidden = signup;
      loginTab.classList.toggle("active", !signup);
      signupTab.classList.toggle("active", signup);
      loginTab.setAttribute("aria-selected", String(!signup));
      signupTab.setAttribute("aria-selected", String(signup));
      message.className = "auth-message";
      message.textContent = "";
    };

    loginTab.addEventListener("click", () => setMode("login"));
    signupTab.addEventListener("click", () => setMode("signup"));
    passwordToggle.addEventListener("click", () => {
      const visible = passwordField.type === "text";
      passwordField.type = visible ? "password" : "text";
      passwordToggle.textContent = visible ? "Mostrar" : "Ocultar";
      passwordToggle.setAttribute("aria-label", visible ? "Mostrar senha" : "Ocultar senha");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      message.className = "auth-message";
      if (!client) {
        showMessage(message, "A autenticação ainda não foi configurada. Siga o arquivo CONFIGURAR-AUTENTICACAO.md para conectar o Supabase.");
        return;
      }
      const email = emailField.value.trim();
      const password = passwordField.value;
      submit.disabled = true;
      submit.textContent = mode === "signup" ? "Criando conta..." : "Entrando...";
      try {
        if (mode === "signup") {
          const { data, error } = await client.auth.signUp({
            email, password,
            options: { data: { full_name: nameField.value.trim() } }
          });
          if (error) throw error;
          if (data.session) {
            window.location.href = "index.html";
          } else {
            showMessage(message, "Cadastro realizado! Confira seu e-mail para confirmar a conta.", "success");
          }
        } else {
          const { error } = await client.auth.signInWithPassword({ email, password });
          if (error) throw error;
          window.location.href = "index.html";
        }
      } catch (error) {
        showMessage(message, error.message || "Não foi possível concluir. Tente novamente.");
      } finally {
        submit.disabled = false;
        submit.innerHTML = mode === "signup" ? 'Criar conta <span>↗</span>' : 'Entrar <span>↗</span>';
      }
    });

    forgot.addEventListener("click", async () => {
      if (!client) return showMessage(message, "Configure o Supabase antes de recuperar a senha.");
      const email = emailField.value.trim();
      if (!email) return showMessage(message, "Informe seu e-mail primeiro.");
      try {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + window.location.pathname
        });
        if (error) throw error;
        showMessage(message, "Se esse e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.", "success");
      } catch (error) {
        showMessage(message, error.message || "Não foi possível enviar o e-mail.");
      }
    });

    if (client) client.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace("index.html");
    });
  }

  // Estado de autenticação no site principal e botão de sair
  const authAction = document.getElementById("authAction");
  if (authAction) {
    if (!client) {
      authAction.href = "login.html";
      authAction.textContent = "Entrar";
    } else {
      client.auth.getSession().then(({ data }) => {
        if (data.session) {
          authAction.textContent = "Sair";
          authAction.href = "#sair";
          authAction.addEventListener("click", async (event) => {
            event.preventDefault();
            authAction.textContent = "Saindo...";
            const { error } = await client.auth.signOut();
            if (error) {
              authAction.textContent = "Tentar novamente";
              return;
            }
            window.location.reload();
          }, { once: true });
        } else {
          authAction.textContent = "Entrar";
          authAction.href = "login.html";
        }
      });
    }
  }
})();
