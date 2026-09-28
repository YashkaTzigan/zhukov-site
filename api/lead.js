const WHO = new Set(["ребёнок", "подросток", "взрослый"]);

function clean(value, max) {
  return String(value || "").replace(/[\u0000-\u001F]/g, " ").trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    res.status(503).json({ ok: false });
    return;
  }

  const body = req.body || {};
  const name = clean(body.name, 80);
  const who = clean(body.who, 20);
  const phone = clean(body.phone, 20);
  const digits = phone.replace(/\D/g, "");
  if (name.length < 2 || !WHO.has(who) || digits.length < 10 || digits.length > 15) {
    res.status(400).json({ ok: false });
    return;
  }

  const text = ["Заявка с сайта", `ФИО: ${name}`, `Кто: ${who}`, `Телефон: ${phone}`].join("\n");
  let sent = false;
  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    sent = tg.ok;
  } catch (err) {
    sent = false;
  }

  res.status(sent ? 200 : 502).json({ ok: sent });
};
