const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

// .env.local dagi API_ID va API_HASH ni shu yerga qo'ying
const apiId = 18349141; // O'zingiznikini yozing
const apiHash = "fa3a10f79ac5765fa9cd9a977a1923d3"; // O'zingiznikini yozing

// Bu yerda StringSession ni yaratamiz
const stringSession = new StringSession("");

(async () => {
  console.log("Sessiya generatsiyasini boshlash...");

  // va uni TelegramClient ga uzatamiz
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () =>
      await input.text(
        "Iltimos, telefon raqamingizni kiriting (+998xxxxxxxxx): "
      ),
    password: async () =>
      await input.text(
        "Ikki bosqichli tasdiqlash parolingizni kiriting (agar mavjud bo'lsa, enter bosing): "
      ),
    phoneCode: async () =>
      await input.text("Telegramdan kelgan tasdiqlash kodini kiriting: "),
    onError: (err) => console.log(err),
  });

  console.log("\n✅ Muvaffaqiyatli! Siz tizimga kirdingiz.");
  console.log(
    "Sizning SESSION_STRING'ingiz quyida. Uni .env.local fayliga ko'chirib oling:"
  );

  // Muvaffaqiyatli ulanishdan so'ng, sessiyani aynan stringSession obyektidan olamiz.
  // Bu eng ishonchli usul.
  console.log(stringSession.save());

  await client.disconnect();
})();
