import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { TournamentEdition } from '../entities/TournamentEdition';

const router = express.Router();
const tournamentEditionRepository = AppDataSource.getRepository(TournamentEdition);

// Get all tournament editions
router.get('/', async (req: Request, res: Response) => {
  try {
    const editions = await tournamentEditionRepository.find({
      order: { year: 'DESC', createdAt: 'DESC' }
    });
    res.json(editions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single tournament edition
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const edition = await tournamentEditionRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!edition) {
      return res.status(404).json({ message: 'Tournament edition not found' });
    }
    res.json(edition);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create tournament edition
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, year, category, phases, numberOfGroups, numberOfKnockoutPhases, numberOfQualificationRounds } = req.body;

    const edition = tournamentEditionRepository.create({
      name,
      year,
      category,
      phases,
      numberOfGroups: phases.grupa ? numberOfGroups : undefined,
      numberOfKnockoutPhases: phases.knockout ? numberOfKnockoutPhases : undefined,
      numberOfQualificationRounds: phases.kvalifikacije ? numberOfQualificationRounds : undefined
    });

    const savedEdition = await tournamentEditionRepository.save(edition);
    res.status(201).json(savedEdition);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Update tournament edition
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, year, category, phases, numberOfGroups, numberOfKnockoutPhases, numberOfQualificationRounds } = req.body;

    const edition = await tournamentEditionRepository.findOne({
      where: { id: req.params.id }
    });

    if (!edition) {
      return res.status(404).json({ message: 'Tournament edition not found' });
    }

    Object.assign(edition, {
      name,
      year,
      category,
      phases,
      numberOfGroups: phases.grupa ? numberOfGroups : undefined,
      numberOfKnockoutPhases: phases.knockout ? numberOfKnockoutPhases : undefined,
      numberOfQualificationRounds: phases.kvalifikacije ? numberOfQualificationRounds : undefined
    });

    const updatedEdition = await tournamentEditionRepository.save(edition);
    res.json(updatedEdition);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Delete tournament edition
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const edition = await tournamentEditionRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!edition) {
      return res.status(404).json({ message: 'Tournament edition not found' });
    }

    await tournamentEditionRepository.remove(edition);
    res.json({ message: 'Tournament edition deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 