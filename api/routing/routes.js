module.exports = (server, newGameMatchService) => {
  // Controllers
  const gameMatchController = require('../controllers/gameMatchController')(newGameMatchService)

  // API Routes
  server.post('/match', gameMatchController.saveMatchResults)
  server.get('/match/raw', gameMatchController.getRawData)
  server.get('/match/stats', gameMatchController.getTableOfPositions)
}
