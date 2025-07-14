import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Player } from '../entities/Player';

const router = express.Router();
const playerRepository = AppDataSource.getRepository(Player);

// Get all players
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let queryBuilder = playerRepository.createQueryBuilder('player');
    
    if (search && typeof search === 'string') {
      queryBuilder = queryBuilder.where(
        'LOWER(player.firstName) LIKE LOWER(:search) OR LOWER(player.lastName) LIKE LOWER(:search)',
        { search: `%${search}%` }
      );
    }
    
    // Always limit to 20 items for performance
    const players = await queryBuilder
      .orderBy('player.lastName', 'ASC')
      .addOrderBy('player.firstName', 'ASC')
      .limit(20)
      .getMany();
      
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single player
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const player = await playerRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create player
router.post('/', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, dateOfBirth, imageUrl } = req.body;

    const player = playerRepository.create({
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      imageUrl
    });

    const savedPlayer = await playerRepository.save(player);
    res.status(201).json(savedPlayer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Update player
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, dateOfBirth, imageUrl } = req.body;

    const player = await playerRepository.findOne({
      where: { id: req.params.id }
    });

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    Object.assign(player, {
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      imageUrl
    });

    const updatedPlayer = await playerRepository.save(player);
    res.json(updatedPlayer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Delete player
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const player = await playerRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    await playerRepository.remove(player);
    res.json({ message: 'Player deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 