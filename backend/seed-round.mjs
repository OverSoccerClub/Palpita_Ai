/**
 * seed-round.mjs
 * Cria a Rodada 1 do Brasileirão Série A 2026 com 14 confrontos completos.
 *
 * Como usar:
 *   node seed-round.mjs
 *
 * Logos: media.api-sports.io (gratuito, sem auth necessária)
 * Para trocar logos: substitua a URL pelo escudo do time desejado.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ────────────────────────────────────────────────
// Logos via API-Sports (api-football.com) CDN
// ID dos times brasileiros no serviço
// ────────────────────────────────────────────────
const LOGO = (id) => `https://media.api-sports.io/football/teams/${id}.png`;

const TEAMS = {
    flamengo: { name: 'Flamengo', logo: LOGO(127) },
    palmeiras: { name: 'Palmeiras', logo: LOGO(121) },
    sao_paulo: { name: 'São Paulo', logo: LOGO(126) },
    corinthians: { name: 'Corinthians', logo: LOGO(131) },
    atletico_mg: { name: 'Atlético-MG', logo: LOGO(1062) },
    fluminense: { name: 'Fluminense', logo: LOGO(129) },
    internacional: { name: 'Internacional', logo: LOGO(133) },
    botafogo: { name: 'Botafogo', logo: LOGO(130) },
    gremio: { name: 'Grêmio', logo: LOGO(132) },
    santos: { name: 'Santos', logo: LOGO(137) },
    athletico_pr: { name: 'Athletico-PR', logo: LOGO(138) },
    vasco: { name: 'Vasco da Gama', logo: LOGO(136) },
    fortaleza: { name: 'Fortaleza', logo: LOGO(140) },
    cruzeiro: { name: 'Cruzeiro', logo: LOGO(141) },
    bahia: { name: 'Bahia', logo: LOGO(118) },
    vitoria: { name: 'Vitória', logo: LOGO(173) },
    bragantino: { name: 'Red Bull Bragantino', logo: LOGO(717) },
    cuiaba: { name: 'Cuiabá', logo: LOGO(1193) },
    sport: { name: 'Sport', logo: LOGO(160) },
    ceara: { name: 'Ceará', logo: LOGO(143) },
    goias: { name: 'Goiás', logo: LOGO(148) },
    america_mg: { name: 'América-MG', logo: LOGO(159) },
    coritiba: { name: 'Coritiba', logo: LOGO(154) },
    juventude: { name: 'Juventude', logo: LOGO(146) },
    mirassol: { name: 'Mirassol', logo: LOGO(2439) },
    avai: { name: 'Avaí', logo: LOGO(163) },
    chapecoense: { name: 'Chapecoense', logo: LOGO(145) },
    crb: { name: 'CRB', logo: LOGO(158) },
};

// ────────────────────────────────────────────────
// Datas (ISO — fuso UTC, horário de Brasília = UTC-3)
// ────────────────────────────────────────────────
//  Sábado 11/04/2026 → UTC = horário BR + 3h
//  Domingo 12/04/2026 e Segunda 13/04/2026

function br(dateStr, timeStr) {
    // dateStr: 'YYYY-MM-DD', timeStr: 'HH:mm'  (horário de Brasília)
    // Retorna ISO UTC
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(`${dateStr}T${timeStr}:00-03:00`);
    return d.toISOString();
}

const MATCHES = [
    // ── Sábado 11/04 ──────────────────────────────────────────
    {
        homeTeam: TEAMS.flamengo.name, homeLogo: TEAMS.flamengo.logo,
        awayTeam: TEAMS.athletico_pr.name, awayLogo: TEAMS.athletico_pr.logo,
        stadium: 'Maracanã – Rio de Janeiro/RJ',
        startTime: br('2026-04-11', '16:00'),
    },
    {
        homeTeam: TEAMS.palmeiras.name, homeLogo: TEAMS.palmeiras.logo,
        awayTeam: TEAMS.santos.name, awayLogo: TEAMS.santos.logo,
        stadium: 'Allianz Parque – São Paulo/SP',
        startTime: br('2026-04-11', '16:00'),
    },
    {
        homeTeam: TEAMS.sao_paulo.name, homeLogo: TEAMS.sao_paulo.logo,
        awayTeam: TEAMS.vasco.name, awayLogo: TEAMS.vasco.logo,
        stadium: 'MorumBIS – São Paulo/SP',
        startTime: br('2026-04-11', '18:30'),
    },
    {
        homeTeam: TEAMS.internacional.name, homeLogo: TEAMS.internacional.logo,
        awayTeam: TEAMS.botafogo.name, awayLogo: TEAMS.botafogo.logo,
        stadium: 'Beira-Rio – Porto Alegre/RS',
        startTime: br('2026-04-11', '18:30'),
    },
    {
        homeTeam: TEAMS.corinthians.name, homeLogo: TEAMS.corinthians.logo,
        awayTeam: TEAMS.gremio.name, awayLogo: TEAMS.gremio.logo,
        stadium: 'Neo Química Arena – São Paulo/SP',
        startTime: br('2026-04-11', '21:00'),
    },
    {
        homeTeam: TEAMS.atletico_mg.name, homeLogo: TEAMS.atletico_mg.logo,
        awayTeam: TEAMS.fluminense.name, awayLogo: TEAMS.fluminense.logo,
        stadium: 'Arena MRV – Belo Horizonte/MG',
        startTime: br('2026-04-11', '21:00'),
    },
    // ── Domingo 12/04 ─────────────────────────────────────────
    {
        homeTeam: TEAMS.fortaleza.name, homeLogo: TEAMS.fortaleza.logo,
        awayTeam: TEAMS.cruzeiro.name, awayLogo: TEAMS.cruzeiro.logo,
        stadium: 'Arena Castelão – Fortaleza/CE',
        startTime: br('2026-04-12', '11:00'),
    },
    {
        homeTeam: TEAMS.bahia.name, homeLogo: TEAMS.bahia.logo,
        awayTeam: TEAMS.vitoria.name, awayLogo: TEAMS.vitoria.logo,
        stadium: 'Arena Fonte Nova – Salvador/BA',
        startTime: br('2026-04-12', '11:00'),
    },
    {
        homeTeam: TEAMS.bragantino.name, homeLogo: TEAMS.bragantino.logo,
        awayTeam: TEAMS.cuiaba.name, awayLogo: TEAMS.cuiaba.logo,
        stadium: 'Estádio Nabi Abi Chedid – Bragança Paulista/SP',
        startTime: br('2026-04-12', '16:00'),
    },
    {
        homeTeam: TEAMS.sport.name, homeLogo: TEAMS.sport.logo,
        awayTeam: TEAMS.ceara.name, awayLogo: TEAMS.ceara.logo,
        stadium: 'Estádio Ilha do Retiro – Recife/PE',
        startTime: br('2026-04-12', '16:00'),
    },
    {
        homeTeam: TEAMS.goias.name, homeLogo: TEAMS.goias.logo,
        awayTeam: TEAMS.america_mg.name, awayLogo: TEAMS.america_mg.logo,
        stadium: 'Estádio Hailé Pinheiro – Goiânia/GO',
        startTime: br('2026-04-12', '18:30'),
    },
    {
        homeTeam: TEAMS.coritiba.name, homeLogo: TEAMS.coritiba.logo,
        awayTeam: TEAMS.juventude.name, awayLogo: TEAMS.juventude.logo,
        stadium: 'Estádio Couto Pereira – Curitiba/PR',
        startTime: br('2026-04-12', '18:30'),
    },
    // ── Segunda 13/04 ─────────────────────────────────────────
    {
        homeTeam: TEAMS.mirassol.name, homeLogo: TEAMS.mirassol.logo,
        awayTeam: TEAMS.avai.name, awayLogo: TEAMS.avai.logo,
        stadium: 'Estádio Municipal José Maria Marin – Mirassol/SP',
        startTime: br('2026-04-13', '20:00'),
    },
    {
        homeTeam: TEAMS.crb.name, homeLogo: TEAMS.crb.logo,
        awayTeam: TEAMS.chapecoense.name, awayLogo: TEAMS.chapecoense.logo,
        stadium: 'Estádio Rei Pelé – Maceió/AL',
        startTime: br('2026-04-13', '20:00'),
    },
];

async function main() {
    console.log('🌱 Criando Rodada 1 do Brasileirão Série A 2026...\n');

    // Apostas encerram 30min antes do primeiro jogo
    const round = await prisma.round.create({
        data: {
            title: 'Rodada 1 – Brasileirão Série A 2026',
            startTime: new Date('2026-04-11T16:00:00-03:00'),
            endTime: new Date('2026-04-11T15:30:00-03:00'), // fecha 30min antes do 1º jogo
            status: 'OPEN',
            matches: {
                create: MATCHES.map(m => ({
                    homeTeam: m.homeTeam,
                    homeLogo: m.homeLogo,
                    awayTeam: m.awayTeam,
                    awayLogo: m.awayLogo,
                    stadium: m.stadium,
                    startTime: new Date(m.startTime),
                })),
            },
        },
        include: { matches: true },
    });

    console.log(`✅ Rodada criada! ID: ${round.id}`);
    console.log(`   Título: ${round.title}`);
    console.log(`   Jogos: ${round.matches.length}`);
    console.log('\n📋 Confrontos:');
    round.matches.forEach((m, i) => {
        const dt = new Date(m.startTime).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            weekday: 'short', day: '2-digit', month: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
        console.log(`  ${String(i + 1).padStart(2, '0')}. ${dt} – ${m.homeTeam} × ${m.awayTeam}`);
    });

    console.log('\n🎉 Seed concluído com sucesso!');
}

main()
    .catch(e => { console.error('❌ Erro:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
