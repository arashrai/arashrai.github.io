const SUPABASE_URL = "https://puaovacwoxelmijgowof.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1YW92YWN3b3hlbG1pamdvd29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTQxMzIsImV4cCI6MjA4NDg5MDEzMn0.HvgBPsXqzTCqe48DueMhD8bYzTWWjIrfA1Ci4NVdtY4";

const gateEl = document.getElementById("gate");
const contentEl = document.getElementById("content");
const formEl = document.getElementById("login-form");
const emailEl = document.getElementById("email");
const statusEl = document.getElementById("status");
const submitEl = document.getElementById("submit");

const hasKeys =
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

if (!hasKeys) {
  statusEl.textContent = "Supabase is not configured yet.";
} else {
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const showContent = () => {
    gateEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  };

  const showGate = () => {
    contentEl.classList.add("hidden");
    gateEl.classList.remove("hidden");
  };

  const exchangeIfCodePresent = async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (!code) return;

    const { error } = await supabaseClient.auth.exchangeCodeForSession(code);
    if (error) {
      statusEl.textContent = "Unable to verify link. Try again.";
      return;
    }

    url.searchParams.delete("code");
    window.history.replaceState({}, document.title, url.toString());
  };

  const refreshAuthState = async () => {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
      showContent();
    } else {
      showGate();
    }
  };

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusEl.textContent = "";
    submitEl.disabled = true;

    const email = emailEl.value.trim();
    if (!email) {
      statusEl.textContent = "Enter a valid email.";
      submitEl.disabled = false;
      return;
    }

    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname,
      },
    });

    if (error) {
      statusEl.textContent = error.message;
      submitEl.disabled = false;
      return;
    }

    statusEl.textContent = "Check your email for the access link.";
    submitEl.disabled = false;
  });

  (async () => {
    await exchangeIfCodePresent();
    await refreshAuthState();
  })();
}
