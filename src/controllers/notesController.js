import { Note } from '../models/note';

export const getNotes = async (request, response) => {
  const notes = await Note.find();
  response.status(200).json(notes);
};

export const getNoteById = async (request, response) => {
  const { noteId } = request.params;
  const note = await Note.findById(noteId);

  if (!note) {
    return response.status(404).json({ message: 'Note not found' });
  }

  response.status(200).json(note);
};

export const testError = (request, response) => {
  throw new Error('Simulated server error');
};
