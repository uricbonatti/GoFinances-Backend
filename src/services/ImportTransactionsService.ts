/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import path from 'path';
import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionLine {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    // TODO
    const csvFilePath = path.resolve(
      __dirname,
      '..',
      '..',
      'tmp',
      'importTransactions.csv',
    );
    async function loadCSV(filePath: string): Promise<TransactionLine[]> {
      const readCSVStream = fs.createReadStream(filePath);
      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });
      const parseCSV = readCSVStream.pipe(parseStream);
      const lines: TransactionLine[] = [];

      parseCSV.on('data', line => {
        lines.push({
          title: line[0],
          type: line[1],
          value: +line[2],
          category: line[3],
        });
      });
      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });

      return lines;
    }
    const onFileTransactions = await loadCSV(csvFilePath);
    await fs.promises.unlink(csvFilePath);
    const createTransaction = new CreateTransactionService();
    const transactions: Transaction[] = [];
    for (const onFileTransaction of onFileTransactions) {
      const transaction = await createTransaction.execute({
        title: onFileTransaction.title,
        value: onFileTransaction.value,
        type: onFileTransaction.type,
        category: onFileTransaction.category,
        file: true,
      });
      transactions.push(transaction);
    }

    // const transactions: Transaction[] = await Promise.all(
    //   dataOnFile.map(async line => {
    //     const transaction = await createTransaction.execute({
    //       title: line[0],
    //       value: line[2],
    //       type: line[1],
    //       category: line[3],
    //       file: true,
    //     });
    //     return transaction;
    //   }),
    // );
    return transactions;
  }
}

export default ImportTransactionsService;
