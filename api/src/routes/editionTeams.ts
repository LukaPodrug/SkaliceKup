import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { EditionTeam } from '../entities/EditionTeam';
import { Team } from '../entities/Team';

const router = express.Router();
const editionTeamRepository = AppDataSource.getRepository(EditionTeam);
const teamRepository = AppDataSource.getRepository(Team);

// Get teams for a tournament edition
router.get('/:editionId', async (req: Request, res: Response) => {
  try {
    const editionTeams = await editionTeamRepository.find({
      where: { tournamentEditionId: req.params.editionId },
      relations: ['team'],
      order: { team: { name: 'ASC' } }
    });

    const teams = editionTeams.map(et => et.team);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add team to tournament edition
router.post('/:editionId', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;

    const editionTeam = editionTeamRepository.create({
      tournamentEditionId: req.params.editionId,
      teamId
    });

    await editionTeamRepository.save(editionTeam);

    const team = await teamRepository.findOne({
      where: { id: teamId }
    });
    res.status(201).json(team);
  } catch (error: any) {
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json({ message: 'Team already assigned to this tournament edition' });
    }
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Remove team from tournament edition
router.delete('/:editionId/:teamId', async (req: Request, res: Response) => {
  try {
    const editionTeam = await editionTeamRepository.findOne({
      where: {
        tournamentEditionId: req.params.editionId,
        teamId: req.params.teamId
      }
    });

    if (!editionTeam) {
      return res.status(404).json({ message: 'Team not found in tournament edition' });
    }

    await editionTeamRepository.remove(editionTeam);
    res.json({ message: 'Team removed from tournament edition' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 