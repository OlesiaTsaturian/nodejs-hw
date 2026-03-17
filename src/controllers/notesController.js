import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (request, response) => {
  const { page = 1, perPage = 10, tag, search } = request.query;

  const skip = (page - 1) * perPage;

  const notesQuery = Note.find();

  if (search) {
    notesQuery.where({ $text: { $search: search } });
  }

  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(perPage),
  ]);
  const totalPages = Math.ceil(totalNotes / perPage);
  response.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
};

export const getNoteById = async (request, response) => {
  const { noteId } = request.params;
  const note = await Note.findById(noteId);

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  response.status(200).json(note);
};

export const createNote = async (request, response) => {
  const note = await Note.create(request.body);
  response.status(201).json(note);
};

export const deleteNote = async (request, response) => {
  const { noteId } = request.params;

  const note = await Note.findOneAndDelete({ _id: noteId });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  response.status(200).json(note);
};

export const updateNote = async (request, response) => {
  const { noteId } = request.params;

  const note = await Note.findOneAndUpdate({ _id: noteId }, request.body, {
    returnDocument: 'after',
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  response.status(200).json(note);
};

//! Error check controller
// export const testError = (request, response) => {
//   throw new Error('Simulated server error');
// };
