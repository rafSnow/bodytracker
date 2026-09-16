import { describe, it, expect } from 'vitest';
import { generateBackupJSON, parseAndValidateBackupJSON } from './backupUtils';

describe('Backup Utilities', () => {
  const fakeProfissionais = [{ id: 'p1', nome: 'Doutor A' }];
  const fakeClientes = [{ id: 'c1', nome: 'Cliente A' }];
  
  describe('generateBackupJSON', () => {
    it('deve gerar uma string JSON válida e bem estruturada', () => {
      const jsonString = generateBackupJSON(fakeProfissionais, fakeClientes, [], []);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toHaveProperty('version', 1);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed.data).toHaveProperty('profissionais');
      expect(parsed.data.profissionais).toHaveLength(1);
      expect(parsed.data.profissionais[0].nome).toBe('Doutor A');
    });
  });

  describe('parseAndValidateBackupJSON', () => {
    it('deve parsear com sucesso um JSON correto e estruturado', () => {
      const validJson = JSON.stringify({
        version: 1,
        timestamp: '2026-01-01T00:00:00Z',
        data: {
          profissionais: [],
          clientes: [],
          avaliacoes: [],
          resultados: []
        }
      });

      const result = parseAndValidateBackupJSON(validJson);
      expect(result.version).toBe(1);
      expect(Array.isArray(result.data.clientes)).toBe(true);
    });

    it('deve lançar erro se a string não for um JSON válido', () => {
      expect(() => parseAndValidateBackupJSON('isso-nao-e-json')).toThrowError(/não é um JSON válido/i);
    });

    it('deve lançar erro se a versão do backup for desconhecida ou ausente', () => {
      const invalidVersion = JSON.stringify({
        version: 2, // Esperamos 1
        data: { profissionais: [], clientes: [], avaliacoes: [], resultados: [] }
      });
      expect(() => parseAndValidateBackupJSON(invalidVersion)).toThrowError(/Versão de backup não suportada/i);
    });

    it('deve lançar erro se as propriedades obrigatórias não existirem', () => {
      const noDataBlock = JSON.stringify({ version: 1 });
      expect(() => parseAndValidateBackupJSON(noDataBlock)).toThrowError(/bloco de dados ausente/i);
    });

    it('deve lançar erro se as collections não forem arrays', () => {
      const invalidArrays = JSON.stringify({
        version: 1,
        data: {
          profissionais: {}, // Deveria ser []
          clientes: [],
          avaliacoes: [],
          resultados: []
        }
      });
      expect(() => parseAndValidateBackupJSON(invalidArrays)).toThrowError(/as collections precisam ser arrays/i);
    });
  });
});
