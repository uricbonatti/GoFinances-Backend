// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    try {
      await transactionsRepository.delete({ id });
    } catch {
      throw new AppError(
        `Transaction with that ${id} can't be deleted, because no exists. `,
      );
    }
  }
}

export default DeleteTransactionService;
