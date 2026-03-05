// File overview: Contains company validation and business rules before using repository queries.

import AppError from '../errors/AppError';
import companiesRepository, {
  type JobRoleInput,
  type TechnologyInput
} from '../repositories/companiesRepository';

interface ListCompaniesQuery {
  search?: unknown;
  location?: unknown;
  tech?: unknown;
  technology?: unknown;
  role?: unknown;
}

interface CreateCompanyPayload {
  name?: unknown;
  website?: unknown;
  linkedin?: unknown;
  industry?: unknown;
  location?: unknown;
  description?: unknown;
  technologyStack?: unknown;
  jobRoles?: unknown;
}

interface UpdateCompanyPayload {
  name?: unknown;
  website?: unknown;
  linkedin?: unknown;
  industry?: unknown;
  location?: unknown;
  description?: unknown;
  technologyStack?: unknown;
  jobRoles?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, field);
}

function readOptionalQueryParam(value: unknown, field: string): string {
  if (value === undefined) {
    return '';
  }

  if (Array.isArray(value) || typeof value !== 'string') {
    throw new AppError(400, `"${field}" must be a string.`);
  }

  return value.trim();
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new AppError(400, `"${field}" is required.`);
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    throw new AppError(400, `"${field}" is required.`);
  }

  return trimmedValue;
}

function readOptionalString(value: unknown, field: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AppError(400, `"${field}" must be a string.`);
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
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

function readOptionalNullableStringField(
  payload: Record<string, unknown>,
  field: string
): string | null | undefined {
  if (!hasOwn(payload, field)) {
    return undefined;
  }

  const value = payload[field];

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AppError(400, `"${field}" must be a string or null.`);
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function splitCsv(input: string): string[] {
  return input
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function readQuerySlugList(value: unknown, field: string): string[] {
  if (value === undefined) {
    return [];
  }

  const parts: string[] = [];

  if (typeof value === 'string') {
    parts.push(...splitCsv(value));
  } else if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item !== 'string') {
        throw new AppError(400, `"${field}" must be a string or comma-separated list.`);
      }

      parts.push(...splitCsv(item));
    }
  } else {
    throw new AppError(400, `"${field}" must be a string or comma-separated list.`);
  }

  return Array.from(new Set(parts.map((item) => toSlug(item, field))));
}

function readOptionalStringArray(value: unknown, field: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new AppError(400, `"${field}" must be an array of strings.`);
  }

  const items = new Set<string>();

  for (const item of value) {
    if (typeof item !== 'string') {
      throw new AppError(400, `"${field}" must be an array of strings.`);
    }

    const cleaned = item.trim();
    if (cleaned.length > 0) {
      items.add(cleaned);
    }
  }

  return Array.from(items);
}

function readOptionalStringArrayField(
  payload: Record<string, unknown>,
  field: string
): string[] | undefined {
  if (!hasOwn(payload, field)) {
    return undefined;
  }

  return readOptionalStringArray(payload[field], field);
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

function readId(value: unknown): number {
  const id = readOptionalPositiveInt(value, 'id');

  if (!id) {
    throw new AppError(400, '"id" must be a positive integer.');
  }

  return id;
}

function normaliseUrlOrThrow(rawValue: string, field: string): string {
  const normalised = rawValue.toLowerCase();

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalised);
  } catch {
    throw new AppError(400, `"${field}" must be a valid URL.`);
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new AppError(400, `"${field}" must use http or https.`);
  }

  return normalised;
}

function normaliseRequiredUrl(urlValue: unknown, field: string): string {
  const rawValue = readRequiredString(urlValue, field);
  return normaliseUrlOrThrow(rawValue, field);
}

function normaliseOptionalUrl(urlValue: unknown, field: string): string | null {
  const rawValue = readOptionalString(urlValue, field);
  if (!rawValue) {
    return null;
  }

  return normaliseUrlOrThrow(rawValue, field);
}

function normaliseOptionalRequiredUrlField(
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

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new AppError(400, `"${field}" must be a non-empty string.`);
  }

  return normaliseUrlOrThrow(trimmed, field);
}

function normaliseOptionalNullableUrlField(
  payload: Record<string, unknown>,
  field: string
): string | null | undefined {
  if (!hasOwn(payload, field)) {
    return undefined;
  }

  const value = payload[field];
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AppError(400, `"${field}" must be a string or null.`);
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return normaliseUrlOrThrow(trimmed, field);
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

function toTechnologyInputs(values: string[], field: string): TechnologyInput[] {
  const map = new Map<string, TechnologyInput>();

  for (const rawValue of values) {
    const name = cleanName(rawValue);
    if (name.length === 0) {
      continue;
    }

    const slug = toSlug(name, field);
    if (!map.has(slug)) {
      map.set(slug, { name, slug });
    }
  }

  return Array.from(map.values());
}

function toJobRoleInputs(values: string[], field: string): JobRoleInput[] {
  const map = new Map<string, JobRoleInput>();

  for (const rawValue of values) {
    const name = cleanName(rawValue);
    if (name.length === 0) {
      continue;
    }

    const slug = toSlug(name, field);
    if (!map.has(slug)) {
      map.set(slug, { name, slug });
    }
  }

  return Array.from(map.values());
}

function ensureObjectPayload(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    throw new AppError(400, 'Request body must be a JSON object.');
  }

  return payload;
}

async function listCompanies(query: ListCompaniesQuery) {
  const search = readOptionalQueryParam(query.search, 'search');
  const location = readOptionalQueryParam(query.location, 'location');
  const technologies = readQuerySlugList(query.tech ?? query.technology, 'tech');
  const jobRoles = readQuerySlugList(query.role, 'role');

  return companiesRepository.getApproved({
    search,
    location,
    technologies,
    jobRoles
  });
}

async function getCompanyById(idParam: unknown) {
  const id = readId(idParam);
  const company = await companiesRepository.getApprovedById(id);

  if (!company) {
    throw new AppError(404, 'Company not found.');
  }

  return company;
}

async function createCompany(rawPayload: CreateCompanyPayload, createdByUserId: number) {
  if (!Number.isInteger(createdByUserId) || createdByUserId <= 0) {
    throw new AppError(401, 'Authentication required.');
  }

  const payload = ensureObjectPayload(rawPayload);

  const name = readRequiredString(payload.name, 'name');
  const website = normaliseRequiredUrl(payload.website, 'website');
  const linkedin = normaliseOptionalUrl(payload.linkedin, 'linkedin');
  const industry = readOptionalString(payload.industry, 'industry');
  const location = readOptionalString(payload.location, 'location');
  const description = readOptionalString(payload.description, 'description');
  const technologies = toTechnologyInputs(
    readOptionalStringArray(payload.technologyStack, 'technologyStack'),
    'technologyStack'
  );
  const jobRoles = toJobRoleInputs(
    readOptionalStringArray(payload.jobRoles, 'jobRoles'),
    'jobRoles'
  );
  return companiesRepository.createPending({
    name,
    website,
    linkedin,
    industry,
    location,
    description,
    technologies,
    jobRoles,
    createdByUserId
  });
}

async function updateCompany(idParam: unknown, rawPayload: UpdateCompanyPayload) {
  const id = readId(idParam);
  const payload = ensureObjectPayload(rawPayload);
  const company = await companiesRepository.getById(id);

  if (!company) {
    throw new AppError(404, 'Company not found.');
  }

  const name = readOptionalNonEmptyStringField(payload, 'name');
  const website = normaliseOptionalRequiredUrlField(payload, 'website');
  const linkedin = normaliseOptionalNullableUrlField(payload, 'linkedin');
  const industry = readOptionalNullableStringField(payload, 'industry');
  const location = readOptionalNullableStringField(payload, 'location');
  const description = readOptionalNullableStringField(payload, 'description');

  const technologyValues = readOptionalStringArrayField(payload, 'technologyStack');
  const technologies =
    technologyValues !== undefined
      ? toTechnologyInputs(technologyValues, 'technologyStack')
      : undefined;

  const jobRoleValues = readOptionalStringArrayField(payload, 'jobRoles');
  const jobRoles =
    jobRoleValues !== undefined
      ? toJobRoleInputs(jobRoleValues, 'jobRoles')
      : undefined;

  const hasBaseUpdates =
    name !== undefined ||
    website !== undefined ||
    linkedin !== undefined ||
    industry !== undefined ||
    location !== undefined ||
    description !== undefined;
  const hasAssociationUpdates = technologies !== undefined || jobRoles !== undefined;

  if (!hasBaseUpdates && !hasAssociationUpdates) {
    throw new AppError(400, 'At least one updatable field is required.');
  }

  const updated = await companiesRepository.updateById(id, {
    name,
    website,
    linkedin,
    industry,
    location,
    description,
    technologies,
    jobRoles
  });

  if (!updated) {
    throw new Error('Failed to update company.');
  }

  return updated;
}

async function deleteCompany(idParam: unknown) {
  const id = readId(idParam);
  const company = await companiesRepository.getById(id);

  if (!company) {
    throw new AppError(404, 'Company not found.');
  }

  const deleted = await companiesRepository.deleteById(id);

  if (!deleted) {
    throw new Error('Failed to delete company.');
  }
}

async function listPendingCompanies() {
  return companiesRepository.getPending();
}

async function approveCompany(
  idParam: unknown,
  approvedByUserId: number
) {
  if (!Number.isInteger(approvedByUserId) || approvedByUserId <= 0) {
    throw new AppError(403, 'Admin access required.');
  }

  const id = readId(idParam);
  const company = await companiesRepository.getById(id);

  if (!company) {
    throw new AppError(404, 'Company not found.');
  }

  if (company.status !== 'pending') {
    throw new AppError(
      400,
      `Only pending companies can be approved. Current status: ${company.status}.`
    );
  }

  const updated = await companiesRepository.updateStatus(
    id,
    'approved',
    approvedByUserId
  );

  if (!updated) {
    throw new Error('Failed to approve company.');
  }

  return updated;
}

async function rejectCompany(idParam: unknown) {
  const id = readId(idParam);
  const company = await companiesRepository.getById(id);

  if (!company) {
    throw new AppError(404, 'Company not found.');
  }

  if (company.status !== 'pending') {
    throw new AppError(
      400,
      `Only pending companies can be rejected. Current status: ${company.status}.`
    );
  }

  const updated = await companiesRepository.updateStatus(id, 'rejected', null);

  if (!updated) {
    throw new Error('Failed to reject company.');
  }

  return updated;
}

export default {
  listCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  listPendingCompanies,
  approveCompany,
  rejectCompany
};
