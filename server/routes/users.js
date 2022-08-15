const router = require('express').Router();
const {
  models: { User },
} = require('../db');

/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

router.get('/unassigned', async (req, res, next) => {
  try {
    const lonelyStudents = await User.findUnassignedStudents();
    const myMap = lonelyStudents.map((user) => user.name);

    res.send(lonelyStudents);
  } catch (err) {
    next(err);
  }
});

// const allTeachers = User.findAll({
//     where: {
//       userType: 'TEACHER',
//     },
//     include: {
//       model: User,
//       as: 'mentees',
//     },

router.get('/teachers', async (req, res, next) => {
  try {
    const allTeachers = await User.findAll({
      where: {
        userType: 'TEACHER',
      },
      include: {
        model: User,
        as: 'mentees',
      },
    });
    res.send(allTeachers);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
