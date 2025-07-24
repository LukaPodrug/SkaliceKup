import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Match } from '../entities/Match';
import { TournamentEdition } from '../entities/TournamentEdition';
import { Team } from '../entities/Team';
import { Player } from '../entities/Player';
import { broadcastUpdate } from '../index';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

const router = express.Router();
const matchRepository = AppDataSource.getRepository(Match);
const tournamentEditionRepository = AppDataSource.getRepository(TournamentEdition);
const teamRepository = AppDataSource.getRepository(Team);
const playerRepository = AppDataSource.getRepository(Player);

// Helper to map phase/knockout round
function getKnockoutPhaseLabel(match: any) {
  // If phase is one of the known knockout rounds, return it
  const knockoutMap: Record<string, string> = {
    'Šesnaestina finala': 'Šesnaestina finala',
    'Osmina finala': 'Osmina finala',
    'Četvrtfinale': 'Četvrtfinale',
    'Polufinale': 'Polufinale',
    'Finale': 'Finale',
  };
  if (knockoutMap[match.phase]) return knockoutMap[match.phase];
  // If phase is 'Knockout', try to use a custom property or fallback
  if (match.phase === 'Knockout' && match.knockoutPhase && knockoutMap[match.knockoutPhase]) {
    return knockoutMap[match.knockoutPhase];
  }
  return undefined;
}

// Get all matches
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tournamentEdition, phase, status, dateFrom, dateTo } = req.query;
    const whereClause: any = {};
    
    if (tournamentEdition) whereClause.tournamentEditionId = tournamentEdition;
    if (phase) whereClause.phase = phase;
    if (status) whereClause.status = status;

    // Date filtering using TypeORM operators
    if (dateFrom && dateTo) {
      whereClause.date = Between(new Date(dateFrom as string), new Date(dateTo as string));
    } else if (dateFrom) {
      whereClause.date = MoreThanOrEqual(new Date(dateFrom as string));
    } else if (dateTo) {
      whereClause.date = LessThanOrEqual(new Date(dateTo as string));
    }

    const matches = await matchRepository.find({
      where: whereClause,
      relations: ['tournamentEdition', 'homeTeam', 'awayTeam'],
      order: { date: 'ASC' }
    });

    // Populate player and team info for events
    const matchesWithEventDetails = await Promise.all(
      matches.map(async (match) => {
        const eventsWithDetails = await Promise.all(
          match.events.map(async (event) => {
            const eventWithDetails: any = { ...event };
            
            if (event.playerId) {
              const player = await playerRepository.findOne({
                where: { id: event.playerId }
              });
              if (player) {
                eventWithDetails.player = {
                  id: player.id,
                  firstName: player.firstName,
                  lastName: player.lastName
                };
              }
            }
            
            if (event.teamId) {
              eventWithDetails.teamId = event.teamId; // Ensure teamId is always present
              const team = await teamRepository.findOne({
                where: { id: event.teamId }
              });
              if (team) {
                eventWithDetails.team = {
                  id: team.id,
                  name: team.name
                };
              }
            }
            
            return eventWithDetails;
          })
        );
        
        return { ...match, events: eventsWithDetails, knockoutPhase: getKnockoutPhaseLabel(match) };
      })
    );

    res.json(matchesWithEventDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single match
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const match = await matchRepository.findOne({
      where: { id: req.params.id },
      relations: ['tournamentEdition', 'homeTeam', 'awayTeam']
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Populate player and team info for events
    const eventsWithDetails = await Promise.all(
      match.events.map(async (event) => {
        const eventWithDetails: any = { ...event };
        
        if (event.playerId) {
          const player = await playerRepository.findOne({
            where: { id: event.playerId }
          });
          if (player) {
            eventWithDetails.player = {
              id: player.id,
              firstName: player.firstName,
              lastName: player.lastName
            };
          }
        }
        
        if (event.teamId) {
          eventWithDetails.teamId = event.teamId; // Ensure teamId is always present
          const team = await teamRepository.findOne({
            where: { id: event.teamId }
          });
          if (team) {
            eventWithDetails.team = {
              id: team.id,
              name: team.name
            };
          }
        }
        
        return eventWithDetails;
      })
    );

    res.json({ ...match, events: eventsWithDetails, knockoutPhase: getKnockoutPhaseLabel(match) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create match
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      tournamentEditionId,
      date,
      homeTeamId,
      awayTeamId,
      phase,
      group,
      qualificationRound,
      homeScore,
      awayScore,
      status,
      homeSquad,
      awaySquad
    } = req.body;

    const match = matchRepository.create({
      tournamentEditionId,
      date: new Date(date),
      homeTeamId,
      awayTeamId,
      phase,
      group,
      qualificationRound,
      homeScore,
      awayScore,
      status: status || 'scheduled',
      events: [],
      homeSquad,
      awaySquad
    });

    const savedMatch = await matchRepository.save(match);
    const populatedMatch = await matchRepository.findOne({
      where: { id: savedMatch.id },
      relations: ['tournamentEdition', 'homeTeam', 'awayTeam']
    });

    res.status(201).json(populatedMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    const err = error as Error;
    res.status(400).json({ message: 'Invalid data', error: err.message, stack: err.stack });
  }
});

// Update match
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const {
      date,
      homeTeamId,
      awayTeamId,
      phase,
      group,
      qualificationRound,
      homeScore,
      awayScore,
      status,
      homeSquad,
      awaySquad
    } = req.body;

    const match = await matchRepository.findOne({
      where: { id: req.params.id }
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    Object.assign(match, {
      date: date ? new Date(date) : undefined,
      homeTeamId,
      awayTeamId,
      phase,
      group,
      qualificationRound,
      homeScore,
      awayScore,
      status,
      homeSquad,
      awaySquad
    });

    const updatedMatch = await matchRepository.save(match);
    const populatedMatch = await matchRepository.findOne({
      where: { id: updatedMatch.id },
      relations: ['tournamentEdition', 'homeTeam', 'awayTeam']
    });

    // Broadcast match update
    broadcastUpdate('match_update', {
      matchId: req.params.id,
      updates: {
        date: updatedMatch.date,
        homeTeamId: updatedMatch.homeTeamId,
        awayTeamId: updatedMatch.awayTeamId,
        phase: updatedMatch.phase,
        group: updatedMatch.group,
        qualificationRound: updatedMatch.qualificationRound,
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore,
        status: updatedMatch.status
      }
    });

    res.json(populatedMatch);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Delete match
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const match = await matchRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    await matchRepository.remove(match);
    res.json({ message: 'Match deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add match event
router.post('/:id/events', async (req: Request, res: Response) => {
  try {

    const match = await matchRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Store all event fields sent from the frontend
    const newEvent = { ...req.body };
    match.events.push(newEvent);

    // Update scores based on event type
    if (
      newEvent.type === 'goal' ||
      ((newEvent.type === 'penalty' || newEvent.type === '10m') && newEvent.result === 'score')
    ) {
      if (newEvent.teamId === match.homeTeamId) {
        match.homeScore = (match.homeScore || 0) + 1;
      } else if (newEvent.teamId === match.awayTeamId) {
        match.awayScore = (match.awayScore || 0) + 1;
      }
    }
    // Handle own_goal: increment opponent's score
    if (newEvent.type === 'own_goal') {
      if (newEvent.teamId === match.homeTeamId) {
        match.awayScore = (match.awayScore || 0) + 1;
      } else if (newEvent.teamId === match.awayTeamId) {
        match.homeScore = (match.homeScore || 0) + 1;
      }
    }
    // Timeout does not affect score

    await matchRepository.save(match);

    const updatedMatch = await matchRepository.findOne({
      where: { id: req.params.id },
      relations: ['tournamentEdition', 'homeTeam', 'awayTeam']
    });

    // Broadcast event update with all events
    if (updatedMatch) {
      broadcastUpdate('event_update', {
        matchId: req.params.id,
        events: updatedMatch.events,
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore,
        action: 'added',
        lastEvent: newEvent
      });
    }

    res.json(updatedMatch);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Remove match event
router.delete('/:id/events/:eventIndex', async (req: Request, res: Response) => {
  try {
    const eventIndex = parseInt(req.params.eventIndex);
    
    const match = await matchRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (eventIndex < 0 || eventIndex >= match.events.length) {
      return res.status(400).json({ message: 'Invalid event index' });
    }

    const removedEvent = match.events[eventIndex];
    match.events.splice(eventIndex, 1);

    // Recalculate scores if a goal was removed
    if (
      removedEvent.type === 'goal' ||
      ((removedEvent.type === 'penalty' || removedEvent.type === '10m') && removedEvent.result === 'score')
    ) {
      if (removedEvent.teamId === match.homeTeamId) {
        match.homeScore = Math.max(0, (match.homeScore || 0) - 1);
      } else if (removedEvent.teamId === match.awayTeamId) {
        match.awayScore = Math.max(0, (match.awayScore || 0) - 1);
      }
    }
    // Handle own_goal removal: decrement opponent's score
    if (removedEvent.type === 'own_goal') {
      if (removedEvent.teamId === match.homeTeamId) {
        match.awayScore = Math.max(0, (match.awayScore || 0) - 1);
      } else if (removedEvent.teamId === match.awayTeamId) {
        match.homeScore = Math.max(0, (match.homeScore || 0) - 1);
      }
    }

    await matchRepository.save(match);

    const updatedMatch = await matchRepository.findOne({
      where: { id: req.params.id },
      relations: ['tournamentEdition', 'homeTeam', 'awayTeam']
    });

    // Broadcast event update
    if (updatedMatch) {
      broadcastUpdate('event_update', {
        matchId: req.params.id,
        events: updatedMatch.events,
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore,
        action: 'removed',
        removedEvent: removedEvent
      });
    }

    res.json(updatedMatch);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

export default router; 