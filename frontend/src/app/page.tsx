'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, ShieldCheck, ArrowRight, Star, CheckCircle2, Users, Banknote, Timer } from 'lucide-react';
import Link from 'next/link';

/* ── How It Works ─────────────────────────────────────── */
const steps = [
  { num: '01', title: 'CRIE SUA CONTA', desc: 'Cadastro em 60 segundos. CPF, email e pronto — seu acesso ao campo está liberado.', emoji: '📋' },
  { num: '02', title: 'ESCOLHA O CONCURSO', desc: 'Selecione a rodada ativa, analise os jogos e faça seus palpites com confiança.', emoji: '⚽' },
  { num: '03', title: 'ACOMPANHE AO VIVO', desc: 'Monitore seus resultados em tempo real enquanto os jogos acontecem.', emoji: '📺' },
  { num: '04', title: 'RECEBA VIA PIX', desc: 'Prêmio creditado automaticamente na sua carteira. Saque na hora, sem burocracia.', emoji: '💰' },
];

/* ── Features ─────────────────────────────────────────── */
const features = [
  {
    emoji: '⚡',
    title: 'PIX INSTANTÂNEO',
    desc: 'Depósitos e saques em segundos. Seu dinheiro na conta enquanto o árbitro ainda está apitando.',
    color: '#22c55e',
  },
  {
    emoji: '🏆',
    title: 'PRÊMIOS REAIS',
    desc: 'Acerte 14, 13 ou 12 resultados e fature sua parte. Quanto mais jogadores, maior o prize pool.',
    color: '#f59e0b',
    featured: true,
  },
  {
    emoji: '🛡️',
    title: 'OPERAÇÃO SEGURA',
    desc: 'Infraestrutura bancária com certificação PCI DSS. Seus dados e seu dinheiro 100% protegidos.',
    color: '#38bdf8',
  },
];

/* ── Trust indicators ─────────────────────────────────── */
const trustItems = [
  { icon: CheckCircle2, text: 'Pagamentos via Pix certificado' },
  { icon: CheckCircle2, text: 'Dados protegidos por criptografia' },
  { icon: CheckCircle2, text: 'Suporte 24h via chat e WhatsApp' },
  { icon: CheckCircle2, text: 'Empresa registrada no Brasil' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020c06] text-[#f0fdf4] selection:bg-[#22c55e] selection:text-[#020c06]">

      {/* ── Football field background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: "url('/football-field.png')", backgroundSize: 'cover', backgroundPosition: 'center top', backgroundRepeat: 'no-repeat' }}
      />
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.90) 0%, rgba(2,12,6,0.78) 35%, rgba(7,26,13,0.68) 65%, rgba(13,36,20,0.60) 100%)' }}
      />

      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#14532d] px-5 md:px-12 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #020c06 50%, #071a0d 100%)', backdropFilter: 'blur(16px)', height: '68px' }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none select-none" aria-hidden="true">⚽</span>
          <span className="text-xl font-display font-black tracking-tight">
            PALPITA<span className="text-[#22c55e]"> AÍ</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="score-label text-[#f0fdf4]/40 hover:text-[#22c55e] transition-colors px-4 py-2 hidden sm:block">
            ENTRAR
          </Link>
          <Link href="/register" className="btn-champion px-6 py-2.5 text-xs">
            JOGAR GRÁTIS
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-48 pb-28 px-5 md:px-12 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 border border-[#22c55e]/30 bg-[#22c55e]/5 mb-10"
            >
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="score-label text-[#22c55e]">⚽ CONCURSO ATIVO — RODADA 2026 EM ANDAMENTO</span>
            </motion.div>

            {/* Main headline */}
            <h1 className="text-6xl md:text-[88px] font-display font-black tracking-tighter leading-none mb-6">
              SEU PALPITE.<br />
              <span style={{
                backgroundImage: 'linear-gradient(135deg, #22c55e 0%, #f59e0b 60%, #22c55e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                O PRÓXIMO MILHÃO.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[#f0fdf4]/55 max-w-2xl mx-auto leading-relaxed mb-4 font-medium">
              A maior plataforma de palpites esportivos do Brasil.
              Acerte os resultados da rodada, acompanhe ao vivo e receba seu prêmio na hora via Pix.
            </p>
            <p className="text-sm text-[#22c55e]/70 mb-10 font-display font-bold tracking-wide">
              Mais de R$ 10 milhões já pagos · 50.000 jogadores ativos · Cadastro gratuito
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-champion w-full sm:w-auto px-14 py-5 text-sm flex items-center justify-center gap-3"
              >
                QUERO MEUS PRÊMIOS
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-14 py-5 border border-[#14532d] font-display font-bold text-xs tracking-widest text-[#f0fdf4]/40 hover:text-[#f0fdf4] hover:bg-[#071a0d] hover:border-[#22c55e]/30 transition-all"
              >
                JÁ TENHO CONTA
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
              {trustItems.map((t) => (
                <div key={t.text} className="flex items-center gap-1.5 text-[#f0fdf4]/30">
                  <t.icon className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span className="text-[11px] font-medium">{t.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="relative z-10 border-y border-[#14532d]"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #020c06 50%, #071a0d 100%)' }}>
        <div className="max-w-5xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Banknote, value: 'R$ 10M+', label: 'JÁ PAGOS', color: '#22c55e' },
            { icon: Users, value: '50.000+', label: 'JOGADORES', color: '#f59e0b' },
            { icon: Trophy, value: '500+', label: 'CONCURSOS', color: '#22c55e' },
            { icon: Timer, value: '< 30s', label: 'SAQUE VIA PIX', color: '#f59e0b' },
          ].map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.color }} />
              <p className="font-display font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
              <p className="score-label mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 py-24 px-5 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="score-label text-[#22c55e] mb-2">SIMPLES COMO UM GOL</p>
            <h2 className="text-3xl md:text-4xl font-display font-black tracking-tighter">
              COMO FUNCIONA?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="match-card p-7 relative"
              >
                <span className="absolute top-5 right-5 font-display font-black text-4xl text-[#22c55e]/8 leading-none">{s.num}</span>
                <div className="text-3xl mb-4">{s.emoji}</div>
                <h3 className="font-display font-black text-sm tracking-wide text-[#22c55e] mb-2">{s.title}</h3>
                <p className="text-[#f0fdf4]/40 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <div className="relative z-10 border-t border-[#14532d]" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(2,12,6,0.4) 100%)' }}>
        <section className="py-24 px-5 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="score-label text-[#22c55e] mb-2">POR QUE SOMOS OS MELHORES</p>
              <h2 className="text-3xl md:text-4xl font-display font-black tracking-tighter">NOSSA VANTAGEM</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, idx) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.12 }}
                  className="match-card p-8 text-center"
                  style={{ borderTopColor: f.color }}
                >
                  <div className="text-4xl mb-5 select-none">{f.emoji}</div>
                  <h3 className="font-display font-black text-lg tracking-tight mb-3" style={{ color: f.color }}>
                    {f.title}
                  </h3>
                  <p className="text-[#f0fdf4]/40 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 py-28 px-5 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center gap-1 mb-5">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-[#f59e0b] text-[#f59e0b]" />)}
          </div>
          <p className="score-label text-[#f0fdf4]/25 mb-4">AVALIAÇÃO DOS NOSSOS JOGADORES</p>

          <blockquote className="text-2xl md:text-3xl font-display font-black tracking-tight mb-3 leading-snug">
            "Saquei meu prêmio em{' '}
            <span className="text-[#22c55e]">menos de 1 minuto</span>.
            Nunca vi nada igual."
          </blockquote>
          <p className="text-[#f0fdf4]/30 text-sm mb-12">— Carlos M., vencedor da rodada 48</p>

          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-4">
            PRONTO PARA{' '}
            <span style={{
              backgroundImage: 'linear-gradient(135deg, #22c55e 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              GANHAR?
            </span>
          </h2>
          <p className="text-[#f0fdf4]/40 mb-10 text-lg">Cadastre-se agora, é gratuito. Sem taxas ocultas, sem contratos.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-champion w-full sm:w-auto px-14 py-5 text-sm flex items-center justify-center gap-3">
              CRIAR CONTA GRATUITA <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[#14532d] px-5 py-10"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #020c06 100%)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-display font-black text-[#f0fdf4]/40 text-sm">PALPITA AÍ</span>
          </div>
          <p className="score-label text-[#f0fdf4]/15 text-center">
            © 2026 · JOGO RESPONSÁVEL · +18 ANOS · TODOS OS DIREITOS RESERVADOS
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="score-label text-[#f0fdf4]/20 hover:text-[#22c55e] transition-colors">ENTRAR</Link>
            <Link href="/register" className="score-label text-[#f0fdf4]/20 hover:text-[#22c55e] transition-colors">CADASTRO</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
