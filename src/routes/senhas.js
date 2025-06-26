const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Senha = require('../models/Senha');
const { 
  verificarAutenticacao, 
  verificarAcessoSenhas, 
  verificarModificacaoSenhas, 
  logAcesso 
} = require('../middleware/auth');

const router = express.Router();

// Validações
const validacaoSenha = [
  body('sistema')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Sistema deve ter entre 1 e 200 caracteres'),
  body('categoria')
    .isIn(['prefeituras', 'fornecedores', 'orgaos', 'b2fleet'])
    .withMessage('Categoria deve ser: prefeituras, fornecedores, orgaos ou b2fleet'),
  body('usuario')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Usuário deve ter entre 1 e 200 caracteres'),
  body('senha')
    .isLength({ min: 1 })
    .withMessage('Senha é obrigatória'),
  body('url')
    .optional()
    .isURL()
    .withMessage('URL deve ser válida'),
  body('data_expiracao')
    .optional()
    .isISO8601()
    .withMessage('Data de expiração deve ser uma data válida'),
  body('dias_aviso_expiracao')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Dias de aviso deve ser entre 1 e 365')
];

const validacaoBusca = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  query('categoria')
    .optional()
    .isIn(['prefeituras', 'fornecedores', 'orgaos', 'b2fleet'])
    .withMessage('Categoria inválida')
];

// Listar senhas
router.get('/', [
  verificarAutenticacao,
  verificarAcessoSenhas,
  validacaoBusca
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: errors.array()
      });
    }

    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 20;
    const offset = (pagina - 1) * limite;

    const filtros = {
      limite,
      offset,
      categoria: req.query.categoria,
      localidade_id: req.query.localidade_id,
      busca: req.query.busca
    };

    const [senhas, total] = await Promise.all([
      Senha.buscarTodas(filtros),
      Senha.contar(filtros)
    ]);

    res.json({
      success: true,
      data: {
        senhas,
        paginacao: {
          pagina_atual: pagina,
          total_paginas: Math.ceil(total / limite),
          total_registros: total,
          registros_por_pagina: limite
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar senhas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar senha por ID
router.get('/:id', [
  verificarAutenticacao,
  verificarAcessoSenhas
], async (req, res) => {
  try {
    const senha = await Senha.buscarPorId(req.params.id);
    
    if (!senha) {
      return res.status(404).json({
        success: false,
        message: 'Senha não encontrada'
      });
    }

    // Incluir senha descriptografada apenas para administradores
    let dadosResposta = senha.toJSON();
    if (req.usuario.tipo_usuario === 'administrador') {
      dadosResposta.senha_descriptografada = senha.obterSenhaDescriptografada();
    }

    res.json({
      success: true,
      data: {
        senha: dadosResposta
      }
    });

  } catch (error) {
    console.error('Erro ao buscar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Criar nova senha
router.post('/', [
  verificarAutenticacao,
  verificarModificacaoSenhas,
  logAcesso,
  ...validacaoSenha
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const novaSenha = await Senha.criar(req.body, req.usuario.id);

    res.status(201).json({
      success: true,
      message: 'Senha criada com sucesso',
      data: {
        senha: novaSenha.toJSON()
      }
    });

  } catch (error) {
    console.error('Erro ao criar senha:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// Atualizar senha
router.put('/:id', [
  verificarAutenticacao,
  verificarModificacaoSenhas,
  logAcesso,
  ...validacaoSenha
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const senhaAtualizada = await Senha.atualizar(req.params.id, req.body, req.usuario.id);
    
    if (!senhaAtualizada) {
      return res.status(404).json({
        success: false,
        message: 'Senha não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Senha atualizada com sucesso',
      data: {
        senha: senhaAtualizada.toJSON()
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// Deletar senha
router.delete('/:id', [
  verificarAutenticacao,
  verificarModificacaoSenhas,
  logAcesso
], async (req, res) => {
  try {
    const sucesso = await Senha.deletar(req.params.id);
    
    if (!sucesso) {
      return res.status(404).json({
        success: false,
        message: 'Senha não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Senha deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar senhas que expiram em breve
router.get('/expiracao/breve', [
  verificarAutenticacao,
  verificarAcessoSenhas
], async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 30;
    const senhasExpirando = await Senha.buscarExpirandoEmBreve(dias);

    res.json({
      success: true,
      data: {
        senhas_expirando: senhasExpirando
      }
    });

  } catch (error) {
    console.error('Erro ao buscar senhas expirando:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Estatísticas por categoria
router.get('/estatisticas/categorias', [
  verificarAutenticacao,
  verificarAcessoSenhas
], async (req, res) => {
  try {
    const estatisticas = await Senha.estatisticasPorCategoria();

    res.json({
      success: true,
      data: {
        estatisticas
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Últimas alterações
router.get('/historico/ultimas', [
  verificarAutenticacao,
  verificarAcessoSenhas
], async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 5;
    const ultimasAlteracoes = await Senha.buscarUltimasAlteracoes(limite);

    res.json({
      success: true,
      data: {
        ultimas_alteracoes: ultimasAlteracoes
      }
    });

  } catch (error) {
    console.error('Erro ao buscar últimas alterações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;

