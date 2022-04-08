import jsSHA from 'jssha';

const getHash = (str) => {
  // eslint-disable-next-line new-cap
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(str);
  const hash = shaObj.getHash('HEX');
  return hash;
};

const SALT = 'jiachen';

export default function initUsersController(db) {
  const getSprite = async (request, response) => {
    try {
      const { id } = request.params;
      const sprite = await db.UserSprite.findOne({
        where: {
          id,
        },
      });
      const path = sprite.sprite;
      response.send(path);
    } catch (error) {
      response.status(500).send();
    }
  };

  const create = async (request, response) => {
    try {
      request.body.password = getHash(`${request.body.password}-${SALT}`);
      const result = await db.User.create(request.body);
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  const login = async (request, response) => {
    try {
      request.body.password = getHash(`${request.body.password}-${SALT}`);
      const { email, password } = request.body;
      const result = await db.User.findOne({
        where: {
          email,
          password,
        },
      });
      if (result) {
        response.cookie('user', result.id);
        response.cookie('loggedIn', getHash(`${result.id}-${SALT}`));
      }
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  const loginCheck = async (request, response) => {
    try {
      const { user, loggedIn } = request.cookies;
      if (user && loggedIn) {
        if (getHash(`${user}-${SALT}`) === loggedIn) {
          response.send(true);
          return;
        }
      }
      response.clearCookie('user');
      response.clearCookie('loggedIn');
      response.send(false);
    } catch (error) {
      response.status(500).send();
    }
  };

  const getInfo = async (request, response) => {
    try {
      const { user } = request.cookies;
      const result = await db.User.findOne({
        where: {
          id: user,
        },
        include: {
          model: db.UserSprite,
        },
      });
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  const logout = async (request, response) => {
    try {
      response.clearCookie('user');
      response.clearCookie('loggedIn');
      response.send(true);
    } catch (error) {
      response.status(500).send();
    }
  };

  const getUserOpponentSprite = async (request, response) => {
    try {
      const { user } = request.cookies;
      request.body.splice(request.body.indexOf(Number(user)), 1);
      const opponentId = request.body[0];
      const userInfo = await db.User.findOne({
        where: {
          id: user,
        },
        include: {
          model: db.UserSprite,
        },
      });
      const opponentInfo = await db.User.findOne({
        where: {
          id: opponentId,
        },
        include: {
          model: db.UserSprite,
        },
      });
      response.send({
        userId: Number(user),
        opponentId,
        userDisplayName: userInfo.displayName,
        opponentDisplayName: opponentInfo.displayName,
        userSprite: userInfo.userSprite.sprite,
        opponentSprite: opponentInfo.userSprite.sprite,
      });
    } catch (error) {
      response.status(500).send();
    }
  };
  const emailCheck = async (request, response) => {
    try {
      const { email } = request.body;
      const result = await db.User.findOne({
        where: {
          email,
        },
      });
      response.send(result === null);
    } catch (error) {
      response.status(500).send();
    }
  };

  return {
    getSprite, create, login, loginCheck, getInfo, logout, getUserOpponentSprite, emailCheck,
  };
}
