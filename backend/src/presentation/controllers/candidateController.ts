import { Request, Response } from 'express';
import { addCandidate, findCandidateById } from '../../application/services/candidateService';
import { UpdateCandidateStageUseCase } from '../../application/services/candidateService';
import { CandidateRepository } from '../../infrastructure/repositories/CandidateRepository';
import { CandidateNotFoundError } from '../../domain/errors/CandidateNotFoundError';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateCandidateStageController = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id);
        const newStage = parseInt(req.body.stage);

        if (isNaN(candidateId) || isNaN(newStage)) {
            return res.status(400).json({ error: 'Invalid candidate ID or stage' });
        }

        const candidateRepository = new CandidateRepository(req.prisma);
        const useCase = new UpdateCandidateStageUseCase(candidateRepository);
        const updatedCandidate = await useCase.execute(candidateId, newStage);
        res.json(updatedCandidate);
    } catch (error) {
        if (error instanceof CandidateNotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            console.error("Error updating candidate stage:", error);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
};

export { addCandidate };