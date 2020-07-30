// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
  file?: boolean;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
    file,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (!file && type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (balance.total < value) {
        throw new AppError('Outcome value exceeds cash value!');
      }
    }

    const categoriesRepository = getRepository(Category);

    let searchCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!searchCategory) {
      searchCategory = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(searchCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: searchCategory,
    });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
