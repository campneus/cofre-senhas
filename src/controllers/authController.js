const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      const isValidPassword = await User.validatePassword(senha, user.senha);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Atualizar último acesso
      await User.updateLastAccess(user.id);

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          tipo_usuario: user.tipo_usuario 
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '8h' }
      );

      // Remover senha da resposta
      const { senha: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async logout(req, res) {
    try {
      // Em uma implementação mais robusta, você poderia invalidar o token
      // adicionando-o a uma blacklist no banco de dados
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async me(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
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
      console.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async changePassword(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual e nova senha são obrigatórias'
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'A nova senha deve ter pelo menos 6 caracteres'
        });
      }

      const user = await User.findById(req.user.id);
      const isValidPassword = await User.validatePassword(senhaAtual, user.senha);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }

      await User.updatePassword(req.user.id, novaSenha);

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = AuthController;

