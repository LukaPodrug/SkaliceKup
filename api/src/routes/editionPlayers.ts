import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { EditionPlayer } from '../entities/EditionPlayer';
import { Player } from '../entities/Player';

const router = express.Router();
const editionPlayerRepository = AppDataSource.getRepository(EditionPlayer);
const playerRepository = AppDataSource.getRepository(Player);

// Get players for a team in a tournament edition
router.get('/:editionId/:teamId', async (req: Request, res: Response) => {
  try {
    const editionPlayers = await editionPlayerRepository.find({
      where: {
        tournamentEditionId: req.params.editionId,
        teamId: req.params.teamId
      },
      relations: ['player'],
      order: { player: { lastName: 'ASC', firstName: 'ASC' } }
    });

    const players = editionPlayers.map(ep => ep.player);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add player to team in tournament edition
router.post('/:editionId/:teamId', async (req: Request, res: Response) => {
  try {
    const { playerId } = req.body;

    const editionPlayer = editionPlayerRepository.create({
      tournamentEditionId: req.params.editionId,
      teamId: req.params.teamId,
      playerId
    });

    await editionPlayerRepository.save(editionPlayer);

    const player = await playerRepository.findOne({
      where: { id: playerId }
    });
    res.status(201).json(player);
  } catch (error: any) {
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json({ message: 'Player already assigned to this team in this tournament edition' });
    }
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Remove player from team in tournament edition
router.delete('/:editionId/:teamId/:playerId', async (req: Request, res: Response) => {
  try {
    const editionPlayer = await editionPlayerRepository.findOne({
      where: {
        tournamentEditionId: req.params.editionId,
        teamId: req.params.teamId,
        playerId: req.params.playerId
      }
    });

    if (!editionPlayer) {
      return res.status(404).json({ message: 'Player not found in team for this tournament edition' });
    }

    await editionPlayerRepository.remove(editionPlayer);
    res.json({ message: 'Player removed from team' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 