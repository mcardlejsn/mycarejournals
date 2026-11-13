(() => {
  if (document.getElementById("mcj-chat")) return;
  const endpoint = document.currentScript.dataset.endpoint || "/api/chat";
  const host = document.createElement("div");
  host.id = "mcj-chat";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      :host { position: fixed; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); z-index: 10000; font: 16px/1.5 system-ui, sans-serif; color: #172936; }
      * { box-sizing: border-box; }
      [hidden] { display: none !important; }
      button, textarea { font: inherit; }
      button { cursor: pointer; min-height: 44px; border: 1px solid #8aa6aa; border-radius: 10px; padding: 8px 12px; color: #173b3b; background: #edf9f7; }
      button:disabled { cursor: wait; opacity: .65; }
      :focus-visible { outline: 3px solid #d49a2d; outline-offset: 3px; }
      #launcher { display: flex; align-items: center; gap: 9px; margin-left: auto; background: #50decb; color: #08252c; border: 1px solid #123e40; border-radius: 28px; padding: 12px 18px; font-weight: 750; box-shadow: 0 5px 22px #08131e33; }
      .icon { width: 20px; height: 16px; border: 2px solid currentColor; border-radius: 5px; position: relative; }
      .icon:after { content: ""; position: absolute; bottom: -5px; left: 3px; width: 5px; height: 5px; background: #50decb; border-left: 2px solid; transform: skewY(-35deg); }
      #panel { width: min(390px, calc(100vw - 32px)); height: min(580px, calc(100dvh - 100px)); background: #fff; border: 1px solid #bfd1d4; border-radius: 18px; margin-bottom: 12px; box-shadow: 0 14px 50px #08131e40; display: flex; flex-direction: column; overflow: hidden; }
      header { background: #08131e; color: white; display: flex; align-items: center; justify-content: space-between; padding: 10px 12px 10px 18px; gap: 10px; }
      h2 { margin: 0; font-size: 18px; line-height: 1.3; }
      header span { display: block; color: #b9d0d4; font-size: 13px; }
      #close { background: transparent; border-color: #ffffff50; color: #fff; font-size: 23px; line-height: 1; }
      #scroll { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; padding: 16px; }
      .intro { margin: 0 0 12px; }
      #examples { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 12px; }
      #examples button { font-size: 14px; text-align: left; }
      .message { border-radius: 12px; background: #edf4f5; padding: 10px 12px; margin: 12px 0; }
      .message.user { background: #dff8f2; margin-left: 22px; }
      .message strong { font-size: 13px; }
      .message p { margin: 3px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }
      form { border-top: 1px solid #dce5e8; padding: 12px 16px; }
      label { display: block; font-weight: 650; font-size: 14px; margin-bottom: 5px; }
      .compose { display: flex; align-items: flex-end; gap: 8px; }
      textarea { width: 100%; min-width: 0; min-height: 48px; max-height: 100px; resize: vertical; border: 1px solid #8aa6aa; border-radius: 9px; padding: 10px; color: #172936; background: #fff; }
      #send { background: #50decb; color: #08252c; border-color: #1c8277; font-weight: 700; }
      .privacy { font-size: 12px; color: #52636b; line-height: 1.4; margin: 9px 0 0; }
      #status { font-size: 14px; margin: 8px 0 0; overflow-wrap: anywhere; }
      #status:empty { margin: 0; }
    </style>
    <section id="panel" role="dialog" aria-labelledby="title" hidden>
      <header><div><h2 id="title">Ask about the app</h2><span>My Care Journals · AI assistant</span></div><button id="close" type="button" aria-label="Close chat">×</button></header>
      <div id="scroll">
        <p class="intro">Hi! What would you like to know about My Care Journals?</p>
        <div id="examples" aria-label="Suggested questions">
          <button type="button">Is it free?</button>
          <button type="button">Which journals are available?</button>
          <button type="button">How private are my notes?</button>
        </div>
        <div id="messages" role="log" aria-label="Conversation" aria-live="polite"></div>
      </div>
      <form>
        <label for="question">Your question</label>
        <div class="compose"><textarea id="question" rows="1" maxlength="500" required></textarea><button id="send" type="submit">Send</button></div>
        <p id="status" role="status"></p>
        <p class="privacy">AI answers can be mistaken. Messages go to Cloudflare. Please leave out personal or medical details.</p>
      </form>
    </section>
    <button id="launcher" type="button" aria-expanded="false" aria-controls="panel"><span class="icon" aria-hidden="true"></span>Ask about the app</button>
  `;
  document.body.append(host);
  const panel = root.querySelector("#panel");
  const launcher = root.querySelector("#launcher");
  const close = root.querySelector("#close");
  const form = root.querySelector("form");
  const question = root.querySelector("#question");
  const send = root.querySelector("#send");
  const status = root.querySelector("#status");
  const messages = root.querySelector("#messages");
  const scroll = root.querySelector("#scroll");
  const conversation = [];
  let busy = false;

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) question.focus();
    else launcher.focus();
  }
  launcher.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  root.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      setOpen(false);
    }
  });
  root.querySelectorAll("#examples button").forEach(button => {
    button.addEventListener("click", () => {
      if (busy) return;
      question.value = button.textContent;
      form.requestSubmit();
    });
  });
  question.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  function addMessage(role, text) {
    const box = document.createElement("div");
    box.className = "message " + role;
    const name = document.createElement("strong");
    name.textContent = role === "user" ? "You" : "AI";
    const content = document.createElement("p");
    content.textContent = text;
    box.append(name, content);
    messages.append(box);
    scroll.scrollTop = scroll.scrollHeight;
    return box;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const text = question.value.trim();
    if (!text || busy) return;
    busy = true;
    send.disabled = true;
    question.readOnly = true;
    root.querySelector("#examples").hidden = true;
    const userMessage = addMessage("user", text);
    status.textContent = "Thinking…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: conversation.slice(-6) }),
        signal: AbortSignal.timeout(45000),
        credentials: "omit",
      });
      let result;
      try { result = await response.json(); }
      catch { throw new Error("Chat is temporarily unavailable. Please try again later."); }
      if (!response.ok || typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error(result.error || "Chat is temporarily unavailable.");
      }
      addMessage("assistant", result.reply);
      conversation.push({ role: "user", content: text }, { role: "assistant", content: result.reply });
      conversation.splice(0, Math.max(0, conversation.length - 6));
      question.value = "";
      status.textContent = "";
    } catch (error) {
      userMessage.remove();
      status.textContent = error.name === "TimeoutError"
        ? "The reply took too long. Please try again."
        : error instanceof TypeError
          ? "Could not connect to chat. Please try again."
          : error.message;
    } finally {
      busy = false;
      send.disabled = false;
      question.readOnly = false;
    }
  });
})();
