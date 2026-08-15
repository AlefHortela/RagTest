// Seed de dados de teste: ocorrências (acidentes/assaltos) num raio ao redor de um ponto,
// com datas distintas nos últimos N dias e alguns anexos (.txt/.pdf) com informações complementares.
//
// Uso: node seed-occurrences.mjs
// Requer o backend rodando em API_BASE_URL e um usuário válido (USERNAME/PASSWORD).

import PDFDocument from 'pdfkit';

const API_BASE_URL = 'http://localhost:5127/api';
const USERNAME = 'admin';
const PASSWORD = 'admin123';

const CENTER = { lat: -22.61937401305779, lng: -48.788105249404914 };
const RADIUS_KM = 100;
const DAYS_BACK = 90;
const COUNT_PER_TYPE = 100;
const ATTACHMENT_RATE = 0.15; // ~15% das ocorrências de cada tipo ganham anexo
const CONCURRENCY = 4;

const roadNames = [
  'Rodovia Marechal Rondon', 'Rodovia Comandante João Ribeiro de Barros',
  'Rodovia Domingos Sartor', 'Avenida Nações Unidas', 'Avenida Getúlio Vargas',
  'Avenida Nuno de Assis', 'Rua Batista de Carvalho', 'Rua Rio Branco',
  'Avenida Duque de Caxias', 'Rodovia Cesário de Almeida Prado', 'Estrada Municipal do Cascalho',
  'Avenida Alfredo Maia', 'Rua Araújo Leite',
];

const neighborhoods = [
  'Centro', 'Vila Independência', 'Jardim América', 'Vila Falcão', 'Jardim Redentor',
  'Vila Cardia', 'Parque Paulista', 'Jardim Panorama', 'Vila Santa Tereza',
  'Núcleo Habitacional Beija-Flor', 'Jardim Bela Vista', 'Vila São Paulo', 'Chácara Santa Rita',
];

const vehicleTypes = ['carro de passeio', 'motocicleta', 'caminhão', 'ônibus', 'van', 'bicicleta'];
const accidentKinds = [
  'colisão traseira', 'colisão frontal', 'capotamento', 'saída de pista',
  'atropelamento', 'engavetamento', 'colisão lateral', 'tombamento de carga',
];

const robberyKinds = ['assalto à mão armada', 'roubo de veículo', 'roubo de celular', 'arrastão', 'furto'];
const robberyTargets = ['pedestre', 'motorista de aplicativo', 'estabelecimento comercial', 'residência', 'veículo estacionado', 'transeunte'];

const weatherConditions = ['tempo claro', 'chuva leve', 'chuva forte', 'pista molhada', 'neblina', 'sol forte'];
const witnessNotes = [
  'Testemunha relatou ter ouvido um forte barulho antes de perceber a ocorrência.',
  'Populares prestaram socorro até a chegada da equipe de resgate.',
  'Câmeras de segurança do local podem ter registrado o momento do fato.',
  'Não havia testemunhas diretas no momento do registro.',
  'Testemunha informou que o suspeito fugiu em direção ao centro da cidade.',
  'Vizinhos acionaram a central de emergência após o ocorrido.',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Ponto aleatório uniformemente distribuído dentro de um raio (km) ao redor do centro.
function randomPointNear(center, maxKm) {
  const R = 6371; // raio da Terra em km
  const d = maxKm * Math.sqrt(Math.random());
  const bearing = Math.random() * 2 * Math.PI;

  const phi1 = (center.lat * Math.PI) / 180;
  const lambda1 = (center.lng * Math.PI) / 180;
  const deltaOverR = d / R;

  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(deltaOverR) + Math.cos(phi1) * Math.sin(deltaOverR) * Math.cos(bearing),
  );
  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(deltaOverR) * Math.cos(phi1),
      Math.cos(deltaOverR) - Math.sin(phi1) * Math.sin(phi2),
    );

  return { lat: (phi2 * 180) / Math.PI, lng: (lambda2 * 180) / Math.PI };
}

function randomPastDate(daysBack) {
  const now = Date.now();
  const past = now - Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(past);
}

function buildAccident() {
  const road = pick(roadNames);
  const kind = pick(accidentKinds);
  const vehicle = pick(vehicleTypes);
  const km = randomInt(1, 180);
  return {
    type: 'Acidente',
    title: `${capitalize(kind)} na ${road}`,
    description: `Registro de ${kind} envolvendo ${vehicle} na ${road}, km ${km}. Ocorrência registrada para fins de teste do sistema.`,
    address: `${road}, km ${km}`,
    complementary: [
      `Condição da via no momento: ${pick(weatherConditions)}.`,
      `Veículo envolvido: ${vehicle}.`,
      pick(witnessNotes),
    ],
  };
}

function buildRobbery() {
  const neighborhood = pick(neighborhoods);
  const kind = pick(robberyKinds);
  const target = pick(robberyTargets);
  return {
    type: 'Assalto',
    title: `${capitalize(kind)} no bairro ${neighborhood}`,
    description: `Registro de ${kind} contra ${target} no bairro ${neighborhood}. Ocorrência registrada para fins de teste do sistema.`,
    address: `Bairro ${neighborhood}`,
    complementary: [
      `Alvo: ${target}.`,
      `Bairro: ${neighborhood}.`,
      pick(witnessNotes),
    ],
  };
}

async function login() {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login falhou: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.token;
}

async function createOccurrence(token, body) {
  const res = await fetch(`${API_BASE_URL}/occurrences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Create falhou: ${res.status} ${await res.text()}`);
  return res.json();
}

async function uploadAttachment(token, occurrenceId, fileName, contentType, buffer) {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: contentType }), fileName);

  const res = await fetch(`${API_BASE_URL}/occurrences/${occurrenceId}/attachments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload falhou: ${res.status} ${await res.text()}`);
  return res.json();
}

function buildTxtAttachment(item) {
  const lines = ['Informações complementares', '', ...item.complementary];
  return Buffer.from(lines.join('\n'), 'utf-8');
}

function buildPdfAttachment(item) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text('Informações complementares', { underline: true });
    doc.moveDown();
    doc.fontSize(11);
    for (const line of item.complementary) {
      doc.text(`- ${line}`);
    }
    doc.end();
  });
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let index = 0;

  async function next() {
    while (index < items.length) {
      const current = index++;
      try {
        results[current] = await worker(items[current], current);
      } catch (err) {
        results[current] = { error: err.message };
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
}

async function main() {
  console.log(`Login como "${USERNAME}"...`);
  const token = await login();
  console.log('Login OK.');

  const items = [];
  for (let i = 0; i < COUNT_PER_TYPE; i++) items.push(buildAccident());
  for (let i = 0; i < COUNT_PER_TYPE; i++) items.push(buildRobbery());

  let created = 0;
  let failed = 0;
  let attachmentsUploaded = 0;
  let attachmentsFailed = 0;

  await runPool(
    items,
    async (item, i) => {
      const point = randomPointNear(CENTER, RADIUS_KM);
      const occurredAt = randomPastDate(DAYS_BACK).toISOString();

      const occurrence = await createOccurrence(token, {
        type: item.type,
        title: item.title,
        description: item.description,
        occurredAt,
        latitude: point.lat,
        longitude: point.lng,
        address: item.address,
      });

      created++;
      if (created % 20 === 0) console.log(`  ${created}/${items.length} ocorrências criadas...`);

      if (Math.random() < ATTACHMENT_RATE) {
        try {
          const asPdf = Math.random() < 0.5;
          if (asPdf) {
            const buffer = await buildPdfAttachment(item);
            await uploadAttachment(token, occurrence.id, `complemento-${i}.pdf`, 'application/pdf', buffer);
          } else {
            const buffer = buildTxtAttachment(item);
            await uploadAttachment(token, occurrence.id, `complemento-${i}.txt`, 'text/plain', buffer);
          }
          attachmentsUploaded++;
        } catch (err) {
          attachmentsFailed++;
          console.error(`  Falha ao anexar arquivo na ocorrência ${occurrence.id}: ${err.message}`);
        }
      }

      return occurrence;
    },
    CONCURRENCY,
  ).then((results) => {
    failed = results.filter((r) => r && r.error).length;
    for (const r of results) {
      if (r && r.error) console.error(`  Falha ao criar ocorrência: ${r.error}`);
    }
  });

  console.log('');
  console.log('Resumo:');
  console.log(`  Ocorrências criadas: ${created} / ${items.length}`);
  console.log(`  Falhas na criação: ${failed}`);
  console.log(`  Anexos enviados: ${attachmentsUploaded}`);
  console.log(`  Falhas no envio de anexos: ${attachmentsFailed}`);
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
