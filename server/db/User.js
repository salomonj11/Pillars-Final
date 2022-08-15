const Sequelize = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  userType: {
    type: Sequelize.STRING,
    defaultValue: 'STUDENT',
    allowNull: false,
    validate: {
      isIn: {
        args: [['TEACHER', 'STUDENT']],
      },
    },
  },
  isStudent: {
    type: Sequelize.DataTypes.VIRTUAL,
    get() {
      return this.userType === 'STUDENT' ? true : false;
    },
  },
  isTeacher: {
    type: Sequelize.DataTypes.VIRTUAL,
    get() {
      return this.userType === 'TEACHER' ? true : false;
    },
  },
});

User.findUnassignedStudents = function () {
  const lonelyStudents = User.findAll({
    where: {
      userType: 'STUDENT',
      mentorId: null,
    },
  });
  return lonelyStudents;
};

User.findTeachersAndMentees = function async() {
  const allTeachers = User.findAll({
    where: {
      userType: 'TEACHER',
    },
    include: {
      model: User,
      as: 'mentees',
    },
  });
  return allTeachers;
};

User.addHook('beforeUpdate', async (user) => {
  const mentorAndMenteesArray = await User.findTeachersAndMentees();

  if (
    mentorAndMenteesArray.some(
      (mentor) => mentor.name === user.name && mentor.mentees.length > 0
    )
  ) {
    throw new Error(
      `${user.name} has a mentee! They Cannot become a student yet`
    );
  } else {
    const woahMentor = await User.findByPk(user.mentorId);
    const ourUser = await User.findByPk(user.id);

    if (ourUser.mentorId !== null) {
      throw new Error(
        `${user.name} has a mentor! They cannot become a teacher yet`
      );
    } else if (woahMentor !== null && woahMentor.userType === 'STUDENT') {
      throw new Error(
        `${woahMentor.name} is not a teacher! Cannot make them a mentor.`
      );
    }
    return user;
  }
});
/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
