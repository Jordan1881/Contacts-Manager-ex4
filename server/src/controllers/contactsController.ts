import type { Request, Response } from "express";
import { ZodError } from "zod";
import { handleError, type FieldError } from "../lib/errors.js";
import * as contactsService from "../services/contactsService.js";
import {
  contactCreateSchema,
  contactPatchSchema,
  contactPutSchema,
  listQuerySchema,
} from "../validators/contactSchemas.js";

function zodToDetails(err: ZodError): FieldError[] {
  return err.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));
}

export async function list(req: Request, res: Response) {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await contactsService.listContacts(query);
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: zodToDetails(err),
      });
    }
    handleError(res, err);
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const contact = await contactsService.getById(req.params.id);
    res.json(contact);
  } catch (err) {
    handleError(res, err);
  }
}

export async function create(req: Request, res: Response) {
  try {
    const body = contactCreateSchema.parse(req.body);
    const contact = await contactsService.create(body);
    res.status(201).json(contact);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: zodToDetails(err),
      });
    }
    handleError(res, err);
  }
}

export async function put(req: Request, res: Response) {
  try {
    const body = contactPutSchema.parse(req.body);
    const contact = await contactsService.replace(req.params.id, body);
    res.json(contact);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: zodToDetails(err),
      });
    }
    handleError(res, err);
  }
}

export async function patch(req: Request, res: Response) {
  try {
    const body = contactPatchSchema.parse(req.body);
    const contact = await contactsService.updatePartial(req.params.id, body);
    res.json(contact);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: zodToDetails(err),
      });
    }
    handleError(res, err);
  }
}

export async function favorite(req: Request, res: Response) {
  try {
    const contact = await contactsService.toggleFavorite(req.params.id);
    res.json(contact);
  } catch (err) {
    handleError(res, err);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await contactsService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
}
