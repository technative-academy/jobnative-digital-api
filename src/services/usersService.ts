// File overview: Contains user business rules and validation before calling the repository layer.

import usersRepository from '../repositories/usersRepository';

async function listUsers() {
  return usersRepository.getAll();
}

export default {
  listUsers
};
