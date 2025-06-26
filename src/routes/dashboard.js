const express = require('express');
const Senha = require('../models/Senha');
const Usuario = require('../models/Usuario');
const Localidade = require('../models/Localidade');
const Prefeitura = require('../models/Prefeitura');
const Fornecedor = require('../models/Fornecedor');
const { verificarAutenticacao, verificarAcessoSenhas } = require('../middleware/auth');

const router = express.Router();

// Estatísticas gerais do dashboard
router.get('/estatisticas', [
  verificarAutenticacao,
  verificarAcessoSenhas
], async (req, res) => {
  try {
    const [
      totalSenhas,
      totalPrefeituras,
      totalFornecedores,
      usuariosAtivos,
      senhasPorCategoria,
      senhasExpirando,
      ultimasAlteracoes
    ] = await Promise.all([
      Senha.contar(),
      Prefeitura.contar({ ativo: true }),
      Fornecedor.contar({ ativo: true }),
      Usuario.contar({ ativo: true }),
      Senha.estatisticasPorCategoria(),
      Senha.buscarExpirandoEmBreve(30),
      Senha.buscarUltimasAlteracoes(5)
    ]);

    // Organizar estatísticas por categoria
    const estatisticasCategorias = {
      prefeituras: 0,
      fornecedores: 0,
      orgaos: 0,
      b2fleet: 0
    };

    senhasPorCategoria.forEach(item => {
      estatisticasCategorias[item.categoria] = parseInt(item.total);
    });

    res.json({
      success: true,
      data: {
        resumo: {
          total_senhas: totalSenhas,
          total_prefeituras: totalPrefeituras,
          total_fornecedores: totalFornecedores,
          usuarios_ativos: usuariosAtivos
        },
        categorias: estatisticasCategorias,
        senhas_expirando: senhasExpirando,
        ultimas_alteracoes: ultimasAlteracoes
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Gráfico de senhas por categoria
router.get('/graficos/senhas-categoria', [
  verificarAutenticacao,
  verificarAcessoSenhas
], async (req, res) => {
  try {
    const estatisticas = await Senha.estatisticasPorCategoria();

    const dadosGrafico = estatisticas.map(item => ({
      categoria: item.categoria,
      total: parseInt(item.total),
      label: {
        'prefeituras': 'Prefeituras',
        'fornecedores': 'Fornecedores',
        'orgaos': 'Órgãos Governamentais',
        'b2fleet': 'B2Fleet e Locadoras'
      }[item.categoria] || item.categoria
    }));

    res.json({
      success: true,
      data: {
        grafico: dadosGrafico
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Senhas que expiram nos próximos dias
router.get('/alertas/expiracao', [
  verificarAutenticacao,
  verificarAcessoSenhas
], async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 30;
    const senhasExpirando = await Senha.buscarExpirandoEmBreve(dias);

    // Categorizar por urgência
    const alertas = {
      criticos: senhasExpirando.filter(s => s.dias_restantes <= 2),
      importantes: senhasExpirando.filter(s => s.dias_restantes > 2 && s.dias_restantes <= 7),
      normais: senhasExpirando.filter(s => s.dias_restantes > 7)
    };

    res.json({
      success: true,
      data: {
        alertas,
        total: senhasExpirando.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar alertas de expiração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atividade recente do sistema
router.get('/atividade/recente', [
  verificarAutenticacao,
  verificarAcessoSenhas
], async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    
    // Buscar logs de acesso recentes
    const { query } = require('../config/database');
    const sql = `
      SELECT 
        l.id,
        l.acao,
        l.criado_em,
        u.nome as usuario_nome,
        u.tipo_usuario,
        s.sistema as senha_sistema
      FROM logs_acesso l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      LEFT JOIN senhas s ON l.senha_id = s.id
      ORDER BY l.criado_em DESC
      LIMIT $1
    `;
    
    const result = await query(sql, [limite]);
    
    res.json({
      success: true,
      data: {
        atividades: result.rows
      }
    });

  } catch (error) {
    console.error('Erro ao buscar atividade recente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Estatísticas detalhadas por período
router.get('/estatisticas/periodo', [
  verificarAutenticacao,
  verificarAcessoSenhas
], async (req, res) => {
  try {
    const periodo = req.query.periodo || '30'; // dias
    const { query } = require('../config/database');
    
    // Senhas criadas por dia no período
    const sqlSenhasPorDia = `
      SELECT 
        DATE(criado_em) as data,
        COUNT(*) as total
      FROM senhas
      WHERE criado_em >= CURRENT_DATE - INTERVAL '${periodo} days'
      GROUP BY DATE(criado_em)
      ORDER BY data DESC
    `;
    
    // Acessos por dia no período
    const sqlAcessosPorDia = `
      SELECT 
        DATE(criado_em) as data,
        COUNT(*) as total
      FROM logs_acesso
      WHERE criado_em >= CURRENT_DATE - INTERVAL '${periodo} days'
      GROUP BY DATE(criado_em)
      ORDER BY data DESC
    `;
    
    const [senhasPorDia, acessosPorDia] = await Promise.all([
      query(sqlSenhasPorDia),
      query(sqlAcessosPorDia)
    ]);

    res.json({
      success: true,
      data: {
        periodo: parseInt(periodo),
        senhas_por_dia: senhasPorDia.rows,
        acessos_por_dia: acessosPorDia.rows
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas por período:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Relatório de uso do sistema
router.get('/relatorio/uso', [
  verificarAutenticacao,
  verificarAcessoSenhas
], async (req, res) => {
  try {
    const { query } = require('../config/database');
    
    // Usuários mais ativos
    const sqlUsuariosAtivos = `
      SELECT 
        u.nome,
        u.tipo_usuario,
        COUNT(l.id) as total_acoes,
        MAX(l.criado_em) as ultimo_acesso
      FROM usuarios u
      LEFT JOIN logs_acesso l ON u.id = l.usuario_id
      WHERE u.ativo = true
      GROUP BY u.id, u.nome, u.tipo_usuario
      ORDER BY total_acoes DESC
      LIMIT 10
    `;
    
    // Sistemas mais acessados
    const sqlSistemasAcessados = `
      SELECT 
        s.sistema,
        s.categoria,
        COUNT(l.id) as total_acessos
      FROM senhas s
      LEFT JOIN logs_acesso l ON s.id = l.senha_id
      GROUP BY s.id, s.sistema, s.categoria
      ORDER BY total_acessos DESC
      LIMIT 10
    `;
    
    const [usuariosAtivos, sistemasAcessados] = await Promise.all([
      query(sqlUsuariosAtivos),
      query(sqlSistemasAcessados)
    ]);

    res.json({
      success: true,
      data: {
        usuarios_mais_ativos: usuariosAtivos.rows,
        sistemas_mais_acessados: sistemasAcessados.rows
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de uso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Status geral do sistema
router.get('/status', [
  verificarAutenticacao
], async (req, res) => {
  try {
    const { query } = require('../config/database');
    
    // Verificar conexão com banco
    await query('SELECT 1');
    
    // Estatísticas básicas
    const [totalSenhas, totalUsuarios, totalLocalidades] = await Promise.all([
      Senha.contar(),
      Usuario.contar({ ativo: true }),
      Localidade.contar({ ativo: true })
    ]);

    res.json({
      success: true,
      data: {
        status: 'online',
        banco_dados: 'conectado',
        estatisticas: {
          total_senhas: totalSenhas,
          total_usuarios: totalUsuarios,
          total_localidades: totalLocalidades
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao verificar status do sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      data: {
        status: 'erro',
        banco_dados: 'desconectado',
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;

