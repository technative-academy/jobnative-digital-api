// File overview: Business layer for technology filter metadata and admin cleanup actions.

import AppError from '../errors/AppError';
import technologiesRepository from '../repositories/technologiesRepository';

interface UpdateTechnologyPayload {
  name?: unknown;
  slug?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, field);
}

function readOptionalPositiveInt(value: unknown, field: string): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number.parseInt(value, 10);
  }

  throw new AppError(400, `"${field}" must be a positive integer.`);
}

function readId(value: unknown, field: string): number {
  const id = readOptionalPositiveInt(value, field);
  if (!id) {
    throw new AppError(400, `"${field}" must be a positive integer.`);
  }

  return id;
}

function readOptionalNonEmptyStringField(
  payload: Record<string, unknown>,
  field: string
): string | undefined {
  if (!hasOwn(payload, field)) {
    return undefined;
  }

  const value = payload[field];
  if (typeof value !== 'string') {
    throw new AppError(400, `"${field}" must be a non-empty string.`);
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    throw new AppError(400, `"${field}" must be a non-empty string.`);
  }

  return trimmedValue;
}

function toSlug(value: string, field: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (slug.length === 0) {
    throw new AppError(400, `"${field}" contains an invalid value.`);
  }

  return slug;
}

function cleanName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function ensureObjectPayload(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    throw new AppError(400, 'Request body must be a JSON object.');
  }

  return payload;
}

async function listTechnologies() {
  return technologiesRepository.list();
}

async function updateTechnology(idParam: unknown, rawPayload: UpdateTechnologyPayload) {
  const id = readId(idParam, 'technologyId');
  const payload = ensureObjectPayload(rawPayload);
  const existing = await technologiesRepository.getById(id);

  if (!existing) {
    throw new AppError(404, 'Technology not found.');
  }

  const nameInput = readOptionalNonEmptyStringField(payload, 'name');
  const slugInput = readOptionalNonEmptyStringField(payload, 'slug');

  if (nameInput === undefined && slugInput === undefined) {
    throw new AppError(400, 'At least one updatable field is required.');
  }

  const name = nameInput !== undefined ? cleanName(nameInput) : undefined;
  const slug = slugInput !== undefined
    ? toSlug(slugInput, 'slug')
    : name !== undefined
      ? toSlug(name, 'name')
      : undefined;

  const updated = await technologiesRepository.updateById(id, { name, slug });
  if (!updated) {
    throw new Error('Failed to update technology.');
  }

  return updated;
}

async function deleteTechnology(idParam: unknown) {
  const id = readId(idParam, 'technologyId');
  const existing = await technologiesRepository.getById(id);

  if (!existing) {
    throw new AppError(404, 'Technology not found.');
  }

  const deleted = await technologiesRepository.deleteById(id);
  if (!deleted) {
    throw new Error('Failed to delete technology.');
  }
}

export default {
  listTechnologies,
  updateTechnology,
  deleteTechnology
};
