const Location = require('../models/Location');

class LocationController {
  static async getAll(req, res) {
    try {
      const locations = await Location.findAll();
      
      res.json({
        success: true,
        data: locations
      });

    } catch (error) {
      console.error('Erro ao buscar localidades:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const location = await Location.findById(id);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Localidade não encontrada'
        });
      }

      res.json({
        success: true,
        data: location
      });

    } catch (error) {
      console.error('Erro ao buscar localidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async create(req, res) {
    try {
      const { id, nome } = req.body;

      if (!id || !nome) {
        return res.status(400).json({
          success: false,
          message: 'ID e nome são obrigatórios'
        });
      }

      // Verificar se o ID já existe
      const existingLocation = await Location.findById(id);
      if (existingLocation) {
        return res.status(400).json({
          success: false,
          message: 'ID já está em uso'
        });
      }

      const newLocation = await Location.create({ id, nome });

      res.status(201).json({
        success: true,
        message: 'Localidade criada com sucesso',
        data: newLocation
      });

    } catch (error) {
      console.error('Erro ao criar localidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, ativo } = req.body;

      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório'
        });
      }

      // Verificar se a localidade existe
      const existingLocation = await Location.findById(id);
      if (!existingLocation) {
        return res.status(404).json({
          success: false,
          message: 'Localidade não encontrada'
        });
      }

      const updatedLocation = await Location.update(id, { nome, ativo });

      res.json({
        success: true,
        message: 'Localidade atualizada com sucesso',
        data: updatedLocation
      });

    } catch (error) {
      console.error('Erro ao atualizar localidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a localidade existe
      const existingLocation = await Location.findById(id);
      if (!existingLocation) {
        return res.status(404).json({
          success: false,
          message: 'Localidade não encontrada'
        });
      }

      await Location.delete(id);

      res.json({
        success: true,
        message: 'Localidade deletada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar localidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = LocationController;

