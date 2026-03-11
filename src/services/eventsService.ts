// File overview: Contains event validation and business rules before using repository queries.

import AppError from '../errors/AppError';
import eventsRepository, {
  type EventStatus,
//   type JobRoleInput,
  type TechnologyInput
} from '../repositories/eventsRepository';

interface ListEventsQuery {
  search?: unknown;
  location?: unknown;
  tech?: unknown;
  technology?: unknown;
  role?: unknown;
}

interface ListAllEventsQuery {
  status?: unknown;
}

interface CreateEventPayload {
  name?: unknown;
  website?: unknown;
  location?: unknown;
  description?: unknown;
  technologyStack?: unknown;
  sponsorCompanyIds?: unknown;
  start_time?: unknown;
  end_time?: unknown;
  createdByUserId?: unknown;
}

interface UpdateEventPayload {
  name?: unknown;
  website?: unknown;
  location?: unknown;
  description?: unknown;
  technologyStack?: unknown;
  sponsorCompanyIds?: unknown;
  start_time?: unknown;
  end_time?: unknown;
}

interface ModerationPayload {
  approvedByUserId?: unknown;
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

function readOptionalStatusQueryParam(value: unknown, field: string): EventStatus | null {
  if (value === undefined) {
    return null;
  }

  if (Array.isArray(value) || typeof value !== 'string') {
    throw new AppError(400, `"${field}" must be one of: pending, approved, rejected.`);
  }

  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed !== 'pending' && trimmed !== 'approved' && trimmed !== 'rejected') {
    throw new AppError(400, `"${field}" must be one of: pending, approved, rejected.`);
  }

  return trimmed;
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

function readOptionalPositiveIntArray(value: unknown, field: string): number[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new AppError(400, `"${field}" must be an array of positive integers.`);
  }

  const items = new Set<number>();

  for (const item of value) {
    if (typeof item === 'number' && Number.isInteger(item) && item > 0) {
      items.add(item);
      continue;
    }

    if (typeof item === 'string' && /^\d+$/.test(item.trim())) {
      items.add(Number.parseInt(item, 10));
      continue;
    }

    throw new AppError(400, `"${field}" must be an array of positive integers.`);
  }

  return Array.from(items);
}

function readOptionalPositiveIntArrayField(
  payload: Record<string, unknown>,
  field: string
): number[] | undefined {
  if (!hasOwn(payload, field)) {
    return undefined;
  }

  return readOptionalPositiveIntArray(payload[field], field);
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

// function toJobRoleInputs(values: string[], field: string): JobRoleInput[] {
//   const map = new Map<string, JobRoleInput>();

//   for (const rawValue of values) {
//     const name = cleanName(rawValue);
//     if (name.length === 0) {
//       continue;
//     }

//     const slug = toSlug(name, field);
//     if (!map.has(slug)) {
//       map.set(slug, { name, slug });
//     }
//   }

//   return Array.from(map.values());
// }

function ensureObjectPayload(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    throw new AppError(400, 'Request body must be a JSON object.');
  }

  return payload;
}

async function listEvents(query: ListEventsQuery) {
  const search = readOptionalQueryParam(query.search, 'search');
  const location = readOptionalQueryParam(query.location, 'location');
  const technologies = readQuerySlugList(query.tech ?? query.technology, 'tech');
//   const jobRoles = readQuerySlugList(query.role, 'role');

  return eventsRepository.getApproved({
    search,
    location,
    technologies
    // jobRoles
  });
}

async function listAllEvents(query: ListAllEventsQuery) {
  const status = readOptionalStatusQueryParam(query.status, 'status');

  return eventsRepository.getAll({ status });
}

async function getEventById(idParam: unknown) {
  const id = readId(idParam);
  const event = await eventsRepository.getApprovedById(id);

  if (!event) {
    throw new AppError(404, 'Event not found.');
  }

  return event;
}

async function createEvent(rawPayload: CreateEventPayload) {
  const payload = ensureObjectPayload(rawPayload);

  const name = readRequiredString(payload.name, 'name');
  const website = normaliseRequiredUrl(payload.website, 'website');
  const location = readOptionalString(payload.location, 'location');
  const description = readOptionalString(payload.description, 'description');
  const technologies = toTechnologyInputs(
    readOptionalStringArray(payload.technologyStack, 'technologyStack'),
    'technologyStack'
  );
  const startTime = readRequiredString(payload.start_time, 'start_time');
  const endTime = readOptionalString(payload.end_time, 'end_time');
  const sponsorCompanyIds = readOptionalPositiveIntArray(
    payload.sponsorCompanyIds,
    'sponsorCompanyIds'
  );
  const createdByUserId = readOptionalPositiveInt(payload.createdByUserId, 'createdByUserId');

  return eventsRepository.createPending({
    name,
    website,
    location,
    description,
    technologies,
    startTime,
    endTime,
    sponsorCompanyIds,
    createdByUserId
  });
}

async function updateEvent(idParam: unknown, rawPayload: UpdateEventPayload) {
  const id = readId(idParam);
  const payload = ensureObjectPayload(rawPayload);
  const event = await eventsRepository.getById(id);

  if (!event) {
    throw new AppError(404, 'Event not found.');
  }

  const name = readOptionalNonEmptyStringField(payload, 'name');
  const website = normaliseOptionalRequiredUrlField(payload, 'website');
  const location = readOptionalNullableStringField(payload, 'location');
  const description = readOptionalNullableStringField(payload, 'description');
  const startTime = readOptionalNonEmptyStringField(payload, 'start_time');
  const endTime = readOptionalNullableStringField(payload, 'end_time');

  const technologyValues = readOptionalStringArrayField(payload, 'technologyStack');
  const technologies =
    technologyValues !== undefined
      ? toTechnologyInputs(technologyValues, 'technologyStack')
      : undefined;

  const sponsorCompanyIds = readOptionalPositiveIntArrayField(
    payload,
    'sponsorCompanyIds'
  );

  const hasBaseUpdates =
    name !== undefined ||
    website !== undefined ||
    location !== undefined ||
    description !== undefined ||
    startTime !== undefined ||
    endTime !== undefined;
  const hasAssociationUpdates =
    technologies !== undefined || sponsorCompanyIds !== undefined;

  if (!hasBaseUpdates && !hasAssociationUpdates) {
    throw new AppError(400, 'At least one updatable field is required.');
  }

  const updated = await eventsRepository.updateById(id, {
    name,
    website,
    location,
    description,
    startTime,
    endTime,
    technologies,
    sponsorCompanyIds
  });

  if (!updated) {
    throw new Error('Failed to update event.');
  }

  return updated;
}

async function deleteEvent(idParam: unknown) {
  const id = readId(idParam);
  const event = await eventsRepository.getById(id);

  if (!event) {
    throw new AppError(404, 'Event not found.');
  }

  const deleted = await eventsRepository.deleteById(id);

  if (!deleted) {
    throw new Error('Failed to delete event.');
  }
}

async function listPendingEvents() {
  return eventsRepository.getPending();
}

async function approveEvent(
  idParam: unknown,
  payload: ModerationPayload = {}
) {
  const id = readId(idParam);
  const event = await eventsRepository.getById(id);

  if (!event) {
    throw new AppError(404, 'Event not found.');
  }

  if (event.status !== 'pending') {
    throw new AppError(
      400,
      `Only pending events can be approved. Current status: ${event.status}.`
    );
  }

  const approvedByUserId = readOptionalPositiveInt(payload.approvedByUserId, 'approvedByUserId');
  const updated = await eventsRepository.updateStatus(
    id,
    'approved',
    approvedByUserId
  );

  if (!updated) {
    throw new Error('Failed to approve event.');
  }

  return updated;
}

async function rejectEvent(idParam: unknown) {
  const id = readId(idParam);
  const event = await eventsRepository.getById(id);

  if (!event) {
    throw new AppError(404, 'Event not found.');
  }

  if (event.status !== 'pending') {
    throw new AppError(
      400,
      `Only pending events can be rejected. Current status: ${event.status}.`
    );
  }

  const updated = await eventsRepository.updateStatus(id, 'rejected', null);

  if (!updated) {
    throw new Error('Failed to reject event.');
  }

  return updated;
}

export default {
  listEvents,
  listAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  listPendingEvents,
  approveEvent,
  rejectEvent
};
