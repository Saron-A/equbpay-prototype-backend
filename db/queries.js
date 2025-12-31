const pool = require("./pool");

// search users by username
const getUserByUsername = async (username) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE username=$1", [
    username,
  ]);
  return rows[0];
};

// create group and return group info including group_id
const createGroup = async ({
  group_name,
  description,
  contribution,
  creation_date,
  creator_id,
  no_of_members,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO groups (group_name, description, contribution, creation_date, creator_id, no_of_members)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING group_id, group_name, description, contribution, creator_id, creation_date, no_of_members`,
    [
      group_name,
      description,
      contribution,
      creation_date,
      creator_id,
      no_of_members,
    ]
  );

  return rows[0];
};

// add member to group
const addMemberToGroup = async (groupId, member) => {
  const { mem_name, phone_num } = member;
  await pool.query(
    `INSERT INTO members (mem_name, phone_num, group_id)
     VALUES ($1, $2, $3)`,
    [mem_name, phone_num, groupId]
  );
};

// get all groups with their members
const getAllGroups = async () => {
  const { rows } = await pool.query(
    `SELECT g.group_id, g.group_name, g.description, g.contribution, g.creation_date, g.no_of_members, g.creator_id, m.mem_id, m.mem_name, m.phone_num FROM groups g
     LEFT JOIN members m ON g.group_id = m.group_id
     ORDER BY g.group_id`
  );
  return rows;
};

module.exports = {
  getUserByUsername,
  createGroup,
  addMemberToGroup,
  getAllGroups,
};
