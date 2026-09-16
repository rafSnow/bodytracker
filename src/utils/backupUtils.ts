export interface BackupData {
  version: number;
  timestamp: string;
  data: {
    profissionais: any[];
    clientes: any[];
    avaliacoes: any[];
    resultados: any[];
  };
}

/**
 * Gera uma string JSON estruturada e segura a partir dos arrays brutos do DB
 */
export const generateBackupJSON = (
  profissionais: any[],
  clientes: any[],
  avaliacoes: any[],
  resultados: any[]
): string => {
  const backupData: BackupData = {
    version: 1,
    timestamp: new Date().toISOString(),
    data: { profissionais, clientes, avaliacoes, resultados }
  };
  return JSON.stringify(backupData);
};

/**
 * Faz o parse e valida o formato do JSON recebido
 * Lança um erro claro (Error) se a estrutura for inválida
 */
export const parseAndValidateBackupJSON = (jsonString: string): BackupData => {
  let parsed: any;
  
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    throw new Error('O arquivo não é um JSON válido.');
  }

  // Validações estruturais de integridade (Schema)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Formato de backup inválido: não é um objeto.');
  }

  if (parsed.version !== 1) {
    throw new Error('Versão de backup não suportada.');
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    throw new Error('Formato de backup inválido: bloco de dados ausente.');
  }

  const { profissionais, clientes, avaliacoes, resultados } = parsed.data;

  if (!Array.isArray(profissionais) || !Array.isArray(clientes) || !Array.isArray(avaliacoes) || !Array.isArray(resultados)) {
    throw new Error('Formato de backup inválido: as collections precisam ser arrays.');
  }

  return parsed as BackupData;
};
