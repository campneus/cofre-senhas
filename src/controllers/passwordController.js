const Password = require('../models/Password');
const { validationResult } = require('express-validator');

class PasswordController {
  static async getAll(req, res) {
    try {
      const { categoria, localidade_id, search } = req.query;
      
      const filters = {};
      if (categoria) filters.categoria = categoria;
      if (localidade_id) filters.localidade_id = localidade_id;
      if (search) filters.search = search;

      const passwords = await Password.findAll(filters);
      
      res.json({
        success: true,
        data: passwords
      });

    } catch (error) {
      console.error('Erro ao buscar senhas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const password = await Password.findById(id);

      if (!password) {
        return res.status(404).json({
          success: false,
          message: 'Senha não encontrada'
        });
      }

      res.json({
        success: true,
        data: password
      });

    } catch (error) {
      console.error('Erro ao buscar senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { 
        sistema, 
        categoria, 
        localidade_id, 
        usuario, 
        senha, 
        url, 
        observacoes 
      } = req.body;

      const newPassword = await Password.create({
        sistema,
        categoria,
        localidade_id,
        usuario,
        senha,
        url,
        observacoes,
        criado_por: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Senha criada com sucesso',
        data: newPassword
      });

    } catch (error) {
      console.error('Erro ao criar senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { 
        sistema, 
        categoria, 
        localidade_id, 
        usuario, 
        senha, 
        url, 
        observacoes 
      } = req.body;

      // Verificar se a senha existe
      const existingPassword = await Password.findById(id);
      if (!existingPassword) {
        return res.status(404).json({
          success: false,
          message: 'Senha não encontrada'
        });
      }

      await Password.update(id, {
        sistema,
        categoria,
        localidade_id,
        usuario,
        senha,
        url,
        observacoes
      });

      res.json({
        success: true,
        message: 'Senha atualizada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a senha existe
      const existingPassword = await Password.findById(id);
      if (!existingPassword) {
        return res.status(404).json({
          success: false,
          message: 'Senha não encontrada'
        });
      }

      await Password.delete(id);

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
  }

  static async getStats(req, res) {
    try {
      const stats = await Password.getStats();
      
      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = PasswordController;

