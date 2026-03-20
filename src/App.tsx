/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, CheckCircle2, Send, Users, PartyPopper, Share2, ChevronRight, Flame } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Error Boundary Component
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-lg w-full">
            <h2 className="text-xl font-bold text-red-400 mb-4">Ops! Algo deu errado.</h2>
            <p className="text-white/60 mb-4 text-sm font-mono break-words text-left bg-black/50 p-4 rounded-lg">
              {this.state.error?.message || "Erro desconhecido"}
            </p>
            <p className="text-white/40 text-sm">
              Por favor, tire um print desta tela e me envie para eu consertar!
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Types
interface Guest {
  id: string;
  name: string;
  attending: boolean;
  bringing: string[];
  createdAt: any;
}

const BRINGING_OPTIONS = [
  { category: 'Carnes', items: ['Picanha', 'Maminha', 'Frango', 'Linguiça'] },
  { category: 'Acompanhamentos', items: ['Pão de Alho', 'Queijo Coalho', 'Vinagrete', 'Farofa'] },
  { category: 'Bebidas', items: ['Cerveja', 'Refrigerante', 'Suco'] },
  { category: 'Outros', items: ['Carvão', 'Gelo', 'Sobremesa'] }
];

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [name, setName] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customItem, setCustomItem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'guests_v2'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const guestData: Guest[] = [];
      snapshot.forEach((doc) => {
        guestData.push({ id: doc.id, ...doc.data() } as Guest);
      });
      setGuests(guestData);
    }, (err) => {
      console.error("Error fetching guests:", err);
    });

    return () => unsubscribe();
  }, []);

  const toggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, insira seu nome.');
      return;
    }
    if (attending === null) {
      setError('Por favor, informe se você vai comparecer.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const bringingList = [...selectedItems];
      if (customItem.trim()) {
        bringingList.push(customItem.trim());
      }

      await addDoc(collection(db, 'guests_v2'), {
        name: name.trim(),
        attending,
        bringing: attending ? bringingList : [],
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      setName('');
      setAttending(null);
      setSelectedItems([]);
      setCustomItem('');
    } catch (err: any) {
      console.error("Error adding document: ", err);
      setError('Erro ao enviar confirmação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = () => {
    const text = `Gabriel Nascimento está fazendo 25 anos! Vamos comemorar com um churrasco! Confirme sua presença: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const confirmedCount = guests.filter(g => g.attending).length;

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-orange-500/30 overflow-hidden">
      {/* Noise Overlay */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none z-50 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Embers Background */}
      <div className="mesh-bg">
        <div className="ember ember-1"></div>
        <div className="ember ember-2"></div>
        <div className="ember ember-3"></div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-12 md:py-24 flex flex-col gap-16">
        
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-center justify-center min-h-[50vh] text-center"
        >
          {/* Massive 25 Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none">
            <span className="text-[15rem] md:text-[25rem] font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent tracking-tighter">
              25
            </span>
          </div>

          <div className="z-10 space-y-6 w-full">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 font-medium text-sm backdrop-blur-md mb-4">
              <Flame className="w-4 h-4" />
              <span className="tracking-widest uppercase">20 de Março</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-white leading-none">
              Gabriel
            </h1>
            
            <h2 className="text-2xl md:text-4xl font-display font-light text-white/70 tracking-tight">
              Churrasco de Aniversário
            </h2>
            
            <div className="text-lg text-white/50 max-w-md mx-auto font-light mt-6 italic">
              "A dinâmica é simples: eu disponibilizo o lugar, e vocês levam a comida."
              <span className="block mt-2 text-sm not-italic text-white/40">~ Beatriz Bastos</span>
            </div>
          </div>
        </motion.section>

        {/* Event Details */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-[2rem] p-8 md:p-10 space-y-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-5">
              <div className="p-4 rounded-2xl bg-white/5 text-white/80 border border-white/10">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-white mb-1">Local</h3>
                <p className="text-white/60 leading-relaxed font-light">
                  Rua Capitólio Lote 26, Quadra 9<br/>Campo Grande, RJ
                </p>
                <a href="https://maps.google.com/?q=Rua+Capitólio+Lote+26,+Quadra+9+-+Campo+Grande,+RJ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-medium mt-3 group transition-colors">
                  Abrir no Maps <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="p-4 rounded-2xl bg-white/5 text-white/80 border border-white/10">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-white mb-1">Horário</h3>
                <p className="text-white/60 font-light">A partir das 19:00h</p>
                <p className="text-sm text-white/40 mt-1 font-light">Chegue quando quiser, a carne não espera.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* RSVP Form */}
        <motion.section 
          ref={formRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-[2rem] p-8 md:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-red-500 opacity-50" />
          
          <h2 className="text-3xl font-display font-bold tracking-tight text-white mb-8">
            Confirme sua presença
          </h2>

          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-20 h-20 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white">Tudo certo!</h3>
              <p className="text-white/60 text-lg font-light">Sua resposta foi registrada com sucesso.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-orange-400 font-medium hover:text-orange-300 mt-6 inline-block transition-colors"
              >
                Enviar outra resposta
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-3 uppercase tracking-widest">Seu Nome</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como devemos te chamar?"
                  className="w-full px-5 py-4 rounded-xl glass-input text-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-3 uppercase tracking-widest">Você vai?</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAttending(true)}
                    className={`px-4 py-4 rounded-xl font-medium text-lg transition-all border ${
                      attending === true 
                        ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20' 
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Tô dentro! 🔥
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttending(false)}
                    className={`px-4 py-4 rounded-xl font-medium text-lg transition-all border ${
                      attending === false 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Não poderei
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {attending && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 space-y-8 border-t border-white/10 mt-6">
                      <label className="block text-xs font-medium text-white/50 mb-4 uppercase tracking-widest">
                        O que você vai levar?
                      </label>
                      
                      <div className="space-y-6">
                        {BRINGING_OPTIONS.map((group) => (
                          <div key={group.category}>
                            <p className="text-xs font-medium text-white/40 mb-3">{group.category}</p>
                            <div className="flex flex-wrap gap-2">
                              {group.items.map(item => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => toggleItem(item)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                                    selectedItems.includes(item)
                                      ? 'bg-white/20 border-white/30 text-white'
                                      : 'bg-transparent border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                                  }`}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <input 
                          type="text" 
                          value={customItem}
                          onChange={(e) => setCustomItem(e.target.value)}
                          placeholder="Mais alguma coisa? Digite aqui..."
                          className="w-full px-5 py-4 rounded-xl glass-input text-base focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="text-red-400 text-sm font-medium bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-white text-black font-display font-bold text-lg hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? 'Enviando...' : (
                  <>
                    Confirmar Presença
                    <Send className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.section>

        {/* Guest List */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-[2rem] p-8 md:p-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-display font-bold tracking-tight text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-white/50" />
              Lista de Convidados
            </h2>
            <div className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium border border-white/10">
              {confirmedCount} {confirmedCount === 1 ? 'Confirmado' : 'Confirmados'}
            </div>
          </div>

          {guests.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-white/40 font-light">Ninguém respondeu ainda. Seja o primeiro!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {guests.map((guest) => (
                <div key={guest.id} className="p-5 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    {guest.attending ? (
                      <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    )}
                    <span className="font-medium text-white/90 text-lg">{guest.name}</span>
                  </div>
                  
                  {guest.attending && guest.bringing && guest.bringing.length > 0 && (
                    <div className="text-sm font-light text-white/60 sm:text-right bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="text-white/30 mr-2 text-xs uppercase tracking-widest">Trazendo</span>
                      {guest.bringing.join(', ')}
                    </div>
                  )}
                  {!guest.attending && (
                    <div className="text-sm font-light text-white/40 sm:text-right">
                      Não vai poder ir
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.section>

      </main>

    </div>
  );
}

