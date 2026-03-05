// File overview: Contains validation and business rules for user-company dashboard states.

import AppError from '../errors/AppError';
import userCompanyStatesRepository, {
  type DashboardColumn
} from '../repositories/userCompanyStatesRepository';
import companiesRepository from '../repositories/companiesRepository';

const VALID_COLUMNS: DashboardColumn[] = ['todo', 'contacted', 'favourite'];

interface UpsertPayload {
  dashboardColumn?: unknown;
  personalNotes?: unknown;
}

function readId(value: unknown): number {
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number.parseInt(value, 10);
  }

  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  throw new AppError(400, '"companyId" must be a positive integer.');
}

async function listByUser(userId: number) {
  return userCompanyStatesRepository.getByUserId(userId);
}

async function getByUserAndCompany(userId: number, companyIdParam: unknown) {
  const companyId = readId(companyIdParam);

  const state = await userCompanyStatesRepository.getByUserAndCompany(userId, companyId);
  if (!state) {
    throw new AppError(404, 'No saved state for this company.');
  }

  return state;
}

async function upsert(userId: number, companyIdParam: unknown, payload: UpsertPayload) {
  const companyId = readId(companyIdParam);

  const company = await companiesRepository.getById(companyId);
  if (!company) {
    throw new AppError(404, 'Company not found.');
  }

  if (!payload.dashboardColumn || typeof payload.dashboardColumn !== 'string') {
    throw new AppError(400, '"dashboardColumn" is required.');
  }

  const dashboardColumn = payload.dashboardColumn.trim() as DashboardColumn;
  if (!VALID_COLUMNS.includes(dashboardColumn)) {
    throw new AppError(400, `"dashboardColumn" must be one of: ${VALID_COLUMNS.join(', ')}.`);
  }

  let personalNotes: string | null = null;
  if (payload.personalNotes !== undefined && payload.personalNotes !== null) {
    if (typeof payload.personalNotes !== 'string') {
      throw new AppError(400, '"personalNotes" must be a string.');
    }
    const trimmed = payload.personalNotes.trim();
    personalNotes = trimmed.length > 0 ? trimmed : null;
  }

  return userCompanyStatesRepository.upsert({
    userId,
    companyId,
    dashboardColumn,
    personalNotes
  });
}

async function remove(userId: number, companyIdParam: unknown) {
  const companyId = readId(companyIdParam);

  const deleted = await userCompanyStatesRepository.deleteByUserAndCompany(userId, companyId);
  if (!deleted) {
    throw new AppError(404, 'No saved state for this company.');
  }
}

export default {
  listByUser,
  getByUserAndCompany,
  upsert,
  remove
};
