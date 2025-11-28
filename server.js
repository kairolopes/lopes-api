// -------------------------------------------------------------
// 🚀 API LOPES X - IMOBILIÁRIA + MARKETPLACE
// -------------------------------------------------------------
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// -------------------------------------------------------------
// 🔥 Firebase (como nos seus outros projetos)
// -------------------------------------------------------------
try {
  const jsonString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const projectId = process.env.GCLOUD_PROJECT;

  if (!jsonString) {
    throw new Error("Variável GOOGLE_APPLICATION_CREDENTIALS não definida.");
  }

  const tempPath = path.join(os.tmpdir(), "firebase_key_lopesx.json");
  fs.writeFileSync(tempPath, jsonString);

  admin.initializeApp({
    credential: admin.credential.cert(require(tempPath)),
    projectId,
  });

  console.log("✅ Firebase conectado");
} catch (err) {
  console.error("Firebase ERROR:", err.message);
  process.exit(1);
}

const db = admin.firestore();

// -------------------------------------------------------------
// 🌐 Rota simples de teste
// -------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("API Lopes X funcionando. Rotas: /api/imoveis e /api/marketplace");
});

// -------------------------------------------------------------
// 🏢 IMÓVEIS - GET /api/imoveis
// -------------------------------------------------------------
app.get("/api/imoveis", async (req, res) => {
  try {
    const snap = await db.collection("imoveis").get();
    const lista = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(lista);
  } catch (err) {
    console.error("Erro ao buscar imoveis:", err);
    res.status(500).json({ error: "Erro ao buscar imóveis" });
  }
});

// -------------------------------------------------------------
// 🏢 IMÓVEIS - POST /api/imoveis  (cadastrar imóvel)
// -------------------------------------------------------------
app.post("/api/imoveis", async (req, res) => {
  try {
    const dados = req.body;

    // validação simples (pode melhorar depois)
    if (!dados.titulo || !dados.tipo || !dados.cidade || !dados.bairro) {
      return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    const docRef = await db.collection("imoveis").add({
      titulo: dados.titulo,
      tipo: dados.tipo,
      cidade: dados.cidade,
      bairro: dados.bairro,
      area: Number(dados.area || 0),
      quartos: Number(dados.quartos || 0),
      banheiros: Number(dados.banheiros || 0),
      vagas: Number(dados.vagas || 0),
      preco: Number(dados.preco || 0),
      condominio: Number(dados.condominio || 0),
      destaque: Boolean(dados.destaque || false),
      imagem: dados.imagem || "",
      nicochatUrl: dados.nicochatUrl || "",
    });

    res.status(201).json({ id: docRef.id, ok: true });
  } catch (err) {
    console.error("Erro ao criar imovel:", err);
    res.status(500).json({ error: "Erro ao criar imóvel" });
  }
});

// -------------------------------------------------------------
// 🛒 MARKETPLACE - GET /api/marketplace
// -------------------------------------------------------------
app.get("/api/marketplace", async (req, res) => {
  try {
    const snap = await db.collection("estabelecimentos").get();
    const lista = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(lista);
  } catch (err) {
    console.error("Erro ao buscar estabelecimentos:", err);
    res.status(500).json({ error: "Erro ao buscar marketplace" });
  }
});

// -------------------------------------------------------------
// 🔁 (Opcional) Webhooks Nicochat - para usar depois
// -------------------------------------------------------------
app.post("/webhook/nicochat/imobiliaria", (req, res) => {
  console.log("📩 Webhook imobiliária:", req.body);
  // Aqui você implementa a lógica depois
  res.json({ ok: true });
});

app.post("/webhook/nicochat/marketplace", (req, res) => {
  console.log("📩 Webhook marketplace:", req.body);
  res.json({ ok: true });
});

// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log("🚀 API Lopes X rodando na porta " + PORT);
});
