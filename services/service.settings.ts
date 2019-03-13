export const update = async (con, userID, dayID, body) => {
  await con.query('update userDefault set startTime = ?, endTime = ?, status = ? where id = ? and userID = ?', [body.startTime, body.endTime, body.status, dayID, userID]);
  return this.get(con, userID);
};

export const get = async (con, userID) => {
  const [days] = await con.query(`select * 
                                     from userDefault 
                                    where userID = ? 
                                    order by day asc`,
    [userID]);
  return {days: days};
};
