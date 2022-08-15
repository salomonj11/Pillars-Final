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

router.delete('/:id', async (req, res, next) => {
  try {
    if (req.params.id.search(/[0-9]/) >= 0) {
      if (await User.findByPk(req.params.id)) {
        await User.destroy({
          where: {
            id: req.params.id,
          },
        });
        res.sendStatus(204);
      } else res.sendStatus(404);
    } else res.sendStatus(400);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const newUser = await User.findOne({
      where: {
        name: req.body.name,
      },
    });
    newUser === null
      ? res.status(201).send(await User.create(req.body))
      : res.sendStatus(409);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const myUser = await User.findByPk(req.params.id);

    myUser != null
      ? res.status(200).send(await myUser.update(req.body))
      : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
