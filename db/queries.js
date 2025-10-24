const pool = require("./pool");

// queries to interact with the database will go here
const createGroup = async (groupData) => {
  const {
    id,
    group_name,
    description,
    contribution,
    members,
    creationDate,
    join_request,
    admin,
  } = groupData;
  await pool.query(
    "INSERT INTO groups (id,group_name, description, contribution, creationDate) Values ($1,$2, $3,$4,$5)",
    [id, group_name, description, contribution, creationDate]
  );
};

const addMemberToGroup = async (groupId, member) => {
  const { mem_id, mem_name, phone_num } = member;
  await pool.query(
    "INSERT INTO members (mem_id, mem_name, phone_num, group_id) VALUES ($1, $2, $3, $4)",
    [mem_id, mem_name, phone_num, groupId]
  );
};

const getAllGroups = async () => {
  // group info with its members
  const { rows } = await pool.query(
    "SELECT * FROM groups JOIN members ON groups.group_id = members.group_id"
  );
  return rows;
};

module.exports = {
  createGroup,
  addMemberToGroup,
  getAllGroups,
};
