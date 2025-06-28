const User = require('../models/User');
const { validationResult } = require('express-validator');

class UserController {
  static async getAll(req, res) {
    try {
      const users = await User.findAll();
      
      res.json({
        success: true,
        data: users
      });

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Remover senha da resposta
      const { senha: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
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

      const { nome, email, senha, tipo_usuario, localidade_id } = req.body;

      // Verificar se o email já existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }

      const newUser = await User.create({
        nome,
        email,
        senha,
        tipo_usuario,
        localidade_id
      });

      // Remover senha da resposta
      const { senha: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: userWithoutPassword
      });

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
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
      const { nome, email, tipo_usuario, localidade_id, ativo } = req.body;

      // Verificar se o usuário existe
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Verificar se o email já está em uso por outro usuário
      if (email !== existingUser.email) {
        const emailInUse = await User.findByEmail(email);
        if (emailInUse) {
          return res.status(400).json({
            success: false,
            message: 'Email já está em uso'
          });
        }
      }

      const updatedUser = await User.update(id, {
        nome,
        email,
        tipo_usuario,
        localidade_id,
        ativo
      });

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o usuário existe
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Não permitir que o usuário delete a si mesmo
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Você não pode deletar sua própria conta'
        });
      }

      await User.delete(id);

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = UserController;

