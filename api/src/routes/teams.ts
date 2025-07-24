import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Team } from '../entities/Team';

const router = express.Router();
const teamRepository = AppDataSource.getRepository(Team);

// Get all teams
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, editionId, ids } = req.query;
    
    // Support fetching by multiple IDs
    if (ids) {
      // ids can be a comma-separated string or array
      let idList: string[] = [];
      if (Array.isArray(ids)) {
        idList = ids as string[];
      } else if (typeof ids === 'string') {
        idList = ids.split(',').map(id => id.trim()).filter(Boolean);
      }
      if (idList.length > 0) {
        const teams = await teamRepository.findByIds(idList);
        return res.json(teams);
      }
    }
    
    if (editionId) {
      // If editionId is provided, return all teams for that edition (no limit)
      const editionTeamRepository = AppDataSource.getRepository(require('../entities/EditionTeam').EditionTeam);
      const editionTeams = await editionTeamRepository.find({
        where: { tournamentEditionId: editionId },
        relations: ['team'],
        order: { team: { name: 'ASC' } }
      });
      const teams = editionTeams.map((et: any) => et.team);
      return res.json(teams);
    }
    
    let queryBuilder = teamRepository.createQueryBuilder('team');
    
    if (search && typeof search === 'string') {
      queryBuilder = queryBuilder.where('LOWER(team.name) LIKE LOWER(:search)', {
        search: `%${search}%`
      });
    }
    
    // Always limit to 20 items for performance
    const teams = await queryBuilder
      .orderBy('team.name', 'ASC')
      .limit(20)
      .getMany();
      
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single team
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const team = await teamRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create team
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, logo } = req.body;

    const team = teamRepository.create({
      name,
      logo
    });

    const savedTeam = await teamRepository.save(team);
    res.status(201).json(savedTeam);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Update team
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, logo } = req.body;

    const team = await teamRepository.findOne({
      where: { id: req.params.id }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    Object.assign(team, { name, logo });
    const updatedTeam = await teamRepository.save(team);
    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Delete team
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const team = await teamRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await teamRepository.remove(team);
    res.json({ message: 'Team deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 