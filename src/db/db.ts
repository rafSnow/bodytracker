import Dexie, { type Table } from 'dexie';

export interface Profissional {
  id: string;
  nome: string;
  registro_profissional?: string;
  criado_em: Date;
}

export interface Cliente {
  id: string;
  profissional_id: string;
  nome: string;
  data_nascimento: Date;
  sexo: 'M' | 'F';
  altura_cm: number;
  criado_em: Date;
}

export interface Avaliacao {
  id: string;
  cliente_id: string;
  data_avaliacao: Date;
  peso_kg: number;
  nivel_atividade?: number; // 1.2, 1.375, 1.55, 1.725, 1.9
  objetivo?: 'emagrecimento' | 'manutencao' | 'hipertrofia';
  medidas: {
    pescoco?: number;
    cintura?: number;
    quadril?: number;
    abdomen?: number;
    braco?: number;
    coxa?: number;
    panturrilha?: number;
  };
}

export interface Resultados {
  id: string;
  avaliacao_id: string;
  calculos: Record<string, any>;
}

export interface FotoAvaliacao {
  id: string;
  avaliacao_id: string;
  cliente_id: string;
  tipo: 'frente' | 'lado' | 'costas';
  foto_base64: string;
  criado_em: Date;
}

export interface Pesagem {
  id: string;
  cliente_id: string;
  data: Date;
  peso_kg: number;
}

export class AppDatabase extends Dexie {
  profissionais!: Table<Profissional, string>;
  clientes!: Table<Cliente, string>;
  avaliacoes!: Table<Avaliacao, string>;
  resultados!: Table<Resultados, string>;
  fotos!: Table<FotoAvaliacao, string>;
  pesagens!: Table<Pesagem, string>;

  constructor() {
    super('BioStatsDB');
    
    this.version(1).stores({
      profissionais: 'id',
      clientes: 'id, profissional_id',
      avaliacoes: 'id, cliente_id',
      resultados: 'id, &avaliacao_id'
    });

    this.version(2).stores({
      fotos: 'id, avaliacao_id, cliente_id, tipo'
    });

    this.version(3).stores({
      pesagens: 'id, cliente_id, data'
    });
  }
}

export const db = new AppDatabase();
