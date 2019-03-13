export const add = async (con, userID, body) => {
  const [[info]] = await con.query('select max(sOrder)+1 as sOrder from userArea where userID = ?', [userID]);
  const sOrder = info.sOrder ? info.sOrder : 0;

  await con.query(`insert into userArea (name, type, userID, sOrder)
                   values (?, ?, ?, ?)`, [body.name, body.type, userID, sOrder]);

  return 'added';
};

export const saveNote = async (con, userID, areaID, note) => {
  // Is this note the same as it was before?
  const [[oldNote]] = await con.query('select note, noteUpdated from userArea where id = ? and userID = ?', [areaID, userID]);
  if (note === oldNote.note) return;

  await con.query('update userArea set note = ?, noteUpdated = NOW() where id = ? and userID = ?', [note, areaID, userID]);

  // console.log('notes', oldNote, note);

  if (!oldNote.note) return;
  //Move the old one into the history table

  // console.log('saving updated', oldNote);

  await con.query('insert into userAreaNoteHistory (userAreaID, note, noteUpdated) values (?,?,?)', [areaID, oldNote.note, oldNote.noteUpdated]);

}

export const sort = async (con, userID, areaID, body) => {
  const items = body.items;
  // Clear everything out of this area - NOT SURE WHAT THIS DOES
  // await con.query('update userHabit set userAreaID = null where userAreaID = ? and userID = ?', [areaID, userID]);

  for (const i in items) {
    await con.query('update userHabit set userAreaID = ?, sOrder = ? where id = ? and userID = ?', [areaID, i, items[i], userID]);
  }

  return 'sorted';
};

export const remove = async (con, userID, areaID) => {

  // await con.query('update userHabit set userAreaID = null where userAreaID = ? and userID = ?', [areaID, userID]);
  // console.log('testing', con);
  await con.query('delete from userArea where id = ? and userID = ?', [areaID, userID]);

  return 'removed';
};

export const sortArea = async (con, userID, body) => {
  const items = body.items;

  for (const i in items) {
    await con.query('update userArea set sOrder = ? where id = ? and userID = ?', [i, items[i], userID]);
  }

  return 'sorted';
};

export const getNoteHistory = async (con, userID, areaID) => {
  const [notes] = await con.query(`select * 
                                     from userAreaNoteHistory 
                                    where userAreaID = ? 
                                      and userAreaID in (select id from userArea where userID = ?) 
                                    order by noteUpdated desc`,
    [areaID, userID]);
  return {notes: notes};
}
